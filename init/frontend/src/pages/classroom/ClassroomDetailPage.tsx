import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Upload,
  Trash2,
  Loader2,
  Shuffle,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit2,
  Save,
  BookOpen,
  FileText,
  HelpCircle,
  Code2,
} from "lucide-react";
import {
  getClassroomDetail,
  uploadStudents,
  addStudent,
  removeStudent,
  createGroup,
  autoDivideGroups,
  deleteGroup,
  updateGroup,
} from "@/services/classroomService";
import type { ClassroomDetail, ClassStudent, StudentGroup } from "@/types/classroom";
import { getClassAssignments, deleteAssignment, type Assignment } from "@/services/assignmentService";
import { activatePeerReview } from "@/services/peerReviewService";

const ClassroomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ created: number; skipped: number; details: string[] } | null>(null);

  // Add student form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addDob, setAddDob] = useState("");
  const [adding, setAdding] = useState(false);

  // Group management
  const [showAutoDiv, setShowAutoDiv] = useState(false);
  const [numGroups, setNumGroups] = useState(4);
  const [divMethod, setDivMethod] = useState("sequential");
  const [dividing, setDividing] = useState(false);

  // Manual group creation
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"students" | "groups" | "assignments">("students");

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Credential copy
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const classroomId = Number(id);

  useEffect(() => {
    if (classroomId) loadClassroom();
  }, [classroomId]);

  const loadClassroom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClassroomDetail(classroomId);
      setClassroom(data);
    } catch {
      setError("Lỗi khi tải thông tin lớp học");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const data = await getClassAssignments(classroomId);
      setAssignments(data.assignments);
    } catch {
      // silent
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "assignments" && classroomId) loadAssignments();
  }, [activeTab, classroomId]);

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm("Xóa bài giao này?")) return;
    try {
      await deleteAssignment(assignmentId);
      showSuccess("Đã xóa bài giao");
      await loadAssignments();
    } catch {
      setError("Lỗi khi xóa bài giao");
    }
  };

  const handleActivatePeerReview = async (assignmentId: number) => {
    if (!window.confirm("Kích hoạt tráo bài đánh giá chéo cho bài này?")) return;
    try {
      await activatePeerReview(assignmentId);
      showSuccess("Đã kích hoạt tráo bài");
      await loadAssignments();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Lỗi khi kích hoạt tráo bài");
    }
  };

  const contentTypeLabel = (type: string) => {
    switch (type) {
      case "worksheet": return "Phiếu bài tập";
      case "quiz": return "Quiz";
      case "code_exercise": return "Bài code";
      default: return type;
    }
  };

  const contentTypeIcon = (type: string) => {
    switch (type) {
      case "worksheet": return <FileText className="w-4 h-4" />;
      case "quiz": return <HelpCircle className="w-4 h-4" />;
      case "code_exercise": return <Code2 className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ========== UPLOAD ==========
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    setError(null);
    try {
      const result = await uploadStudents(classroomId, file);
      setUploadResult({
        created: result.total_created,
        skipped: result.total_skipped,
        details: result.skipped_details,
      });
      showSuccess(`Đã thêm ${result.total_created} học sinh`);
      await loadClassroom();
    } catch {
      setError("Lỗi khi upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ========== ADD STUDENT ==========
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    try {
      await addStudent(classroomId, {
        full_name: addName.trim(),
        student_code: addCode.trim() || undefined,
        date_of_birth: addDob.trim() || undefined,
      });
      setAddName("");
      setAddCode("");
      setAddDob("");
      setShowAddForm(false);
      showSuccess("Đã thêm học sinh");
      await loadClassroom();
    } catch {
      setError("Lỗi khi thêm học sinh");
    } finally {
      setAdding(false);
    }
  };

  // ========== REMOVE STUDENT ==========
  const handleRemove = async (studentId: number) => {
    if (!window.confirm("Xóa học sinh này khỏi lớp?")) return;
    try {
      await removeStudent(classroomId, studentId);
      showSuccess("Đã xóa học sinh");
      await loadClassroom();
    } catch {
      setError("Lỗi khi xóa học sinh");
    }
  };

  // ========== AUTO DIVIDE ==========
  const handleAutoDivide = async () => {
    if (numGroups < 1) return;
    setDividing(true);
    try {
      const result = await autoDivideGroups(classroomId, { num_groups: numGroups, method: divMethod });
      showSuccess(result.message);
      setShowAutoDiv(false);
      await loadClassroom();
    } catch {
      setError("Lỗi khi chia nhóm");
    } finally {
      setDividing(false);
    }
  };

  // ========== CREATE GROUP ==========
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      await createGroup(classroomId, { name: newGroupName.trim(), student_ids: selectedStudentIds });
      setNewGroupName("");
      setSelectedStudentIds([]);
      setShowCreateGroup(false);
      showSuccess("Đã tạo nhóm");
      await loadClassroom();
    } catch {
      setError("Lỗi khi tạo nhóm");
    } finally {
      setCreatingGroup(false);
    }
  };

  // ========== DELETE GROUP ==========
  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm("Xóa nhóm này?")) return;
    try {
      await deleteGroup(classroomId, groupId);
      showSuccess("Đã xóa nhóm");
      await loadClassroom();
    } catch {
      setError("Lỗi khi xóa nhóm");
    }
  };

  // ========== COPY CREDENTIALS ==========
  const copyCredentials = (student: ClassStudent) => {
    const text = `Tài khoản: ${student.email}\nMật khẩu: hs${student.date_of_birth ? student.date_of_birth.split("-").reverse().join("") : "hocsinh2026"}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-center text-slate-500">
        Không tìm thấy lớp học
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/classes")}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lớp {classroom.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {classroom.grade && `Khối ${classroom.grade}`}
              {classroom.school_year && ` - Năm học ${classroom.school_year}`}
              {` - ${classroom.students.length} học sinh - ${classroom.groups.length} nhóm`}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
            {successMsg}
          </div>
        )}
        {uploadResult && (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg mb-4">
            <p>Đã tạo: {uploadResult.created} | Bỏ qua: {uploadResult.skipped}</p>
            {uploadResult.details.length > 0 && (
              <ul className="mt-2 text-sm list-disc pl-5">
                {uploadResult.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
            <button onClick={() => setUploadResult(null)} className="mt-2 text-xs underline">Đóng</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "students"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Học sinh ({classroom.students.length})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "groups"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Shuffle className="w-4 h-4 inline mr-2" />
            Nhóm ({classroom.groups.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "assignments"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Bài giao ({assignments.length})
          </button>
        </div>

        {/* ========== STUDENTS TAB ========== */}
        {activeTab === "students" && (
          <div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload danh sách
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Thêm thủ công
              </button>
            </div>

            {/* Add student form */}
            {showAddForm && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4">
                <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Họ tên *"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Mã HS"
                    value={addCode}
                    onChange={(e) => setAddCode(e.target.value)}
                    className="w-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Ngày sinh (DD/MM/YYYY)"
                    value={addDob}
                    onChange={(e) => setAddDob(e.target.value)}
                    className="w-44 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm"
                  >
                    Hủy
                  </button>
                </form>
              </div>
            )}

            {/* Student table */}
            {classroom.students.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Chưa có học sinh. Upload file Excel/CSV hoặc thêm thủ công.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">STT</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Họ tên</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Mã HS</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Ngày sinh</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Tài khoản</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {classroom.students.map((student, idx) => (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{student.full_name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{student.student_code || "-"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {student.date_of_birth
                              ? new Date(student.date_of_birth).toLocaleDateString("vi-VN")
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => copyCredentials(student)}
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              title="Copy tài khoản đăng nhập"
                            >
                              {copiedId === student.id ? (
                                <><Check className="w-3 h-3" /> Đã copy</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy TK</>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemove(student.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              title="Xóa khỏi lớp"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== ASSIGNMENTS TAB ========== */}
        {activeTab === "assignments" && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <Link
                to={`/classes/${classroomId}/assign`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Giao bài mới
              </Link>
            </div>

            {loadingAssignments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Chưa có bài nào được giao cho lớp này.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      {contentTypeIcon(a.content_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{a.title}</h3>
                        {!a.is_active && (
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                            Tắt
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                          {contentTypeLabel(a.content_type)}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                          {a.work_type === "group" ? "Nhóm" : "Cá nhân"}
                        </span>
                        {a.lesson_info?.lesson_name && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded">
                            {a.lesson_info.lesson_name}
                          </span>
                        )}
                        {a.due_date && (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
                            Hạn: {new Date(a.due_date).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>Nộp: {a.submission_count}/{a.total_students}</span>
                        <span>Tạo: {new Date(a.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!a.peer_review_status && a.submission_count > 0 && (
                        <button
                          onClick={() => handleActivatePeerReview(a.id)}
                          className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          title="Kích hoạt tráo bài"
                        >
                          Tráo bài
                        </button>
                      )}
                      {a.peer_review_status === "active" && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-center">
                          Đang chấm
                        </span>
                      )}
                      {a.peer_review_status === "completed" && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-center">
                          Đã chấm
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded self-center"
                        title="Xóa bài giao"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== GROUPS TAB ========== */}
        {activeTab === "groups" && (
          <div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setShowAutoDiv(!showAutoDiv)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                <Shuffle className="w-4 h-4" />
                Chia nhóm tự động
              </button>
              <button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Tạo nhóm thủ công
              </button>
            </div>

            {/* Auto divide form */}
            {showAutoDiv && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Chia nhóm tự động</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Số nhóm</label>
                    <input
                      type="number"
                      min={1}
                      max={classroom.students.length}
                      value={numGroups}
                      onChange={(e) => setNumGroups(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cách chia</label>
                    <select
                      value={divMethod}
                      onChange={(e) => setDivMethod(e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="sequential">Theo thứ tự</option>
                      <option value="random">Ngẫu nhiên</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleAutoDivide}
                      disabled={dividing}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                      {dividing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Chia nhóm
                    </button>
                    <button
                      onClick={() => setShowAutoDiv(false)}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Lưu ý: Chia tự động sẽ xóa tất cả nhóm cũ
                </p>
              </div>
            )}

            {/* Manual create group form */}
            {showCreateGroup && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Tạo nhóm mới</h3>
                <form onSubmit={handleCreateGroup}>
                  <input
                    type="text"
                    placeholder="Tên nhóm"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm mb-3"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Chọn thành viên:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                    {classroom.students.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => toggleStudentSelection(s.id)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-900 dark:text-white">{s.full_name}</span>
                        <span className="text-slate-400 text-xs">{s.student_code}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creatingGroup}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                      {creatingGroup && <Loader2 className="w-4 h-4 animate-spin" />}
                      Tạo nhóm
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreateGroup(false); setSelectedStudentIds([]); }}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Groups list */}
            {classroom.groups.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Shuffle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Chưa có nhóm nào. Dùng "Chia nhóm tự động" hoặc tạo thủ công.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classroom.groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {group.members.length === 0 ? (
                        <p className="text-xs text-slate-400">Chưa có thành viên</p>
                      ) : (
                        group.members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded bg-slate-50 dark:bg-slate-700/30"
                          >
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{m.full_name}</span>
                            {m.student_code && (
                              <span className="text-xs text-slate-400">({m.student_code})</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{group.members.length} thành viên</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomDetailPage;
