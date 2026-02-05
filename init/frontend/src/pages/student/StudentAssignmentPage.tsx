import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  FileText,
  HelpCircle,
  Code2,
  Users,
  User,
  Loader2,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Crown,
  BookOpen,
} from "lucide-react";
import {
  getAssignmentDetail,
  startWorkSession,
  type AssignmentContentResponse,
} from "@/services/studentService";
import { getMyFeedback, type FeedbackItem } from "@/services/peerReviewService";

// Worksheet parsing helpers
interface InteractiveBlock {
  type: "markdown" | "question_input";
  text: string;
  questionLine: string;
  questionNum: string;
}

const buildInteractiveBlocks = (content: string): InteractiveBlock[] => {
  const blocks: InteractiveBlock[] = [];
  const questionLinePattern = /^\s*\*{0,2}\s*(?:Câu|Bài|Question)\s+(\d+)\s*[.:]/i;
  const dotLinePattern = /^\s*\.{3,}\s*$/;
  const studentInfoPattern = /^\s*\*{0,2}\s*(?:Họ và tên|Họ tên|HỌ VÀ TÊN|HỌ TÊN|Nhóm|NHÓM|Lớp|LỚP)\s*\*{0,2}\s*:/i;

  const lines = content.split("\n");
  let currentMarkdown: string[] = [];
  let inCodeBlock = false;

  const flushMarkdown = () => {
    const text = currentMarkdown.join("\n").trim();
    if (text) blocks.push({ type: "markdown", text, questionLine: "", questionNum: "" });
    currentMarkdown = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) { inCodeBlock = !inCodeBlock; currentMarkdown.push(line); continue; }
    if (inCodeBlock) { currentMarkdown.push(line); continue; }
    if (dotLinePattern.test(line)) continue;
    if (studentInfoPattern.test(line)) {
      const withoutDots = line.replace(/\.{2,}/g, "").replace(/\*{1,2}/g, "").trim();
      if (/^(?:Họ và tên|Họ tên|Nhóm|Lớp)\s*:\s*$/i.test(withoutDots)) continue;
    }
    const cleanedLine = line.replace(/\.{3,}/g, "");
    const qMatch = cleanedLine.match(questionLinePattern);
    if (qMatch) { flushMarkdown(); blocks.push({ type: "question_input", text: "", questionLine: cleanedLine, questionNum: qMatch[1] }); continue; }
    currentMarkdown.push(cleanedLine);
  }
  flushMarkdown();

  if (blocks.length === 0 && content.trim()) {
    blocks.push({ type: 'markdown', text: content.trim(), questionLine: '', questionNum: '' });
  }

  return blocks;
};

const parseWorksheetTitle = (content: string): string => {
  const m = content.match(/\*\*PHIẾU HỌC TẬP SỐ (\d+)\*\*/i);
  return m ? `Phiếu học tập số ${m[1]}` : "Phiếu học tập";
};

const mdComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>,
  th: ({ children }: any) => <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">{children}</th>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr>{children}</tr>,
  td: ({ children }: any) => <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{children}</td>,
  p: ({ node, children }: any) => {
    const firstChild = node?.children?.[0] as { value?: string } | undefined;
    const text = firstChild?.value || '';
    if (text.includes('[SECTION:') || text.includes('[/SECTION')) return null;
    return <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-2">{children}</p>;
  },
  h1: ({ children }: any) => <h1 className="text-gray-900 dark:text-white font-bold text-xl mb-3">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{children}</h3>,
  li: ({ children }: any) => <li className="text-gray-700 dark:text-gray-200">{children}</li>,
  strong: ({ children }: any) => <strong className="text-gray-900 dark:text-white font-semibold">{children}</strong>,
  code({ className, children, ...props }: any) {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    }
    const codeStr = String(children).replace(/\n$/, '');
    return <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto text-sm"><code className="font-mono">{codeStr}</code></pre>;
  },
};

const StudentAssignmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);

  const [data, setData] = useState<AssignmentContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [showWorksheetModal, setShowWorksheetModal] = useState(false);
  const [worksheetBlocks, setWorksheetBlocks] = useState<InteractiveBlock[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState("Phiếu học tập");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assignmentId) loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAssignmentDetail(assignmentId);
      setData(result);

      // Parse worksheet content if available
      if (result.content?.content && typeof result.content.content === "string") {
        setWorksheetTitle(parseWorksheetTitle(result.content.content));
        setWorksheetBlocks(buildInteractiveBlocks(result.content.content));
      }

      // Get answers from work session
      if (result.work_session?.answers) {
        setAnswers(result.work_session.answers);
      }
    } catch {
      setError("Lỗi khi tải bài tập");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    setStarting(true);
    try {
      await startWorkSession(assignmentId);
      navigate(`/student/assignment/${assignmentId}/workspace`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi bắt đầu làm bài");
    } finally {
      setStarting(false);
    }
  };

  const handleViewFeedback = async () => {
    setShowFeedbackModal(true);
    setLoadingFeedback(true);
    try {
      const result = await getMyFeedback(assignmentId);
      setFeedback(result.feedback);
    } catch {}
    finally {
      setLoadingFeedback(false);
    }
  };

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case "worksheet": return <FileText className="w-5 h-5" />;
      case "quiz": return <HelpCircle className="w-5 h-5" />;
      case "code_exercise": return <Code2 className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const contentTypeLabel = (type: string) => {
    switch (type) {
      case "worksheet": return "Phiếu bài tập";
      case "quiz": return "Quiz";
      case "code_exercise": return "Bài code";
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">{error || "Không tìm thấy bài tập"}</p>
      </div>
    );
  }

  const a = data.assignment;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/student/dashboard")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Quay lại">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {contentTypeIcon(a.content_type)}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{a.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <span>{contentTypeLabel(a.content_type)}</span>
              <span>•</span>
              <span>{a.classroom_name}</span>
              {a.lesson_info?.lesson_name && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400">{a.lesson_info.lesson_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Info bar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                {a.work_type === "group" ? <Users className="w-5 h-5 text-purple-500" /> : <User className="w-5 h-5 text-blue-500" />}
                <span className="font-medium">{a.work_type === "group" ? "Làm nhóm" : "Cá nhân"}</span>
              </span>
              {a.due_date && (
                <span className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span>{new Date(a.due_date).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              )}
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              a.status === "submitted" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
              a.status === "in_progress" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
              "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}>
              {a.status === "submitted" ? "Đã nộp" : a.status === "in_progress" ? "Đang làm" : "Chưa làm"}
            </span>
          </div>

          {/* Main content */}
          <div className="p-6">
            {a.status === "submitted" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bạn đã nộp bài này</h2>
                <p className="text-gray-500 mb-6">Xem lại bài làm hoặc xem đánh giá từ các nhóm khác</p>
                <div className="flex items-center justify-center gap-3">
                  {a.content_type === "worksheet" && worksheetBlocks.length > 0 && (
                    <button
                      onClick={() => setShowWorksheetModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    >
                      <BookOpen className="w-5 h-5" />
                      Xem bài làm
                    </button>
                  )}
                  <button
                    onClick={handleViewFeedback}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <Eye className="w-5 h-5" />
                    Xem đánh giá
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* No group warning */}
                {a.work_type === "group" && !data.my_group && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg mb-6">
                    Bạn chưa được phân vào nhóm nào. Hãy liên hệ giáo viên.
                  </div>
                )}

                {/* Group info */}
                {a.work_type === "group" && data.my_group && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{data.my_group.group_name}</span>
                      <span className="text-sm text-gray-500">({data.my_group.members.length} thành viên)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.my_group.members.map((m) => (
                        <div key={m.student_id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                            {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">{m.full_name}</span>
                          {m.is_leader && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start button */}
                <button
                  onClick={handleStartSession}
                  disabled={starting || (a.work_type === "group" && !data.my_group)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
                >
                  {starting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {a.status === "in_progress" ? "Tiếp tục làm bài" : "Bắt đầu làm bài"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Đánh giá từ nhóm khác</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingFeedback ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((fb) => (
                    <div key={fb.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{fb.reviewer_name}</span>
                        {fb.score && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-semibold">
                            {fb.score}/10
                          </span>
                        )}
                      </div>
                      {fb.comments.general && (
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{fb.comments.general}</p>
                      )}
                      {Object.entries(fb.comments)
                        .filter(([key]) => key !== "general")
                        .map(([key, comment]) => (
                          <p key={key} className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Câu {key}:</span> {comment}
                          </p>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Worksheet Modal - Xem lại bài làm */}
      {showWorksheetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{worksheetTitle}</h3>
              </div>
              <button onClick={() => setShowWorksheetModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {worksheetBlocks.map((block, idx) => {
                  if (block.type === "markdown") {
                    return (
                      <div key={`md-${idx}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.text}</ReactMarkdown>
                      </div>
                    );
                  }
                  const answerKey = `q_${block.questionNum}`;
                  const answer = answers[answerKey] || "";
                  return (
                    <div key={`q-${idx}`} className="border-l-4 border-blue-500 pl-4">
                      <div className="mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.questionLine}</ReactMarkdown>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Câu trả lời của nhóm:</p>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{answer || "(Chưa trả lời)"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentPage;
