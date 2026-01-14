/**
 * SavedLessonPlansPage - Trang hiển thị danh sách giáo án đã lưu
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import {
  getSavedLessonPlans,
  deleteSavedLessonPlan,
} from "@/services/lessonBuilderService";
import type { SavedLessonPlanListItem } from "@/types/lessonBuilder";

const SavedLessonPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessonPlans, setLessonPlans] = useState<SavedLessonPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const PAGE_SIZE = 10;

  const fetchLessonPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSavedLessonPlans(
        page,
        PAGE_SIZE,
        searchQuery || undefined
      );
      setLessonPlans(response.lesson_plans);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / PAGE_SIZE));
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi tải danh sách giáo án");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonPlans();
  }, [page, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa giáo án này?")) return;

    setDeletingId(id);
    try {
      await deleteSavedLessonPlan(String(id));
      fetchLessonPlans();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi xóa giáo án");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id: number) => {
    navigate(`/lesson-builder/saved/${id}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header - Giống trang chủ */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-5 py-2.5 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Kế hoạch bài dạy</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Giáo án đã lưu</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/lesson-builder")}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-500" />
              Giáo án đã lưu
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Xem lại và quản lý các giáo án đã tạo
            </p>
          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bài..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : lessonPlans.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery
                  ? "Không tìm thấy giáo án nào"
                  : "Chưa có giáo án nào được lưu"}
              </p>
              <button
                onClick={() => navigate("/lesson-builder")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Tạo giáo án mới
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Tổng cộng {total} giáo án
              </div>

              {/* List */}
              <div className="space-y-3">
                {lessonPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1.5">
                          {plan.lesson_name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {plan.book_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Lớp {plan.grade}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(plan.updated_at)}
                          </span>
                        </div>
                        {plan.topic && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                              {plan.topic}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(plan.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          disabled={deletingId === plan.id}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedLessonPlansPage;
