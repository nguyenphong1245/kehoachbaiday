import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Loader2,
  CheckCircle2,
  X,
  Crown,
} from "lucide-react";
import {
  getAssignmentDetail,
  startWorkSession,
  type AssignmentContentResponse,
} from "@/services/studentService";
import { getMyFeedback, type FeedbackItem } from "@/services/peerReviewService";
import { usePageTitle } from "@/hooks/usePageTitle";

// Worksheet parsing helpers
interface InteractiveBlock {
  type: "markdown" | "question_input";
  text: string;
  questionLine: string;
  questionNum: string;
  codeBlock?: string;
}

const buildInteractiveBlocks = (content: string): InteractiveBlock[] => {
  const blocks: InteractiveBlock[] = [];
  const questionLinePattern = /^\s*\*{0,2}\s*(?:Câu|Bài|Question)\s+(\d+)\s*[.:]/i;
  const dotLinePattern = /^\s*\.{3,}\s*$/;
  const studentInfoPattern = /^\s*\*{0,2}\s*(?:Họ và tên|Họ tên|HỌ VÀ TÊN|HỌ TÊN|Nhóm|NHÓM|Lớp|LỚP)\s*\*{0,2}\s*:/i;
  const sectionHeaderPattern = /^\s*#{1,4}\s*\*{0,2}\s*(?:I{1,3}V?|V?I{0,3})\.\s*PHỤ LỤC/i;
  const worksheetTitlePattern = /^\s*\*{0,2}\s*PHIẾU HỌC TẬP\s*(?:SỐ\s*\d+)?\s*\*{0,2}\s*$/i;

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
    const stripped = line.replace(/\*/g, "").trim();
    if (sectionHeaderPattern.test(line) || sectionHeaderPattern.test(stripped)) continue;
    if (worksheetTitlePattern.test(line) || worksheetTitlePattern.test(stripped)) continue;
    if (studentInfoPattern.test(line)) {
      const withoutDots = line.replace(/\.{2,}/g, "").replace(/\*{1,2}/g, "").trim();
      if (/^(?:Họ và tên|Họ tên|Nhóm|Lớp)\s*:\s*$/i.test(withoutDots)) continue;
    }
    const cleanedLine = line.replace(/\.{3,}/g, "");
    const qMatch = cleanedLine.match(questionLinePattern);
    if (qMatch) {
      flushMarkdown();
      // Look ahead for code block immediately after question
      let questionCode: string | undefined;
      let j = i + 1;
      // Skip blank lines
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length && lines[j].trim().startsWith("```")) {
        const codeLines: string[] = [lines[j]];
        j++;
        while (j < lines.length && !lines[j].trim().startsWith("```")) {
          codeLines.push(lines[j]);
          j++;
        }
        if (j < lines.length) { codeLines.push(lines[j]); j++; }
        questionCode = codeLines.join("\n");
        i = j - 1; // Advance past the code block
      }
      blocks.push({ type: "question_input", text: "", questionLine: cleanedLine, questionNum: qMatch[1], codeBlock: questionCode });
      continue;
    }
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
      <table className="w-full border-collapse border border-stone-300 dark:border-stone-600">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-stone-100 dark:bg-stone-700">{children}</thead>,
  th: ({ children }: any) => <th className="border border-stone-300 dark:border-stone-600 px-3 py-2 text-left text-sm font-semibold text-stone-800 dark:text-stone-100">{children}</th>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr>{children}</tr>,
  td: ({ children }: any) => <td className="border border-stone-300 dark:border-stone-600 px-3 py-2 text-sm text-stone-700 dark:text-stone-200">{children}</td>,
  p: ({ node, children }: any) => {
    const firstChild = node?.children?.[0] as { value?: string } | undefined;
    const text = firstChild?.value || '';
    if (text.includes('[SECTION:') || text.includes('[/SECTION')) return null;
    return <p className="text-stone-700 dark:text-stone-200 leading-relaxed mb-2">{children}</p>;
  },
  h1: ({ children }: any) => <h1 className="text-stone-900 dark:text-white font-bold text-xl mb-3">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-stone-900 dark:text-white font-bold text-lg mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-stone-900 dark:text-white font-semibold mb-2">{children}</h3>,
  li: ({ children }: any) => <li className="text-stone-700 dark:text-stone-200">{children}</li>,
  strong: ({ children }: any) => <strong className="text-stone-900 dark:text-white font-semibold">{children}</strong>,
  code({ className, children, ...props }: any) {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    }
    const codeStr = String(children).replace(/\n$/, '');
    return <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 my-3 overflow-x-auto text-sm"><code className="font-mono">{codeStr}</code></pre>;
  },
};

const StudentAssignmentPage: React.FC = () => {
  usePageTitle("Bài tập");
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
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Bài tập đã bị xóa hoặc không tồn tại.");
      } else {
        setError("Lỗi khi tải bài tập");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    // If session already exists (in_progress), navigate directly without calling startWorkSession
    if (data?.assignment?.status === "in_progress") {
      navigate(`/student/assignment/${assignmentId}/workspace`);
      return;
    }

    setStarting(true);
    try {
      await startWorkSession(assignmentId);
      navigate(`/student/assignment/${assignmentId}/workspace`);
    } catch (err: any) {
      // Retry once on failure (handles race condition for group sessions)
      try {
        await startWorkSession(assignmentId);
        navigate(`/student/assignment/${assignmentId}/workspace`);
      } catch (retryErr: any) {
        // If still fails, try navigating directly (session might already exist)
        if (retryErr?.response?.status === 400 || retryErr?.response?.status === 409) {
          navigate(`/student/assignment/${assignmentId}/workspace`);
        } else {
          setError(retryErr?.response?.data?.detail || "Lỗi khi bắt đầu làm bài");
        }
      }
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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500">{error || "Không tìm thấy bài tập"}</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark text-sm"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const a = data.assignment;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-base font-semibold text-stone-900 dark:text-white">{a.title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
            <span>{contentTypeLabel(a.content_type)}</span>
            <span>·</span>
            <span>{a.classroom_name}</span>
            {a.lesson_info?.lesson_name && (
              <>
                <span>·</span>
                <span>{a.lesson_info.lesson_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {a.status === "submitted" ? (
          <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-stone-500 mb-4">Đã nộp bài</p>
            <div className="flex items-center justify-center gap-2">
              {a.content_type === "worksheet" && worksheetBlocks.length > 0 && (
                <button
                  onClick={() => setShowWorksheetModal(true)}
                  className="px-4 py-2 text-sm border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700"
                >
                  Xem bài làm
                </button>
              )}
              <button
                onClick={handleViewFeedback}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark"
              >
                Xem đánh giá
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Info */}
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <span>{a.work_type === "group" ? "Nhóm" : "Cá nhân"}</span>
              {a.due_date && (
                <>
                  <span className="text-stone-300">·</span>
                  <span>Hạn: {new Date(a.due_date).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </>
              )}
              {a.status === "in_progress" && (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="text-sky-600 dark:text-sky-400">Đang làm</span>
                </>
              )}
            </div>

            {/* No group warning */}
            {a.work_type === "group" && !data.my_group && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-lg">
                Bạn chưa được phân vào nhóm nào. Hãy liên hệ giáo viên.
              </div>
            )}

            {/* Group members */}
            {a.work_type === "group" && data.my_group && (
              <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">{data.my_group.group_name}</p>
                <div className="flex flex-wrap gap-2">
                  {data.my_group.members.map((m) => (
                    <span key={m.student_id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-700 rounded-md text-sm text-stone-700 dark:text-stone-300">
                      {m.full_name}
                      {m.is_leader && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStartSession}
              disabled={starting || (a.work_type === "group" && !data.my_group)}
              className="w-full py-3 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
              {starting && <Loader2 className="w-4 h-4 animate-spin" />}
              {a.status === "in_progress" ? "Tiếp tục làm bài" : "Bắt đầu làm bài"}
            </button>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="px-3 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Đánh giá từ nhóm khác</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[60vh]">
              {loadingFeedback ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-500">Chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((fb, fbIdx) => (
                    <div key={fb.id} className="border border-stone-200 dark:border-stone-600 rounded-lg overflow-hidden">
                      <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-700/50 flex items-center justify-between">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Đánh giá #{fbIdx + 1}</span>
                        {fb.score != null && (
                          <span className="text-sm font-semibold text-stone-900 dark:text-white">{fb.score}/10</span>
                        )}
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        {fb.comments.general && (
                          <p className="text-sm text-stone-700 dark:text-stone-300">{fb.comments.general}</p>
                        )}
                        {Object.entries(fb.comments)
                          .filter(([key]) => key !== "general")
                          .sort(([a], [b]) => {
                            const numA = parseInt(a) || 0;
                            const numB = parseInt(b) || 0;
                            return numA - numB;
                          })
                          .map(([key, comment]) => (
                            <div key={key} className="flex gap-2 text-sm">
                              <span className="text-stone-400 whitespace-nowrap">Câu {key}:</span>
                              <span className="text-stone-600 dark:text-stone-300">{comment}</span>
                            </div>
                          ))}
                        {Object.keys(fb.comments).length === 0 && (
                          <p className="text-sm text-stone-400 italic">Không có nhận xét</p>
                        )}
                      </div>
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
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-3 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between bg-sky-50 dark:bg-sky-900/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand dark:text-sky-400" />
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">{worksheetTitle}</h3>
              </div>
              <button onClick={() => setShowWorksheetModal(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
                    <div key={`q-${idx}`} className="border-l-4 border-brand pl-4">
                      <div className="mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.questionLine}</ReactMarkdown>
                      </div>
                      {block.codeBlock && (
                        <div className="mb-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.codeBlock}</ReactMarkdown>
                        </div>
                      )}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Câu trả lời của nhóm:</p>
                        <p className="text-stone-800 dark:text-stone-200 whitespace-pre-wrap">{answer || "(Chưa trả lời)"}</p>
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
