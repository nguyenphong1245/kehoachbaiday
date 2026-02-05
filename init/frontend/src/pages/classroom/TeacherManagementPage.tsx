import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  X,
  Trash2,
  Menu,
  Share2,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  ChevronRight,
  Users,
  Shuffle,
  Package,
  User,
  BarChart3,
} from "lucide-react";
import {
  getClassrooms,
  getClassroomDetail,
  createClassroom,
  deleteClassroom,
} from "@/services/classroomService";
import { getClassAssignments, type Assignment } from "@/services/assignmentService";

import type { Classroom, ClassroomDetail } from "@/types/classroom";
import { SharingManagementPage } from "@/pages/sharing";
import { getStoredAuthUser } from "@/utils/authStorage";

import StudentPanel from "./panels/StudentPanel";
import GroupPanel from "./panels/GroupPanel";
import MaterialPanel from "./panels/MaterialPanel";
import StatisticsPanel from "./panels/StatisticsPanel";
import StudentUploadModal from "@/components/classroom/StudentUploadModal";

type TabType = "students" | "groups" | "materials" | "statistics";
type ViewMode = "sharing" | "classes";

const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "students", label: "Học sinh", icon: <Users className="w-4 h-4" /> },
  { key: "groups", label: "Nhóm", icon: <Shuffle className="w-4 h-4" /> },
  { key: "materials", label: "Học liệu", icon: <Package className="w-4 h-4" /> },
  { key: "statistics", label: "Thống kê", icon: <BarChart3 className="w-4 h-4" /> },
];

const TeacherManagementPage: React.FC = () => {
  const user = getStoredAuthUser();

  const [viewMode, setViewMode] = useState<ViewMode>("classes");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Classrooms
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(true);
  const [classroomsError, setClassroomsError] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGrade, setFormGrade] = useState<string>("10");
  const [formYear, setFormYear] = useState<string>("2025-2026");
  const [creating, setCreating] = useState(false);

  // Classroom detail
  const [classroomDetail, setClassroomDetail] = useState<ClassroomDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>("students");

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Assignments (per class)
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Student upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalClassId, setUploadModalClassId] = useState<number | null>(null);
  const [uploadModalClassName, setUploadModalClassName] = useState("");

  const generateSchoolYears = (): string[] => {
    const startYear = 2025;
    const years: string[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(`${startYear + i}-${startYear + i + 1}`);
    }
    return years;
  };

  // ===== Load initial data =====
  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setClassroomsLoading(true);
    setClassroomsError(false);
    try {
      const data = await getClassrooms();
      setClassrooms(data.classrooms);
    } catch {
      setClassroomsError(true);
    } finally {
      setClassroomsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadClassroomDetail(selectedClassId);
    } else {
      setClassroomDetail(null);
    }
  }, [selectedClassId]);

  const loadClassroomDetail = async (id: number) => {
    setDetailLoading(true);
    setError(null);
    try {
      const data = await getClassroomDetail(id);
      setClassroomDetail(data);
    } catch {
      setError("Lỗi khi tải thông tin lớp học");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadAssignments = useCallback(async () => {
    if (!selectedClassId) return;
    setAssignmentsLoading(true);
    try {
      const data = await getClassAssignments(selectedClassId);
      setAssignments(data.assignments);
    } catch { /* silent */ } finally {
      setAssignmentsLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (activeTab === "materials" && selectedClassId) loadAssignments();
  }, [activeTab, selectedClassId, loadAssignments]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const reloadClassroom = async () => {
    if (selectedClassId) {
      await loadClassroomDetail(selectedClassId);
      await loadClassrooms();
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const newClass = await createClassroom({
        name: formName.trim(),
        grade: formGrade,
        school_year: formYear,
      });
      setFormName("");
      setFormGrade("10");
      setFormYear("2025-2026");
      setShowCreateForm(false);
      await loadClassrooms();
      showSuccess(`Đã tạo lớp ${newClass.name}`);
      setUploadModalClassId(newClass.id);
      setUploadModalClassName(newClass.name);
      setShowUploadModal(true);
    } catch {
      setError("Lỗi khi tạo lớp học");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClassroom = async (classId: number, className: string) => {
    if (!window.confirm(`Xóa lớp "${className}"? Tất cả dữ liệu sẽ bị mất.`)) return;
    try {
      await deleteClassroom(classId);
      if (selectedClassId === classId) {
        setSelectedClassId(null);
        setClassroomDetail(null);
      }
      await loadClassrooms();
      showSuccess(`Đã xóa lớp ${className}`);
    } catch {
      setError("Lỗi khi xóa lớp học");
    }
  };

  const selectClassroom = (id: number) => {
    setSelectedClassId(id);
    setActiveTab("students");
    setError(null);
    setSidebarOpen(false);
  };

  const backToClassList = () => {
    setSelectedClassId(null);
    setClassroomDetail(null);
    setError(null);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
    if (uploadModalClassId) {
      setSelectedClassId(uploadModalClassId);
    }
    setUploadModalClassId(null);
    setUploadModalClassName("");
  };

  const switchView = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedClassId(null);
    setClassroomDetail(null);
    setError(null);
    setSuccessMsg(null);
    setSidebarOpen(false);
  };

  // Breadcrumb text
  const breadcrumbText = () => {
    if (viewMode === "sharing") return "Quản lý học liệu";
    if (classroomDetail) return null; // custom breadcrumb
    return "Quản lý lớp học";
  };

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR — matches lesson builder sidebar style ===== */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-72 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform lg:translate-x-0 shadow-sm
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col overflow-hidden
        `}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Quản lý</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Học liệu, lớp học và giao bài
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => switchView("sharing")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              viewMode === "sharing"
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Share2 className="w-4 h-4 flex-shrink-0" />
            Quản lý học liệu
          </button>
          <button
            onClick={() => switchView("classes")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              viewMode === "classes"
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <GraduationCap className="w-4 h-4 flex-shrink-0" />
            Quản lý lớp học
            {classrooms.length > 0 && (
              <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {classrooms.length}
              </span>
            )}
          </button>
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5" />
            <span className="truncate">{user?.email || "Giáo viên"}</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN — header + content like lesson builder ===== */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header bar — matches lesson builder header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Left: Mobile menu + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex items-center gap-2 text-sm">
                {classroomDetail ? (
                  <>
                    <button
                      onClick={backToClassList}
                      className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Quản lý lớp học
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[200px]">
                      {classroomDetail.name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {classroomDetail.grade && `Khối ${classroomDetail.grade}`}
                      {classroomDetail.school_year && ` · ${classroomDetail.school_year}`}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {breadcrumbText()}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Sub-header: Tabs for class detail or class count for list */}
          {viewMode === "classes" && classroomDetail && (
            <div className="px-6 py-0 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.key === "students" && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === "students"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                        {classroomDetail.students.length}
                      </span>
                    )}
                    {tab.key === "groups" && classroomDetail.groups.length > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === "groups"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                        {classroomDetail.groups.length}
                      </span>
                    )}
                    {tab.key === "materials" && assignments.length > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === "materials"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                        {assignments.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Messages */}
          {(error || successMsg) && (
            <div className="max-w-5xl mx-auto px-6 pt-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-2 flex items-center justify-between text-sm">
                  <span>{error}</span>
                  <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-2 text-sm">
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* ===== SHARING VIEW ===== */}
          {viewMode === "sharing" && (
            <SharingManagementPage embedded />
          )}

          {/* ===== CLASS LIST ===== */}
          {viewMode === "classes" && !selectedClassId && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
              {/* Action bar */}
              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Tạo lớp mới
                </button>
              </div>

              {/* Create form */}
              {showCreateForm && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-5">
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Tạo lớp học mới</h3>
                  </div>
                  <div className="p-5">
                    <form onSubmit={handleCreateClassroom} className="space-y-3">
                      <input
                        type="text" placeholder="Tên lớp (VD: 10A1)" value={formName}
                        onChange={(e) => setFormName(e.target.value)} required autoFocus
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <div className="flex gap-3">
                        <select value={formGrade} onChange={(e) => setFormGrade(e.target.value)} required
                          className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="10">Khối 10</option>
                          <option value="11">Khối 11</option>
                          <option value="12">Khối 12</option>
                        </select>
                        <select value={formYear} onChange={(e) => setFormYear(e.target.value)} required
                          className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          {generateSchoolYears().map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={creating}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                          Tạo lớp
                        </button>
                        <button type="button" onClick={() => { setShowCreateForm(false); setFormName(""); }}
                          className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm transition-colors">
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Class list */}
              {classroomsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : classroomsError ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
                  <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 mb-3">Không tải được danh sách lớp học</p>
                  <button onClick={loadClassrooms}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Thử lại
                  </button>
                </div>
              ) : classrooms.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg">Chưa có lớp học nào</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Bấm "Tạo lớp mới" để bắt đầu</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  {classrooms.map((c, idx) => (
                    <div
                      key={c.id}
                      className={`group flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer ${
                        idx > 0 ? "border-t border-slate-100 dark:border-slate-700/50" : ""
                      }`}
                      onClick={() => selectClassroom(c.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900 dark:text-white">{c.name}</h3>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {c.grade && `Khối ${c.grade}`}
                            {c.school_year && ` · ${c.school_year}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {c.student_count} học sinh
                          </span>
                          {c.group_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Shuffle className="w-3 h-3" />
                              {c.group_count} nhóm
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClassroom(c.id, c.name); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CLASS DETAIL ===== */}
          {viewMode === "classes" && selectedClassId && (
            <>
              {detailLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : classroomDetail ? (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
                  {/* Tab content */}
                  {activeTab === "students" && (
                    <StudentPanel classroom={classroomDetail} classroomId={selectedClassId!}
                      onReload={reloadClassroom} onError={setError} onSuccess={showSuccess} />
                  )}
                  {activeTab === "groups" && (
                    <GroupPanel classroom={classroomDetail} classroomId={selectedClassId!}
                      onReload={reloadClassroom} onError={setError} onSuccess={showSuccess} />
                  )}
                  {activeTab === "materials" && (
                    <MaterialPanel
                      classroomId={selectedClassId!}
                      classroomName={classroomDetail.name}
                      assignments={assignments}
                      assignmentsLoading={assignmentsLoading}
                      onReloadAssignments={loadAssignments}
                      onAssigned={loadAssignments}
                      onError={setError}
                      onSuccess={showSuccess}
                    />
                  )}
                  {activeTab === "statistics" && (
                    <StatisticsPanel classroomId={selectedClassId!} />
                  )}
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>

      {/* Student Upload Modal */}
      {showUploadModal && uploadModalClassId && (
        <StudentUploadModal
          classroomId={uploadModalClassId}
          classroomName={uploadModalClassName}
          isOpen={showUploadModal}
          onClose={handleUploadModalClose}
          onSuccess={showSuccess}
          onError={setError}
          onUploadComplete={async () => {
            await loadClassrooms();
            if (uploadModalClassId) {
              await loadClassroomDetail(uploadModalClassId);
            }
          }}
        />
      )}
    </div>
  );
};

export default TeacherManagementPage;
