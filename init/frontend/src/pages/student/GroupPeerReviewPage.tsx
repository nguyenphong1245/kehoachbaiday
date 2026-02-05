import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Crown,
  Users,
  FileText,
  RefreshCw,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getMyReviewTask,
  submitPeerReview,
  type MyReviewResponse,
  type GroupMemberInfo,
} from "@/services/peerReviewService";
import {
  getMemberEvaluationStatus,
  evaluateGroupMembers,
  getDiscussion,
  type MemberEvaluationStatus,
} from "@/services/studentService";
import { useCollaboration } from "@/hooks/useCollaboration";
import { getStoredAuthUser } from "@/utils/authStorage";

// ========== Worksheet parsing ==========
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

const GroupPeerReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);
  const currentUser = getStoredAuthUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [reviewData, setReviewData] = useState<MyReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [score, setScore] = useState<number>(5);

  const [isLeader, setIsLeader] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMemberInfo[]>([]);
  const [groupName, setGroupName] = useState("");
  const [workSessionId, setWorkSessionId] = useState<number>(0);

  const [isWaiting, setIsWaiting] = useState(false);
  const [worksheetBlocks, setWorksheetBlocks] = useState<InteractiveBlock[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState("Phiếu học tập");

  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  // Member evaluation state (cross-evaluation)
  const [evalStatus, setEvalStatus] = useState<MemberEvaluationStatus | null>(null);
  const [evalRatings, setEvalRatings] = useState<Record<number, number>>({});
  const [evalComments, setEvalComments] = useState<Record<number, string>>({});
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [showEvalInWaiting, setShowEvalInWaiting] = useState(false);

  // Use collaboration hook with peer review sync callbacks
  const {
    chatMessages,
    membersOnline,
    connected,
    sendChatMessage,
    loadChatHistory,
    sendPeerReviewComment,
    sendPeerReviewScore,
    peerReviewComments,
    peerReviewScore,
    loadPeerReviewState,
  } = useCollaboration({
    sessionId: workSessionId,
    onPeerReviewComment: (questionId, comment, userId, userName) => {
      console.log(`[WS Received] peer_review_comment: q=${questionId}, from=${userName}(${userId}), me=${currentUser?.id}`);
      // Update local comments state when receiving from others
      if (userId !== currentUser?.id) {
        console.log(`[WS Received] Updating comment for q=${questionId}`);
        setComments(prev => ({ ...prev, [questionId]: comment }));
      }
    },
    onPeerReviewScore: (newScore, userId, userName) => {
      console.log(`[WS Received] peer_review_score: score=${newScore}, from=${userName}(${userId}), me=${currentUser?.id}`);
      // Update local score state when receiving from leader
      if (userId !== currentUser?.id) {
        console.log(`[WS Received] Updating score to ${newScore}`);
        setScore(newScore);
      }
    },
  });

  useEffect(() => {
    if (assignmentId) loadData();
  }, [assignmentId]);

  useEffect(() => {
    if (!isWaiting) return;
    const interval = setInterval(() => loadData(), 10000);
    return () => clearInterval(interval);
  }, [isWaiting, assignmentId]);

  useEffect(() => {
    if (isWaiting || isLeader || submitted) return;
    const interval = setInterval(async () => {
      try {
        const result = await getMyReviewTask(assignmentId);
        if (result.review?.submitted_at) {
          // Instead of navigating away, show submitted state for member evaluation
          setSubmitted(true);
          setScore(result.review.score || 5);
          setComments(result.review.comments || {});
          // Reload member evaluation status
          try {
            const evalStatusResult = await getMemberEvaluationStatus(assignmentId);
            setEvalStatus(evalStatusResult);
          } catch (err) {
            console.log("Could not reload evaluation status:", err);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isWaiting, isLeader, submitted, assignmentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Poll member evaluation status to show who has submitted (real-time sync)
  useEffect(() => {
    if (!evalStatus?.group_submitted || evalStatus?.my_evaluation_submitted) return;
    const interval = setInterval(async () => {
      try {
        const newStatus = await getMemberEvaluationStatus(assignmentId);
        setEvalStatus(newStatus);
      } catch (err) {
        console.log("Could not refresh evaluation status:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [assignmentId, evalStatus?.group_submitted, evalStatus?.my_evaluation_submitted]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reviewResult = await getMyReviewTask(assignmentId);
      console.log("Peer review data:", reviewResult);
      setReviewData(reviewResult);

      const waiting = !reviewResult.review && reviewResult.message === "Chưa có vòng đánh giá";
      setIsWaiting(waiting);

      if (reviewResult.review?.submitted_at) {
        setSubmitted(true);
        setComments(reviewResult.review.comments || {});
        setScore(reviewResult.review.score || 5);
        // Load into collaboration hook for sync
        loadPeerReviewState(reviewResult.review.comments || {}, reviewResult.review.score || 5);
      }

      if (reviewResult.group_info) {
        console.log("Group info:", reviewResult.group_info);
        console.log("Members:", reviewResult.group_info.members);
        console.log("Work session ID:", reviewResult.group_info.work_session_id);
        setGroupMembers(reviewResult.group_info.members || []);
        setIsLeader(reviewResult.group_info.is_leader || false);
        setGroupName(reviewResult.group_info.group_name || "Nhóm");
        const wsId = reviewResult.group_info.work_session_id || 0;
        setWorkSessionId(wsId);

        // Load chat history for group
        if (wsId > 0) {
          try {
            const chatData = await getDiscussion(assignmentId);
            loadChatHistory(chatData.messages);
          } catch (err) {
            console.log("Could not load chat history:", err);
          }
        }
      } else {
        console.log("No group_info returned from API");
      }

      if (reviewResult.worksheet_content && typeof reviewResult.worksheet_content === "string") {
        setWorksheetTitle(parseWorksheetTitle(reviewResult.worksheet_content));
        setWorksheetBlocks(buildInteractiveBlocks(reviewResult.worksheet_content));
      }

      // Load member evaluation status for cross-evaluation
      try {
        const evalStatusResult = await getMemberEvaluationStatus(assignmentId);
        console.log("Evaluation status:", evalStatusResult);
        setEvalStatus(evalStatusResult);
        // Show evaluation form if group has submitted but current user hasn't evaluated yet
        if (evalStatusResult.group_submitted && !evalStatusResult.my_evaluation_submitted) {
          setShowEvalInWaiting(true);
        }
      } catch (err) {
        console.log("Could not load evaluation status:", err);
      }
    } catch {
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData?.review) return;
    if (!isLeader) { alert("Chỉ nhóm trưởng mới được nộp đánh giá!"); return; }
    if (!window.confirm("Nộp đánh giá? Không thể sửa sau khi nộp.")) return;

    setSubmitting(true);
    try {
      const allComments = { ...comments, general: generalComment };
      await submitPeerReview(reviewData.review.id, allComments, score);
      sendChatMessage("Đã nộp đánh giá");

      // Instead of navigating away, show submitted state for member evaluation
      setSubmitted(true);

      // Reload member evaluation status
      try {
        const evalStatusResult = await getMemberEvaluationStatus(assignmentId);
        setEvalStatus(evalStatusResult);
      } catch (err) {
        console.log("Could not reload evaluation status:", err);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi nộp");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  // Handle comment change with real-time sync
  const handleCommentChange = (questionId: string, value: string) => {
    console.log(`[Comment] Updating q=${questionId}, connected=${connected}, wsId=${workSessionId}`);
    setComments(prev => ({ ...prev, [questionId]: value }));
    // Send via WebSocket for real-time sync with other members
    if (connected) {
      console.log(`[Comment] Sending via WS: q=${questionId}, v=${value.substring(0, 20)}...`);
      sendPeerReviewComment(questionId, value);
    }
  };

  // Handle score change with real-time sync (leader only)
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    // Send via WebSocket for real-time sync
    if (connected && isLeader) {
      sendPeerReviewScore(newScore);
    }
  };

  // Handle member evaluation submission - ALL members (including self)
  const handleSubmitMemberEvaluation = async () => {
    if (!evalStatus) return;
    setEvalSubmitting(true);
    try {
      // Evaluate ALL members including self
      const allMembers = evalStatus.members;
      const evaluations = allMembers.map((m) => ({
        student_id: m.student_id,
        rating: evalRatings[m.student_id] || 3,
        comment: evalComments[m.student_id] || undefined,
      }));
      await evaluateGroupMembers(assignmentId, evaluations);
      // Reload status to reflect submission
      const newStatus = await getMemberEvaluationStatus(assignmentId);
      setEvalStatus(newStatus);
      setShowEvalInWaiting(false);
    } catch (err: any) {
      console.error("Evaluation submission error:", err);
      setError(err?.response?.data?.detail || "Lỗi khi gửi đánh giá");
    } finally {
      setEvalSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ========== WAITING STATE ==========
  if (isWaiting || !reviewData?.review) {
    // Check if we need to show member evaluation form - ALL members including self
    const needsEvaluation = showEvalInWaiting && evalStatus && !evalStatus.my_evaluation_submitted;
    const allMembersForEval = evalStatus?.members || [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/student/dashboard")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Quay lại">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Đánh giá chéo</h1>
              <p className="text-sm text-gray-500">{groupName}</p>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8">
          {/* Member Evaluation Form - Show if group submitted but user hasn't evaluated - ALL MEMBERS INCLUDING SELF */}
          {needsEvaluation && allMembersForEval.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 p-6 shadow-sm mb-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Đánh giá thành viên nhóm</h2>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-red-500">*</span> Đánh giá tất cả thành viên (kể cả bản thân)
                </p>
              </div>

              <div className="space-y-4">
                {allMembersForEval.map((m) => {
                  const hasRating = evalRatings[m.student_id] && evalRatings[m.student_id] > 0;
                  const isMe = m.student_id === evalStatus?.my_student_id;
                  return (
                    <div key={m.student_id} className={`p-3 rounded-lg ${hasRating ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50 border border-red-200 dark:border-red-800'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${isMe ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                          {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{m.full_name}</span>
                        {isMe && <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">Bạn</span>}
                        {!hasRating && <span className="text-xs text-red-500">* Bắt buộc</span>}
                        {hasRating && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      {/* Star rating */}
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEvalRatings((prev) => ({ ...prev, [m.student_id]: star }))}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                star <= (evalRatings[m.student_id] || 0)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={evalComments[m.student_id] || ""}
                        onChange={(e) => setEvalComments((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                        placeholder={isMe ? "Tự đánh giá bản thân (tùy chọn)" : "Nhận xét (tùy chọn)"}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Submit button */}
              {(() => {
                const ratedCount = allMembersForEval.filter((m) => evalRatings[m.student_id] && evalRatings[m.student_id] > 0).length;
                const allRated = ratedCount === allMembersForEval.length;
                return (
                  <div className="mt-4">
                    <div className={`text-sm mb-3 ${allRated ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {allRated
                        ? '✓ Đã đánh giá tất cả thành viên'
                        : `Còn ${allMembersForEval.length - ratedCount}/${allMembersForEval.length} thành viên chưa được đánh giá`}
                    </div>
                    <button
                      onClick={handleSubmitMemberEvaluation}
                      disabled={evalSubmitting || !allRated}
                      className={`w-full px-4 py-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        allRated
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {evalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {allRated ? 'Gửi đánh giá thành viên' : 'Vui lòng đánh giá tất cả thành viên'}
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : null}

          {/* Evaluation status - show who has evaluated */}
          {evalStatus && evalStatus.group_submitted && evalStatus.evaluators && evalStatus.evaluators.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Trạng thái đánh giá thành viên
              </p>
              <div className="space-y-2">
                {evalStatus.members.map((m) => {
                  const hasEvaluated = evalStatus.evaluators.includes(String(m.student_id));
                  const isMe = m.student_id === evalStatus.my_student_id;
                  return (
                    <div key={m.student_id} className="flex items-center justify-between text-sm">
                      <span className={`${isMe ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {m.full_name} {isMe && '(Bạn)'}
                      </span>
                      {hasEvaluated ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã đánh giá
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Chưa đánh giá
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Waiting card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Đang chờ đánh giá chéo</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tất cả các nhóm cần nộp bài trước khi bắt đầu đánh giá chéo giữa các nhóm</p>

            {groupMembers.length > 0 && (
              <div className="text-left mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nhóm của bạn
                </p>
                <div className="space-y-2">
                  {groupMembers.map((m) => (
                    <div key={m.student_id} className="flex items-center gap-3">
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

            <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <RefreshCw className="w-4 h-4" />
              Kiểm tra ngay
            </button>
            <p className="text-sm text-gray-500 mt-3">Tự động kiểm tra mỗi 10 giây</p>
          </div>

          {/* Chat removed from waiting state */}
        </div>
      </div>
    );
  }

  // ========== SUBMITTED STATE ==========
  if (submitted) {
    const needsMemberEval = evalStatus && evalStatus.group_submitted && !evalStatus.my_evaluation_submitted;
    const allMembersSubmitted = evalStatus?.members || [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate("/student/dashboard")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Quay lại">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="font-semibold text-gray-900 dark:text-white">Đánh giá chéo</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-8">
          {/* Member Evaluation Form in submitted state - ALL MEMBERS INCLUDING SELF */}
          {needsMemberEval && allMembersSubmitted.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 p-6 shadow-sm mb-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Đánh giá thành viên nhóm</h2>
                <p className="text-sm text-gray-500 mt-1">Đánh giá tất cả thành viên (kể cả bản thân)</p>
              </div>

              <div className="space-y-3">
                {allMembersSubmitted.map((m) => {
                  const hasRating = evalRatings[m.student_id] && evalRatings[m.student_id] > 0;
                  const isMe = m.student_id === evalStatus?.my_student_id;
                  return (
                    <div key={m.student_id} className={`p-3 rounded-lg ${hasRating ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50 border border-red-200 dark:border-red-800'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${isMe ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                          {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{m.full_name}</span>
                        {isMe && <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">Bạn</span>}
                        {!hasRating && <span className="text-xs text-red-500">* Bắt buộc</span>}
                        {hasRating && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEvalRatings((prev) => ({ ...prev, [m.student_id]: star }))}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                star <= (evalRatings[m.student_id] || 0)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={evalComments[m.student_id] || ""}
                        onChange={(e) => setEvalComments((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                        placeholder={isMe ? "Tự đánh giá bản thân (tùy chọn)" : "Nhận xét (tùy chọn)"}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {(() => {
                const ratedCount = allMembersSubmitted.filter((m) => evalRatings[m.student_id] && evalRatings[m.student_id] > 0).length;
                const allRated = ratedCount === allMembersSubmitted.length;
                return (
                  <div className="mt-4">
                    <button
                      onClick={handleSubmitMemberEvaluation}
                      disabled={evalSubmitting || !allRated}
                      className={`w-full px-4 py-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                        allRated
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {evalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {allRated ? 'Gửi đánh giá thành viên' : `Còn ${allMembersSubmitted.length - ratedCount}/${allMembersSubmitted.length} chưa đánh giá`}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Submitted confirmation */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Đã hoàn thành đánh giá chéo!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Điểm đã cho: <span className="font-semibold text-gray-900 dark:text-white">{score}/10</span></p>
            {evalStatus?.my_evaluation_submitted && (
              <p className="text-green-600 dark:text-green-400 mb-4 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Đã đánh giá thành viên nhóm
              </p>
            )}
            <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN REVIEW UI ==========
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/student/dashboard")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Quay lại">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">Đánh giá chéo</h1>
            <p className="text-sm text-gray-500">{groupName}</p>
          </div>
        </div>
        {isLeader && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            Nhóm trưởng
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 text-sm">{error}</div>}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Members */}
        <div className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nhóm của bạn
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {groupMembers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Không có thành viên</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((m) => {
                  const isOnline = membersOnline.some((o) => o.name === m.full_name);
                  const hasEvaluated = evalStatus?.evaluators?.includes(String(m.student_id));
                  return (
                    <div key={m.student_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="relative">
                        <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                          {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                        </span>
                        {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{m.full_name}</p>
                        {m.is_leader && <p className="text-xs text-amber-600 dark:text-amber-400">Nhóm trưởng</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Member evaluation status - show who has submitted */}
          {evalStatus && evalStatus.group_submitted && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" />
                Đánh giá thành viên
              </p>
              <div className="space-y-1.5">
                {evalStatus.members.map((m) => {
                  const hasEvaluated = evalStatus.evaluators.includes(String(m.student_id));
                  const isMe = m.student_id === evalStatus.my_student_id;
                  return (
                    <div key={m.student_id} className="flex items-center justify-between text-xs">
                      <span className={isMe ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                        {m.full_name.split(' ').pop()} {isMe && '(Bạn)'}
                      </span>
                      {hasEvaluated ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center - Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Worksheet header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {worksheetTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bài làm của nhóm khác - Hãy đánh giá cẩn thận</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {worksheetBlocks.length > 0 ? (
                  worksheetBlocks.map((block, idx) => {
                    if (block.type === "markdown") {
                      return (
                        <div key={`md-${idx}`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.text}</ReactMarkdown>
                        </div>
                      );
                    }
                    const answerKey = `q_${block.questionNum}`;
                    const answer = reviewData?.reviewee_answers?.[answerKey] || "";
                    return (
                      <div key={`q-${idx}`} className="border-l-4 border-blue-500 pl-4">
                        <div className="mb-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{block.questionLine}</ReactMarkdown>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border border-green-200 dark:border-green-800">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Câu trả lời:</p>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{answer || "(Chưa trả lời)"}</p>
                        </div>
                        <input
                          type="text"
                          placeholder={`Nhận xét cho câu ${block.questionNum}...`}
                          value={comments[block.questionNum] || ""}
                          onChange={(e) => handleCommentChange(block.questionNum, e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    );
                  })
                ) : (
                  reviewData?.reviewee_answers && Object.entries(reviewData.reviewee_answers)
                    .filter(([key]) => !key.startsWith("_"))
                    .map(([qId, answer]) => (
                      <div key={qId} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Câu {qId}</p>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border border-green-200 dark:border-green-800">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Câu trả lời:</p>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{String(answer) || "(Chưa trả lời)"}</p>
                        </div>
                        <input
                          type="text"
                          placeholder={`Nhận xét cho câu ${qId}...`}
                          value={comments[qId] || ""}
                          onChange={(e) => handleCommentChange(qId, e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))
                )}

{/* Member evaluation is moved to AFTER peer review submission - shown in submitted state */}

                {/* Review summary */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Đánh giá tổng hợp</h4>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nhận xét chung</label>
                    <textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      placeholder="Viết nhận xét về bài làm của nhóm khác..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Score input - Only visible to leader */}
                  {isLeader && (
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cho điểm (1-10)</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => handleScoreChange(n)}
                            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                              score >= n
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                        <span className="ml-3 text-2xl font-bold text-blue-600 dark:text-blue-400">{score}/10</span>
                      </div>
                    </div>
                  )}

                  {isLeader ? (
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-base transition-colors"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Nộp đánh giá cho nhóm
                    </button>
                  ) : (
                    <div className="text-center py-3 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      Chỉ nhóm trưởng mới được nộp đánh giá
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Chat */}
        <div className={`${chatOpen ? 'w-72' : 'w-12'} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 transition-all duration-200`}>
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            {chatOpen ? (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat nhóm
              </span>
            ) : (
              <MessageCircle className="w-5 h-5 text-gray-400 mx-auto" />
            )}
            <button onClick={() => setChatOpen(!chatOpen)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              {chatOpen ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronLeft className="w-4 h-4 text-gray-500" />}
            </button>
          </div>

          {chatOpen && (
            <>
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <span className={`text-sm ${connected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {connected ? `${membersOnline.length} đang online` : 'Đang kết nối...'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Chưa có tin nhắn</p>}
                {chatMessages.map((msg) => {
                  const isMe = msg.user_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-xs text-gray-500 mb-1">{msg.user_name}</span>
                      <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                        isMe ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleSendChat} disabled={!chatInput.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPeerReviewPage;
