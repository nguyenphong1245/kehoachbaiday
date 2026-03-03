import { useState, useEffect } from "react";
import {
  Users,
  School,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertCircle,
  UserPlus,
  CheckCircle,
  XCircle,
  Coins,
  FileText,
  ClipboardList,
  Code,
  UserCheck,
  Activity,
  FolderOpen,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/services/adminService";
import { api } from "@/services/authService";

interface TeacherOverview {
  total_classrooms: number;
  total_students: number;
  total_materials: number;
}

const AdminDashboardPage = () => {
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

        // Calculate summary stats from teachers overview
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
    <section className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Tổng quan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Thống kê hệ thống và theo dõi sử dụng token
        </p>
      </div>

      {/* Token summary cards */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Thống kê Token toàn hệ thống
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium">Tổng đã cấp</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {formatTokens(stats.total_tokens_allocated)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Tổng đã dùng</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {formatTokens(stats.total_tokens_used)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-medium">Tổng còn lại</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {formatTokens(stats.total_tokens_remaining)}
            </p>
          </div>
        </div>
        {/* Usage bar */}
        {stats.total_tokens_allocated > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Tỷ lệ sử dụng</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{usagePercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* User statistics */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Thống kê người dùng
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Tổng users</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_users}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Hoạt động</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.active_users}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Đã xác thực</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.verified_users}</p>
          </div>
          {summaryStats && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Giáo viên</span>
                </div>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{summaryStats.teachers}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                  <School className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Lớp học</span>
                </div>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{summaryStats.classrooms}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Học sinh</span>
                </div>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{summaryStats.students}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content statistics */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Thống kê nội dung
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Giáo án</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_lesson_plans}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Trắc nghiệm</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_quizzes}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Phiếu học tập</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_worksheets}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <Code className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Bài tập code</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total_code_exercises}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Teachers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Giáo viên đăng ký gần đây
            </h2>
          </div>
          {stats.recent_users.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có giáo viên</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {user.is_verified ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" /> Đã xác thực
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <XCircle className="w-3 h-3" /> Chưa xác thực
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Token Usage - summary card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Top sử dụng token
            </h2>
          </div>
          {stats.top_teachers.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {stats.top_teachers.slice(0, 5).map((teacher, idx) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      idx === 0 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                      idx === 1 ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" :
                      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {teacher.email}
                      </p>
                      <p className="text-xs text-slate-400">
                        Còn: {formatTokens(teacher.token_balance)} token
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      {formatTokens(teacher.tokens_used)} đã dùng
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full teacher token usage table */}
      {stats.top_teachers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Chi tiết sử dụng token giáo viên
            </h2>
            <span className="text-xs text-slate-400 ml-auto">{stats.top_teachers.length} giáo viên</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium text-right">Đã dùng</th>
                  <th className="px-5 py-3 font-medium text-right">Còn lại</th>
                  <th className="px-5 py-3 font-medium text-right">Tổng cấp</th>
                  <th className="px-5 py-3 font-medium text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.top_teachers.map((teacher, idx) => {
                  const total = teacher.tokens_used + teacher.token_balance;
                  const pct = total > 0 ? Math.round((teacher.tokens_used / total) * 100) : 0;
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300">
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <span className="font-medium">{teacher.email}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-semibold ${teacher.tokens_used > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                          {formatTokens(teacher.tokens_used)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={teacher.token_balance === 0 ? "text-red-500 font-semibold" : ""}>
                          {formatTokens(teacher.token_balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">
                        {formatTokens(total)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
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
    </section>
  );
};

export default AdminDashboardPage;
