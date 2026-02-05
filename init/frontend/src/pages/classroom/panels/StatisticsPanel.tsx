import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  Code2,
  Users,
  User,
  CheckCircle2,
  Clock,
  BarChart3,
  Star,
  Trophy,
  TrendingUp,
  Award,
  Eye,
  MessageSquare,
  X,
  Pencil,
  Save,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getClassroomStatistics, getSubmissions, gradeSubmission } from "@/services/assignmentService";
import { api } from "@/services/authService";

/* ── Worksheet parsing (same logic as CollaborativeWorkspacePage) ── */
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
    blocks.push({ type: "markdown", text: content.trim(), questionLine: "", questionNum: "" });
  }

  return blocks;
};

const parseWorksheetTitle = (content: string): string => {
  const m = content.match(/\*\*PHIẾU HỌC TẬP SỐ (\d+)\*\*/i);
  return m ? `Phiếu học tập số ${m[1]}` : "Phiếu học tập";
};

/* ── Types ── */
interface StudentStat {
  student_id: number;
  student_name: string;
  student_code: string;
  status: string;
  submitted_at: string | null;
  submission_id?: number;
  teacher_score?: number | null;
  teacher_comment?: string | null;
  score?: {
    total_correct?: number;
    total_questions?: number;
    passed_tests?: number;
    total_tests?: number;
    no_test?: boolean;
    teacher_score?: number;
    max_score?: number;
  };
}

interface GroupMemberInfo {
  student_id: number;
  full_name: string;
  student_code?: string;
  teacher_score?: number | null;
  teacher_comment?: string | null;
}

interface GroupStat {
  group_id: number;
  group_name: string;
  status: string;
  submitted_at: string | null;
  session_id?: number;
  teacher_score?: number | null;
  teacher_comment?: string | null;
  member_grades?: Record<string, { score: number; comment?: string }> | null;
  member_evaluations: Record<string, Array<{ student_id: number; rating: number; comment?: string }>> | null;
  members: GroupMemberInfo[];
  score?: { passed_tests?: number; total_tests?: number };
}

interface AssignmentStat {
  id: number;
  title: string;
  content_type: string;
  work_type: string;
  total_students: number;
  submitted_count: number;
  start_at: string | null;
  due_date: string | null;
  created_at: string | null;
  student_stats: StudentStat[];
  group_stats: GroupStat[];
}

interface LessonStat {
  lesson_name: string;
  assignments: AssignmentStat[];
}

interface StudentRanking {
  rank: number;
  student_id: number;
  student_name: string;
  student_code: string;
  total_score: number;
  total_max: number;
  assignments_submitted: number;
  quiz_score: number;
  quiz_max: number;
  quiz_count: number;
  code_score: number;
  code_max: number;
  code_count: number;
  worksheet_score: number;
  worksheet_max: number;
  worksheet_count: number;
}

interface PeerReviewInfo {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_type: string;
  reviewer_user_name: string | null;
  reviewer_group_name: string | null;
  reviewee_group_name: string | null;
  comments: Record<string, string>;
  score: number | null;
  submitted_at: string | null;
}

interface Props {
  classroomId: number;
}

/* ── Helpers ── */
const contentTypeIcon = (type: string) => {
  switch (type) {
    case "worksheet": return <FileText className="w-3.5 h-3.5" />;
    case "quiz": return <HelpCircle className="w-3.5 h-3.5" />;
    case "code_exercise": return <Code2 className="w-3.5 h-3.5" />;
    default: return <FileText className="w-3.5 h-3.5" />;
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

const pctColor = (pct: number) =>
  pct >= 80 ? "text-green-600 dark:text-green-400" : pct >= 50 ? "text-blue-600 dark:text-blue-400" : "text-red-500";

const barColor = (pct: number) =>
  pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500";

const fmtPct = (score: number, max: number) => max > 0 ? Math.round((score / max) * 100) : 0;

/* ── Component ── */
const StatisticsPanel: React.FC<Props> = ({ classroomId }) => {
  const [data, setData] = useState<{
    lessons: LessonStat[];
    total_students: number;
    student_ranking?: StudentRanking[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [expandedAssignments, setExpandedAssignments] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "individual" | "group">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

  // Submission viewer state
  const [viewingSubmission, setViewingSubmission] = useState<{
    assignmentId: number;
    assignmentTitle: string;
    contentType: string;
    data: any;
  } | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Peer review viewer state
  const [peerReviews, setPeerReviews] = useState<Record<number, PeerReviewInfo[]>>({});
  const [expandedPeerReview, setExpandedPeerReview] = useState<Set<number>>(new Set());
  const [peerReviewLoading, setPeerReviewLoading] = useState<Set<number>>(new Set());

  // Grading state
  const [gradingKey, setGradingKey] = useState<string | null>(null); // "assignmentId-type-submissionId[-studentId]"
  const [gradingScore, setGradingScore] = useState<string>("");
  const [gradingComment, setGradingComment] = useState<string>("");
  const [gradingSaving, setGradingSaving] = useState(false);

  // Member evaluation viewer state
  const [viewingEvaluations, setViewingEvaluations] = useState<{
    groupName: string;
    evaluations: Record<string, Array<{ student_id: number; rating: number; comment?: string }>>;
    members: GroupMemberInfo[];
  } | null>(null);

  useEffect(() => { loadStats(); }, [classroomId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClassroomStatistics(classroomId);
      setData(res);
      const lessons = new Set<string>();
      res.lessons.forEach((l: LessonStat) => lessons.add(l.lesson_name));
      setExpandedLessons(lessons);
    } catch (err: any) {
      console.error("Statistics API error:", err);
      setError(err?.response?.data?.detail || err?.message || "Lỗi khi tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats silently (no loading spinner, preserves expanded state)
  const refreshStatsSilent = async () => {
    try {
      const res = await getClassroomStatistics(classroomId);
      setData(res);
      // Don't reset expandedLessons - preserve user's current view
    } catch (err) {
      console.error("Silent refresh error:", err);
      // Don't show error - this is a background refresh
    }
  };

  const toggleLesson = (name: string) => {
    setExpandedLessons((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  };
  const toggleAssignment = (id: number) => {
    setExpandedAssignments((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Load submission for viewing
  const viewSubmissions = useCallback(async (assignmentId: number, title: string, contentType: string) => {
    setSubmissionLoading(true);
    try {
      const res = await getSubmissions(assignmentId);
      setViewingSubmission({ assignmentId, assignmentTitle: title, contentType, data: res });
    } catch { /* ignore */ } finally {
      setSubmissionLoading(false);
    }
  }, []);

  // Load peer reviews
  const loadPeerReviews = useCallback(async (assignmentId: number) => {
    if (peerReviews[assignmentId]) {
      setExpandedPeerReview((prev) => { const n = new Set(prev); n.has(assignmentId) ? n.delete(assignmentId) : n.add(assignmentId); return n; });
      return;
    }
    setPeerReviewLoading((prev) => new Set(prev).add(assignmentId));
    try {
      const res = await api.get(`/peer-review/assignments/${assignmentId}/reviews`);
      setPeerReviews((prev) => ({ ...prev, [assignmentId]: res.data.reviews || [] }));
      setExpandedPeerReview((prev) => new Set(prev).add(assignmentId));
    } catch { /* ignore */ } finally {
      setPeerReviewLoading((prev) => { const n = new Set(prev); n.delete(assignmentId); return n; });
    }
  }, [peerReviews]);

  // Start grading a submission
  // key format: "assignmentId-type-submissionId" or "assignmentId-group_member-sessionId-studentId"
  const startGrading = (assignmentId: number, submissionId: number, submissionType: string, currentScore?: number | null, currentComment?: string | null, studentId?: number) => {
    const key = studentId
      ? `${assignmentId}-group_member-${submissionId}-${studentId}`
      : `${assignmentId}-${submissionType}-${submissionId}`;
    if (gradingKey === key) { setGradingKey(null); return; }
    setGradingKey(key);
    setGradingScore(currentScore != null ? String(currentScore) : "");
    setGradingComment(currentComment || "");
  };

  // Note: saveGrade is now implemented as handleSaveGrade inside renderSubmissionModal
  // to properly refresh both modal data and statistics after grading

  /* ── Computed ── */
  const overviewStats = useMemo(() => {
    if (!data) return null;
    let totalAssignments = 0, totalSubmissions = 0, totalPossible = 0;
    const byType: Record<string, { count: number; submitted: number; total: number }> = {};
    for (const lesson of data.lessons) {
      for (const a of lesson.assignments) {
        totalAssignments++;
        totalSubmissions += a.submitted_count;
        totalPossible += a.total_students;
        if (!byType[a.content_type]) byType[a.content_type] = { count: 0, submitted: 0, total: 0 };
        byType[a.content_type].count++;
        byType[a.content_type].submitted += a.submitted_count;
        byType[a.content_type].total += a.total_students;
      }
    }

    // Compute class-wide average scores per type from ranking data
    const rk = (data.student_ranking || []) as StudentRanking[];
    let quizScoreSum = 0, quizMaxSum = 0, quizStudents = 0;
    let codeScoreSum = 0, codeMaxSum = 0, codeStudents = 0;
    let worksheetScoreSum = 0, worksheetMaxSum = 0, worksheetStudents = 0, worksheetCountSum = 0;
    let totalScoreSum = 0, totalMaxSum = 0, totalScoredStudents = 0;
    for (const r of rk) {
      if (r.quiz_count > 0) { quizScoreSum += r.quiz_score; quizMaxSum += r.quiz_max; quizStudents++; }
      if (r.code_count > 0) { codeScoreSum += r.code_score; codeMaxSum += r.code_max; codeStudents++; }
      if (r.worksheet_count > 0) {
        worksheetStudents++;
        worksheetCountSum += r.worksheet_count;
        if ((r as any).worksheet_score != null) { worksheetScoreSum += (r as any).worksheet_score; worksheetMaxSum += (r as any).worksheet_max; }
      }
      if (r.total_max > 0) { totalScoreSum += r.total_score; totalMaxSum += r.total_max; totalScoredStudents++; }
    }
    const typeAvg = {
      quiz: quizMaxSum > 0 ? Math.round((quizScoreSum / quizMaxSum) * 100) : null,
      code_exercise: codeMaxSum > 0 ? Math.round((codeScoreSum / codeMaxSum) * 100) : null,
      worksheet: worksheetMaxSum > 0 ? Math.round((worksheetScoreSum / worksheetMaxSum) * 100) : null,
      overall: totalMaxSum > 0 ? Math.round((totalScoreSum / totalMaxSum) * 100) : null,
      quizStudents, codeStudents, worksheetStudents, worksheetCountSum,
    };

    return { totalAssignments, totalSubmissions, totalPossible, byType, typeAvg };
  }, [data]);

  const allAssignments = useMemo(() => {
    if (!data) return [];
    const result: AssignmentStat[] = [];
    for (const lesson of data.lessons)
      for (const a of lesson.assignments)
        if (filter === "all" || a.work_type === filter) result.push(a);
    return result;
  }, [data, filter]);

  // Compute per-assignment average & ranking
  const getAssignmentAvgAndRanking = (a: AssignmentStat) => {
    if (a.work_type === "group") return { avg: null, ranking: [] };
    const scored = a.student_stats
      .filter((s) => s.status === "submitted" && (s.score || s.teacher_score != null))
      .map((s) => {
        let earned = 0, max = 0;
        if (s.score?.teacher_score != null) { earned = s.score.teacher_score; max = s.score.max_score || 10; }
        else if (s.score?.total_questions != null) { earned = s.score.total_correct || 0; max = s.score.total_questions; }
        else if (s.score?.total_tests != null && !s.score?.no_test) { earned = s.score.passed_tests || 0; max = s.score.total_tests!; }
        else if (s.teacher_score != null) { earned = s.teacher_score; max = 10; }
        const pct = max > 0 ? (earned / max) * 100 : 0;
        return { ...s, earned, max, pct };
      })
      .sort((a, b) => b.pct - a.pct || b.earned - a.earned);

    const totalEarned = scored.reduce((s, x) => s + x.earned, 0);
    const totalMax = scored.reduce((s, x) => s + x.max, 0);
    const avg = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : null;
    const ranking = scored.map((s, i) => ({ ...s, rank: i + 1 }));
    return { avg, ranking };
  };

  /* ── Score renderers ── */
  const renderScore = (stat: StudentStat) => {
    if (!stat.score) {
      if (stat.status === "submitted") {
        // Check if there's a teacher_score at stat level (for worksheet/code without auto-score)
        if (stat.teacher_score != null) {
          const pct = fmtPct(stat.teacher_score, 10);
          return <span className={`text-xs font-medium ${pctColor(pct)}`}>GV: {stat.teacher_score}/10</span>;
        }
        return <span className="text-xs text-slate-400 italic">Chưa chấm</span>;
      }
      return null;
    }
    // Teacher scored (worksheet or code_exercise with teacher override)
    if (stat.score.teacher_score != null) {
      const pct = fmtPct(stat.score.teacher_score, stat.score.max_score || 10);
      return <span className={`text-xs font-medium ${pctColor(pct)}`}>GV: {stat.score.teacher_score}/{stat.score.max_score || 10}</span>;
    }
    if (stat.score.total_questions != null) {
      const pct = fmtPct(stat.score.total_correct || 0, stat.score.total_questions);
      return <span className={`text-xs font-medium ${pctColor(pct)}`}>{stat.score.total_correct}/{stat.score.total_questions} ({pct}%)</span>;
    }
    if (stat.score.no_test) return <span className="text-xs text-slate-400 italic">Chưa chấm</span>;
    if (stat.score.total_tests != null) {
      const pct = fmtPct(stat.score.passed_tests || 0, stat.score.total_tests);
      return <span className={`text-xs font-medium ${pctColor(pct)}`}>{stat.score.passed_tests}/{stat.score.total_tests} tests ({pct}%)</span>;
    }
    return null;
  };

  const renderGroupScore = (stat: GroupStat) => {
    if (stat.teacher_score != null) {
      const pct = fmtPct(stat.teacher_score, 10);
      return <span className={`text-xs font-medium ${pctColor(pct)}`}>GV: {stat.teacher_score}/10</span>;
    }
    if (!stat.score) {
      if (stat.status === "submitted") return <span className="text-xs text-slate-400 italic">Chưa chấm</span>;
      return null;
    }
    const pct = fmtPct(stat.score.passed_tests || 0, stat.score.total_tests || 0);
    return <span className={`text-xs font-medium ${pctColor(pct)}`}>{stat.score.passed_tests}/{stat.score.total_tests} tests ({pct}%)</span>;
  };

  /* ── Loading / Error / Empty ── */
  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;

  if (error) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-red-300 dark:text-red-600" />
      <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      <button onClick={loadStats} className="mt-3 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thử lại</button>
    </div>
  );

  if (!data || data.lessons.length === 0) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p className="text-slate-500 dark:text-slate-400">Chưa có dữ liệu thống kê</p>
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Giao bài cho học sinh để bắt đầu theo dõi.</p>
    </div>
  );

  const ranking = (data.student_ranking || []) as StudentRanking[];

  /* ═══════════════════════════════════════════════
     TAB: TỔNG QUAN
     ═══════════════════════════════════════════════ */
  const renderOverviewTab = () => {
    if (!overviewStats) return null;
    const overallPct = fmtPct(overviewStats.totalSubmissions, overviewStats.totalPossible);

    return (
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tổng bài giao", value: overviewStats.totalAssignments, color: "text-slate-800 dark:text-white" },
            { label: "Học sinh", value: data.total_students, color: "text-slate-800 dark:text-white" },
            { label: "Đã nộp", value: overviewStats.totalSubmissions, color: "text-green-600 dark:text-green-400" },
            { label: "Tỉ lệ nộp", value: `${overallPct}%`, color: "text-blue-600 dark:text-blue-400" },
          ].map((c) => (
            <div key={c.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">{c.label}</div>
              <div className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* By content type with submission bar + average scores */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Theo loại bài
            {overviewStats.typeAvg.overall !== null && (
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${overviewStats.typeAvg.overall >= 80 ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : overviewStats.typeAvg.overall >= 50 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                TB chung: {overviewStats.typeAvg.overall}%
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {Object.entries(overviewStats.byType).map(([type, stats]) => {
              const pct = fmtPct(stats.submitted, stats.total);
              const avgScore = type === "quiz" ? overviewStats.typeAvg.quiz
                : type === "code_exercise" ? overviewStats.typeAvg.code_exercise
                : type === "worksheet" ? overviewStats.typeAvg.worksheet
                : null;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${type === "quiz" ? "text-purple-500" : type === "code_exercise" ? "text-green-500" : "text-blue-500"}`}>
                      {contentTypeIcon(type)}
                    </div>
                    <div className="w-28 text-xs text-slate-600 dark:text-slate-400">{contentTypeLabel(type)} ({stats.count})</div>
                    <div className="flex-1">
                      <div className="w-full h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                        <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-slate-700 dark:text-slate-300">
                          {stats.submitted}/{stats.total} ({pct}%)
                        </span>
                      </div>
                    </div>
                    {/* Average score badge */}
                    <div className="flex-shrink-0 w-24 text-right">
                      {avgScore !== null ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${avgScore >= 80 ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : avgScore >= 50 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                          TB: {avgScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa chấm</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Student Ranking ── */}
        {ranking.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Bảng xếp hạng tổng hợp</h3>
              <span className="text-xs text-slate-400 ml-auto">{ranking.length} học sinh</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                    <th className="text-center py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400 w-10">#</th>
                    <th className="text-left py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400">Mã HS</th>
                    <th className="text-left py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400">Họ tên</th>
                    <th className="text-center py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400">Bài nộp</th>
                    <th className="text-center py-2.5 px-2 font-medium text-purple-500">
                      <span className="inline-flex items-center gap-0.5"><HelpCircle className="w-3 h-3" /> Quiz</span>
                    </th>
                    <th className="text-center py-2.5 px-2 font-medium text-green-500">
                      <span className="inline-flex items-center gap-0.5"><Code2 className="w-3 h-3" /> Code</span>
                    </th>
                    <th className="text-center py-2.5 px-2 font-medium text-blue-500">
                      <span className="inline-flex items-center gap-0.5"><FileText className="w-3 h-3" /> PBT</span>
                    </th>
                    <th className="text-center py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400">TB chung</th>
                    <th className="text-left py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400 w-24">Tiến độ</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r) => {
                    const overallPct = fmtPct(r.total_score, r.total_max);
                    const quizPct = fmtPct(r.quiz_score, r.quiz_max);
                    const codePct = fmtPct(r.code_score, r.code_max);
                    return (
                      <tr key={r.student_id} className="border-b border-slate-50 dark:border-slate-700/30 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                        <td className="py-2 px-2 text-center">
                          {r.rank <= 3 ? (
                            <span className={r.rank === 1 ? "text-amber-500" : r.rank === 2 ? "text-slate-400" : "text-amber-700"}>
                              {r.rank === 1 ? <Award className="w-4 h-4 inline" /> : <span className="font-bold">{r.rank}</span>}
                            </span>
                          ) : <span className="text-slate-400">{r.rank}</span>}
                        </td>
                        <td className="py-2 px-2 text-slate-500 dark:text-slate-400 font-mono">{r.student_code || "-"}</td>
                        <td className="py-2 px-2 font-medium text-slate-800 dark:text-white">{r.student_name}</td>
                        <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-400">{r.assignments_submitted}</td>
                        <td className="py-2 px-2 text-center">
                          {r.quiz_count > 0
                            ? <span className={`font-medium ${pctColor(quizPct)}`}>{quizPct}%</span>
                            : <span className="text-slate-300 dark:text-slate-600">-</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {r.code_count > 0
                            ? <span className={`font-medium ${pctColor(codePct)}`}>{codePct}%</span>
                            : <span className="text-slate-300 dark:text-slate-600">-</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {r.worksheet_count > 0
                            ? (r.worksheet_max > 0
                              ? <span className={`font-medium ${pctColor(fmtPct(r.worksheet_score, r.worksheet_max))}`}>{fmtPct(r.worksheet_score, r.worksheet_max)}%</span>
                              : <span className="font-medium text-blue-600 dark:text-blue-400">{r.worksheet_count}</span>)
                            : <span className="text-slate-300 dark:text-slate-600">-</span>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`font-bold ${pctColor(overallPct)}`}>{overallPct}%</span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor(overallPct)}`} style={{ width: `${overallPct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     TAB: CHI TIẾT
     ═══════════════════════════════════════════════ */
  const renderDetailsTab = () => (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Lọc:</span>
        {(["all", "individual", "group"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${filter === f
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}>
            {f === "all" ? "Tất cả" : f === "individual" ? "Cá nhân" : "Nhóm"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{data.total_students} học sinh</span>
      </div>

      {/* Lessons */}
      {data.lessons.map((lesson) => {
        const filtered = lesson.assignments.filter((a) => filter === "all" || a.work_type === filter);
        if (filtered.length === 0) return null;
        const isExpanded = expandedLessons.has(lesson.lesson_name);
        const totalSubmitted = filtered.reduce((s, a) => s + a.submitted_count, 0);
        const totalPossible = filtered.reduce((s, a) => s + a.total_students, 0);

        return (
          <div key={lesson.lesson_name} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => toggleLesson(lesson.lesson_name)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left">
              {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-slate-800 dark:text-white truncate block">{lesson.lesson_name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} bài · {totalSubmitted}/{totalPossible} đã nộp</span>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-700/50">
                {filtered.map((a) => {
                  const isExp = expandedAssignments.has(a.id);
                  const submitPct = fmtPct(a.submitted_count, a.total_students);
                  const { avg, ranking: assignRanking } = getAssignmentAvgAndRanking(a);

                  return (
                    <div key={a.id} className="border-b border-slate-50 dark:border-slate-700/30 last:border-b-0">
                      {/* Assignment header */}
                      <button onClick={() => toggleAssignment(a.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 pl-11 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors text-left">
                        {isExp ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        <div className={`flex-shrink-0 ${a.content_type === "quiz" ? "text-purple-500" : a.content_type === "code_exercise" ? "text-green-500" : "text-blue-500"}`}>
                          {contentTypeIcon(a.content_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-slate-800 dark:text-white truncate">{a.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">{contentTypeLabel(a.content_type)}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                              {a.work_type === "group"
                                ? <span className="inline-flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> Nhóm</span>
                                : <span className="inline-flex items-center gap-0.5"><User className="w-2.5 h-2.5" /> Cá nhân</span>}
                            </span>
                            {avg !== null && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${avg >= 80 ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : avg >= 50 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                                TB: {avg}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor(submitPct)}`} style={{ width: `${submitPct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-14 text-right">{a.submitted_count}/{a.total_students}</span>
                        </div>
                      </button>

                      {/* Expanded: tables + ranking + actions */}
                      {isExp && (
                        <div className="px-4 pb-3 pl-[4.5rem] space-y-3">
                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <button onClick={() => viewSubmissions(a.id, a.title, a.content_type)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                              <Eye className="w-3 h-3" /> Xem bài nộp
                            </button>
                            {/* Peer review only for worksheet */}
                            {a.content_type === "worksheet" && (
                              <button onClick={() => loadPeerReviews(a.id)}
                                disabled={peerReviewLoading.has(a.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 disabled:opacity-50">
                                {peerReviewLoading.has(a.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                                Đánh giá chéo
                              </button>
                            )}
                          </div>

                          {/* Peer review comments */}
                          {expandedPeerReview.has(a.id) && peerReviews[a.id] && (
                            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-800">
                              <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> Đánh giá chéo ({peerReviews[a.id].length} bài đánh giá)
                              </p>
                              {peerReviews[a.id].length === 0 ? (
                                <p className="text-xs text-violet-400">Chưa có bài đánh giá chéo nào</p>
                              ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                  {peerReviews[a.id].map((pr) => (
                                    <div key={pr.id} className="bg-white dark:bg-slate-800 rounded p-3 text-xs border border-violet-100 dark:border-violet-900/50">
                                      {/* Reviewer -> Reviewee header */}
                                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-violet-100 dark:border-violet-900/50">
                                        <div className="flex items-center gap-2">
                                          {pr.reviewer_type === "group" ? (
                                            <div className="flex items-center gap-1.5">
                                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">
                                                {pr.reviewer_group_name || `Nhóm #${pr.reviewer_id}`}
                                              </span>
                                              <span className="text-slate-400">→</span>
                                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                                                {pr.reviewee_group_name || `Nhóm #${pr.reviewee_id}`}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                              {pr.reviewer_user_name || `#${pr.reviewer_id}`}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {pr.score != null && (
                                            <span className={`font-bold px-2 py-0.5 rounded ${pr.score >= 8 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : pr.score >= 5 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>{pr.score}/10</span>
                                          )}
                                          {pr.submitted_at ? (
                                            <span className="text-slate-400">{new Date(pr.submitted_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                                          ) : (
                                            <span className="text-amber-500 italic">Chưa nộp</span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Reviewer user name (for group reviews) */}
                                      {pr.reviewer_type === "group" && pr.reviewer_user_name && (
                                        <p className="text-slate-500 mb-2 flex items-center gap-1">
                                          <User className="w-3 h-3" /> Người đánh giá: {pr.reviewer_user_name}
                                        </p>
                                      )}
                                      {/* Comments */}
                                      {Object.entries(pr.comments).length > 0 ? (
                                        <div className="space-y-1.5 bg-slate-50 dark:bg-slate-700/50 rounded p-2">
                                          {Object.entries(pr.comments).map(([key, val]) => (
                                            <div key={key} className="text-slate-600 dark:text-slate-400">
                                              <span className="text-slate-500 font-medium">{key === "general" ? "Nhận xét chung" : `Câu ${key}`}: </span>
                                              <span className="text-slate-700 dark:text-slate-300">{val}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-slate-400 italic">Không có nhận xét</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Group stats - chỉ xem, chấm điểm trong modal "Xem bài nộp" ── */}
                          {a.work_type === "group" ? (
                            a.group_stats.length > 0 ? (
                              <div className="space-y-3">
                                {a.group_stats.map((gs) => (
                                  <div key={gs.group_id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    {/* Group header */}
                                    <div className="bg-slate-50 dark:bg-slate-700/30 px-3 py-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-slate-800 dark:text-white">{gs.group_name}</span>
                                        {gs.status === "submitted"
                                          ? <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Đã nộp</span>
                                          : <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" /> {gs.status === "in_progress" ? "Đang làm" : "Chưa làm"}</span>}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {gs.submitted_at && (
                                          <span>Nộp: {new Date(gs.submitted_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                                        )}
                                        {gs.member_evaluations && Object.keys(gs.member_evaluations).length > 0 && (
                                          <button onClick={() => setViewingEvaluations({ groupName: gs.group_name, evaluations: gs.member_evaluations!, members: gs.members })}
                                            className="flex items-center gap-1 px-2 py-0.5 border border-amber-200 dark:border-amber-800 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                            <Star className="w-3 h-3" /> Xem đánh giá TV
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {/* Members table - chỉ hiển thị điểm, không có nút chấm */}
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                                          <th className="text-left py-2 px-3 text-slate-500 font-medium">Mã HS</th>
                                          <th className="text-left py-2 px-3 text-slate-500 font-medium">Họ tên</th>
                                          <th className="text-center py-2 px-3 text-slate-500 font-medium">Điểm</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {gs.members.map((member) => {
                                          const memberGrade = gs.member_grades?.[String(member.student_id)];
                                          return (
                                            <tr key={member.student_id} className="border-b border-slate-50 dark:border-slate-700/30 last:border-b-0">
                                              <td className="py-2 px-3 text-slate-500 font-mono">{member.student_code || "-"}</td>
                                              <td className="py-2 px-3 font-medium text-slate-800 dark:text-white">{member.full_name}</td>
                                              <td className="py-2 px-3 text-center">
                                                {memberGrade ? (
                                                  <span className={`font-medium ${pctColor(fmtPct(memberGrade.score, 10))}`}>{memberGrade.score}/10</span>
                                                ) : member.teacher_score != null ? (
                                                  <span className={`font-medium ${pctColor(fmtPct(member.teacher_score, 10))}`}>{member.teacher_score}/10</span>
                                                ) : gs.status === "submitted" ? (
                                                  <span className="text-slate-400 italic">Chưa chấm</span>
                                                ) : (
                                                  <span className="text-slate-300">-</span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                    {/* Code exercise test results */}
                                    {a.content_type === "code_exercise" && gs.score && (
                                      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/10">
                                        <span className="text-xs text-slate-500">Kết quả test: </span>
                                        <span className={`text-xs font-medium ${pctColor(fmtPct(gs.score.passed_tests || 0, gs.score.total_tests || 0))}`}>
                                          {gs.score.passed_tests}/{gs.score.total_tests} tests
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 py-2">Chưa có nhóm nào làm bài</p>
                            )
                          ) : (
                            /* ── Individual stats - chỉ xem, chấm điểm trong modal "Xem bài nộp" ── */
                            a.student_stats.length > 0 ? (
                              <div className="space-y-3">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-slate-200 dark:border-slate-700">
                                        {assignRanking.length > 0 && <th className="text-center py-2 pr-2 text-slate-500 font-medium w-8">#</th>}
                                        <th className="text-left py-2 pr-3 text-slate-500 font-medium">Mã HS</th>
                                        <th className="text-left py-2 pr-3 text-slate-500 font-medium">Họ tên</th>
                                        <th className="text-center py-2 pr-3 text-slate-500 font-medium">Trạng thái</th>
                                        <th className="text-center py-2 pr-3 text-slate-500 font-medium">Điểm</th>
                                        <th className="text-right py-2 text-slate-500 font-medium">Nộp lúc</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(assignRanking.length > 0
                                        ? [
                                            ...assignRanking.map((rs) => {
                                              const ss = a.student_stats.find((s) => s.student_id === rs.student_id)!;
                                              return { ...ss, _rank: rs.rank };
                                            }),
                                            ...a.student_stats
                                              .filter((ss) => !assignRanking.find((r) => r.student_id === ss.student_id))
                                              .map((ss) => ({ ...ss, _rank: 0 })),
                                          ]
                                        : a.student_stats.map((ss) => ({ ...ss, _rank: 0 }))
                                      ).map((ss) => (
                                        <tr key={ss.student_id} className="border-b border-slate-50 dark:border-slate-700/30 last:border-b-0">
                                          {assignRanking.length > 0 && (
                                            <td className="py-2 pr-2 text-center">
                                              {ss._rank > 0 ? (
                                                ss._rank <= 3 ? (
                                                  <span className={ss._rank === 1 ? "text-amber-500 font-bold" : ss._rank === 2 ? "text-slate-400 font-bold" : "text-amber-700 font-bold"}>
                                                    {ss._rank}
                                                  </span>
                                                ) : <span className="text-slate-400">{ss._rank}</span>
                                              ) : <span className="text-slate-300">-</span>}
                                            </td>
                                          )}
                                          <td className="py-2 pr-3 text-slate-500 font-mono">{ss.student_code || "-"}</td>
                                          <td className="py-2 pr-3 font-medium text-slate-800 dark:text-white">{ss.student_name}</td>
                                          <td className="py-2 pr-3 text-center">
                                            {ss.status === "submitted"
                                              ? <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Đã nộp</span>
                                              : <span className="inline-flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {ss.status === "in_progress" ? "Đang làm" : "Chưa làm"}</span>}
                                          </td>
                                          <td className="py-2 pr-3 text-center">{renderScore(ss)}</td>
                                          <td className="py-2 text-right text-slate-400">
                                            {ss.submitted_at ? new Date(ss.submitted_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 py-2">Chưa có học sinh nào làm bài</p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════════════════
     SUBMISSION VIEWER MODAL - Hiển thị phiếu bài tập đầy đủ
     ═══════════════════════════════════════════════ */
  const renderSubmissionModal = () => {
    if (!viewingSubmission) return null;
    const { assignmentId, assignmentTitle, contentType, data: subData } = viewingSubmission;
    // Sort submissions by ID to maintain stable order after refresh
    const subs = [...(subData.submissions || [])].sort((a: any, b: any) => a.id - b.id);
    const content = subData.content; // {title, questions} from API

    // Helper: Find question by ID from content
    const getQuestion = (qId: string) => {
      if (!content?.questions) return null;
      return content.questions.find((q: any) => q.id === qId || String(q.id) === qId);
    };

    // Render worksheet/quiz with questions + answers - giống giao diện học sinh
    const renderWorksheetAnswers = (answers: Record<string, any>, fallbackTitle?: string) => {
      const safeAnswers = answers || {};

      // Get raw content from API and parse it like student view
      const rawContent = typeof content?.content === "string" ? content.content : "";
      const worksheetBlocks = rawContent ? buildInteractiveBlocks(rawContent) : [];
      const title = rawContent ? parseWorksheetTitle(rawContent) : (fallbackTitle || content?.title || "Phiếu học tập");

      // If we have worksheet blocks (parsed from markdown), render like student view
      if (worksheetBlocks.length > 0) {
        return (
          <div className="mb-4">
            {/* Blue header - giống student view */}
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
              <h3 className="text-white font-bold text-xl">{title}</h3>
            </div>
            {/* Content area with blue border */}
            <div className="p-6 bg-white dark:bg-slate-800 border-2 border-blue-600 border-t-0 rounded-b-lg shadow-sm">
              {worksheetBlocks.map((block, blockIdx) => {
                if (block.type === "markdown") {
                  return (
                    <div key={`block-${blockIdx}`} className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {block.text}
                      </ReactMarkdown>
                    </div>
                  );
                }
                // question_input block - show question line + answer with underline style
                const answerKey = `q_${block.questionNum}`;
                const answer = safeAnswers[answerKey] || safeAnswers[block.questionNum] || safeAnswers[`${block.questionNum}`] || "";
                const answerLines = String(answer || "").split("\n");
                const lineCount = Math.max(answerLines.length, 3); // At least 3 lines like student view

                return (
                  <div key={`block-${blockIdx}`}>
                    {/* Question line rendered as markdown */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {block.questionLine}
                      </ReactMarkdown>
                    </div>
                    {/* Answer with underline style - giống student view */}
                    <div className="mt-1 mb-6 ml-2">
                      <div className="space-y-0">
                        {[...Array(lineCount)].map((_, lineIndex) => (
                          <div key={`${answerKey}-line-${lineIndex}`} className="w-full border-b border-gray-400">
                            <div className="px-1 py-2 text-base text-black dark:text-white" style={{ lineHeight: "1.8" }}>
                              {answerLines[lineIndex] || "\u00A0"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // Fallback: If we have content.questions array, render with that
      if (content?.questions && content.questions.length > 0) {
        return (
          <div className="mb-4">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
              <h3 className="text-white font-bold text-xl">{title}</h3>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 border-2 border-blue-600 border-t-0 rounded-b-lg shadow-sm">
              {content.questions.map((q: any, idx: number) => {
                const qId = q.id || String(idx + 1);
                const answer = safeAnswers[qId] || safeAnswers[`q_${idx + 1}`] || safeAnswers[String(idx + 1)] || "";
                const questionText = q.question || q.text || q.title || `Câu hỏi ${idx + 1}`;
                const answerLines = String(answer || "").split("\n");
                const lineCount = Math.max(answerLines.length, 3);

                return (
                  <div key={qId} className="mb-6 last:mb-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {`**Câu ${idx + 1}.** ${questionText}`}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-1 mb-6 ml-2">
                      <div className="space-y-0">
                        {[...Array(lineCount)].map((_, lineIndex) => (
                          <div key={`${qId}-line-${lineIndex}`} className="w-full border-b border-gray-400">
                            <div className="px-1 py-2 text-base text-black dark:text-white" style={{ lineHeight: "1.8" }}>
                              {answerLines[lineIndex] || "\u00A0"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // Last fallback: show raw answers if no questions structure
      const hasAnswers = Object.keys(safeAnswers).length > 0;
      if (!hasAnswers) {
        return (
          <div className="mb-4">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
              <h3 className="text-white font-bold text-xl">{fallbackTitle || "Phiếu học tập"}</h3>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 border-2 border-blue-600 border-t-0 rounded-b-lg">
              <p className="text-sm text-slate-400 italic text-center">Chưa có câu trả lời</p>
            </div>
          </div>
        );
      }

      // Fallback: raw answers with blue header style
      return (
        <div className="mb-4">
          <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
            <h3 className="text-white font-bold text-xl">{fallbackTitle || "Phiếu học tập"}</h3>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 border-2 border-blue-600 border-t-0 rounded-b-lg">
            {Object.entries(safeAnswers).map(([key, val], idx) => {
              const answerText = typeof val === "string" ? val : JSON.stringify(val);
              const answerLines = answerText.split("\n");
              const lineCount = Math.max(answerLines.length, 3);
              return (
                <div key={key} className="mb-6 last:mb-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {`**Câu ${key.replace(/[^\d]/g, '') || idx + 1}.**`}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-1 mb-6 ml-2">
                    <div className="space-y-0">
                      {[...Array(lineCount)].map((_, lineIndex) => (
                        <div key={`${key}-line-${lineIndex}`} className="w-full border-b border-gray-400">
                          <div className="px-1 py-2 text-base text-black dark:text-white" style={{ lineHeight: "1.8" }}>
                            {answerLines[lineIndex] || "\u00A0"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // Save grade and refresh submission data
    const handleSaveGrade = async () => {
      if (!gradingKey) return;
      const parts = gradingKey.split("-");
      console.log("[GRADE] Grading key:", gradingKey);
      console.log("[GRADE] Key parts:", parts);

      const score = parseFloat(gradingScore);
      if (isNaN(score) || score < 0 || score > 10) {
        alert("Điểm phải từ 0 đến 10");
        return;
      }
      setGradingSaving(true);
      try {
        if (parts[1] === "group_member") {
          const payload = {
            submission_type: "group_member",
            submission_id: Number(parts[2]),
            student_id: Number(parts[3]),
            score,
            comment: gradingComment || undefined,
          };
          console.log("[GRADE] Sending group_member grade request:", payload);
          const result = await gradeSubmission(Number(parts[0]), payload);
          console.log("[GRADE] Grade response:", result);
        } else {
          const payload = {
            submission_type: parts[1],
            submission_id: Number(parts[2]),
            score,
            comment: gradingComment || undefined,
          };
          console.log("[GRADE] Sending grade request:", payload);
          const result = await gradeSubmission(Number(parts[0]), payload);
          console.log("[GRADE] Grade response:", result);
        }
        setGradingKey(null);
        // Reload submission modal data only (no full page reload)
        console.log("[GRADE] Reloading submissions for assignment:", assignmentId);
        const res = await getSubmissions(assignmentId);
        console.log("[GRADE] Submissions reloaded, member_grades:", res.submissions?.map((s: any) => ({ id: s.id, member_grades: s.member_grades })));
        setViewingSubmission({ ...viewingSubmission, data: res });
        // Silently refresh stats in background (no spinner, preserve scroll/expanded state)
        refreshStatsSilent();
      } catch (err: any) {
        console.error("[GRADE] Grade error full:", err);
        console.error("[GRADE] Response data:", err?.response?.data);
        alert("Lỗi lưu điểm: " + (err?.response?.data?.detail || err.message));
      } finally {
        setGradingSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewingSubmission(null)}>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{assignmentTitle}</h3>
              <p className="text-xs text-slate-500">{subs.length} bài nộp · {contentTypeLabel(contentType)}</p>
            </div>
            <button onClick={() => setViewingSubmission(null)} className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-600 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {subs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">Chưa có bài nộp nào</p>
            ) : subs.map((sub: any, idx: number) => (
              <div key={sub.id || idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      {subData.work_type === "group" ? <Users className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-white">
                        {subData.work_type === "group" ? sub.group_name : sub.student_name}
                      </span>
                      {sub.submitted_at && (
                        <p className="text-xs text-slate-400">Nộp: {new Date(sub.submitted_at).toLocaleString("vi-VN")}</p>
                      )}
                    </div>
                  </div>
                  {sub.status === "submitted" ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Đã nộp
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">{sub.status === "in_progress" ? "Đang làm" : sub.status}</span>
                  )}
                </div>

                {/* Content - Bài làm */}
                <div className="p-4">
                  {contentType === "code_exercise" && sub.answers?.code ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <Code2 className="w-4 h-4 text-green-500" />
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Code đã nộp</h4>
                      </div>
                      <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap">{sub.answers.code}</pre>
                      {sub.answers.test_result && (
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <span className={`font-medium ${sub.answers.test_result.status === "passed" ? "text-green-600" : "text-red-500"}`}>
                            {sub.answers.test_result.status === "passed" ? "✓ Passed" : "✗ Failed"}
                          </span>
                          <span className="text-slate-500">
                            {sub.answers.test_result.passed_tests}/{sub.answers.test_result.total_tests} tests
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Worksheet/Quiz - render với style giống học sinh */
                    renderWorksheetAnswers(sub.answers, assignmentTitle)
                  )}
                </div>

                {/* Grading section - ONLY in modal */}
                {sub.status === "submitted" && (
                  <div className="border-t border-slate-200 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Chấm điểm
                    </p>

                    {subData.work_type === "group" && sub.members ? (
                      // Group: grade each member
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-amber-200 dark:border-amber-800/50">
                            <th className="text-left py-2 px-2 text-amber-700 dark:text-amber-400 font-medium">Thành viên</th>
                            <th className="text-center py-2 px-2 text-amber-700 dark:text-amber-400 font-medium w-24">Điểm</th>
                            <th className="text-center py-2 px-2 text-amber-700 dark:text-amber-400 font-medium w-40">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.members.map((member: any) => {
                            const memberGrade = sub.member_grades?.[String(member.student_id)];
                            const gKey = `${assignmentId}-group_member-${sub.id}-${member.student_id}`;
                            const isGrading = gradingKey === gKey;
                            // Debug logging
                            console.log(`[DISPLAY] Member ${member.full_name} (student_id=${member.student_id}): grade lookup key="${String(member.student_id)}", found grade=`, memberGrade);
                            return (
                              <tr key={member.student_id} className="border-b border-amber-100 dark:border-amber-900/30 last:border-b-0">
                                <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-white">{member.full_name}</td>
                                <td className="py-2.5 px-2 text-center">
                                  {memberGrade?.score != null ? (
                                    <span className={`font-bold ${pctColor(fmtPct(memberGrade.score, 10))}`}>{memberGrade.score}/10</span>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">Chưa chấm</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  {isGrading ? (
                                    <div className="flex items-center gap-1 justify-center">
                                      <input type="number" min="0" max="10" step="0.5" value={gradingScore}
                                        onChange={(e) => setGradingScore(e.target.value)}
                                        className="w-16 px-2 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-slate-700 text-center"
                                        placeholder="0-10" autoFocus
                                      />
                                      <button onClick={handleSaveGrade} disabled={gradingSaving}
                                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded disabled:opacity-50">
                                        {gradingSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                      </button>
                                      <button onClick={() => setGradingKey(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button onClick={() => startGrading(assignmentId, sub.id, "group_member", memberGrade?.score, memberGrade?.comment, member.student_id)}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                      <Pencil className="w-3 h-3" /> {memberGrade?.score != null ? "Sửa" : "Chấm điểm"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      // Individual: grade the submission
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Điểm GV:</span>
                        {sub.teacher_score != null ? (
                          <span className={`text-lg font-bold ${pctColor(fmtPct(sub.teacher_score, 10))}`}>{sub.teacher_score}/10</span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Chưa chấm</span>
                        )}
                        {sub.teacher_comment && (
                          <span className="text-sm text-slate-500 italic">"{sub.teacher_comment}"</span>
                        )}
                        {(() => {
                          const gKey = `${assignmentId}-individual-${sub.id}`;
                          const isGrading = gradingKey === gKey;
                          return isGrading ? (
                            <div className="flex items-center gap-2 ml-auto">
                              <input type="number" min="0" max="10" step="0.5" value={gradingScore}
                                onChange={(e) => setGradingScore(e.target.value)}
                                className="w-20 px-2 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700"
                                placeholder="0-10" autoFocus
                              />
                              <input type="text" value={gradingComment}
                                onChange={(e) => setGradingComment(e.target.value)}
                                className="flex-1 min-w-[150px] px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700"
                                placeholder="Nhận xét..."
                              />
                              <button onClick={handleSaveGrade} disabled={gradingSaving}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                                {gradingSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu
                              </button>
                              <button onClick={() => setGradingKey(null)}
                                className="px-3 py-1.5 text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => startGrading(assignmentId, sub.id, "individual", sub.teacher_score, sub.teacher_comment)}
                              className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              <Pencil className="w-4 h-4" /> {sub.teacher_score != null ? "Sửa điểm" : "Chấm điểm"}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* Tab navigation - 2 tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
        {([
          { key: "overview" as const, label: "Tổng quan", icon: TrendingUp },
          { key: "details" as const, label: "Chi tiết", icon: BarChart3 },
        ]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors flex-1 justify-center ${
              activeTab === key
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "details" && renderDetailsTab()}

      {/* Submission viewer modal */}
      {renderSubmissionModal()}

      {/* Member evaluation viewer modal */}
      {viewingEvaluations && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewingEvaluations(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-lg w-full max-h-[70vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Đánh giá thành viên: {viewingEvaluations.groupName}</h3>
              </div>
              <button onClick={() => setViewingEvaluations(null)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(viewingEvaluations.evaluations).map(([evaluatorId, evals]) => {
                const evaluator = viewingEvaluations.members.find((m) => m.student_id === Number(evaluatorId));
                return (
                  <div key={evaluatorId} className="border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 bg-amber-50/50 dark:bg-amber-900/10">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" /> {evaluator?.full_name || `HS #${evaluatorId}`} đánh giá:
                    </p>
                    <div className="space-y-2">
                      {evals.map((ev, idx) => {
                        const target = viewingEvaluations.members.find((m) => m.student_id === ev.student_id);
                        const isSelfEval = ev.student_id === Number(evaluatorId);
                        return (
                          <div key={idx} className={`flex items-start gap-2 rounded p-2 ${isSelfEval ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-slate-700/50'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${isSelfEval ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {target?.full_name || `#${ev.student_id}`}
                                </span>
                                {isSelfEval && <span className="text-[10px] px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">Tự đánh giá</span>}
                                <span className="text-amber-500 text-sm">{"★".repeat(ev.rating)}{"☆".repeat(5 - ev.rating)}</span>
                                <span className="text-xs text-slate-400">({ev.rating}/5)</span>
                              </div>
                              {ev.comment && (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">"{ev.comment}"</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {Object.keys(viewingEvaluations.evaluations).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">Chưa có đánh giá nào</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for submission fetch */}
      {submissionLoading && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Đang tải bài nộp...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
