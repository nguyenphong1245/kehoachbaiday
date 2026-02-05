import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  Loader2,
  Trash2,
  School,
  Calendar,
  FolderOpen,
} from "lucide-react";
import {
  getClassrooms,
  createClassroom,
  deleteClassroom,
} from "@/services/classroomService";
import type { Classroom } from "@/types/classroom";

const ClassroomListPage: React.FC = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formSchoolYear, setFormSchoolYear] = useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClassrooms();
      setClassrooms(data.classrooms);
    } catch {
      setError("Lỗi khi tải danh sách lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreating(true);
    try {
      await createClassroom({
        name: formName.trim(),
        grade: formGrade || undefined,
        school_year: formSchoolYear || undefined,
      });
      setFormName("");
      setFormGrade("");
      setFormSchoolYear("");
      setShowCreateForm(false);
      await loadClassrooms();
    } catch {
      setError("Lỗi khi tạo lớp học");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa lớp học này? Tất cả dữ liệu liên quan sẽ bị xóa.")) return;
    setDeletingId(id);
    try {
      await deleteClassroom(id);
      await loadClassrooms();
    } catch {
      setError("Lỗi khi xóa lớp học");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-7 h-7" />
              Quản lý lớp học
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Tạo lớp, upload danh sách học sinh, chia nhóm
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo lớp mới
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Tạo lớp học mới
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Tên lớp (VD: 10A1)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Khối</option>
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
              <input
                type="text"
                placeholder="Năm học (VD: 2025-2026)"
                value={formSchoolYear}
                onChange={(e) => setFormSchoolYear(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Tạo
              </button>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Chưa có lớp học nào</p>
            <p className="text-sm mt-1">Nhấn "Tạo lớp mới" để bắt đầu</p>
          </div>
        ) : (
          /* Classroom Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow cursor-pointer relative group"
              >
                <Link to={`/classes/${classroom.id}`} className="block">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {classroom.name}
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    {classroom.grade && (
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4" />
                        <span>Khối {classroom.grade}</span>
                      </div>
                    )}
                    {classroom.school_year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Năm học {classroom.school_year}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{classroom.student_count} học sinh - {classroom.group_count} nhóm</span>
                    </div>
                  </div>
                </Link>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(classroom.id);
                  }}
                  disabled={deletingId === classroom.id}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {deletingId === classroom.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomListPage;
