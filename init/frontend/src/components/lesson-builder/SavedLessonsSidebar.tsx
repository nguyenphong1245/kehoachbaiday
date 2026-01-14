/**
 * SavedLessonsSidebar - Sidebar hiển thị danh sách giáo án đã lưu
 */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  FolderOpen,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { getSavedLessonPlans } from "@/services/lessonBuilderService";
import type { SavedLessonPlanListItem } from "@/types/lessonBuilder";
import { getStoredAuthUser, clearStoredAuth } from "@/utils/authStorage";

interface SavedLessonsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedLessonsSidebar: React.FC<SavedLessonsSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [lessonPlans, setLessonPlans] = useState<SavedLessonPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const user = getStoredAuthUser();

  useEffect(() => {
    const fetchLessonPlans = async () => {
      setIsLoading(true);
      try {
        const response = await getSavedLessonPlans(1, 10);
        setLessonPlans(response.lesson_plans);
      } catch (err) {
        console.error("Error fetching saved lesson plans:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLessonPlans();
    }
  }, [isOpen]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/login");
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl z-50 flex flex-col">
        {/* User Info Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-white truncate">
                {user?.email || "Người dùng"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đã đăng nhập
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-700 dark:text-slate-200">Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-200">Tối</span>
                </>
              )}
            </button>
            <Link
              to="/account"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 dark:text-slate-200">Cài đặt</span>
            </Link>
          </div>
        </div>

        {/* Saved Lesson Plans */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Giáo án đã lưu
              </h3>
              <Link
                to="/lesson-builder/saved"
                onClick={onClose}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Xem tất cả
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : lessonPlans.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có giáo án nào được lưu
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lessonPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      navigate(`/lesson-builder/saved/${plan.id}`);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {plan.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(plan.updated_at)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
};

export default SavedLessonsSidebar;
