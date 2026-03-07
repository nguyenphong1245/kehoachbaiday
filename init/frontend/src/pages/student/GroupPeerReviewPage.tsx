import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Crown,
  Users,
  FileText,
  Code2,
  RefreshCw,
  Star,
  Minus,
  Plus,
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
  getSubmissionStatus,
  type MemberEvaluationStatus,
} from "@/services/studentService";
import { useCollaboration } from "@/hooks/useCollaboration";
import { getStoredAuthUser } from "@/utils/authStorage";
import { usePageTitle } from "@/hooks/usePageTitle";

// ========== Worksheet parsing ==========
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

const GroupPeerReviewPage: React.FC = () => {
  usePageTitle("Đánh giá chéo nhóm");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);
  const currentUser = getStoredAuthUser();
  const { confirm, ConfirmDialog, dialogProps } = useConfirm();

  const [reviewData, setReviewData] = useState<MyReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [score, setScore] = useState<number>(5);
  const [mySubmitted, setMySubmitted] = useState(false); // This member has submitted
  const [memberScores, setMemberScores] = useState<Record<string, number>>({}); // Who submitted what score

  const [isLeader, setIsLeader] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMemberInfo[]>([]);
  const [groupName, setGroupName] = useState("");
  const [workSessionId, setWorkSessionId] = useState<number>(0);

  const [isWaiting, setIsWaiting] = useState(false);
  const [hasPeerReview, setHasPeerReview] = useState(false); // Whether peer review is expected
  const [submissionStatus, setSubmissionStatus] = useState<any>(null); // Submission status for all groups
  const [worksheetBlocks, setWorksheetBlocks] = useState<InteractiveBlock[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState("Phiếu học tập");
  const [contentType, setContentType] = useState<string>("worksheet");
  const [reviewTimeLeft, setReviewTimeLeft] = useState<number | null>(null); // seconds remaining

  // Member evaluation state (cross-evaluation)
  const [evalStatus, setEvalStatus] = useState<MemberEvaluationStatus | null>(null);
  const [evalRatings, setEvalRatings] = useState<Record<number, number>>({});
  const [evalComments, setEvalComments] = useState<Record<number, string>>({});
  const [evalSubmitting, setEvalSubmitting] = useState(false);
  const [showEvalInWaiting, setShowEvalInWaiting] = useState(false);

  // Use collaboration hook with peer review sync callbacks
  const {
    membersOnline,
    connected,
    sendPeerReviewComment,
    sendPeerReviewScore,
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
    if (!isWaiting || !hasPeerReview) return;
    const interval = setInterval(async () => {
      try {
        // Refresh submission status
        const statusData = await getSubmissionStatus(assignmentId);
        setSubmissionStatus(statusData);
        // Check if peer review has been activated
        const reviewResult = await getMyReviewTask(assignmentId);
        if (reviewResult.review || reviewResult.peer_review_status === "active") {
          setReviewData(reviewResult);
          setIsWaiting(false);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [isWaiting, hasPeerReview, assignmentId]);

  // Poll to refresh member submission status
  useEffect(() => {
    if (isWaiting || submitted) return;
    const interval = setInterval(async () => {
      try {
        const result = await getMyReviewTask(assignmentId);
        if (result.review) {
          const ms = result.review.member_scores || {};
          setMemberScores(ms);
          // Check if current user already submitted
          const userKey = String(currentUser?.id);
          if (ms[userKey]) {
            setMySubmitted(true);
          }
        }
      } catch {}
    }, 8000);
    return () => clearInterval(interval);
  }, [isWaiting, submitted, assignmentId]);


  // Countdown timer for peer review duration
  useEffect(() => {
    if (reviewTimeLeft === null || reviewTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setReviewTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reviewTimeLeft !== null && reviewTimeLeft > 0]);

  // Load eval status when submitted but evalStatus not yet loaded
  useEffect(() => {
    if (!submitted || evalStatus !== null) return;
    // Small delay to avoid racing with handleSubmitReview's own call
    const timer = setTimeout(() => {
      getMemberEvaluationStatus(assignmentId)
        .then(setEvalStatus)
        .catch(() => console.log("Could not load evaluation status"));
    }, 2000);
    return () => clearTimeout(timer);
  }, [submitted, evalStatus, assignmentId]);

  // Poll member evaluation status to show who has submitted (real-time sync)
  useEffect(() => {
    if (!evalStatus || evalStatus.my_evaluation_submitted) return;
    const interval = setInterval(async () => {
      try {
        const newStatus = await getMemberEvaluationStatus(assignmentId);
        setEvalStatus(newStatus);
      } catch (err) {
        console.log("Could not refresh evaluation status:", err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [assignmentId, evalStatus?.my_evaluation_submitted]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reviewResult = await getMyReviewTask(assignmentId);
      console.log("Peer review data:", reviewResult);
      console.log("Reviewee answers:", reviewResult.reviewee_answers);
      setReviewData(reviewResult);

      const peerReviewExpected = reviewResult.auto_peer_review ||
        reviewResult.peer_review_status === "active" ||
        reviewResult.peer_review_status === "completed";
      setHasPeerReview(peerReviewExpected);

      const waiting = !reviewResult.review && reviewResult.message === "Chưa có vòng đánh giá";
      setIsWaiting(waiting);

      // Load submission status for all groups (for display instead of polling)
      if (waiting && peerReviewExpected) {
        try {
          const statusData = await getSubmissionStatus(assignmentId);
          setSubmissionStatus(statusData);
        } catch (err) {
          console.log("Could not load submission status:", err);
        }
      }

      if (reviewResult.review) {
        const ms = reviewResult.review.member_scores || {};
        setMemberScores(ms);
        const userKey = String(currentUser?.id);
        const alreadySubmitted = userKey in ms;
        setMySubmitted(alreadySubmitted);

        // If this member already submitted, load their comments/score
        const mc = reviewResult.review.member_comments || {};
        if (mc[userKey]) {
          setComments(mc[userKey].comments || {});
        } else {
          setComments(reviewResult.review.comments || {});
        }
        setScore(ms[userKey] || reviewResult.review.score || 5);

        if (alreadySubmitted) {
          setSubmitted(true);
        }

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

      } else {
        console.log("No group_info returned from API");
      }

      if (reviewResult.content_type) setContentType(reviewResult.content_type);

      // Calculate review time remaining
      const duration = reviewResult.peer_review_duration;
      const activatedAt = (reviewResult as any).review_activated_at;
      if (duration && activatedAt && reviewResult.review && !reviewResult.review.submitted_at) {
        const endTime = new Date(activatedAt).getTime() + duration * 60 * 1000;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setReviewTimeLeft(remaining > 0 ? remaining : null);
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
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Bài tập đã bị xóa hoặc không tồn tại.");
      } else {
        setError("Lỗi khi tải dữ liệu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData?.review) return;
    if (mySubmitted) { alert("Bạn đã nộp đánh giá rồi!"); return; }
    const ok = await confirm({ title: "Nộp đánh giá", message: "Nộp đánh giá? Không thể sửa sau khi nộp.", confirmText: "Nộp", cancelText: "Huỷ" });
    if (!ok) return;

    setSubmitting(true);
    try {
      const allComments = { ...comments, general: generalComment };
      const result = await submitPeerReview(reviewData.review.id, allComments, score);

      setMySubmitted(true);
      // Update member scores from response
      if (result.member_submitted) {
        const newScores = { ...memberScores };
        newScores[String(currentUser?.id)] = score;
        setMemberScores(newScores);
      }

      // Always transition to member evaluation after submitting peer review
      // The group's assignment is already submitted, so we go to evaluation
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

  // Handle score change with real-time sync (all members)
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    // Send via WebSocket for real-time sync
    if (connected) {
      sendPeerReviewScore(newScore);
    }
  };

  // Handle member evaluation submission - ALL members (including self)
  const handleSubmitMemberEvaluation = async () => {
    if (!evalStatus || evalSubmitting) return;
    setEvalSubmitting(true);
    setError(null);
    try {
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
      const detail = err?.response?.data?.detail;
      if (detail === "Nhóm chưa nộp bài") {
        // Work session not submitted yet - should not happen but handle gracefully
        setError("Nhóm chưa nộp bài. Vui lòng tải lại trang.");
      } else {
        setError(detail || "Lỗi khi gửi đánh giá. Vui lòng thử lại.");
      }
    } finally {
      setEvalSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
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

  // Helper: render member evaluation form
  const renderMemberEvalForm = (members: any[], myStudentId: number | undefined) => (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-amber-800 p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">Đánh giá thành viên nhóm</h2>
        <p className="text-sm text-stone-500 mt-1">
          <span className="text-red-500">*</span> Đánh giá tất cả thành viên (kể cả bản thân)
        </p>
      </div>

      <div className="space-y-4">
        {members.map((m) => {
          const hasRating = evalRatings[m.student_id] && evalRatings[m.student_id] > 0;
          const isMe = m.student_id === myStudentId;
          return (
            <div key={m.student_id} className={`p-3 rounded-lg ${hasRating ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-stone-50 dark:bg-stone-700/50 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${isMe ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-sky-100 dark:bg-sky-900/30 text-brand dark:text-sky-400'}`}>
                  {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                </div>
                <span className="text-sm font-medium text-stone-900 dark:text-white">{m.full_name}</span>
                {isMe && <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">Bạn</span>}
                {!hasRating && <span className="text-xs text-red-500">* Bắt buộc</span>}
                {hasRating && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setEvalRatings((prev) => ({ ...prev, [m.student_id]: star }))} className="p-0.5">
                    <Star className={`w-5 h-5 transition-colors ${star <= (evalRatings[m.student_id] || 0) ? "text-amber-400 fill-amber-400" : "text-stone-300 dark:text-stone-600"}`} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={evalComments[m.student_id] || ""}
                onChange={(e) => setEvalComments((prev) => ({ ...prev, [m.student_id]: e.target.value }))}
                placeholder={isMe ? "Tự đánh giá bản thân (tùy chọn)" : "Nhận xét (tùy chọn)"}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-200 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-white"
              />
            </div>
          );
        })}
      </div>

      {(() => {
        const ratedCount = members.filter((m: any) => evalRatings[m.student_id] && evalRatings[m.student_id] > 0).length;
        const allRated = ratedCount === members.length;
        return (
          <div className="mt-4">
            <div className={`text-sm mb-3 ${allRated ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {allRated ? '✓ Đã đánh giá tất cả thành viên' : `Còn ${members.length - ratedCount}/${members.length} thành viên chưa được đánh giá`}
            </div>
            <button
              onClick={handleSubmitMemberEvaluation}
              disabled={evalSubmitting || !allRated}
              className={`w-full px-4 py-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${allRated ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'} disabled:opacity-50`}
            >
              {evalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {allRated ? 'Gửi đánh giá thành viên' : 'Vui lòng đánh giá tất cả thành viên'}
            </button>
          </div>
        );
      })()}
    </div>
  );

  // ========== WAITING STATE (no peer review data yet) ==========
  if (isWaiting || !reviewData?.review) {
    const needsEvaluation = showEvalInWaiting && evalStatus && !evalStatus.my_evaluation_submitted;
    const evalDone = evalStatus?.my_evaluation_submitted;

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-2 flex items-center gap-3">
          <button onClick={() => navigate("/student/dashboard")} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700" title="Quay lại">
            <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
              {hasPeerReview ? "Chờ đánh giá chéo" : needsEvaluation ? "Đánh giá thành viên" : "Kết quả"}
            </h1>
            <p className="text-xs text-stone-500">{groupName}</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8">
          {/* Case 1: Peer review enabled → show waiting for peer review (NO eval form here) */}
          {hasPeerReview ? (
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 shadow-sm">
              {submissionStatus && submissionStatus.groups ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Trạng thái nộp bài ({submissionStatus.submitted_count}/{submissionStatus.total_groups} nhóm)
                    </p>
                    <button onClick={loadData} className="text-xs text-brand hover:text-brand-dark flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Làm mới
                    </button>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5 mb-4">
                    <div className="bg-brand h-1.5 rounded-full transition-all duration-500" style={{ width: `${submissionStatus.total_groups > 0 ? (submissionStatus.submitted_count / submissionStatus.total_groups) * 100 : 0}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {submissionStatus.groups.map((g: any) => (
                      <div key={g.group_id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50 dark:bg-stone-700/50">
                        <span className="text-sm text-stone-800 dark:text-stone-200">{g.group_name}</span>
                        {g.status === "submitted" ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã nộp</span>
                        ) : (
                          <span className="text-xs text-stone-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang làm</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {submissionStatus.submitted_count < submissionStatus.total_groups && (
                    <p className="text-xs text-stone-400 text-center mt-4">Tự động cập nhật khi tất cả nhóm nộp bài</p>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">Đang tải...</p>
                </div>
              )}
            </div>
          ) : needsEvaluation && (evalStatus?.members || []).length > 0 ? (
            /* Case 2: No peer review, needs member evaluation */
            renderMemberEvalForm(evalStatus!.members, evalStatus?.my_student_id)
          ) : (
            /* Case 3: No peer review, evaluation done or not needed */
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                {evalDone ? "Hoàn thành!" : "Đã nộp bài thành công!"}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6">
                {evalDone ? "Bạn đã hoàn thành tất cả đánh giá." : "Nhóm của bạn đã hoàn thành bài làm."}
              </p>
              <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-dark font-medium">
                Về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== SUBMITTED STATE (peer review done, now member evaluation) ==========
  if (submitted) {
    const evalLoaded = evalStatus !== null;
    const needsMemberEval = evalLoaded && !evalStatus.my_evaluation_submitted;
    const hasMembers = (evalStatus?.members || []).length > 0;

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-2 flex items-center gap-3">
          <button onClick={() => navigate("/student/dashboard")} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700" title="Quay lại">
            <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>
          <h1 className="text-sm font-semibold text-stone-900 dark:text-white">
            {needsMemberEval ? "Đánh giá thành viên" : "Hoàn thành"}
          </h1>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 text-sm text-center">{error}</div>}

        <div className="max-w-xl mx-auto px-4 py-8">
          {!evalLoaded ? (
            /* Loading eval status */
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <p className="text-sm text-stone-500">Đang tải...</p>
            </div>
          ) : needsMemberEval && hasMembers ? (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã hoàn thành đánh giá chéo! Điểm TB nhóm: <span className="font-bold">{reviewData?.review?.score || score}/10</span>
                </p>
              </div>
              {renderMemberEvalForm(evalStatus!.members, evalStatus?.my_student_id)}
            </>
          ) : (
            /* All done */
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Hoàn thành!</h2>
              <p className="text-stone-600 dark:text-stone-400 mb-2">Điểm TB đánh giá chéo: <span className="font-semibold text-stone-900 dark:text-white">{reviewData?.review?.score || score}/10</span></p>
              {evalStatus?.my_evaluation_submitted && (
                <p className="text-green-600 dark:text-green-400 mb-4 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã đánh giá thành viên nhóm
                </p>
              )}
              <button onClick={() => navigate("/student/dashboard")} className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-dark font-medium mt-4">
                Về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== MAIN REVIEW UI ==========
  return (
    <div className="h-screen bg-stone-50 dark:bg-stone-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate("/student/dashboard")} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700" title="Quay lại">
          <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-stone-900 dark:text-white truncate">Đánh giá chéo</h1>
          <p className="text-xs text-stone-500">{groupName}</p>
        </div>
        {reviewTimeLeft !== null && reviewTimeLeft > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {String(Math.floor(reviewTimeLeft / 60)).padStart(2, "0")}:{String(reviewTimeLeft % 60).padStart(2, "0")}
          </span>
        )}
        {isLeader && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
            <Crown className="w-3.5 h-3.5" />
            Nhóm trưởng
          </span>
        )}
        {mySubmitted && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã nộp
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 text-sm">{error}</div>}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Members */}
        <div className="hidden sm:flex w-56 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-stone-100 dark:border-stone-700">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Nhóm của bạn
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {groupMembers.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">Không có thành viên</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((m) => {
                  const isOnline = membersOnline.some((o) => o.name === m.full_name);
                  return (
                    <div key={m.student_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50">
                      <div className="relative">
                        <span className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-medium">
                          {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                        </span>
                        {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-stone-800" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{m.full_name}</p>
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
            <div className="p-3 border-t border-stone-100 dark:border-stone-700">
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" />
                Đánh giá thành viên
              </p>
              <div className="space-y-1.5">
                {evalStatus.members.map((m) => {
                  const hasEvaluated = evalStatus.evaluators.includes(String(m.student_id));
                  const isMe = m.student_id === evalStatus.my_student_id;
                  return (
                    <div key={m.student_id} className="flex items-center justify-between text-xs">
                      <span className={isMe ? 'font-medium text-brand dark:text-sky-400' : 'text-stone-600 dark:text-stone-400'}>
                        {m.full_name.split(' ').pop()} {isMe && '(Bạn)'}
                      </span>
                      {hasEvaluated ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
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
          <div className="max-w-3xl mx-auto p-3 sm:p-6">
            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
              {/* Content header */}
              <div className="px-3 sm:px-6 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700/30">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  {contentType === "code_exercise" ? <Code2 className="w-4 h-4 text-brand" /> : <FileText className="w-4 h-4 text-brand" />}
                  {contentType === "code_exercise" ? "Bài code" : worksheetTitle}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Bài làm của nhóm khác</p>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-6 space-y-5">
                {contentType === "code_exercise" ? (
                  /* Code exercise review */
                  (() => {
                    const code = reviewData?.reviewee_answers?.code || "";
                    const testResult = reviewData?.reviewee_answers?.test_result;
                    return (
                      <>
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-2">Code bài làm:</p>
                          <pre className="bg-stone-900 text-stone-100 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                            <code>{code || "(Chưa có code)"}</code>
                          </pre>
                        </div>
                        {testResult && typeof testResult === "object" && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 mb-2">Kết quả test:</p>
                            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3 text-sm space-y-1">
                              {testResult.passed !== undefined && (
                                <p className={testResult.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                  {testResult.passed ? "Passed" : "Failed"} {testResult.total ? `(${testResult.passed_count || 0}/${testResult.total})` : ""}
                                </p>
                              )}
                              {testResult.results && Array.isArray(testResult.results) && testResult.results.map((r: any, i: number) => (
                                <div key={i} className={`flex items-center gap-2 text-xs ${r.passed ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                                  {r.passed ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 text-center">x</span>}
                                  <span>Test {i + 1}: {r.input} → {r.expected_output}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-2">Nhận xét code:</p>
                          <textarea
                            placeholder="Nhận xét về code của nhóm khác..."
                            value={comments["code"] || ""}
                            onChange={(e) => handleCommentChange("code", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                          />
                        </div>
                      </>
                    );
                  })()
                ) : (
                  /* Worksheet review - render like student worksheet view */
                  (() => {
                    // Get answers from reviewee
                    const answers = reviewData?.reviewee_answers || {};
                    // Use worksheetBlocks if available, otherwise build from answer keys
                    const hasBlocks = worksheetBlocks.length > 0;
                    // Extract question keys for fallback
                    const questionKeys = !hasBlocks ? Object.entries(answers)
                      .filter(([key]) => key.startsWith("q_"))
                      .sort(([a], [b]) => {
                        const numA = parseInt(a.replace("q_", ""));
                        const numB = parseInt(b.replace("q_", ""));
                        return numA - numB;
                      }) : [];

                    return (
                      <>
                        {/* Worksheet card with blue header */}
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
                                      {/* Ensure at least 3 lines */}
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
                                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                                      <strong>Câu {qNum}:</strong>
                                    </p>
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

                        {/* Review comments per question - outside the worksheet card */}
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
                                placeholder={`Nhận xét...`}
                                value={comments[num] || ""}
                                onChange={(e) => handleCommentChange(num, e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()
                )}

{/* Member evaluation is moved to AFTER peer review submission - shown in submitted state */}

                {/* Review summary */}
                <div className="pt-5 border-t border-stone-200 dark:border-stone-700">
                  {contentType !== "code_exercise" && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-stone-500 mb-2">Nhận xét chung</p>
                      <textarea
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        placeholder="Viết nhận xét về bài làm của nhóm khác..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-white placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Score + Submit row */}
                  <div className="space-y-3">
                    {/* Score stepper - all members can score */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Điểm của bạn:</span>
                      <div className="flex items-center border border-stone-300 dark:border-stone-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleScoreChange(Math.max(1, score - 0.5))}
                          disabled={mySubmitted}
                          className="px-2 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-bold text-brand dark:text-sky-400 min-w-[3.5rem] text-center bg-stone-50 dark:bg-stone-700/50">
                          {score}/10
                        </span>
                        <button
                          onClick={() => handleScoreChange(Math.min(10, score + 0.5))}
                          disabled={mySubmitted}
                          className="px-2 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Member submission status */}
                    {Object.keys(memberScores).length > 0 && (
                      <div className="text-xs text-stone-500 bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
                        <p className="font-medium mb-1">Đã nộp ({Object.keys(memberScores).length}/{groupMembers.length}):</p>
                        {Object.entries(memberScores).map(([uid, s]) => {
                          const mc = reviewData?.review?.member_comments?.[uid];
                          const name = mc?.reviewer_name || `User ${uid}`;
                          return (
                            <span key={uid} className="inline-flex items-center gap-1 mr-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              {name}: {s}đ
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Submit button - all members */}
                    {mySubmitted ? (
                      <div className="text-center py-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Bạn đã nộp đánh giá ({score} điểm)
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Nộp đánh giá của bạn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default GroupPeerReviewPage;
