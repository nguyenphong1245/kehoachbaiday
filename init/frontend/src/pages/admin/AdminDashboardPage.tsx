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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Top Token Usage */}
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
              {stats.top_teachers.map((teacher, idx) => (
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
                        Còn: {teacher.token_balance.toLocaleString("vi-VN")} token
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      {teacher.tokens_used.toLocaleString("vi-VN")} đã dùng
                    </span>
                  </div>
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
