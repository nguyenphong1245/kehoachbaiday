import React, { useState } from "react";
import {
  Shuffle,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { createGroup, autoDivideGroups, deleteGroup } from "@/services/classroomService";
import type { ClassroomDetail } from "@/types/classroom";

interface GroupPanelProps {
  classroom: ClassroomDetail;
  classroomId: number;
  onReload: () => Promise<void>;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const GroupPanel: React.FC<GroupPanelProps> = ({
  classroom,
  classroomId,
  onReload,
  onError,
  onSuccess,
}) => {
  const [showAutoDiv, setShowAutoDiv] = useState(false);
  const [numGroups, setNumGroups] = useState(4);
  const [divMethod, setDivMethod] = useState("sequential");
  const [dividing, setDividing] = useState(false);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const handleAutoDivide = async () => {
    if (numGroups < 1) return;
    setDividing(true);
    try {
      const result = await autoDivideGroups(classroomId, { num_groups: numGroups, method: divMethod });
      onSuccess(result.message);
      setShowAutoDiv(false);
      await onReload();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Lỗi khi chia nhóm";
      onError(errorMsg);
    } finally {
      setDividing(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    // Kiểm tra trùng tên nhóm
    const trimmedName = newGroupName.trim().toLowerCase();
    const isDuplicate = classroom.groups.some(
      (g) => g.name.toLowerCase() === trimmedName
    );
    if (isDuplicate) {
      onError("Tên nhóm đã tồn tại. Vui lòng chọn tên khác.");
      return;
    }

    setCreatingGroup(true);
    try {
      await createGroup(classroomId, { name: newGroupName.trim(), student_ids: selectedStudentIds });
      setNewGroupName("");
      setSelectedStudentIds([]);
      setShowCreateGroup(false);
      onSuccess("Đã tạo nhóm");
      await onReload();
    } catch {
      onError("Lỗi khi tạo nhóm");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm("Xóa nhóm này?")) return;
    try {
      await deleteGroup(classroomId, groupId);
      onSuccess("Đã xóa nhóm");
      await onReload();
    } catch {
      onError("Lỗi khi xóa nhóm");
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setShowAutoDiv(!showAutoDiv);
            setShowCreateGroup(false); // Đóng form thủ công
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Chia nhóm tự động
        </button>
        <button
          onClick={() => {
            setShowCreateGroup(!showCreateGroup);
            setShowAutoDiv(false); // Đóng form tự động
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo nhóm thủ công
        </button>
      </div>

      {/* Auto divide form */}
      {showAutoDiv && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Chia nhóm tự động</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Số nhóm</label>
              <input
                type="number" min={1} max={classroom.students.length || 1}
                value={numGroups} onChange={(e) => setNumGroups(Number(e.target.value))}
                className="w-20 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cách chia</label>
              <select value={divMethod} onChange={(e) => setDivMethod(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                <option value="sequential">Theo thứ tự</option>
                <option value="random">Ngẫu nhiên</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleAutoDivide} disabled={dividing}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
                {dividing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Chia nhóm
              </button>
              <button onClick={() => setShowAutoDiv(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-sm">
                Hủy
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Chia tự động sẽ xóa tất cả nhóm cũ
          </p>
        </div>
      )}

      {/* Manual create group form */}
      {showCreateGroup && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Tạo nhóm mới</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="mb-3">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Chọn tên nhóm</label>
              <select
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="">-- Chọn nhóm --</option>
                {[...Array(10)].map((_, i) => {
                  const groupName = `Nhóm ${i + 1}`;
                  const isExisting = classroom.groups.some(
                    (g) => g.name.toLowerCase() === groupName.toLowerCase()
                  );
                  return (
                    <option key={i} value={groupName} disabled={isExisting}>
                      {groupName} {isExisting ? "(đã tồn tại)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Chọn thành viên:</p>
            <div className="max-h-40 overflow-y-auto space-y-0.5 mb-3">
              {classroom.students.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={() => toggleStudentSelection(s.id)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-slate-900 dark:text-white">{s.full_name}</span>
                  {s.student_code && (
                    <span className="text-slate-400 text-xs">{s.student_code}</span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creatingGroup}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
                {creatingGroup && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tạo nhóm
              </button>
              <button type="button"
                onClick={() => { setShowCreateGroup(false); setSelectedStudentIds([]); }}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-sm">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups list */}
      {classroom.groups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Chưa có nhóm nào. Dùng "Chia nhóm tự động" hoặc tạo thủ công.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classroom.groups.map((group) => (
            <div
              key={group.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 bg-white dark:bg-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">{group.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{group.members.length} TV</span>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-0.5">
                {group.members.length === 0 ? (
                  <p className="text-xs text-slate-400">Chưa có thành viên</p>
                ) : (
                  group.members.map((m) => (
                    <div
                      key={m.id}
                      className="text-sm text-slate-700 dark:text-slate-300 py-0.5"
                    >
                      {m.full_name}
                      {m.student_code && (
                        <span className="text-xs text-slate-400 ml-1.5">{m.student_code}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupPanel;
