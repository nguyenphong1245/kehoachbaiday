import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Code2,
  Loader2,
  ClipboardList,
  Clock,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Lock,
} from "lucide-react";
import { getStudentDashboard, type StudentAssignmentInfo } from "@/services/studentService";

const StudentDashboardPage: React.FC = () => {
  const [assignments, setAssignments] = useState<StudentAssignmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentDashboard();
      setAssignments(data.assignments);
      // Auto-expand all lessons
      const lessons = new Set<string>();
      data.assignments.forEach((a) => {
        const key = a.lesson_info?.lesson_name || a.title;
        lessons.add(key);
      });
      setExpandedLessons(lessons);
    } catch {
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case "worksheet": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      case "code_exercise": return <Code2 className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
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

  const statusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
            <CheckCircle2 className="w-3 h-3" /> Đã nộp
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
            <PlayCircle className="w-3 h-3" /> Đang làm
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium">
            <Clock className="w-3 h-3" /> Chưa làm
          </span>
        );
    }
  };

  const toggleLesson = (key: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Group assignments by lesson name
  const groupedAssignments = assignments.reduce<Record<string, StudentAssignmentInfo[]>>((acc, a) => {
    const key = a.lesson_info?.lesson_name || a.title;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  // Counts
  const submittedCount = assignments.filter(a => a.status === "submitted").length;
  const pendingCount = assignments.filter(a => a.status !== "submitted").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      {assignments.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {submittedCount} đã nộp · {pendingCount} chưa nộp
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Tải lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <span>{error}</span>
          <button onClick={loadDashboard} className="ml-auto text-red-600 hover:text-red-800 text-xs font-medium">
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-10 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Chưa có bài tập nào được giao
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Khi giáo viên giao bài, bạn sẽ thấy danh sách ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedAssignments).map(([lessonKey, items]) => {
            const doneCount = items.filter(i => i.status === "submitted").length;
            const isExpanded = expandedLessons.has(lessonKey);

            return (
              <div
                key={lessonKey}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Lesson module header */}
                <button
                  onClick={() => toggleLesson(lessonKey)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white block truncate">
                      {lessonKey}
                    </span>
                  </div>
                  {/* Progress */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">
                      {doneCount}/{items.length}
                    </span>
                  </div>
                </button>

                {/* Assignment items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700/50">
                    {items.map((a) => {
                      const notStarted = a.start_at && new Date(a.start_at) > new Date();
                      const inner = (
                        <>
                          <div className={`flex-shrink-0 ${
                            notStarted
                              ? "text-amber-400"
                              : a.status === "submitted"
                              ? "text-green-500"
                              : a.status === "in_progress"
                              ? "text-blue-500"
                              : "text-slate-400 dark:text-slate-500"
                          }`}>
                            {notStarted ? <Lock className="w-4 h-4" /> : contentTypeIcon(a.content_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-sm truncate ${notStarted ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                                {a.title}
                              </h3>
                              {notStarted ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
                                  <Clock className="w-3 h-3" />
                                  {new Date(a.start_at!).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              ) : statusBadge(a.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <span>{contentTypeLabel(a.content_type)}</span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span>{a.work_type === "group" ? "Nhóm" : "Cá nhân"}</span>
                              {a.lesson_info?.activity_name && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-600">·</span>
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {a.lesson_info.activity_name}
                                  </span>
                                </>
                              )}
                              {a.due_date && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-600">·</span>
                                  <span className="text-red-500 dark:text-red-400">
                                    Hạn: {new Date(a.due_date).toLocaleDateString("vi-VN")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                        </>
                      );

                      return notStarted ? (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 px-4 py-3 pl-11 opacity-60 cursor-not-allowed border-b border-slate-50 dark:border-slate-700/30 last:border-b-0"
                          title="Chưa đến giờ làm bài"
                        >
                          {inner}
                        </div>
                      ) : (
                        <Link
                          key={a.id}
                          to={`/student/assignment/${a.id}`}
                          className="flex items-center gap-3 px-4 py-3 pl-11 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-b-0"
                        >
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
