import { useState, useEffect } from "react";
import {
  Users,
  School,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Coins,
  FileText,
  ClipboardList,
  Code,
  UserCheck,
  Activity,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/services/adminService";
import { api } from "@/services/authService";
import { usePageTitle } from "@/hooks/usePageTitle";

interface TeacherOverview {
  total_classrooms: number;
  total_students: number;
  total_materials: number;
}

const AdminDashboardPage = () => {
  usePageTitle("Quản trị");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summaryStats, setSummaryStats] = useState<{
    teachers: number;
    classrooms: number;
    students: number;
    materials: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardData, teachersData] = await Promise.all([
          getDashboardStats(),
          api.get<TeacherOverview[]>("/admin/teachers-overview"),
        ]);
        setStats(dashboardData);

        const teachers = teachersData.data;
        setSummaryStats({
          teachers: teachers.length,
          classrooms: teachers.reduce((sum, t) => sum + t.total_classrooms, 0),
          students: teachers.reduce((sum, t) => sum + t.total_students, 0),
          materials: teachers.reduce((sum, t) => sum + t.total_materials, 0),
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || "Lỗi khi tải thống kê");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTokens = (n: number) => n.toLocaleString("vi-VN");

  const usagePercent = stats && stats.total_tokens_allocated > 0
    ? Math.round((stats.total_tokens_used / stats.total_tokens_allocated) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500 gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error || "Không thể tải dữ liệu"}</span>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
        Tổng quan hệ thống
      </h1>

      {/* Token Overview - unified card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-4.5 h-4.5 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Token</span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-4">
          <div>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mb-0.5">Đã cấp</p>
            <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
              {formatTokens(stats.total_tokens_allocated)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mb-0.5">Đã dùng</p>
            <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 leading-tight">
              {formatTokens(stats.total_tokens_used)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mb-0.5">Còn lại</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 leading-tight">
              {formatTokens(stats.total_tokens_remaining)}
            </p>
          </div>
        </div>
        {stats.total_tokens_allocated > 0 && (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">
              <span>Tỷ lệ sử dụng</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">{usagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent > 80 ? "bg-red-400" : usagePercent > 50 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats - compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          { icon: Users, label: "Người dùng", value: stats.total_users, color: "text-slate-500" },
          { icon: Activity, label: "Hoạt động", value: stats.active_users, color: "text-emerald-500" },
          { icon: UserCheck, label: "Đã xác thực", value: stats.verified_users, color: "text-blue-500" },
          ...(summaryStats ? [
            { icon: School, label: "Lớp học", value: summaryStats.classrooms, color: "text-violet-500" },
            { icon: GraduationCap, label: "Học sinh", value: summaryStats.students, color: "text-pink-500" },
          ] : []),
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Content Stats - inline row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { icon: FileText, label: "Giáo án", value: stats.total_lesson_plans, color: "text-blue-500" },
          { icon: ClipboardList, label: "Trắc nghiệm", value: stats.total_quizzes, color: "text-emerald-500" },
          { icon: BookOpen, label: "Phiếu học tập", value: stats.total_worksheets, color: "text-orange-500" },
          { icon: Code, label: "Bài tập code", value: stats.total_code_exercises, color: "text-violet-500" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Teachers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Giáo viên gần đây
          </h2>
          {stats.recent_users.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có giáo viên</p>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  {user.is_verified ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Token Usage */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Top sử dụng token
          </h2>
          {stats.top_teachers.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2.5">
              {stats.top_teachers.slice(0, 5).map((teacher, idx) => (
                <div key={teacher.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                      idx === 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                      idx === 1 ? "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300" :
                      "bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {teacher.email}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Còn {formatTokens(teacher.token_balance)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0 tabular-nums">
                    {formatTokens(teacher.tokens_used)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
