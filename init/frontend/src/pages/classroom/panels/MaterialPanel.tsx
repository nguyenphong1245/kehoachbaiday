import React, { useState, useEffect, useMemo } from "react";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  Users,
  Send,
  BookOpen,
  X,
} from "lucide-react";
import {
  createAssignment,
  deleteAssignment,
  type Assignment,
} from "@/services/assignmentService";
import {
  getClassroomMaterials,
  removeMaterialFromClass,
  type ClassroomMaterial,
} from "@/services/classroomService";
import { activatePeerReview } from "@/services/peerReviewService";

interface MaterialPanelProps {
  classroomId: number;
  classroomName: string;
  assignments: Assignment[];
  assignmentsLoading: boolean;
  onReloadAssignments: () => Promise<void>;
  onAssigned: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const typeLabel: Record<string, string> = {
  worksheet: "Phiếu bài tập",
  quiz: "Quiz",
  code_exercise: "Bài code",
};

const typeColor: Record<string, string> = {
  worksheet: "text-brand dark:text-sky-400",
  quiz: "text-emerald-600 dark:text-emerald-400",
  code_exercise: "text-violet-600 dark:text-violet-400",
};

const getLessonGroupKey = (info?: ClassroomMaterial["lesson_info"]): string => {
  if (!info?.lesson_name) return "__none__";
  return `${info.lesson_name}||${info.grade || ""}||${info.book_type || ""}`;
};

const getLessonLabel = (info?: ClassroomMaterial["lesson_info"]): string => {
  if (!info?.lesson_name) return "Khác";
  const parts = [info.lesson_name];
  if (info.grade) parts.push(`Lớp ${info.grade}`);
  if (info.book_type) parts.push(info.book_type);
  return parts.join(" · ");
};

const MaterialPanel: React.FC<MaterialPanelProps> = ({
  classroomId,
  classroomName,
  assignments,
  assignmentsLoading,
  onReloadAssignments,
  onAssigned,
  onError,
  onSuccess,
}) => {
  const { confirm, ConfirmDialog, dialogProps } = useConfirm();
  // Classroom materials (staging area)
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Assign form state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignWorkType, setAssignWorkType] = useState("individual");
  const [assignStartAt, setAssignStartAt] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignAutoPeerReview, setAssignAutoPeerReview] = useState(false);
  const [assignChatEnabled, setAssignChatEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load classroom materials
  const loadMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const data = await getClassroomMaterials(classroomId);
      setMaterials(data);
    } catch {
      // silent
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [classroomId]);

  // Group materials by lesson, excluding already-assigned ones
  const groupedMaterials = useMemo(() => {
    // Build set of assigned content keys to filter out
    const assignedKeys = new Set(
      assignments.map((a) => `${a.content_type}-${a.content_id}`)
    );

    const filtered = materials.filter(
      (m) => !assignedKeys.has(`${m.content_type}-${m.content_id}`)
    );

    const groups: { key: string; label: string; items: ClassroomMaterial[] }[] = [];
    const map = new Map<string, ClassroomMaterial[]>();
    const orderKeys: string[] = [];

    for (const item of filtered) {
      const gk = getLessonGroupKey(item.lesson_info);
      if (!map.has(gk)) {
        map.set(gk, []);
        orderKeys.push(gk);
      }
      map.get(gk)!.push(item);
    }

    for (const gk of orderKeys) {
      const items = map.get(gk)!;
      const label = getLessonLabel(items[0].lesson_info);
      groups.push({ key: gk, label, items });
    }

    return groups;
  }, [materials, assignments]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openAssignForm = (mat: ClassroomMaterial) => {
    const key = `${mat.content_type}-${mat.content_id}`;
    if (assigningId === key) {
      setAssigningId(null);
      return;
    }
    setAssigningId(key);
    setAssignTitle(mat.title);
    setAssignDesc("");
    setAssignWorkType("individual");
    setAssignStartAt("");
    setAssignDueDate("");
    setAssignAutoPeerReview(false);
    setAssignChatEnabled(mat.content_type !== "quiz");
  };

  const handleAssign = async (mat: ClassroomMaterial) => {
    if (!assignTitle.trim()) return;
    setSubmitting(true);
    try {
      await createAssignment({
        classroom_id: classroomId,
        content_type: mat.content_type,
        content_id: mat.content_id,
        title: assignTitle.trim(),
        description: assignDesc.trim() || undefined,
        work_type: assignWorkType,
        start_at: assignStartAt || undefined,
        due_date: assignDueDate || undefined,
        auto_peer_review: assignAutoPeerReview,
        chat_enabled: assignChatEnabled,
        lesson_info: mat.lesson_info || undefined,
      });
      onSuccess(`Đã giao "${assignTitle}" cho lớp ${classroomName}`);
      setAssigningId(null);
      onAssigned();
      await onReloadAssignments();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      onError(detail || "Lỗi khi giao bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMaterial = async (materialId: number) => {
    const ok = await confirm({ title: "Xác nhận", message: "Xóa học liệu khỏi danh sách lớp?", confirmText: "Xóa", cancelText: "Huỷ", variant: "danger" });
    if (!ok) return;
    try {
      await removeMaterialFromClass(classroomId, materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      onSuccess("Đã xóa học liệu khỏi lớp");
    } catch {
      onError("Lỗi khi xóa học liệu");
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    const ok2 = await confirm({ title: "Xác nhận", message: "Xóa bài giao này?", confirmText: "Xóa", cancelText: "Huỷ", variant: "danger" });
    if (!ok2) return;
    try {
      await deleteAssignment(assignmentId);
      onSuccess("Đã xóa bài giao");
      await onReloadAssignments();
    } catch {
      onError("Lỗi khi xóa bài giao");
    }
  };

  const handleActivatePeerReview = async (assignmentId: number) => {
    const ok3 = await confirm({ title: "Xác nhận", message: "Kích hoạt tráo bài đánh giá chéo cho bài này?", confirmText: "Kích hoạt", cancelText: "Huỷ" });
    if (!ok3) return;
    try {
      await activatePeerReview(assignmentId);
      onSuccess("Đã kích hoạt tráo bài");
      await onReloadAssignments();
    } catch (err: any) {
      onError(err?.response?.data?.detail || "Lỗi khi kích hoạt tráo bài");
    }
  };

  // Build material lesson_info lookup for fallback
  const materialLessonMap = useMemo(() => {
    const map = new Map<string, ClassroomMaterial["lesson_info"]>();
    for (const m of materials) {
      if (m.lesson_info?.lesson_name) {
        map.set(`${m.content_type}-${m.content_id}`, m.lesson_info);
      }
    }
    return map;
  }, [materials]);

  // Group assignments by lesson (with material fallback for lesson_info)
  const groupedAssignments = useMemo(() => {
    const groups: { key: string; label: string; items: Assignment[] }[] = [];
    const map = new Map<string, Assignment[]>();
    const orderKeys: string[] = [];

    for (const a of assignments) {
      const info = a.lesson_info || materialLessonMap.get(`${a.content_type}-${a.content_id}`);
      const lessonName = info?.lesson_name || "__none__";
      if (!map.has(lessonName)) {
        map.set(lessonName, []);
        orderKeys.push(lessonName);
      }
      map.get(lessonName)!.push(a);
    }

    for (const gk of orderKeys) {
      const items = map.get(gk)!;
      const label = gk === "__none__" ? "Khác" : gk;
      groups.push({ key: gk, label, items });
    }
    return groups;
  }, [assignments, materialLessonMap]);

  const [collapsedAssignGroups, setCollapsedAssignGroups] = useState<Set<string>>(new Set());

  const toggleAssignGroup = (key: string) => {
    setCollapsedAssignGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Assigned materials section ──
  const renderAssignments = () => {
    if (assignmentsLoading) {
      return (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <p className="text-sm text-stone-400 dark:text-stone-500 py-4">
          Chưa có bài nào được giao cho lớp này.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {groupedAssignments.map((group) => {
          const isCollapsed = collapsedAssignGroups.has(group.key);
          return (
            <div key={group.key}>
              <button
                onClick={() => toggleAssignGroup(group.key)}
                className="flex items-center gap-2 py-2 px-1 w-full text-left group"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
                )}
                <BookOpen className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 group-hover:text-brand dark:group-hover:text-sky-400 transition-colors truncate">
                  {group.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 flex-shrink-0">
                  {group.items.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="ml-6 border-l-2 border-stone-100 dark:border-stone-700 pl-4 divide-y divide-stone-100 dark:divide-stone-700/50">
                  {group.items.map((a) => (
                    <div key={a.id} className="py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900 dark:text-white text-sm truncate">
                            {a.title}
                          </span>
                          {!a.is_active && (
                            <span className="text-[11px] text-stone-400 dark:text-stone-500">
                              (tắt)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-500 dark:text-stone-400">
                          <span className={typeColor[a.content_type] || ""}>
                            {typeLabel[a.content_type] || a.content_type}
                          </span>
                          <span>{a.work_type === "group" ? "Nhóm" : "Cá nhân"}</span>
                          <span>
                            Nộp {a.submission_count}/{a.total_students}
                          </span>
                          {a.due_date && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Hạn: {new Date(a.due_date).toLocaleString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                            {a.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!a.peer_review_status && a.submission_count > 0 && a.content_type !== "quiz" && (
                          <button
                            onClick={() => handleActivatePeerReview(a.id)}
                            className="px-2 py-1 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors"
                          >
                            Tráo bài
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1 text-stone-300 hover:text-red-500 rounded transition-colors"
                          title="Xóa bài giao"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Material picker grouped by lesson ──
  const renderPicker = () => {
    if (materialsLoading) {
      return (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      );
    }

    if (materials.length === 0) {
      return (
        <p className="text-sm text-stone-400 dark:text-stone-500 py-4">
          Chưa có học liệu nào. Chuyển từ trang Quản lý học liệu.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {groupedMaterials.map((group) => {
          const isCollapsed = collapsedGroups.has(group.key);
          return (
            <div key={group.key}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className="flex items-center gap-2 py-2 px-1 w-full text-left group"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
                )}
                <BookOpen className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 group-hover:text-brand dark:group-hover:text-sky-400 transition-colors truncate">
                  {group.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 flex-shrink-0">
                  {group.items.length}
                </span>
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <div className="ml-6 border-l-2 border-stone-100 dark:border-stone-700 pl-4">
                  {group.items.map((mat) => {
                    const itemKey = `${mat.content_type}-${mat.content_id}`;
                    const isExpanded = assigningId === itemKey;

                    return (
                      <div key={mat.id} className="py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-stone-900 dark:text-white">
                              {mat.title}
                            </span>
                            <span className={`ml-2 text-xs ${typeColor[mat.content_type]}`}>
                              {typeLabel[mat.content_type]}
                            </span>
                          </div>
                          <button
                            onClick={() => openAssignForm(mat)}
                            className={`text-xs px-2.5 py-1 rounded transition-colors flex-shrink-0 ${
                              isExpanded
                                ? "bg-stone-200 dark:bg-stone-600 text-stone-600 dark:text-stone-300"
                                : "bg-brand text-white hover:bg-brand-dark"
                            }`}
                          >
                            {isExpanded ? "Thu gọn" : "Giao"}
                          </button>
                          <button
                            onClick={() => handleRemoveMaterial(mat.id)}
                            className="p-1 text-stone-300 hover:text-red-500 rounded transition-colors flex-shrink-0"
                            title="Xóa khỏi lớp"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inline assign form */}
                        {isExpanded && (
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              value={assignTitle}
                              onChange={(e) => setAssignTitle(e.target.value)}
                              className="w-full px-3 py-1.5 border border-stone-200 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="Tiêu đề bài giao"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs text-stone-500 dark:text-stone-400">
                                Giờ bắt đầu
                                <input
                                  type="datetime-local"
                                  value={assignStartAt}
                                  onChange={(e) => setAssignStartAt(e.target.value)}
                                  className="mt-0.5 w-full px-2 py-1 border border-stone-200 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white text-sm"
                                />
                              </label>
                              <label className="text-xs text-stone-500 dark:text-stone-400">
                                Hạn nộp
                                <input
                                  type="datetime-local"
                                  value={assignDueDate}
                                  onChange={(e) => setAssignDueDate(e.target.value)}
                                  className="mt-0.5 w-full px-2 py-1 border border-stone-200 dark:border-stone-600 rounded-lg bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white text-sm"
                                />
                              </label>
                            </div>
                            {mat.content_type !== "quiz" && (
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`wt-${itemKey}`}
                                    checked={assignWorkType === "individual"}
                                    onChange={() => setAssignWorkType("individual")}
                                    className="text-brand"
                                  />
                                  <User className="w-3.5 h-3.5 text-stone-400" />
                                  Cá nhân
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`wt-${itemKey}`}
                                    checked={assignWorkType === "group"}
                                    onChange={() => setAssignWorkType("group")}
                                    className="text-violet-600"
                                  />
                                  <Users className="w-3.5 h-3.5 text-stone-400" />
                                  Nhóm
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-auto">
                                  <input
                                    type="checkbox"
                                    checked={assignAutoPeerReview}
                                    onChange={(e) => setAssignAutoPeerReview(e.target.checked)}
                                    className="rounded text-orange-500"
                                  />
                                  Tráo bài tự động
                                </label>
                                {assignWorkType === "group" && (
                                  <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={assignChatEnabled}
                                      onChange={(e) => setAssignChatEnabled(e.target.checked)}
                                      className="rounded text-blue-500"
                                    />
                                    Cho phép chat
                                  </label>
                                )}
                              </div>
                            )}
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleAssign(mat)}
                                disabled={submitting || !assignTitle.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 text-sm"
                              >
                                {submitting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                Giao bài
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Bài đã giao */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700/30 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-white">
              Bài đã giao
            </h2>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {assignments.length} bài
            </span>
          </div>
        </div>
        <div className="px-4 py-2">
          {renderAssignments()}
        </div>
      </div>

      {/* Right column: Danh sách học liệu (transferred to this class) */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700/30 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800 dark:text-white">
              Danh sách học liệu
            </h2>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {materials.length} học liệu
            </span>
          </div>
        </div>
        <div className="px-4 py-2">
          {renderPicker()}
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};

export default MaterialPanel;
