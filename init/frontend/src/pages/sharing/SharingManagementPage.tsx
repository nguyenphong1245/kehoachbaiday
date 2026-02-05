/**
 * SharingManagementPage - Trang quản lý học liệu
 * Chỉ giữ: chỉnh sửa, giao cho lớp, xóa
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  FileQuestion,
  Trash2,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FolderOpen,
  Pencil,
  Save,
  X,
  ArrowUpDown,
  Code2,
  Send,
} from "lucide-react";
import {
  getMySharedWorksheets,
  getWorksheetDetail,
  updateWorksheet,
  deleteSharedWorksheet,
  type SharedWorksheet,
} from "@/services/worksheetService";
import {
  getMyQuizzes,
  getQuizDetail,
  updateQuiz,
  deleteQuiz,
  type SharedQuiz,
  type QuizQuestion,
} from "@/services/sharedQuizService";
import {
  getMyCodeExercises,
  deleteCodeExercise,
  type CodeExercise,
} from "@/services/codeExerciseService";
import { getClassrooms, addMaterialToClass } from "@/services/classroomService";
import type { Classroom } from "@/types/classroom";

type TabType = "worksheets" | "quizzes" | "code_exercises";
type SortMode = "newest" | "lesson_asc" | "lesson_desc";

interface LessonInfoType {
  book_type?: string;
  grade?: string;
  topic?: string;
  lesson_name?: string;
}

const getLessonLabel = (info?: LessonInfoType | null): string => {
  if (!info?.lesson_name) return "";
  const parts = [info.lesson_name];
  if (info.grade) parts.push(`Lớp ${info.grade}`);
  if (info.book_type) parts.push(info.book_type);
  return parts.join(" - ");
};

const getLessonGroupKey = (info?: LessonInfoType | null): string => {
  if (!info?.lesson_name) return "__none__";
  return `${info.lesson_name}||${info.grade || ""}||${info.book_type || ""}`;
};

const SharingManagementPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState<TabType>("worksheets");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Worksheet state
  const [worksheets, setWorksheets] = useState<SharedWorksheet[]>([]);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);

  // Quiz state
  const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
  const [qzLoading, setQzLoading] = useState(true);
  const [qzError, setQzError] = useState<string | null>(null);

  // Code exercise state
  const [codeExercises, setCodeExercises] = useState<CodeExercise[]>([]);
  const [ceLoading, setCeLoading] = useState(true);
  const [ceError, setCeError] = useState<string | null>(null);

  // Shared action states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit states
  const [editWsModal, setEditWsModal] = useState<{ id: number; title: string; content: string } | null>(null);
  const [editQzModal, setEditQzModal] = useState<{ id: number; title: string; questions: QuizQuestion[] } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Classrooms + assign
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignPopover, setAssignPopover] = useState<{ type: string; id: number; title: string; lesson_info?: LessonInfoType | null } | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Load data
  const loadWorksheets = async () => {
    setWsLoading(true);
    setWsError(null);
    try {
      const { worksheets: data } = await getMySharedWorksheets();
      setWorksheets(data);
    } catch (err: any) {
      setWsError(err.response?.data?.detail || "Lỗi khi tải danh sách phiếu học tập");
    } finally {
      setWsLoading(false);
    }
  };

  const loadQuizzes = async () => {
    setQzLoading(true);
    setQzError(null);
    try {
      const data = await getMyQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setQzError(err.response?.data?.detail || "Lỗi khi tải danh sách trắc nghiệm");
    } finally {
      setQzLoading(false);
    }
  };

  const loadCodeExercises = async () => {
    setCeLoading(true);
    setCeError(null);
    try {
      const data = await getMyCodeExercises();
      setCodeExercises(data);
    } catch (err: any) {
      setCeError(err.response?.data?.detail || "Lỗi khi tải danh sách bài tập code");
    } finally {
      setCeLoading(false);
    }
  };

  const loadClassrooms = async () => {
    try {
      const data = await getClassrooms();
      setClassrooms(data.classrooms);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadWorksheets();
    loadQuizzes();
    loadCodeExercises();
    loadClassrooms();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  // ========== Delete handlers ==========
  const handleDeleteWs = async (wsId: number) => {
    if (!confirm("Bạn có chắc muốn xóa phiếu học tập này?")) return;
    setDeletingId(`ws-${wsId}`);
    try {
      await deleteSharedWorksheet(wsId);
      setWorksheets(prev => prev.filter(w => w.id !== wsId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteQz = async (qzId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài trắc nghiệm này?")) return;
    setDeletingId(`qz-${qzId}`);
    try {
      await deleteQuiz(qzId);
      setQuizzes(prev => prev.filter(q => q.id !== qzId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCe = async (ceId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài tập lập trình này?")) return;
    setDeletingId(`ce-${ceId}`);
    try {
      await deleteCodeExercise(ceId);
      setCodeExercises(prev => prev.filter(c => c.id !== ceId));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  // ========== Edit handlers ==========
  const handleEditWs = async (wsId: number) => {
    setEditLoading(true);
    try {
      const detail = await getWorksheetDetail(wsId);
      setEditWsModal({ id: detail.id, title: detail.title, content: detail.content });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi tải chi tiết phiếu học tập");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveWs = async () => {
    if (!editWsModal) return;
    setEditSaving(true);
    try {
      await updateWorksheet(editWsModal.id, {
        title: editWsModal.title,
        content: editWsModal.content,
      });
      setEditWsModal(null);
      loadWorksheets();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi lưu");
    } finally {
      setEditSaving(false);
    }
  };

  const handleEditQz = async (qzId: number) => {
    setEditLoading(true);
    try {
      const detail = await getQuizDetail(qzId);
      setEditQzModal({ id: detail.id, title: detail.title, questions: detail.questions });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi tải chi tiết trắc nghiệm");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveQz = async () => {
    if (!editQzModal) return;
    setEditSaving(true);
    try {
      await updateQuiz(editQzModal.id, {
        title: editQzModal.title,
        questions: editQzModal.questions,
      });
      setEditQzModal(null);
      loadQuizzes();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi lưu");
    } finally {
      setEditSaving(false);
    }
  };

  // ========== Transfer to class material list ==========
  const handleAssignToClass = async (classroomId: number) => {
    if (!assignPopover) return;
    setAssigning(true);
    try {
      await addMaterialToClass(classroomId, {
        content_type: assignPopover.type,
        content_id: assignPopover.id,
        title: assignPopover.title,
        lesson_info: assignPopover.lesson_info || undefined,
      });
      alert("Đã chuyển học liệu vào lớp!");
      setAssignPopover(null);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail === "Học liệu đã có trong danh sách lớp này") {
        alert("Học liệu này đã có trong danh sách lớp rồi.");
      } else {
        alert(detail || "Lỗi khi chuyển học liệu");
      }
    } finally {
      setAssigning(false);
    }
  };

  // Sorted/grouped data
  const sortedWorksheets = useMemo(() => {
    const sorted = [...worksheets];
    if (sortMode === "newest") {
      sorted.sort((a, b) => {
        const aKey = getLessonGroupKey(a.lesson_info);
        const bKey = getLessonGroupKey(b.lesson_info);
        if (aKey !== bKey) return aKey.localeCompare(bKey, "vi");
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      const dir = sortMode === "lesson_asc" ? 1 : -1;
      sorted.sort((a, b) => {
        const aName = a.lesson_info?.lesson_name || "";
        const bName = b.lesson_info?.lesson_name || "";
        return dir * aName.localeCompare(bName, "vi");
      });
    }
    return sorted;
  }, [worksheets, sortMode]);

  const sortedQuizzes = useMemo(() => {
    const sorted = [...quizzes];
    if (sortMode === "newest") {
      sorted.sort((a, b) => {
        const aKey = getLessonGroupKey(a.lesson_info);
        const bKey = getLessonGroupKey(b.lesson_info);
        if (aKey !== bKey) return aKey.localeCompare(bKey, "vi");
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      const dir = sortMode === "lesson_asc" ? 1 : -1;
      sorted.sort((a, b) => {
        const aName = a.lesson_info?.lesson_name || "";
        const bName = b.lesson_info?.lesson_name || "";
        return dir * aName.localeCompare(bName, "vi");
      });
    }
    return sorted;
  }, [quizzes, sortMode]);

  const sortedCodeExercises = useMemo(() => {
    const sorted = [...codeExercises];
    if (sortMode === "newest") {
      sorted.sort((a, b) => {
        const aKey = getLessonGroupKey(a.lesson_info as LessonInfoType | undefined);
        const bKey = getLessonGroupKey(b.lesson_info as LessonInfoType | undefined);
        if (aKey !== bKey) return aKey.localeCompare(bKey, "vi");
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      const dir = sortMode === "lesson_asc" ? 1 : -1;
      sorted.sort((a, b) => {
        const aName = a.lesson_info?.lesson_name || "";
        const bName = b.lesson_info?.lesson_name || "";
        return dir * aName.localeCompare(bName, "vi");
      });
    }
    return sorted;
  }, [codeExercises, sortMode]);

  // Default all groups to collapsed
  const initializedCollapse = React.useRef(false);
  useEffect(() => {
    if (initializedCollapse.current) return;
    if (wsLoading || qzLoading || ceLoading) return;
    initializedCollapse.current = true;
    const allKeys = new Set<string>();
    worksheets.forEach(ws => allKeys.add(`ws-${getLessonGroupKey(ws.lesson_info)}`));
    quizzes.forEach(qz => allKeys.add(`qz-${getLessonGroupKey(qz.lesson_info)}`));
    codeExercises.forEach(ce => allKeys.add(`ce-${getLessonGroupKey(ce.lesson_info as LessonInfoType | undefined)}`));
    setCollapsedGroups(allKeys);
  }, [worksheets, quizzes, codeExercises, wsLoading, qzLoading, ceLoading]);

  const isLoading = activeTab === "worksheets" ? wsLoading : activeTab === "quizzes" ? qzLoading : ceLoading;
  const error = activeTab === "worksheets" ? wsError : activeTab === "quizzes" ? qzError : ceError;

  // ========== Render helpers ==========
  const renderGroupHeader = (
    prefix: string,
    groupKey: string,
    info: LessonInfoType | undefined,
    icon: React.ReactNode,
    itemCount: number,
  ) => {
    const isCollapsed = collapsedGroups.has(`${prefix}-${groupKey}`);
    return (
      <button
        onClick={() => toggleGroupCollapse(`${prefix}-${groupKey}`)}
        className="flex items-center gap-2 pt-3 pb-1.5 px-1 w-full text-left group"
      >
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        )}
        {icon}
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {getLessonLabel(info) || "Khác"}
        </h3>
        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
          {itemCount}
        </span>
      </button>
    );
  };

  const renderAssignRow = (contentType: string, id: number) => {
    if (!(assignPopover?.type === contentType && assignPopover?.id === id)) return null;
    return (
      <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Chọn lớp để chuyển học liệu:</p>
        {classrooms.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có lớp học nào</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classrooms.map(c => (
              <button
                key={c.id}
                onClick={() => handleAssignToClass(c.id)}
                disabled={assigning}
                className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors disabled:opacity-50 border border-blue-200 dark:border-blue-800"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = (
    contentType: string,
    id: number,
    title: string,
    onEdit: () => void,
    lessonInfo?: LessonInfoType | null,
  ) => (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        disabled={editLoading}
        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
        title="Chỉnh sửa"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (assignPopover?.type === contentType && assignPopover?.id === id) {
            setAssignPopover(null);
          } else {
            setAssignPopover({ type: contentType, id, title, lesson_info: lessonInfo });
          }
        }}
        className={`p-2 rounded-md transition-colors ${
          assignPopover?.type === contentType && assignPopover?.id === id
            ? "text-blue-700 bg-blue-100 dark:bg-blue-900/40"
            : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        }`}
        title="Chuyển vào lớp"
      >
        <Send className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (contentType === "worksheet") handleDeleteWs(id);
          else if (contentType === "quiz") handleDeleteQz(id);
          else handleDeleteCe(id);
        }}
        disabled={deletingId === `${contentType.slice(0, 2)}-${id}`}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
        title="Xóa"
      >
        {deletingId === `${contentType.slice(0, 2)}-${id}` ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className={embedded ? "flex flex-col" : "h-screen flex flex-col bg-slate-50 dark:bg-slate-900"}>
      {/* Header - hidden in embedded mode */}
      {!embedded && (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Quản lý học liệu</span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className={embedded ? "" : "flex-1 overflow-auto"}>
        <div className={embedded ? "px-4 sm:px-6 py-5 max-w-5xl mx-auto" : "max-w-5xl mx-auto px-4 sm:px-6 py-6"}>
          {/* Page Title */}
          {!embedded && (
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Quản lý học liệu
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
                Chỉnh sửa, giao bài cho lớp, hoặc xóa học liệu
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className={`flex border-b border-slate-200 dark:border-slate-700 ${embedded ? "mb-4" : "mb-5"}`}>
            <button
              onClick={() => setActiveTab("worksheets")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "worksheets"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <FileText className="w-4 h-4" />
              Phiếu học tập
              {!wsLoading && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "worksheets"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {worksheets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "quizzes"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <FileQuestion className="w-4 h-4" />
              Trắc nghiệm
              {!qzLoading && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "quizzes"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {quizzes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("code_exercises")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "code_exercises"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Bài tập code
              {!ceLoading && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "code_exercises"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {codeExercises.length}
                </span>
              )}
            </button>
          </div>

          {/* Sort controls */}
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="lesson_asc">Tên bài học A-Z</option>
                <option value="lesson_desc">Tên bài học Z-A</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          )}

          {/* ========== WORKSHEETS TAB ========== */}
          {activeTab === "worksheets" && !wsLoading && (
            <>
              {worksheets.length === 0 ? (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Chưa có phiếu học tập nào</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Tạo KHBD và bấm Lưu — phiếu học tập sẽ tự động xuất hiện tại đây
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                    Tổng cộng {worksheets.length} phiếu học tập
                  </div>
                  <div className="space-y-3">
                    {sortedWorksheets.map((ws, wsIdx) => {
                      const wsInfo = ws.lesson_info;
                      const prevInfo = wsIdx > 0 ? sortedWorksheets[wsIdx - 1].lesson_info : undefined;
                      const groupKey = getLessonGroupKey(wsInfo);
                      const showGroupHeader = groupKey !== getLessonGroupKey(prevInfo);
                      const isGroupCollapsed = collapsedGroups.has(`ws-${groupKey}`);
                      const groupItemCount = showGroupHeader ? sortedWorksheets.filter(w => getLessonGroupKey(w.lesson_info) === groupKey).length : 0;
                      if (!showGroupHeader && isGroupCollapsed) return null;
                      return (
                        <React.Fragment key={ws.id}>
                          {showGroupHeader && renderGroupHeader("ws", groupKey, wsInfo as LessonInfoType | undefined, <FileText className="w-4 h-4 text-blue-500" />, groupItemCount)}
                          {!isGroupCollapsed && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate mb-1">
                                      {ws.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(ws.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                  {renderActionButtons("worksheet", ws.id, ws.title, () => handleEditWs(ws.id), ws.lesson_info)}
                                </div>
                              </div>
                              {renderAssignRow("worksheet", ws.id)}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ========== QUIZZES TAB ========== */}
          {activeTab === "quizzes" && !qzLoading && (
            <>
              {quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Chưa có bài trắc nghiệm nào</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Tạo KHBD và bấm Lưu — bài trắc nghiệm sẽ tự động xuất hiện tại đây
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                    Tổng cộng {quizzes.length} bài trắc nghiệm
                  </div>
                  <div className="space-y-3">
                    {sortedQuizzes.map((qz, qzIdx) => {
                      const qzInfo = qz.lesson_info;
                      const prevQzInfo = qzIdx > 0 ? sortedQuizzes[qzIdx - 1].lesson_info : undefined;
                      const qzGroupKey = getLessonGroupKey(qzInfo);
                      const showQzGroupHeader = qzGroupKey !== getLessonGroupKey(prevQzInfo);
                      const isQzGroupCollapsed = collapsedGroups.has(`qz-${qzGroupKey}`);
                      const qzGroupItemCount = showQzGroupHeader ? sortedQuizzes.filter(q => getLessonGroupKey(q.lesson_info) === qzGroupKey).length : 0;
                      if (!showQzGroupHeader && isQzGroupCollapsed) return null;
                      return (
                        <React.Fragment key={qz.id}>
                          {showQzGroupHeader && renderGroupHeader("qz", qzGroupKey, qzInfo as LessonInfoType | undefined, <FileQuestion className="w-4 h-4 text-blue-500" />, qzGroupItemCount)}
                          {!isQzGroupCollapsed && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate mb-1">
                                      {qz.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <FileQuestion className="w-3.5 h-3.5" />
                                        {qz.total_questions} câu
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(qz.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                  {renderActionButtons("quiz", qz.id, qz.title, () => handleEditQz(qz.id), qz.lesson_info)}
                                </div>
                              </div>
                              {renderAssignRow("quiz", qz.id)}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ========== CODE EXERCISES TAB ========== */}
          {activeTab === "code_exercises" && !ceLoading && (
            <>
              {codeExercises.length === 0 ? (
                <div className="text-center py-16">
                  <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Chưa có bài tập lập trình nào</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Bài tập code được tạo từ nút "Bài tập code" khi soạn KHBD
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                    Tổng cộng {codeExercises.length} bài tập lập trình
                  </div>
                  <div className="space-y-3">
                    {sortedCodeExercises.map((ce, ceIdx) => {
                      const ceInfo = ce.lesson_info as LessonInfoType | undefined;
                      const prevCeInfo = ceIdx > 0 ? sortedCodeExercises[ceIdx - 1].lesson_info as LessonInfoType | undefined : undefined;
                      const ceGroupKey = getLessonGroupKey(ceInfo);
                      const showCeGroupHeader = ceGroupKey !== getLessonGroupKey(prevCeInfo);
                      const isCeGroupCollapsed = collapsedGroups.has(`ce-${ceGroupKey}`);
                      const ceGroupItemCount = showCeGroupHeader ? sortedCodeExercises.filter(c => getLessonGroupKey(c.lesson_info as LessonInfoType | undefined) === ceGroupKey).length : 0;
                      if (!showCeGroupHeader && isCeGroupCollapsed) return null;
                      return (
                        <React.Fragment key={ce.id}>
                          {showCeGroupHeader && renderGroupHeader("ce", ceGroupKey, ceInfo, <Code2 className="w-4 h-4 text-blue-500" />, ceGroupItemCount)}
                          {!isCeGroupCollapsed && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate mb-1">
                                      {ce.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Code2 className="w-3.5 h-3.5" />
                                        {ce.language}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        {ce.total_test_cases} test cases
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(ce.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                  {renderActionButtons("code_exercise", ce.id, ce.title, () => {
                                    window.open(`/code/${ce.share_code}`, "_blank");
                                  }, ce.lesson_info)}
                                </div>
                              </div>
                              {renderAssignRow("code_exercise", ce.id)}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========== EDIT WORKSHEET MODAL ========== */}
      {editWsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                Chỉnh sửa phiếu học tập
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveWs}
                  disabled={editSaving}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu
                </button>
                <button
                  onClick={() => setEditWsModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title input */}
            <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-700">
              <input
                type="text"
                value={editWsModal.title}
                onChange={(e) => setEditWsModal({ ...editWsModal, title: e.target.value })}
                placeholder="Tiêu đề phiếu học tập..."
                className="w-full px-0 py-1 border-0 bg-transparent text-lg font-semibold text-slate-900 dark:text-white focus:ring-0 focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Modal body - side by side editor + preview */}
            <div className="flex-1 overflow-hidden flex">
              {/* Editor */}
              <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-700">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Soạn thảo</span>
                </div>
                <textarea
                  value={editWsModal.content}
                  onChange={(e) => setEditWsModal({ ...editWsModal, content: e.target.value })}
                  className="flex-1 w-full px-4 py-3 border-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-0 focus:outline-none font-mono text-sm resize-none leading-relaxed"
                  placeholder="Nhập nội dung phiếu học tập..."
                />
              </div>

              {/* Preview */}
              <div className="w-1/2 flex flex-col">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xem trước</span>
                </div>
                <div className="flex-1 overflow-auto px-5 py-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    {editWsModal.content.split("\n").map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-3" />;
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        const text = trimmed.slice(2, -2);
                        return <p key={i} className="font-bold text-slate-900 dark:text-white text-base mb-1">{text}</p>;
                      }
                      if (trimmed.startsWith("**")) {
                        const parts = trimmed.split("**");
                        return (
                          <p key={i} className="mb-1">
                            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 dark:text-white">{part}</strong> : <span key={j}>{part}</span>)}
                          </p>
                        );
                      }
                      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        return <p key={i} className="ml-4 mb-0.5 before:content-['•'] before:mr-2 before:text-slate-400">{trimmed.slice(2)}</p>;
                      }
                      if (/^[.\s…]+$/.test(trimmed)) {
                        return <div key={i} className="border-b border-dotted border-slate-300 dark:border-slate-600 my-2 h-5" />;
                      }
                      return <p key={i} className="mb-1">{trimmed}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
              <span className="text-xs text-slate-400">{editWsModal.content.length} ký tự</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditWsModal(null)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveWs}
                  disabled={editSaving}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT QUIZ MODAL ========== */}
      {editQzModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                Chỉnh sửa bài trắc nghiệm
              </h2>
              <button
                onClick={() => setEditQzModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={editQzModal.title}
                  onChange={(e) => setEditQzModal({ ...editQzModal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {editQzModal.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        {qIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...editQzModal.questions];
                          updated[qIdx] = { ...updated[qIdx], question: e.target.value };
                          setEditQzModal({ ...editQzModal, questions: updated });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="ml-9">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((key) => (
                          <div key={key} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...editQzModal.questions];
                                updated[qIdx] = { ...updated[qIdx], correct_answer: key };
                                setEditQzModal({ ...editQzModal, questions: updated });
                              }}
                              className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold flex-shrink-0 transition-colors ${
                                q.correct_answer === key
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                              }`}
                              title={q.correct_answer === key ? "Đáp án đúng" : "Chọn làm đáp án đúng"}
                            >
                              {key}
                            </button>
                            <input
                              type="text"
                              value={q.options?.[key] || ""}
                              onChange={(e) => {
                                const updated = [...editQzModal.questions];
                                updated[qIdx] = {
                                  ...updated[qIdx],
                                  options: { ...(updated[qIdx].options || {}), [key]: e.target.value },
                                };
                                setEditQzModal({ ...editQzModal, questions: updated });
                              }}
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setEditQzModal(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQz}
                disabled={editSaving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharingManagementPage;
