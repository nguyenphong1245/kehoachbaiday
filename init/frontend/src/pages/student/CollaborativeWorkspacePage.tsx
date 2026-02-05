import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  Crown,
  Vote,
  MessageSquare,
  FileText,
  Wifi,
  WifiOff,
  User,
  Plus,
  ChevronRight,
  ChevronLeft,
  Play,
  Terminal,
  XCircle,
  Star,
  AlertCircle,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getAssignmentDetail,
  startWorkSession,
  submitAssignment,
  getDiscussion,
  runCodeInAssignment,
  evaluateGroupMembers,
  type AssignmentContentResponse,
  type RunTestCasesResponse,
} from "@/services/studentService";
import { useCollaboration, type ChatMessage } from "@/hooks/useCollaboration";
import { getStoredAuthUser } from "@/utils/authStorage";

// ========== Worksheet parsing (same logic as PublicWorksheetPage) ==========
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

  // FALLBACK: If no blocks generated, treat entire content as markdown
  if (blocks.length === 0 && content.trim()) {
    blocks.push({
      type: 'markdown',
      text: content.trim(),
      questionLine: '',
      questionNum: ''
    });
  }

  return blocks;
};

const parseWorksheetTitle = (content: string): string => {
  const m = content.match(/\*\*PHIẾU HỌC TẬP SỐ (\d+)\*\*/i);
  return m ? `Phiếu học tập số ${m[1]}` : "Phiếu học tập";
};

const CollaborativeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignmentId = Number(id);
  const currentUser = getStoredAuthUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<AssignmentContentResponse | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  // Questions parsed from content
  const [questions, setQuestions] = useState<Array<{ id: string; label: string; text: string; options?: Record<string, string> }>>([]);
  const [worksheetBlocks, setWorksheetBlocks] = useState<InteractiveBlock[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState("Phiếu học tập");
  const [lineCounts, setLineCounts] = useState<Record<string, number>>({});

  // Code exercise states
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<RunTestCasesResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Member evaluation (group work)
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [evalRatings, setEvalRatings] = useState<Record<number, number>>({});
  const [evalComments, setEvalComments] = useState<Record<number, string>>({});
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  // Peer review notification
  const [peerReviewActivated, setPeerReviewActivated] = useState(false);

  // Track when another member (leader) submits the assignment
  const [otherSubmitted, setOtherSubmitted] = useState(false);
  const [otherSubmitterName, setOtherSubmitterName] = useState("");

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // Peer review time info
  const [peerReviewInfo, setPeerReviewInfo] = useState<{
    start_time: string | null;
    end_time: string | null;
  }>({ start_time: null, end_time: null });

  const handleSessionSubmitted = useCallback((submitterName: string) => {
    // Only show notification if we didn't submit ourselves
    if (!submitted && !submitting) {
      setOtherSubmitted(true);
      setOtherSubmitterName(submitterName);
      // Mark as submitted so they can also see evaluation form
      setSubmitted(true);

      // Check if peer review is enabled for this assignment
      const hasPeerReview = data?.assignment?.auto_peer_review ||
        data?.assignment?.peer_review_status === "active" ||
        data?.assignment?.peer_review_status === "pending";

      // Show evaluation form for other members too (if group work with multiple members)
      const isGroup = data?.assignment?.work_type === "group";
      if (isGroup && data?.my_group?.members && data.my_group.members.length > 1) {
        if (hasPeerReview) {
          // Peer review is enabled: Skip member evaluation here
          // Member evaluation will be shown AFTER peer review submission (in GroupPeerReviewPage)
          setTimeout(() => {
            navigate(`/student/assignment/${assignmentId}/group-peer-review`);
          }, 2000);
        } else {
          // No peer review: Show member evaluation here
          setShowEvalForm(true);
        }
      } else {
        // No evaluation needed, redirect to waiting room after 3 seconds
        setTimeout(() => {
          navigate(`/student/assignment/${assignmentId}/group-peer-review`);
        }, 3000);
      }
    }
  }, [submitted, submitting, navigate, assignmentId, data?.assignment?.work_type, data?.my_group?.members, data?.assignment?.auto_peer_review, data?.assignment?.peer_review_status]);

  const {
    answers,
    taskAssignments,
    leaderId,
    leaderVotes,
    membersOnline,
    chatMessages,
    typingUsers,
    connected,
    connecting,
    sessionSubmitted,
    sendAnswerUpdate,
    sendChatMessage,
    voteLeader,
    assignTasks,
    loadChatHistory,
    sendTypingIndicator,
  } = useCollaboration({
    sessionId,
    onSessionSubmitted: handleSessionSubmitted,
  });

  useEffect(() => {
    if (assignmentId) initWorkspace();
  }, [assignmentId]);

  // Countdown timer effect - uses either due_date or peer_review_start_time (whichever is earlier)
  useEffect(() => {
    // Determine the deadline: peer_review_start_time takes priority if set, otherwise use due_date
    const peerReviewStart = peerReviewInfo.start_time
      ? new Date(peerReviewInfo.start_time).getTime()
      : null;
    const dueDateTime = data?.assignment?.due_date
      ? new Date(data.assignment.due_date).getTime()
      : null;

    // Use peer_review_start_time if set, otherwise due_date
    const deadline = peerReviewStart || dueDateTime;
    if (!deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimerExpired(true);
        clearInterval(interval);

        // Auto-submit if not yet submitted
        if (!submitted && !submitting && sessionId) {
          handleAutoSubmit();
        }
        return;
      }

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.assignment?.due_date, peerReviewInfo.start_time, submitted, submitting, sessionId]);

  const handleAutoSubmit = async () => {
    if (!sessionId) return;

    try {
      setSubmitting(true);
      const finalAnswers = data?.assignment.content_type === "code_exercise"
        ? { ...answers, code }
        : { ...answers };

      await submitAssignment(assignmentId, finalAnswers);
      setSubmitted(true);

      alert("Hết thời gian làm bài! Bài làm đã được nộp tự động.");

      // For group work, always go to waiting room (group-peer-review)
      if (isGroupWork) {
        setTimeout(() => {
          navigate(`/student/assignment/${assignmentId}/group-peer-review`);
        }, 2000);
      } else {
        // For individual work, check peer review time
        const now = new Date();
        const peerReviewStart = peerReviewInfo.start_time
          ? new Date(peerReviewInfo.start_time)
          : null;

        if (peerReviewStart && now >= peerReviewStart) {
          setTimeout(() => {
            navigate(`/student/assignment/${assignmentId}/peer-review`);
          }, 2000);
        } else {
          setTimeout(() => {
            navigate("/student/dashboard");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Auto-submit failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const initWorkspace = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load assignment details
      const detail = await getAssignmentDetail(assignmentId);
      setData(detail);

      // Load peer review info - fields not available in current schema
      // setPeerReviewInfo if needed in the future

      // Parse questions from content
      const parsedQuestions = parseQuestions(detail.content);
      setQuestions(parsedQuestions);

      // For worksheets, parse interactive blocks for proper rendering
      if (detail.assignment.content_type === "worksheet" && detail.content?.content) {
        const rawContent = typeof detail.content.content === "string" ? detail.content.content : "";
        setWorksheetTitle(parseWorksheetTitle(rawContent));
        setWorksheetBlocks(buildInteractiveBlocks(rawContent));
      }

      // For code exercises, init with starter code or default
      if (detail.assignment.content_type === "code_exercise") {
        const starterCode = detail.content?.starter_code || "# Viết code của bạn ở đây\n\n";
        setCode(starterCode);
      }

      // Start/get session
      const session = await startWorkSession(assignmentId);
      setSessionId(session.session_id);

      if (session.status === "submitted") {
        setSubmitted(true);
      }

      // Load chat history for group work
      if (detail.assignment.work_type === "group") {
        try {
          const chatData = await getDiscussion(assignmentId);
          loadChatHistory(chatData.messages);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi tải bài tập");
    } finally {
      setIsLoading(false);
    }
  };

  const parseQuestions = (content: Record<string, any> | null | undefined): Array<{ id: string; label: string; text: string; options?: Record<string, string> }> => {
    if (!content) return [];

    // Parse questions from worksheet content
    if (content.questions && Array.isArray(content.questions)) {
      return content.questions.map((q: any, idx: number) => ({
        id: String(q.id || idx + 1),
        label: `Câu ${idx + 1}`,
        text: q.text || q.question || q.content || "",
        options: q.options || undefined,
      }));
    }

    // If no structured questions, create a single answer field
    return [{ id: "1", label: "Bài làm", text: "" }];
  };

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      sendAnswerUpdate(questionId, value);
      // Notify others that we're typing (group work only)
      if (data?.assignment.work_type === "group") {
        sendTypingIndicator(questionId);
      }
    },
    [sendAnswerUpdate, sendTypingIndicator, data?.assignment.work_type]
  );

  const handleSubmit = async () => {
    if (!window.confirm("Bạn có chắc muốn nộp bài? Không thể sửa sau khi nộp.")) return;
    setSubmitting(true);
    try {
      // For code exercises, ensure code is included in answers
      const submitAnswers = data?.assignment.content_type === "code_exercise"
        ? { ...answers, code }
        : answers;
      const res = await submitAssignment(assignmentId, submitAnswers);
      setSubmitted(true);

      // Check if auto peer review was activated
      if (res?.peer_review_activated) {
        setPeerReviewActivated(true);
      }

      // Check if peer review is enabled for this assignment
      const hasPeerReview = data?.assignment?.auto_peer_review ||
        res?.peer_review_activated ||
        data?.assignment?.peer_review_status === "active" ||
        data?.assignment?.peer_review_status === "pending";

      if (isGroupWork && data?.my_group?.members && data.my_group.members.length > 1) {
        if (hasPeerReview) {
          // Peer review is enabled: Skip member evaluation here
          // Member evaluation will be shown AFTER peer review submission (in GroupPeerReviewPage)
          setTimeout(() => {
            navigate(`/student/assignment/${assignmentId}/group-peer-review`);
          }, 1500);
        } else {
          // No peer review: Show member evaluation here
          setShowEvalForm(true);
        }
      } else {
        // Individual work or no group members
        // Check if peer review should start
        const now = new Date();
        const peerReviewStart = peerReviewInfo.start_time
          ? new Date(peerReviewInfo.start_time)
          : null;

        if (peerReviewStart && now >= peerReviewStart) {
          // Navigate to peer review immediately
          setTimeout(() => {
            navigate(`/student/assignment/${assignmentId}/peer-review`);
          }, 1500);
        } else {
          // Navigate to dashboard
          setTimeout(() => {
            navigate("/student/dashboard");
          }, 3000);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEvaluations = async () => {
    setEvalSubmitting(true);
    try {
      // Evaluate ALL members including self
      const evaluations = data!.my_group!.members.map((m) => ({
        student_id: m.student_id,
        rating: evalRatings[m.student_id] || 3,
        comment: evalComments[m.student_id] || undefined,
      }));
      await evaluateGroupMembers(assignmentId, evaluations);
      setShowEvalForm(false);

      // This flow is only reached when NO peer review is enabled
      // So navigate to dashboard after member evaluation
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
    } catch {
      setError("Lỗi khi gửi đánh giá");
    } finally {
      setEvalSubmitting(false);
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setTestResult(null);
    setRunError(null);
    try {
      const result = await runCodeInAssignment(assignmentId, code, "python");
      setTestResult(result);
    } catch (err: any) {
      setRunError(err?.response?.data?.detail || err.message || "Không thể chạy code");
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-slate-500">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-center text-slate-500">
        {error || "Không tìm thấy bài tập"}
      </div>
    );
  }

  // Show notification when leader submits - only if not showing evaluation form
  if (otherSubmitted && !showEvalForm) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center max-w-md mx-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Bài đã được nộp!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            <strong>{otherSubmitterName}</strong> đã nộp bài cho nhóm của bạn.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đang chuyển đến phòng chờ đánh giá chéo...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  // Custom markdown components for proper rendering
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

  const isGroupWork = data.assignment.work_type === "group";
  const myStudentId = data.my_group?.my_student_id;
  const isLeader = leaderId != null && leaderId === myStudentId;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(`/student/assignment/${assignmentId}`)}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Quay lại"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {data.assignment.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {data.assignment.lesson_info?.lesson_name && (
              <span>{data.assignment.lesson_info.lesson_name}</span>
            )}
            {data.assignment.lesson_info?.activity_name && (
              <>
                <span>-</span>
                <span>{data.assignment.lesson_info.activity_name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Code exercise buttons */}
          {data.assignment.content_type === "code_exercise" && (
            <>
              <button
                onClick={handleRunCode}
                disabled={isRunning || !code.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Chạy thử
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || submitted || !code.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : submitted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {submitted ? "Đã nộp" : "Nộp bài"}
              </button>
            </>
          )}

          {isGroupWork && (
            connected ? (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : connecting ? (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Kết nối...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Countdown Timer - Fixed position */}
      {timeRemaining && !submitted && (
        <div className="fixed top-4 right-4 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 border-2 border-orange-500 z-50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {peerReviewInfo.start_time ? "Đến giờ đánh giá chéo" : "Thời gian còn lại"}
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {timeRemaining.days > 0 && `${timeRemaining.days}d `}
            {String(timeRemaining.hours).padStart(2, "0")}:
            {String(timeRemaining.minutes).padStart(2, "0")}:
            {String(timeRemaining.seconds).padStart(2, "0")}
          </div>
          {peerReviewInfo.start_time && (
            <p className="text-xs text-orange-500 mt-1">Bài sẽ tự động nộp khi hết giờ</p>
          )}
        </div>
      )}

      {/* Peer Review Info Banner */}
      {peerReviewInfo.start_time && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 px-4 py-3 mx-4 mt-2 rounded">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Thông tin đánh giá chéo
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Bắt đầu:</strong>{" "}
            {new Date(peerReviewInfo.start_time).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {peerReviewInfo.end_time && (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Kết thúc:</strong>{" "}
              {new Date(peerReviewInfo.end_time).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      )}

      {/* Leader Info - Optional, not required */}
      {!submitted && data?.assignment?.work_type === "group" && !leaderId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 px-4 py-3 mx-4 mt-2 rounded">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              Có thể bầu nhóm trưởng (không bắt buộc). Bất kỳ thành viên nào cũng có thể nộp bài.
            </span>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Members (group only) */}
        {isGroupWork && (
          <div className="w-52 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {data.my_group?.group_name || "Nhóm"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {data.my_group?.members.map((m) => {
                const isOnline = membersOnline.some((o) => o.name === m.full_name);
                const isThisLeader = leaderId === m.student_id;
                return (
                  <div
                    key={m.student_id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-900 dark:text-white text-xs truncate block">
                        {m.full_name}
                      </span>
                    </div>
                    {isThisLeader && (
                      <span title="Nhóm trưởng"><Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
              {!leaderId && !submitted && (
                <button
                  onClick={() => setShowVotePanel(!showVotePanel)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  <Vote className="w-3.5 h-3.5" />
                  Bầu nhóm trưởng
                </button>
              )}
              {!submitted && (
                <>
                  {isLeader && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 text-center px-1">
                      Bạn là nhóm trưởng
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Nộp bài
                  </button>
                </>
              )}
            </div>

            {/* Vote panel */}
            {showVotePanel && !leaderId && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Bầu cho:</p>
                {data.my_group?.members.map((m) => {
                  const voteCount = Object.values(leaderVotes).filter((v) => v === m.student_id).length;
                  return (
                    <button
                      key={m.student_id}
                      onClick={() => voteLeader(m.student_id)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-amber-100 dark:hover:bg-amber-900/20 mb-1"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{m.full_name}</span>
                      <span className="text-amber-600 font-medium">{voteCount} phiếu</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Center - Worksheet content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {submitted ? (
            <div className="flex-1 flex items-center justify-center overflow-y-auto py-8">
              {showEvalForm && isGroupWork && data.my_group ? (
                /* Member Evaluation Form */
                <div className="w-full max-w-lg mx-auto px-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="text-center mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {otherSubmitted ? `${otherSubmitterName} đã nộp bài!` : "Đã nộp bài!"}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="text-red-500">*</span> Đánh giá tất cả thành viên (kể cả bản thân) để tiếp tục
                      </p>
                    </div>
                    <div className="space-y-4">
                      {/* ALL members including self */}
                      {data.my_group.members.map((m) => {
                        const hasRating = evalRatings[m.student_id] && evalRatings[m.student_id] > 0;
                        const isMe = m.student_id === myStudentId;
                        return (
                          <div key={m.student_id} className={`p-3 rounded-lg ${hasRating ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-700/50 border border-red-200 dark:border-red-800'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${isMe ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                {m.full_name.charAt(m.full_name.lastIndexOf(" ") + 1)}
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{m.full_name}</span>
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
                                        : "text-slate-300 dark:text-slate-600"
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
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Show how many evaluations are remaining - ALL members including self */}
                    {(() => {
                      const allMembers = data.my_group.members;
                      const ratedCount = allMembers.filter((m) => evalRatings[m.student_id] && evalRatings[m.student_id] > 0).length;
                      const allRated = ratedCount === allMembers.length;
                      return (
                        <div className="mt-4">
                          <div className={`text-sm mb-3 ${allRated ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {allRated
                              ? '✓ Đã đánh giá tất cả thành viên'
                              : `Còn ${allMembers.length - ratedCount}/${allMembers.length} thành viên chưa được đánh giá`}
                          </div>
                          <button
                            onClick={handleSubmitEvaluations}
                            disabled={evalSubmitting || !allRated}
                            className={`w-full px-4 py-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                              allRated
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            } disabled:opacity-50`}
                          >
                            {evalSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {allRated ? 'Gửi đánh giá và tiếp tục' : 'Vui lòng đánh giá tất cả thành viên'}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center px-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Đã nộp bài!</h2>
                  <p className="text-slate-500">Bài làm đã được ghi nhận.</p>
                  {peerReviewActivated && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg inline-flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Đánh giá chéo đã được kích hoạt! Kiểm tra lại sau để đánh giá bài bạn khác.
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/student/dashboard")}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Về trang chủ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : data.assignment.content_type === "code_exercise" ? (
            /* Code Exercise - Full Screen Layout */
            <div className="flex-1 flex overflow-hidden">
              <div className="flex h-full w-full">
                {/* Left panel - Problem description */}
                <div className="w-[40%] border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden bg-white dark:bg-slate-800">
                  {/* Tab: Đề bài */}
                  <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <button className="px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
                      Đề bài
                    </button>
                  </div>
                  {/* Problem content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {(data.content?.description || data.content?.content || data.content?.problem_statement) ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {data.content.description || data.content.content || data.content.problem_statement || ''}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>Đề bài chưa được tải. Vui lòng thử lại.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right panel - Editor + Output */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800">
                  {/* Code Editor */}
                  <div className="h-[65%] border-b border-slate-200 dark:border-slate-700">
                    <Editor
                      height="100%"
                      language="python"
                      value={code}
                      onChange={(value) => {
                        const newCode = value || "";
                        setCode(newCode);
                        handleAnswerChange("code", newCode);
                      }}
                      theme="vs-light"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        padding: { top: 8 },
                      }}
                    />
                  </div>

                  {/* Output panel */}
                  <div className="h-[35%] flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900">
                    {/* Output tab */}
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                      <div className="px-4 py-2 text-xs font-medium text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        Kết quả
                        {testResult && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            testResult.status === "passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {testResult.passed_tests}/{testResult.total_tests}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Output content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {isRunning ? (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang chạy code với test cases...
                        </div>
                      ) : runError ? (
                        <div className="text-xs text-red-600 dark:text-red-400">Lỗi: {runError}</div>
                      ) : testResult && testResult.test_results ? (
                        <>
                          {/* Summary */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium ${
                            testResult.status === "passed"
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : testResult.status === "timeout"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {testResult.status === "passed" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {testResult.status === "passed"
                              ? `Đạt tất cả ${testResult.total_tests} test cases!`
                              : testResult.status === "timeout"
                              ? "Quá thời gian thực thi"
                              : `Đạt ${testResult.passed_tests}/${testResult.total_tests} test cases`}
                            <span className="ml-auto text-[10px] opacity-70">{testResult.execution_time_ms}ms</span>
                          </div>
                          {/* Test case details */}
                          {testResult.test_results.map((tc) => (
                            <div key={tc.test_num} className={`border rounded text-xs ${
                              tc.passed
                                ? "border-green-200 dark:border-green-800"
                                : "border-red-200 dark:border-red-800"
                            }`}>
                              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${
                                tc.passed
                                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                              }`}>
                                {tc.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                <span className="font-medium">Test {tc.test_num}</span>
                                {tc.is_hidden && <span className="text-[10px] opacity-60">(ẩn)</span>}
                              </div>
                              {!tc.is_hidden && (
                                <div className="px-2.5 py-2 space-y-1 font-mono text-slate-700 dark:text-slate-300">
                                  <div><span className="text-slate-400">Input: </span>{tc.input || "(trống)"}</div>
                                  <div><span className="text-slate-400">Kỳ vọng: </span>{tc.expected_output}</div>
                                  <div><span className="text-slate-400">Kết quả: </span>
                                    <span className={tc.passed ? "text-green-600" : "text-red-600"}>{tc.actual_output || "(trống)"}</span>
                                  </div>
                                  {tc.error && <div className="text-red-500">Lỗi: {tc.error}</div>}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      ) : testResult ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <p className="font-medium mb-1">Kết quả (raw):</p>
                          <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[11px] whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nhấn "Chạy thử" để kiểm tra code với các test cases.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Worksheet with blue header format */}
                {data.assignment.content_type === "worksheet" && worksheetBlocks.length > 0 ? (
                  <div className="mb-8">
                    <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                      <h3 className="text-white font-bold text-xl">{worksheetTitle}</h3>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 border-2 border-blue-600 border-t-0 rounded-b-lg shadow-sm">
                      {worksheetBlocks.map((block, blockIdx) => {
                        if (block.type === "markdown") {
                          return (
                            <div key={`block-${blockIdx}`} className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {block.text}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                        // question_input block
                        const answerKey = `q_${block.questionNum}`;
                        const lineCount = lineCounts[answerKey] || 3;
                        const answerLines = (answers[answerKey] || "").split("\n");
                        return (
                          <div key={`block-${blockIdx}`}>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {block.questionLine}
                              </ReactMarkdown>
                            </div>
                            <div className="mt-1 mb-6 ml-2 relative">
                              <div className="space-y-0">
                                {[...Array(lineCount)].map((_, lineIndex) => (
                                  <div key={`${answerKey}-line-${lineIndex}`} className="w-full border-b border-gray-400">
                                    <input
                                      type="text"
                                      value={answerLines[lineIndex] || ""}
                                      onChange={(e) => {
                                        const newLines = [...answerLines];
                                        while (newLines.length <= lineIndex) newLines.push("");
                                        newLines[lineIndex] = e.target.value;
                                        const joined = newLines.join("\n");
                                        handleAnswerChange(answerKey, joined);
                                      }}
                                      className="w-full px-1 py-2 focus:outline-none bg-transparent text-black dark:text-white text-base border-none"
                                      style={{ lineHeight: "1.8" }}
                                    />
                                  </div>
                                ))}
                              </div>
                              {/* Typing indicator for this question */}
                              {isGroupWork && typingUsers.filter((t) => t.question_id === answerKey).length > 0 && (
                                <div className="absolute -bottom-4 left-0 flex items-center gap-1 text-xs text-blue-500 animate-pulse">
                                  <span className="inline-flex">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce ml-0.5" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce ml-0.5" style={{ animationDelay: "300ms" }} />
                                  </span>
                                  <span>{typingUsers.filter((t) => t.question_id === answerKey).map((t) => t.user_name).join(", ")} đang gõ...</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setLineCounts(prev => ({ ...prev, [answerKey]: (prev[answerKey] || 3) + 1 }))}
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
                ) : (
                  <>
                    {/* Fallback: quiz or content without blocks */}
                    {data.content?.content && (
                      <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {typeof data.content.content === 'string' ? data.content.content : ''}
                        </ReactMarkdown>
                      </div>
                    )}
                    {questions.map((q) => {
                      const assignedTo = Object.entries(taskAssignments).find(
                        ([, qIds]) => Array.isArray(qIds) && qIds.includes(Number(q.id))
                      );
                      return (
                        <div
                          key={q.id}
                          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {q.label}
                            </h3>
                            {assignedTo && (
                              <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                                <User className="w-3 h-3 inline mr-1" />
                                Người làm: {
                                  data.my_group?.members.find(
                                    (m) => m.student_id === Number(assignedTo[0])
                                  )?.full_name || `#${assignedTo[0]}`
                                }
                              </span>
                            )}
                          </div>
                          {q.text && (
                            <div className="text-sm text-slate-600 dark:text-slate-300 mb-3 prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                {q.text}
                              </ReactMarkdown>
                            </div>
                          )}

                          {/* Multiple choice options for quiz */}
                          {q.options ? (
                            <div className="space-y-2">
                              {Object.entries(q.options).map(([key, value]) => {
                                const isSelected = answers[q.id] === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, key)}
                                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold flex-shrink-0 text-sm ${
                                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                      }`}>{key}</span>
                                      <div className="text-slate-900 dark:text-white pt-0.5 text-sm prose prose-sm dark:prose-invert max-w-none [&_code]:bg-slate-200 [&_code]:dark:bg-slate-600 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_p]:m-0 [&_p]:inline">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Open-ended text answer for worksheet */
                            <div className="relative">
                              <textarea
                                value={answers[q.id] || ""}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Nhập câu trả lời..."
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {/* Typing indicator */}
                              {isGroupWork && typingUsers.filter((t) => t.question_id === q.id).length > 0 && (
                                <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-blue-500 animate-pulse">
                                  <span className="inline-flex">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce ml-0.5" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce ml-0.5" style={{ animationDelay: "300ms" }} />
                                  </span>
                                  <span>{typingUsers.filter((t) => t.question_id === q.id).map((t) => t.user_name).join(", ")} đang gõ...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Submit button */}
                {!isGroupWork && (
                  <div className="flex justify-center pb-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium shadow-lg"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Nộp bài
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Chat (group only) */}
        {isGroupWork && (
          <div className={`${chatOpen ? 'w-72' : 'w-12'} bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 transition-all duration-300`}>
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              {chatOpen ? (
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat nhóm
                </h2>
              ) : (
                <MessageSquare className="w-4 h-4 text-slate-500 mx-auto" />
              )}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title={chatOpen ? "Đóng chat" : "Mở chat"}
              >
                {chatOpen ? (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>

            {chatOpen && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Chưa có tin nhắn</p>
                  )}
                  {chatMessages.map((msg) => {
                const isMe = msg.user_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-xs text-slate-400 mb-0.5">{msg.user_name}</span>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-sm max-w-[85%] ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {!submitted && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeWorkspacePage;
