import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Star,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getMyReviewTask,
  submitPeerReview,
  getMyFeedback,
  type MyReviewResponse,
  type FeedbackItem,
} from "@/services/peerReviewService";

// ========== Worksheet parsing (same as CollaborativeWorkspacePage) ==========
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

// Markdown components for proper rendering
const mdComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border-2 border-slate-300 dark:border-slate-600">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-slate-100 dark:bg-slate-700">{children}</thead>,
  th: ({ children }: any) => <th className="border-2 border-slate-300 dark:border-slate-600 px-4 py-3 text-left font-bold text-slate-800 dark:text-white">{children}</th>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">{children}</tr>,
  td: ({ children }: any) => (
    <td className="border-2 border-slate-300 dark:border-slate-600 px-4 py-3 align-top">
      <div className="text-slate-800 dark:text-slate-200">{children}</div>
    </td>
  ),
  p: ({ node, children }: any) => {
    const firstChild = node?.children?.[0] as { value?: string } | undefined;
    const text = firstChild?.value || '';
    if (text.includes('[SECTION:') || text.includes('[/SECTION')) return null;
    return <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{children}</p>;
  },
  h1: ({ children }: any) => <h1 className="text-slate-900 dark:text-white font-bold text-2xl mb-3">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-slate-900 dark:text-white font-bold text-xl mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-slate-900 dark:text-white font-bold mb-1">{children}</h4>,
  li: ({ children }: any) => <li className="text-slate-800 dark:text-slate-200">{children}</li>,
  strong: ({ children }: any) => <strong className="text-slate-900 dark:text-white font-bold">{children}</strong>,
  code({ className, children, ...props }: any) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-600" {...props}>
          {children}
        </code>
      );
    }
    const codeStr = String(children).replace(/\n$/, '');
    return (
      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 my-3 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono">{codeStr}</code>
      </pre>
    );
  },
};

const PeerReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);

  const [activeTab, setActiveTab] = useState<"review" | "feedback">("review");
  const [reviewData, setReviewData] = useState<MyReviewResponse | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Review form state
  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [score, setScore] = useState<number>(5);

  // Waiting state
  const [isWaiting, setIsWaiting] = useState(false);

  // Worksheet blocks for rendering
  const [worksheetBlocks, setWorksheetBlocks] = useState<InteractiveBlock[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState("Phiếu học tập");

  useEffect(() => {
    if (assignmentId) loadData();
  }, [assignmentId]);

  // Auto-refresh when waiting
  useEffect(() => {
    if (!isWaiting) return;
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [isWaiting, assignmentId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reviewResult, feedbackResult] = await Promise.all([
        getMyReviewTask(assignmentId),
        getMyFeedback(assignmentId),
      ]);
      setReviewData(reviewResult);
      setFeedback(feedbackResult.feedback);

      // Check if waiting
      const waiting = !reviewResult.review && reviewResult.message === "Chưa có vòng đánh giá";
      setIsWaiting(waiting);

      if (reviewResult.review?.submitted_at) {
        setSubmitted(true);
        setComments(reviewResult.review.comments || {});
        setScore(reviewResult.review.score || 5);
      }

      // Build worksheet blocks from worksheet_content
      if (reviewResult.worksheet_content && typeof reviewResult.worksheet_content === "string") {
        setWorksheetTitle(parseWorksheetTitle(reviewResult.worksheet_content));
        setWorksheetBlocks(buildInteractiveBlocks(reviewResult.worksheet_content));
      }
    } catch {
      setError("Lỗi khi tải dữ liệu đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData?.review) return;
    if (!window.confirm("Nộp nhận xét? Không thể sửa sau khi nộp.")) return;

    setSubmitting(true);
    try {
      const allComments = { ...comments, general: generalComment };
      await submitPeerReview(reviewData.review.id, allComments, score);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi nộp nhận xét");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ========== WAITING STATE ==========
  if (isWaiting || !reviewData?.review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Đánh giá chéo
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-10 text-center">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isWaiting ? "Đang chờ vòng đánh giá" : "Chưa có bài cần chấm"}
              </h2>
              <p className="text-blue-100">
                {isWaiting
                  ? "Đang chờ giáo viên kích hoạt vòng đánh giá chéo..."
                  : reviewData?.message || "Bạn không có bài nào được phân công chấm."}
              </p>
            </div>

            <div className="p-8 text-center">
              {isWaiting && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Tự động kiểm tra mỗi 10 giây
                </p>
              )}
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Kiểm tra ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Đánh giá chéo
          </h1>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "review"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Chấm bài
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "feedback"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Nhận xét nhận được ({feedback.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ========== REVIEW TAB ========== */}
        {activeTab === "review" && (
          <div className="flex gap-6">
            {/* Left: Worksheet display */}
            <div className="flex-1 min-w-0">
              {submitted ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-green-200 dark:border-green-800 p-10 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Đã nộp nhận xét!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Điểm đã cho: <span className="font-semibold text-green-600">{score}/10</span>
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {worksheetTitle}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">Bài làm của bạn khác</p>
                  </div>

                  <div className="p-6">
                    {worksheetBlocks.length > 0 ? (
                      <div className="space-y-6">
                        {worksheetBlocks.map((block, blockIdx) => {
                          if (block.type === "markdown") {
                            return (
                              <div key={`md-${blockIdx}`} className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                  {block.text}
                                </ReactMarkdown>
                              </div>
                            );
                          }

                          const answerKey = `q_${block.questionNum}`;
                          const answer = reviewData?.reviewee_answers?.[answerKey] || "";

                          return (
                            <div key={`q-${blockIdx}`} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                  {block.questionLine}
                                </ReactMarkdown>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                                  Câu trả lời:
                                </p>
                                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {answer || "(Chưa trả lời)"}
                                </p>
                              </div>
                              <div className="mt-3">
                                <input
                                  type="text"
                                  placeholder={`Nhận xét cho câu ${block.questionNum}...`}
                                  value={comments[block.questionNum] || ""}
                                  onChange={(e) => setComments((prev) => ({ ...prev, [block.questionNum]: e.target.value }))}
                                  className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviewData?.reviewee_answers && Object.entries(reviewData.reviewee_answers)
                          .filter(([key]) => !key.startsWith("_"))
                          .map(([qId, answer]) => {
                            const question = reviewData.questions?.find(
                              (q) => q.id === qId || String(q.id) === qId
                            );
                            const questionText = question?.question || question?.text || question?.title || question?.description;

                            return (
                              <div key={qId} className="border-l-4 border-blue-500 pl-4 py-2">
                                <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2">
                                  Câu {qId}
                                </h4>
                                {questionText && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border-l-4 border-blue-400">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{questionText}</p>
                                  </div>
                                )}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                                    Câu trả lời:
                                  </p>
                                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                    {String(answer) || "(Chưa trả lời)"}
                                  </p>
                                </div>
                                <div className="mt-3">
                                  <input
                                    type="text"
                                    placeholder={`Nhận xét cho câu ${qId}...`}
                                    value={comments[qId] || ""}
                                    onChange={(e) => setComments((prev) => ({ ...prev, [qId]: e.target.value }))}
                                    className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Scoring sidebar */}
            {!submitted && (
              <div className="w-72 flex-shrink-0">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-20">
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500">
                    <h3 className="font-medium text-white">Đánh giá bài làm</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nhận xét chung
                      </label>
                      <textarea
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        placeholder="Viết nhận xét về bài làm..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Cho điểm
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => setScore(n)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                              score >= n
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-center text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {score}/10
                      </p>
                    </div>

                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-medium shadow-lg transition-all"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      Nộp đánh giá
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== FEEDBACK TAB ========== */}
        {activeTab === "feedback" && (
          <div>
            {feedback.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-10 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400">
                  Chưa có nhận xét nào
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Từ: <span className="font-medium text-slate-700 dark:text-slate-200">{fb.reviewer_name}</span>
                      </span>
                      {fb.score && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-medium text-amber-700 dark:text-amber-400">
                            {fb.score}/10
                          </span>
                        </div>
                      )}
                    </div>

                    {Object.entries(fb.comments).map(([key, comment]) => (
                      <div key={key} className="mb-3">
                        <span className="text-xs text-slate-500 font-medium uppercase">
                          {key === "general" ? "Nhận xét chung" : `Câu ${key}`}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 mt-1">
                          {comment}
                        </p>
                      </div>
                    ))}

                    {fb.submitted_at && (
                      <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        {new Date(fb.submitted_at).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerReviewPage;
