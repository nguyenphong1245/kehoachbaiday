import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  Loader2,
  AlertCircle,
  Send,
  FileText,
  Clock,
  Users,
  GraduationCap,
  Settings,
  Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublicWorksheet, startWorksheetSession, submitWorksheet } from "@/services/worksheetService";
import type { WorksheetPublic } from "@/services/worksheetService";
import { getStoredAuthUser } from "@/utils/authStorage";
import { useToast } from "@/contexts/Toast";

// Type cho worksheet section
interface WorksheetSection {
  id: string;
  title: string;
  content: string;
  questions: { id: string; question: string; type: 'text' | 'textarea' }[];
}

// Parse content để tìm các phiếu học tập
const parseWorksheetSections = (content: string): WorksheetSection[] => {
  const sections: WorksheetSection[] = [];
  
  // Cách 1: Tìm theo marker [SECTION:PHIEU_HOC_TAP_X]
  const phieuSectionPattern = /\[SECTION:PHIEU_HOC_TAP_(\d+)\]([\s\S]*?)(?=\[SECTION:|$)/gi;
  let match;
  
  while ((match = phieuSectionPattern.exec(content)) !== null) {
    const phieuNum = match[1];
    let phieuContent = match[2].trim();
    
    // Loại bỏ dấu --- ở đầu/cuối
    phieuContent = phieuContent.replace(/^---\s*|\s*---$/g, '').trim();
    
    // Loại bỏ tất cả các marker [SECTION:...] khỏi nội dung
    phieuContent = phieuContent.replace(/\[SECTION:[^\]]+\]/g, '').trim();
    
    const questions = parseQuestionsFromSection(phieuContent);
    
    sections.push({
      id: `section_${phieuNum}`,
      title: `Phiếu học tập số ${phieuNum}`,
      content: phieuContent,
      questions: questions
    });
  }
  
  // Nếu không tìm thấy markers, parse toàn bộ content như 1 phiếu duy nhất
  if (sections.length === 0) {
    
    // Loại bỏ markers nếu có
    let cleanContent = content.replace(/\[SECTION:[^\]]+\]/g, '').trim();
    
    // Parse câu hỏi từ toàn bộ content
    const questions = parseQuestionsFromSection(cleanContent);
    
    // Lấy title từ dòng đầu tiên (nếu có format **PHIẾU HỌC TẬP SỐ X**)
    const titleMatch = cleanContent.match(/\*\*PHIẾU HỌC TẬP SỐ (\d+)\*\*/i);
    const title = titleMatch ? `Phiếu học tập số ${titleMatch[1]}` : 'Phiếu học tập';
    
    return [{
      id: 'section_1',
      title: title,
      content: cleanContent,
      questions: questions
    }];
  }
  
  return sections;
};

// Parse câu hỏi từ một section
const parseQuestionsFromSection = (content: string): { id: string; question: string; type: 'text' | 'textarea' }[] => {
  const questions: { id: string; question: string; type: 'text' | 'textarea' }[] = [];

  // Strip markdown bold/italic markers trước khi parse
  const cleaned = content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');

  // Tìm các pattern như "Câu 1:", "Câu hỏi 1:", "1.", "1)"
  const patterns = [
    /(?:^|\n)\s*(?:Câu|Bài|Question)\s*(\d+)\s*[.:]\s*(.+?)(?=(?:\n\s*(?:Câu|Bài|Question)\s*\d+\s*[.:])|$)/gis,
    /(?:^|\n)(\d+)[.)]\s*(.+?)(?=(?:\n\d+[.)])|$)/gm,
  ];

  let foundQuestions = false;

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(cleaned)) !== null) {
      const questionNum = match[1];
      let questionText = match[2].trim();

      // Xóa dòng trống và giữ toàn bộ câu hỏi
      questionText = questionText.split('\n')[0].trim();
      // Xóa markdown còn sót
      questionText = questionText.replace(/\*+/g, '').trim();

      if (questionText.length > 5) { // Must be meaningful
        questions.push({
          id: `q_${questionNum}`,
          question: questionText,
          type: questionText.length > 100 ? 'textarea' : 'text'
        });
        foundQuestions = true;
      }
    }
    if (foundQuestions) break;
  }

  return questions;
};

// Block hiển thị: markdown thường hoặc câu hỏi có ô nhập
interface InteractiveBlock {
  type: 'markdown' | 'question_input';
  text: string;           // Nội dung markdown (cho type 'markdown')
  questionLine: string;   // Dòng câu hỏi gốc (cho type 'question_input')
  questionNum: string;    // Số câu hỏi: "1", "2", "3"...
}

/**
 * Xử lý nội dung phiếu học tập: giữ nguyên markdown, xóa dòng chấm (nét đứt),
 * sau mỗi dòng "Câu X:" chèn ô nhập nét liền để HS gõ câu trả lời.
 */
const buildInteractiveBlocks = (content: string, sectionId: string): InteractiveBlock[] => {
  const blocks: InteractiveBlock[] = [];

  // Regex nhận diện dòng câu hỏi: "Câu 1:", "**Câu 1:**", "Bài 1:", v.v.
  const questionLinePattern = /^\s*\*{0,2}\s*(?:Câu|Bài|Question)\s+(\d+)\s*[.:]/i;

  // Regex nhận diện dòng chỉ chứa dấu chấm liên tục (dòng kẻ nét đứt từ LLM)
  const dotLinePattern = /^\s*\.{3,}\s*$/;

  // Regex nhận diện dòng "Họ và tên: ...", "Nhóm: ...", "Lớp: ..." (thông tin HS đã nhập ở form)
  const studentInfoPattern = /^\s*\*{0,2}\s*(?:Họ và tên|Họ tên|HỌ VÀ TÊN|HỌ TÊN|Nhóm|NHÓM|Lớp|LỚP)\s*\*{0,2}\s*:/i;

  // Xử lý: chia content thành các dòng, nhưng giữ nguyên code block
  const lines = content.split('\n');
  let currentMarkdown: string[] = [];
  let inCodeBlock = false;
  let questionCount = 0;

  const flushMarkdown = () => {
    const text = currentMarkdown.join('\n').trim();
    if (text) {
      blocks.push({ type: 'markdown', text, questionLine: '', questionNum: '' });
    }
    currentMarkdown = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block (``` ... ```)
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      currentMarkdown.push(line);
      continue;
    }

    // Trong code block -> giữ nguyên
    if (inCodeBlock) {
      currentMarkdown.push(line);
      continue;
    }

    // Xóa dòng chỉ chứa dấu chấm liên tục
    if (dotLinePattern.test(line)) {
      continue;
    }

    // Xóa dòng "Họ và tên:", "Nhóm:", "Lớp:" nếu sau đó chỉ là dấu chấm
    if (studentInfoPattern.test(line)) {
      // Chỉ xóa nếu dòng này chủ yếu là label + dấu chấm (không có nội dung thực)
      const withoutDots = line.replace(/\.{2,}/g, '').replace(/\*{1,2}/g, '').trim();
      const labelMatch = withoutDots.match(/^(?:Họ và tên|Họ tên|Nhóm|Lớp)\s*:\s*$/i);
      if (labelMatch) {
        continue; // Dòng trống chỉ có label -> xóa
      }
    }

    // Xóa dấu chấm liên tục trong dòng (giữ nội dung khác)
    const cleanedLine = line.replace(/\.{3,}/g, '');

    // Nhận diện dòng câu hỏi
    const qMatch = cleanedLine.match(questionLinePattern);
    if (qMatch) {
      // Flush markdown tích lũy trước đó
      flushMarkdown();

      questionCount++;
      blocks.push({
        type: 'question_input',
        text: '',
        questionLine: cleanedLine,
        questionNum: qMatch[1],
      });
      continue;
    }

    // Dòng markdown thông thường
    currentMarkdown.push(cleanedLine);
  }

  // Flush markdown còn lại
  flushMarkdown();

  return blocks;
};

export const PublicWorksheetPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const toast = useToast();

  // Check if current user is a teacher
  const isTeacher = useMemo(() => {
    const user = getStoredAuthUser();
    return user?.roles?.some(r => r.name === "teacher" || r.name === "admin") ?? false;
  }, []);

  // States
  const [worksheet, setWorksheet] = useState<WorksheetPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form nhập thông tin học sinh
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentGroup, setStudentGroup] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Answer state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lineCounts, setLineCounts] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);

  // Load worksheet
  useEffect(() => {
    const loadWorksheet = async () => {
      if (!shareCode) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPublicWorksheet(shareCode);
        setWorksheet(data);
        
        // Parse worksheet sections to get all questions and init answer keys
        const sections = parseWorksheetSections(data.content);
        const initialAnswers: Record<string, string> = {};

        // Collect all questions, dùng key format: section_id-q_num
        sections.forEach(section => {
          // Cũng build interactive blocks để lấy đúng questionNum
          const blocks = buildInteractiveBlocks(section.content, section.id);
          blocks.forEach(block => {
            if (block.type === 'question_input') {
              initialAnswers[`${section.id}-q_${block.questionNum}`] = '';
            }
          });
          // Fallback: nếu không tìm thấy qua blocks, dùng parsed questions
          if (blocks.filter(b => b.type === 'question_input').length === 0) {
            section.questions.forEach(q => {
              initialAnswers[`${section.id}-${q.id}`] = '';
            });
          }
        });

        setAnswers(initialAnswers);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Không thể tải phiếu học tập");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorksheet();
  }, [shareCode]);

  const handleStartWorksheet = async () => {
    if (!shareCode || !studentName.trim() || !studentClass.trim()) return;
    try {
      const session = await startWorksheetSession(shareCode, {
        student_name: studentName.trim(),
        student_class: studentClass.trim(),
      });
      setSessionToken(session.session_token);
      setHasStarted(true);
    } catch {
      toast.push({ type: "error", title: "Không thể bắt đầu phiên làm bài", description: "Vui lòng thử lại." });
    }
  };

  const handleSubmit = async () => {
    if (!shareCode || !sessionToken) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await submitWorksheet(shareCode, {
        student_name: studentName.trim(),
        student_class: studentClass.trim(),
        student_group: studentGroup.trim() || undefined,
        answers: answers,
        session_token: sessionToken,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      toast.push({ type: "error", title: "Nộp bài thất bại", description: err.response?.data?.detail || "Lỗi khi nộp bài" });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getLineCount = (key: string, defaultLines = 3) => {
    return lineCounts[key] || defaultLines;
  };

  const handleAddLine = (key: string) => {
    setLineCounts(prev => ({
      ...prev,
      [key]: (prev[key] || 3) + 1
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">Đang tải phiếu học tập...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !worksheet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Không tìm thấy phiếu học tập</h2>
          <p className="text-slate-600 mb-4">
            {error || "Link chia sẻ không hợp lệ hoặc đã hết hạn."}
          </p>
          <p className="text-sm text-slate-500">
            Vui lòng liên hệ giáo viên để nhận link mới.
          </p>
        </div>
      </div>
    );
  }

  // Success state - after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Nộp bài thành công!</h2>
          <p className="text-slate-600 mb-6">
            Cảm ơn <span className="font-semibold">{studentName}</span> đã hoàn thành phiếu học tập.
          </p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">
              Giáo viên sẽ xem và đánh giá bài làm của bạn.
            </p>
          </div>
          
          <div className="text-sm text-slate-500">
            <p>Bạn có thể đóng trang này.</p>
          </div>
        </div>
      </div>
    );
  }

  // Entry form - before starting
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden max-w-lg w-full">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{worksheet.title}</h1>
                <p className="text-blue-100 text-sm">Phiếu học tập tương tác</p>
              </div>
            </div>
          </div>

          {/* Lesson Info - Hidden */}

          {/* Entry Form */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lớp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="Ví dụ: 10A1"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nhóm (nếu có)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    placeholder="Ví dụ: Nhóm 1"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleStartWorksheet}
                disabled={!studentName.trim() || !studentClass.trim()}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Bắt đầu làm bài
              </button>

              {isTeacher && (
                <Link
                  to="/sharing-management"
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Quản lý chia sẻ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main worksheet view - Lấy sections từ backend hoặc parse nếu không có
  const worksheetSections = worksheet.sections?.filter(s => s.section_type === 'phieu_hoc_tap') || [];
  
  const sections = worksheetSections.length > 0 
    ? worksheetSections.map(s => ({
        id: s.section_id,
        title: s.title,
        content: s.content,
        questions: parseQuestionsFromSection(s.content)
      }))
    : parseWorksheetSections(worksheet.content);
  
  // Đếm số câu hỏi từ interactive blocks
  const totalQuestions = sections.reduce((count, section) => {
    const blocks = buildInteractiveBlocks(section.content, section.id);
    return count + blocks.filter(b => b.type === 'question_input').length;
  }, 0);
  const answeredCount = Object.values(answers).filter(a => a.trim()).length;

  // Markdown components cho ReactMarkdown
  const mdComponents = {
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse border-2 border-slate-300">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-100">{children}</thead>,
    th: ({ children }: any) => <th className="border-2 border-slate-300 px-4 py-3 text-left font-bold text-slate-800">{children}</th>,
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-slate-50">{children}</tr>,
    td: ({ children }: any) => (
      <td className="border-2 border-slate-300 px-4 py-3 align-top">
        <div className="text-slate-800">{children}</div>
      </td>
    ),
    p: ({ node, children }: any) => {
      const firstChild = node?.children?.[0] as { value?: string } | undefined;
      const text = firstChild?.value || '';
      if (text.includes('[SECTION:') || text.includes('[/SECTION')) return null;
      return <p className="text-slate-800 leading-relaxed">{children}</p>;
    },
    h1: ({ children }: any) => <h1 className="text-slate-900 font-bold text-2xl mb-3">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-slate-900 font-bold text-xl mb-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-slate-900 font-bold text-lg mb-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-slate-900 font-bold mb-1">{children}</h4>,
    li: ({ children }: any) => <li className="text-slate-800">{children}</li>,
    strong: ({ children }: any) => <strong className="text-slate-900 font-bold">{children}</strong>,
    code({ className, children, ...props }: any) {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200" {...props}>
            {children}
          </code>
        );
      }
      const codeStr = String(children).replace(/\n$/, '');
      return (
        <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 my-3 overflow-x-auto text-sm leading-relaxed">
          <code className="font-mono">
            {codeStr.split('\n').map((line: string, i: number) => {
              if (line.trimStart().startsWith('#')) {
                return <div key={i}><span style={{color:'#6a9955'}}>{line}</span></div>;
              }
              let highlighted = line
                .replace(/\b(def|class|return|if|elif|else|for|while|import|from|in|not|and|or|True|False|None|print|input|range|len|int|float|str|list)\b/g, '<kw>$1</kw>');
              highlighted = highlighted.replace(/(["'])(.*?)\1/g, '<str>$1$2$1</str>');
              const parts: React.ReactNode[] = [];
              let remaining = highlighted;
              let partKey = 0;
              while (remaining.length > 0) {
                const kwMatch = remaining.match(/^(.*?)<kw>(.*?)<\/kw>/);
                const strMatch = remaining.match(/^(.*?)<str>(.*?)<\/str>/);
                if (kwMatch && (!strMatch || (kwMatch.index ?? 0) <= (strMatch.index ?? 0))) {
                  if (kwMatch[1]) parts.push(<span key={partKey++}>{kwMatch[1]}</span>);
                  parts.push(<span key={partKey++} style={{color:'#569cd6'}}>{kwMatch[2]}</span>);
                  remaining = remaining.slice(kwMatch[0].length);
                } else if (strMatch) {
                  if (strMatch[1]) parts.push(<span key={partKey++}>{strMatch[1]}</span>);
                  parts.push(<span key={partKey++} style={{color:'#ce9178'}}>{strMatch[2]}</span>);
                  remaining = remaining.slice(strMatch[0].length);
                } else {
                  parts.push(<span key={partKey++}>{remaining.replace(/<\/?kw>|<\/?str>/g, '')}</span>);
                  break;
                }
              }
              return <div key={i}>{parts}</div>;
            })}
          </code>
        </pre>
      );
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">{worksheet.title}</h1>
                <p className="text-xs text-slate-600">{studentName} - {studentClass}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isTeacher && (
                <Link
                  to="/sharing-management"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Quản lý
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>{answeredCount}/{totalQuestions} câu</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Các phiếu học tập */}
        {sections.map((section) => {
          // Chia nội dung thành các block: markdown thường + câu hỏi (có ô nhập)
          // Cách tiếp cận: xử lý từng dòng, gom nhóm thành block markdown hoặc block câu hỏi
          const contentBlocks = buildInteractiveBlocks(section.content, section.id);

          return (
            <div key={section.id} className="mb-8">
              {/* Header phiếu */}
              <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                <h3 className="text-white font-bold text-xl">{section.title}</h3>
              </div>

              {/* Nội dung phiếu - hiển thị nội dung LLM, thay dòng chấm bằng ô nhập */}
              <div className="p-6 bg-white border-2 border-blue-600 border-t-0 rounded-b-lg shadow-sm">
                {contentBlocks.map((block, blockIdx) => {
                  if (block.type === 'markdown') {
                    return (
                      <div key={`${section.id}-block-${blockIdx}`} className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {block.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  // block.type === 'question_input'
                  const answerKey = `${section.id}-q_${block.questionNum}`;
                  const lines = getLineCount(answerKey);
                  const answerLines = (answers[answerKey] || '').split('\n');
                  return (
                    <div key={`${section.id}-block-${blockIdx}`}>
                      {/* Dòng câu hỏi */}
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {block.questionLine}
                        </ReactMarkdown>
                      </div>
                      {/* Ô nhập câu trả lời - nét liền */}
                      <div className="mt-1 mb-6 ml-2">
                        <div className="space-y-0">
                          {[...Array(lines)].map((_, lineIndex) => (
                            <div key={`${answerKey}-line-${lineIndex}`} className="w-full border-b border-gray-400">
                              <input
                                type="text"
                                value={answerLines[lineIndex] || ''}
                                onChange={(e) => {
                                  const newLines = [...answerLines];
                                  while (newLines.length <= lineIndex) newLines.push('');
                                  newLines[lineIndex] = e.target.value;
                                  handleAnswerChange(answerKey, newLines.join('\n'));
                                }}
                                className="w-full px-1 py-2 focus:outline-none bg-transparent text-black text-base border-none"
                                style={{ lineHeight: '1.8' }}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddLine(answerKey)}
                          className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm dòng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang nộp bài...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Nộp bài
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-600">
          <p>Phiếu học tập được tạo bởi <span className="font-medium text-blue-600">KHBD AI</span></p>
        </div>
      </footer>
    </div>
  );
};

export default PublicWorksheetPage;
