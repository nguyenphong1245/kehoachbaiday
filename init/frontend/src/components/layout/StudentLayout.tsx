import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LogOut, User } from "lucide-react";
import { logoutUser } from "@/services/authService";
import { clearStoredAuth, getStoredAuthUser } from "@/utils/authStorage";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredAuthUser();
  const isDashboard = location.pathname === "/student/dashboard" || location.pathname === "/student";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    clearStoredAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {isDashboard && (
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link
            to="/student/dashboard"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Bài tập của tôi
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-2">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{user?.email?.split("@")[0] || "Học sinh"}</span>
            </span>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </nav>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
