import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublicWorksheet, submitWorksheet } from "@/services/worksheetService";
import type { WorksheetPublic } from "@/services/worksheetService";

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
  
  console.log('🔍 Bắt đầu parse worksheet content...');
  console.log('📄 Content preview (first 500 chars):', content.substring(0, 500));
  
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
    
    console.log(`  ✓ Phiếu ${phieuNum}: ${questions.length} câu hỏi`);
    
    sections.push({
      id: `section_${phieuNum}`,
      title: `Phiếu học tập số ${phieuNum}`,
      content: phieuContent,
      questions: questions
    });
  }
  
  console.log(`✅ Parse xong: ${sections.length} sections`);
  
  // Nếu không tìm thấy markers, parse toàn bộ content như 1 phiếu duy nhất
  if (sections.length === 0) {
    console.log('⚠️ Không tìm thấy markers, parse toàn bộ content...');
    
    // Loại bỏ markers nếu có
    let cleanContent = content.replace(/\[SECTION:[^\]]+\]/g, '').trim();
    
    // Parse câu hỏi từ toàn bộ content
    const questions = parseQuestionsFromSection(cleanContent);
    
    console.log(`  ✓ Tìm thấy ${questions.length} câu hỏi`);
    
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
  
  // Tìm các pattern như "Câu 1:", "Câu hỏi 1:", "1.", "1)" 
  const patterns = [
    /(?:^|\n)(?:Câu|Bài|Question)\s*(\d+)[.:\s]*(.+?)(?=(?:\n(?:Câu|Bài|Question)\s*\d+[.:\s])|$)/gis,
    /(?:^|\n)(\d+)[.)]\s*(.+?)(?=(?:\n\d+[.)])|$)/gm,
  ];
  
  let foundQuestions = false;
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const questionNum = match[1];
      let questionText = match[2].trim();
      
      // Xóa dòng trống và giữ toàn bộ câu hỏi
      questionText = questionText.split('\n')[0].trim();
      
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

export const PublicWorksheetPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();

  // States
  const [worksheet, setWorksheet] = useState<WorksheetPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form nhập thông tin học sinh
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  // Answer state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load worksheet
  useEffect(() => {
    const loadWorksheet = async () => {
      console.log('🔍 PublicWorksheetPage - shareCode:', shareCode);
      if (!shareCode) {
        console.log('❌ No shareCode - aborting');
        return;
      }

      try {
        console.log('📡 Calling API with shareCode:', shareCode);
        setIsLoading(true);
        const data = await getPublicWorksheet(shareCode);
        console.log('✅ API response:', data);
        setWorksheet(data);
        
        // Parse worksheet sections to get all questions
        const sections = parseWorksheetSections(data.content);
        const initialAnswers: Record<string, string> = {};
        
        // Collect all questions from all sections
        sections.forEach(section => {
          section.questions.forEach(q => {
            initialAnswers[q.id] = '';
          });
        });
        
        setAnswers(initialAnswers);
      } catch (err: any) {
        console.error('❌ API error:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.detail || "Không thể tải phiếu học tập");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorksheet();
  }, [shareCode]);

  const handleStartWorksheet = () => {
    if (studentName.trim() && studentClass.trim()) {
      setHasStarted(true);
    }
  };

  const handleSubmit = async () => {
    if (!shareCode) return;
    
    setIsSubmitting(true);
    try {
      await submitWorksheet(shareCode, {
        student_name: studentName.trim(),
        student_class: studentClass.trim(),
        answers: answers,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
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

              <button
                onClick={handleStartWorksheet}
                disabled={!studentName.trim() || !studentClass.trim()}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main worksheet view - Lấy sections từ backend hoặc parse nếu không có
  const worksheetSections = worksheet.sections?.filter(s => s.section_type === 'phieu_hoc_tap') || [];
  
  console.log('📋 All worksheet sections:', worksheet.sections);
  console.log('✅ Filtered phieu sections:', worksheetSections);
  
  const sections = worksheetSections.length > 0 
    ? worksheetSections.map(s => ({
        id: s.section_id,
        title: s.title,
        content: s.content,
        questions: parseQuestionsFromSection(s.content)
      }))
    : parseWorksheetSections(worksheet.content);
  
  const allQuestions = sections.flatMap(s => s.questions);
  const answeredCount = Object.values(answers).filter(a => a.trim()).length;

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
            
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>{answeredCount}/{allQuestions.length} câu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Các phiếu học tập */}
        {sections.map((section, index) => (
              <div key={section.id} className="mb-8">
                {/* Header của phiếu con - giống như hoạt động 2.1, 2.2 */}
                <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                  <h3 className="text-white font-bold text-xl">{section.title}</h3>
                </div>
                
                {/* Nội dung phiếu con */}
                <div className="p-6 bg-white border-2 border-blue-600 border-t-0 rounded-b-lg shadow-sm space-y-6">
                  {/* Section Content */}
                  <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="w-full border-collapse border border-gray-400 text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-blue-100">{children}</thead>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-400 px-3 py-2 text-left font-bold text-black">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-400 px-3 py-2 text-black">
                            {children}
                          </td>
                    ),
                    p: ({ node, children }) => {
                      // Ẩn các dòng chứa markers
                      const firstChild = node?.children?.[0] as { value?: string } | undefined;
                      const text = firstChild?.value || '';
                      if (text.includes('[SECTION:') || text.includes('[/SECTION')) {
                        return null;
                      }
                      return <p className="text-black">{children}</p>;
                    },
                    h1: ({ children }) => (
                      <h1 className="text-black font-bold">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-black font-bold">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-black font-bold">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-black font-bold">{children}</h4>
                    ),
                    li: ({ children }) => (
                      <li className="text-black">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-black font-bold">{children}</strong>
                    ),
                  }}
                >
                  {section.content.replace(/\.{10,}/g, '')}
                </ReactMarkdown>
              </div>

                  {/* Section Questions */}
                  {section.questions.length > 0 && (
                    <div className="border-t border-gray-200 pt-6 space-y-8">
                      {section.questions.map((question, index) => (
                        <div key={question.id} className="mb-6">
                          <p className="text-lg font-bold text-black mb-4 break-words">
                            Câu {index + 1}: {question.question}
                          </p>
                          {question.type === 'textarea' ? (
                            <div className="space-y-2">
                              {[...Array(5)].map((_, lineIndex) => (
                                <div key={`${section.id}-${question.id}-line-${lineIndex}`} className="w-full border-b-2 border-gray-400">
                                  <input
                                    type="text"
                                    value={answers[`${section.id}-${question.id}`]?.split('\n')[lineIndex] || ''}
                                    onChange={(e) => {
                                      const lines = (answers[`${section.id}-${question.id}`] || '').split('\n');
                                      lines[lineIndex] = e.target.value;
                                      handleAnswerChange(`${section.id}-${question.id}`, lines.join('\n'));
                                    }}
                                    placeholder=""
                                    className="w-full px-0 py-2 focus:outline-none bg-transparent text-black text-base border-none"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="w-full border-b-2 border-gray-400">
                              <input
                                type="text"
                                value={answers[`${section.id}-${question.id}`] || ''}
                                onChange={(e) => handleAnswerChange(`${section.id}-${question.id}`, e.target.value)}
                                placeholder=""
                                className="w-full px-0 py-3 focus:outline-none bg-transparent text-black text-base border-none"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        
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
