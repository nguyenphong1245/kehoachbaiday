import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConfirm } from "@/components/common/ConfirmDialog";
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
import { usePageTitle } from "@/hooks/usePageTitle";

// ========== Worksheet parsing (same as CollaborativeWorkspacePage) ==========
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
      let questionCode: string | undefined;
      let j = i + 1;
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
        i = j - 1;
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

// Markdown components for proper rendering
const mdComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border-2 border-stone-300 dark:border-stone-600">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-stone-100 dark:bg-stone-700">{children}</thead>,
  th: ({ children }: any) => <th className="border-2 border-stone-300 dark:border-stone-600 px-4 py-3 text-left font-bold text-stone-800 dark:text-white">{children}</th>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/50">{children}</tr>,
  td: ({ children }: any) => (
    <td className="border-2 border-stone-300 dark:border-stone-600 px-4 py-3 align-top">
      <div className="text-stone-800 dark:text-stone-200">{children}</div>
    </td>
  ),
  p: ({ node, children }: any) => {
    const firstChild = node?.children?.[0] as { value?: string } | undefined;
    const text = firstChild?.value || '';
    if (text.includes('[SECTION:') || text.includes('[/SECTION')) return null;
    return <p className="text-stone-800 dark:text-stone-200 leading-relaxed">{children}</p>;
  },
  h1: ({ children }: any) => <h1 className="text-stone-900 dark:text-white font-bold text-2xl mb-3">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-stone-900 dark:text-white font-bold text-xl mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-stone-900 dark:text-white font-bold text-lg mb-2">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-stone-900 dark:text-white font-bold mb-1">{children}</h4>,
  li: ({ children }: any) => <li className="text-stone-800 dark:text-stone-200">{children}</li>,
  strong: ({ children }: any) => <strong className="text-stone-900 dark:text-white font-bold">{children}</strong>,
  code({ className, children, ...props }: any) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-sm font-mono border border-stone-200 dark:border-stone-600" {...props}>
          {children}
        </code>
      );
    }
    const codeStr = String(children).replace(/\n$/, '');
    return (
      <pre className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-lg p-4 my-3 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono">{codeStr}</code>
      </pre>
    );
  },
};

const PeerReviewPage: React.FC = () => {
  usePageTitle("Đánh giá chéo");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);
  const { confirm, ConfirmDialog, dialogProps } = useConfirm();

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
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Bài tập đã bị xóa hoặc không tồn tại.");
      } else {
        setError("Lỗi khi tải dữ liệu đánh giá");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData?.review) return;
    const ok = await confirm({ title: "Nộp nhận xét", message: "Nộp nhận xét? Không thể sửa sau khi nộp.", confirmText: "Nộp", cancelText: "Huỷ" });
    if (!ok) return;

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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand mx-auto mb-3" />
          <p className="text-stone-600 dark:text-stone-300">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !reviewData) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500">{error}</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark text-sm"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // ========== WAITING STATE ==========
  if (isWaiting || !reviewData?.review) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            </button>
            <h1 className="text-lg font-semibold text-stone-900 dark:text-white">
              Đánh giá chéo
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            <div className="bg-brand px-8 py-10 text-center">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isWaiting ? "Đang chờ vòng đánh giá" : "Chưa có bài cần chấm"}
              </h2>
              <p className="text-sky-100">
                {isWaiting
                  ? "Đang chờ giáo viên kích hoạt vòng đánh giá chéo..."
                  : reviewData?.message || "Bạn không có bài nào được phân công chấm."}
              </p>
            </div>

            <div className="p-8 text-center">
              {isWaiting && (
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Tự động kiểm tra mỗi 10 giây
                </p>
              )}
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-medium"
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-300" />
          </button>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-white">
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
        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "review"
                ? "border-brand text-brand dark:text-sky-400"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Chấm bài
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "feedback"
                ? "border-brand text-brand dark:text-sky-400"
                : "border-transparent text-stone-500 hover:text-stone-700"
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Worksheet display */}
            <div className="flex-1 min-w-0">
              {submitted ? (
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-green-200 dark:border-green-800 p-10 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                    Đã nộp nhận xét!
                  </h2>
                  <p className="text-stone-600 dark:text-stone-300">
                    Điểm đã cho: <span className="font-semibold text-green-600">{score}/10</span>
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-brand px-3 sm:px-6 py-4">
                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {worksheetTitle}
                    </h3>
                    <p className="text-sky-100 text-sm mt-1">Bài làm của bạn khác</p>
                  </div>

                  <div className="p-3 sm:p-6 space-y-5">
                    {(() => {
                      const answers = reviewData?.reviewee_answers || {};
                      const hasBlocks = worksheetBlocks.length > 0;
                      const questionKeys = !hasBlocks ? Object.entries(answers)
                        .filter(([key]) => key.startsWith("q_"))
                        .sort(([a], [b]) => parseInt(a.replace("q_", "")) - parseInt(b.replace("q_", ""))) : [];

                      return (
                        <>
                          {/* Worksheet card */}
                          <div className="rounded-lg overflow-hidden border-2 border-sky-400">
                            <div className="bg-sky-500 px-5 py-3">
                              <h4 className="text-white font-bold text-base">{worksheetTitle}</h4>
                            </div>
                            <div className="bg-white dark:bg-stone-800 px-5 py-4 space-y-4">
                              {hasBlocks ? (
                                worksheetBlocks.map((block, idx) => {
                                  if (block.type === "markdown") {
                                    return (
                                      <div key={`md-${idx}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.text}</ReactMarkdown>
                                      </div>
                                    );
                                  }
                                  const answerKey = `q_${block.questionNum}`;
                                  const answer = answers[answerKey] || "";
                                  const answerLines = String(answer || "").split("\n");
                                  return (
                                    <div key={`q-${idx}`}>
                                      <div className="mb-1">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.questionLine}</ReactMarkdown>
                                      </div>
                                      {block.codeBlock && (
                                        <div className="mb-2">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.codeBlock}</ReactMarkdown>
                                        </div>
                                      )}
                                      <div className="ml-1 mb-4">
                                        {(answerLines.length > 0 && answer ? answerLines : [""]).map((line, li) => (
                                          <div key={li} className="border-b border-stone-400 px-1 py-2 min-h-[2rem]">
                                            <span className="text-sm text-blue-700 dark:text-blue-400">{line}</span>
                                          </div>
                                        ))}
                                        {answerLines.length < 3 && [...Array(3 - Math.max(answerLines.length, answer ? 1 : 0))].map((_, li) => (
                                          <div key={`empty-${li}`} className="border-b border-stone-400 px-1 py-2 min-h-[2rem]" />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                questionKeys.map(([qId, answer]) => {
                                  const qNum = qId.replace("q_", "");
                                  const answerLines = String(answer || "").split("\n");
                                  return (
                                    <div key={qId}>
                                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1"><strong>Câu {qNum}:</strong></p>
                                      <div className="ml-1 mb-4">
                                        {(answerLines.length > 0 && answer ? answerLines : [""]).map((line, li) => (
                                          <div key={li} className="border-b border-stone-400 px-1 py-2 min-h-[2rem]">
                                            <span className="text-sm text-blue-700 dark:text-blue-400">{typeof line === "object" ? JSON.stringify(line) : String(line)}</span>
                                          </div>
                                        ))}
                                        {answerLines.length < 3 && [...Array(3 - Math.max(answerLines.length, answer ? 1 : 0))].map((_, li) => (
                                          <div key={`empty-${li}`} className="border-b border-stone-400 px-1 py-2 min-h-[2rem]" />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Review comments */}
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Nhận xét từng câu</p>
                            {(hasBlocks
                              ? worksheetBlocks.filter(b => b.type === "question_input").map(b => ({ num: b.questionNum }))
                              : questionKeys.map(([qId]) => ({ num: qId.replace("q_", "") }))
                            ).map(({ num }) => (
                              <div key={num} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-stone-600 dark:text-stone-400 whitespace-nowrap">Câu {num}:</span>
                                <input
                                  type="text"
                                  placeholder="Nhận xét..."
                                  value={comments[num] || ""}
                                  onChange={(e) => setComments((prev) => ({ ...prev, [num]: e.target.value }))}
                                  className="flex-1 px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Scoring sidebar */}
            {!submitted && (
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden sticky top-20">
                  <div className="px-4 py-3 bg-amber-500">
                    <h3 className="font-medium text-white">Đánh giá bài làm</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Nhận xét chung
                      </label>
                      <textarea
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        placeholder="Viết nhận xét về bài làm..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Cho điểm
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => setScore(n)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                              score >= n
                                ? "bg-amber-500 text-white shadow-md"
                                : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600"
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-lg transition-all"
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
              <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 p-10 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
                <p className="text-stone-500 dark:text-stone-400">
                  Chưa có nhận xét nào
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-stone-500 dark:text-stone-400">
                        Từ: <span className="font-medium text-stone-700 dark:text-stone-200">{fb.reviewer_name}</span>
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
                        <span className="text-xs text-stone-500 font-medium uppercase">
                          {key === "general" ? "Nhận xét chung" : `Câu ${key}`}
                        </span>
                        <p className="text-stone-700 dark:text-stone-200 mt-1">
                          {comment}
                        </p>
                      </div>
                    ))}

                    {fb.submitted_at && (
                      <p className="text-xs text-stone-400 mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
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
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default PeerReviewPage;
