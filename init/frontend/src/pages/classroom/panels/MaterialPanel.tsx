import React, { useState, useEffect, useMemo } from "react";
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
  worksheet: "text-blue-600 dark:text-blue-400",
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
        lesson_info: mat.lesson_info || undefined,
      });
      onSuccess(`Đã giao "${assignTitle}" cho lớp ${classroomName}`);
      setAssigningId(null);
      onAssigned();
      await onReloadAssignments();
    } catch {
      onError("Lỗi khi giao bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMaterial = async (materialId: number) => {
    if (!window.confirm("Xóa học liệu khỏi danh sách lớp?")) return;
    try {
      await removeMaterialFromClass(classroomId, materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      onSuccess("Đã xóa học liệu khỏi lớp");
    } catch {
      onError("Lỗi khi xóa học liệu");
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm("Xóa bài giao này?")) return;
    try {
      await deleteAssignment(assignmentId);
      onSuccess("Đã xóa bài giao");
      await onReloadAssignments();
    } catch {
      onError("Lỗi khi xóa bài giao");
    }
  };

  const handleActivatePeerReview = async (assignmentId: number) => {
    if (!window.confirm("Kích hoạt tráo bài đánh giá chéo cho bài này?"))
      return;
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
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
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
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                )}
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {group.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {group.items.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-4 divide-y divide-slate-100 dark:divide-slate-700/50">
                  {group.items.map((a) => (
                    <div key={a.id} className="py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {a.title}
                          </span>
                          {!a.is_active && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              (tắt)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className={typeColor[a.content_type] || ""}>
                            {typeLabel[a.content_type] || a.content_type}
                          </span>
                          <span>{a.work_type === "group" ? "Nhóm" : "Cá nhân"}</span>
                          <span>
                            Nộp {a.submission_count}/{a.total_students}
                          </span>
                          {a.due_date && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Hạn: {new Date(a.due_date).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {a.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!a.peer_review_status && a.submission_count > 0 && (
                          <button
                            onClick={() => handleActivatePeerReview(a.id)}
                            className="px-2 py-1 text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors"
                          >
                            Tráo bài
                          </button>
                        )}
                        {a.peer_review_status === "active" && (
                          <span className="text-xs text-violet-500">Đang chấm</span>
                        )}
                        {a.peer_review_status === "completed" && (
                          <span className="text-xs text-emerald-500">Đã chấm</span>
                        )}
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
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
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      );
    }

    if (materials.length === 0) {
      return (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
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
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                )}
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {group.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {group.items.length}
                </span>
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-4">
                  {group.items.map((mat) => {
                    const itemKey = `${mat.content_type}-${mat.content_id}`;
                    const isExpanded = assigningId === itemKey;

                    return (
                      <div key={mat.id} className="py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-slate-900 dark:text-white">
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
                                ? "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isExpanded ? "Thu gọn" : "Giao"}
                          </button>
                          <button
                            onClick={() => handleRemoveMaterial(mat.id)}
                            className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors flex-shrink-0"
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
                              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Tiêu đề bài giao"
                            />
                            <input
                              type="text"
                              value={assignDesc}
                              onChange={(e) => setAssignDesc(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Mô tả (tùy chọn)"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs text-slate-500 dark:text-slate-400">
                                Giờ bắt đầu
                                <input
                                  type="datetime-local"
                                  value={assignStartAt}
                                  onChange={(e) => setAssignStartAt(e.target.value)}
                                  className="mt-0.5 w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                />
                              </label>
                              <label className="text-xs text-slate-500 dark:text-slate-400">
                                Hạn nộp
                                <input
                                  type="datetime-local"
                                  value={assignDueDate}
                                  onChange={(e) => setAssignDueDate(e.target.value)}
                                  className="mt-0.5 w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name={`wt-${itemKey}`}
                                  checked={assignWorkType === "individual"}
                                  onChange={() => setAssignWorkType("individual")}
                                  className="text-blue-600"
                                />
                                <User className="w-3.5 h-3.5 text-slate-400" />
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
                                <Users className="w-3.5 h-3.5 text-slate-400" />
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
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleAssign(mat)}
                                disabled={submitting || !assignTitle.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              Bài đã giao
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {assignments.length} bài
            </span>
          </div>
        </div>
        <div className="px-4 py-2">
          {renderAssignments()}
        </div>
      </div>

      {/* Right column: Danh sách học liệu (transferred to this class) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              Danh sách học liệu
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {materials.length} học liệu
            </span>
          </div>
        </div>
        <div className="px-4 py-2">
          {renderPicker()}
        </div>
      </div>
    </div>
  );
};

export default MaterialPanel;
