import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  FileQuestion,
  Code2,
  BookOpen,
  Loader2,
  AlertCircle,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Eye,
  X,
  Share2,
} from "lucide-react";
import {
  getAllContent,
  deleteContent,
  type ContentItem,
  type LessonInfo,
} from "@/services/adminService";

type TabType = "quiz" | "worksheet" | "code_exercise" | "lesson_plan";

const tabConfig: { key: TabType; label: string; icon: typeof FileText }[] = [
  { key: "quiz", label: "Trắc nghiệm", icon: FileQuestion },
  { key: "worksheet", label: "Phiếu học tập", icon: FileText },
  { key: "code_exercise", label: "Bài tập code", icon: Code2 },
  { key: "lesson_plan", label: "KHBD", icon: BookOpen },
];

const getLessonLabel = (info?: LessonInfo | null): string => {
  if (!info?.lesson_name) return "";
  const parts = [info.lesson_name];
  if (info.grade) parts.push(`Lớp ${info.grade}`);
  if (info.book_type) parts.push(info.book_type);
  return parts.join(" - ");
};

const getLessonGroupKey = (info?: LessonInfo | null): string => {
  if (!info?.lesson_name) return "__none__";
  return `${info.lesson_name}||${info.grade || ""}||${info.book_type || ""}`;
};

const AdminContentPage = () => {
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("quiz");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContent("all", 1, 9999);
      setAllItems(data.items);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Lỗi khi tải nội dung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  // Group items by tab type
  const quizzes = useMemo(() => allItems.filter((i) => i.type === "quiz"), [allItems]);
  const worksheets = useMemo(() => allItems.filter((i) => i.type === "worksheet"), [allItems]);
  const codeExercises = useMemo(() => allItems.filter((i) => i.type === "code_exercise"), [allItems]);
  const lessonPlans = useMemo(() => allItems.filter((i) => i.type === "lesson_plan"), [allItems]);

  const currentItems = useMemo(() => {
    const map: Record<TabType, ContentItem[]> = {
      quiz: quizzes,
      worksheet: worksheets,
      code_exercise: codeExercises,
      lesson_plan: lessonPlans,
    };
    return map[activeTab] || [];
  }, [activeTab, quizzes, worksheets, codeExercises, lessonPlans]);

  // Sort by lesson name
  const sortedItems = useMemo(() => {
    const sorted = [...currentItems];
    sorted.sort((a, b) => {
      const aName = a.lesson_info?.lesson_name || "";
      const bName = b.lesson_info?.lesson_name || "";
      if (aName && !bName) return -1;
      if (!aName && bName) return 1;
      return aName.localeCompare(bName, "vi");
    });
    return sorted;
  }, [currentItems]);

  // Default collapsed on initial load
  const initializedCollapse = React.useRef(false);
  useEffect(() => {
    if (initializedCollapse.current) return;
    if (allItems.length === 0) return;
    initializedCollapse.current = true;
    const allKeys = new Set<string>();
    allItems.forEach((item) => {
      allKeys.add(`${item.type}-${getLessonGroupKey(item.lesson_info)}`);
    });
    setCollapsedGroups(allKeys);
  }, [allItems]);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Xóa "${item.title}" của ${item.creator_email}?\n\nHành động này không thể hoàn tác!`)) return;
    const key = `${item.type}-${item.id}`;
    setDeletingId(key);
    setSuccessMsg(null);
    try {
      await deleteContent(item.type, item.id);
      setAllItems((prev) => prev.filter((i) => !(i.id === item.id && i.type === item.type)));
      setSuccessMsg(`Đã xóa "${item.title}"`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

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

  const tabCounts: Record<TabType, number> = {
    quiz: quizzes.length,
    worksheet: worksheets.length,
    code_exercise: codeExercises.length,
    lesson_plan: lessonPlans.length,
  };

  return (
    <section className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Share2 className="w-6 h-6 text-blue-500" />
          Quản lý nội dung
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Xem và quản lý tất cả nội dung trên hệ thống
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {!loading && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Không có nội dung nào</p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Tổng cộng {sortedItems.length}{" "}
            {tabConfig.find((t) => t.key === activeTab)?.label?.toLowerCase()}
          </div>
          <div className="space-y-3">
            {sortedItems.map((item, idx) => {
              const groupKey = getLessonGroupKey(item.lesson_info);
              const prevGroupKey =
                idx > 0 ? getLessonGroupKey(sortedItems[idx - 1].lesson_info) : null;
              const showGroupHeader = groupKey !== prevGroupKey;
              const collapseKey = `${activeTab}-${groupKey}`;
              const isGroupCollapsed = collapsedGroups.has(collapseKey);
              const groupItemCount = showGroupHeader
                ? sortedItems.filter((i) => getLessonGroupKey(i.lesson_info) === groupKey).length
                : 0;

              if (!showGroupHeader && isGroupCollapsed) return null;

              const TabIcon = tabConfig.find((t) => t.key === activeTab)?.icon || FileText;
              const delKey = `${item.type}-${item.id}`;

              return (
                <React.Fragment key={delKey}>
                  {showGroupHeader && (
                    <button
                      onClick={() => toggleGroupCollapse(collapseKey)}
                      className="flex items-center gap-2 pt-3 pb-1.5 px-1 w-full text-left group"
                    >
                      {isGroupCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      )}
                      <TabIcon className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {getLessonLabel(item.lesson_info) || "Khác"}
                      </h3>
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        {groupItemCount}
                      </span>
                    </button>
                  )}
                  {isGroupCollapsed ? null : (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {item.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {item.creator_email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.created_at)}
                              </span>
                              {item.share_code && (
                                <span className="font-mono text-blue-500">
                                  #{item.share_code}
                                </span>
                              )}
                              {item.is_active !== null && (
                                <span className="flex items-center gap-1">
                                  {item.is_active ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      <span className="text-green-600 dark:text-green-400">Đang mở</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 text-slate-400" />
                                      <span>Đã đóng</span>
                                    </>
                                  )}
                                </span>
                              )}
                              {item.response_count > 0 && (
                                <span>{item.response_count} bài nộp</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {item.content && (
                              <button
                                onClick={() => setPreviewItem(item)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                title="Xem nội dung"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === delKey}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                              title="Xóa"
                            >
                              {deletingId === delKey ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}

      {/* Content Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {previewItem.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {previewItem.creator_email} &middot; {formatDate(previewItem.created_at)}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {previewItem.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminContentPage;
