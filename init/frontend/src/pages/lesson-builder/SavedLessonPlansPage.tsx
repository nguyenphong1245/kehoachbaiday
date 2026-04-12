/**
 * SavedLessonPlansPage - Trang hiển thị danh sách KHBD đã lưu
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  Eye,
  Calendar,
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import {
  getSavedLessonPlans,
  deleteSavedLessonPlan,
} from "@/services/lessonBuilderService";
import type { SavedLessonPlanListItem } from "@/types/lessonBuilder";
import { usePageTitle } from "@/hooks/usePageTitle";

const SavedLessonPlansPage: React.FC = () => {
  usePageTitle("KHBD đã lưu");
  const navigate = useNavigate();
  const [lessonPlans, setLessonPlans] = useState<SavedLessonPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedLessonPlanListItem | null>(null);

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
      setError(err.response?.data?.detail || "Lỗi tải danh sách KHBD");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonPlans();
  }, [page, searchQuery]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      await deleteSavedLessonPlan(String(deleteTarget.id));
      setDeleteTarget(null);
      await fetchLessonPlans();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Lỗi xóa KHBD");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id: number) => {
    window.open(`/lesson-builder/saved/${id}`, '_blank');
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
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      {/* Header - Giống trang chủ */}
      <header className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="px-5 py-2.5 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-stone-700 dark:text-stone-300 font-medium">KHBD đã lưu</span>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Search */}
          <div className="mb-5">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bài..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-white text-sm focus:ring-1 focus:ring-brand focus:border-brand"
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
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : lessonPlans.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-stone-400">
                {searchQuery
                  ? "Không tìm thấy KHBD nào"
                  : "Chưa có KHBD nào được lưu"}
              </p>
              <button
                onClick={() => navigate("/lesson-builder")}
                className="mt-4 px-4 py-2 bg-brand text-white text-sm rounded-md hover:bg-brand-dark transition-colors"
              >
                Tạo KHBD mới
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-3 text-sm text-stone-500 dark:text-stone-400">
                Tổng cộng {total} KHBD
              </div>

              {/* List */}
              <div className="space-y-3">
                {lessonPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-stone-800 dark:text-white mb-1.5">
                          {plan.lesson_name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-stone-600 dark:text-stone-400">
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
                            <span className="inline-block px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-brand-dark dark:text-sky-300 text-xs rounded">
                              {plan.topic}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(plan.id)}
                          className="p-2 text-brand hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(plan)}
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
                    className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1.5 text-sm text-stone-700 dark:text-stone-300">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Xác nhận xóa</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Thao tác này không thể hoàn tác.</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-stone-700 dark:text-stone-300">Bạn có chắc muốn xóa bài đã lưu này?</p>
              <p className="mt-2 text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-2">{deleteTarget.lesson_name}</p>
            </div>

            <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId === deleteTarget.id}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === deleteTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedLessonPlansPage;
