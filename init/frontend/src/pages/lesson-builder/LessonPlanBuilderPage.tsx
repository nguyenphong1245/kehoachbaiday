/**
 * LessonPlanBuilderPage - Trang soạn Kế hoạch bài dạy
 * Phong cách hành chính - Giao diện chuyên nghiệp, rõ ràng
 */
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  FileText,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Settings,
  Loader2,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  LogOut,
  Monitor,
  X,
  KeyRound,
  Wrench,
  Palette,
  Plus,
  Check,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredAuthUser } from "@/utils/authStorage";
import { logoutUser, changePassword } from "@/services/authService";
import useAccount from "@/hooks/useAccount";
import { useToast } from "@/contexts/Toast";
import { DEFAULT_TEACHING_TOOLS } from "@/constants/teachingTools";
import {
  LessonPlanBuilderSidebar,
  ActivityConfigPanel,
  LessonPlanOutput,
  NLSConfigSection,
} from "@/components/lesson-builder";
import type {
  LessonDetail,
  ActivityConfig,
  GenerateLessonPlanResponse,
  NLSSelectionItem,
} from "@/types/lessonBuilder";
import { generateLessonPlanStream, type SSEProgressEvent } from "@/services/lessonBuilderService";

type PageStep = "select" | "configure" | "result";

// Step configuration - chỉ label đơn giản
const STEPS = [
  { key: "select", label: "Chọn bài học" },
  { key: "configure", label: "Cấu hình" },
  { key: "result", label: "Kết quả" },
];

type SettingsModal = "password" | "tools" | "style" | null;

export const LessonPlanBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredAuthUser();
  const toast = useToast();
  const userId = useMemo(() => user?.id ?? null, [user]);
  const { settings, saveSettings } = useAccount({ userId });

  // State
  const [currentStep, setCurrentStep] = useState<PageStep>("select");
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [activities, setActivities] = useState<ActivityConfig[]>([]);
  const [generatedResult, setGeneratedResult] = useState<GenerateLessonPlanResponse | null>(null);
  const [nlsSelections, setNlsSelections] = useState<NLSSelectionItem[]>([]);
  const [showNlsModal, setShowNlsModal] = useState(false);
  const [sidebarResetKey, setSidebarResetKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SSEProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Teaching tools state
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTools, setCustomTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [savingTools, setSavingTools] = useState(false);

  // Teaching style state
  const [teachingStyle, setTeachingStyle] = useState("");
  const [originalStyle, setOriginalStyle] = useState("");
  const [savingStyle, setSavingStyle] = useState(false);

  // Sync settings to local state
  useEffect(() => {
    if (!settings) return;
    setSelectedTools(settings.teaching_tools ?? []);
    setCustomTools(settings.custom_tools ?? []);
    setTeachingStyle(settings.teaching_style ?? "");
    setOriginalStyle(settings.teaching_style ?? "");
  }, [settings]);

  // Lock body scroll khi sidebar mở
  useEffect(() => {
    if (showUserMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUserMenu]);

  // Lấy 2 chữ cái đầu từ email để làm avatar
  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  // Collapse states for fullscreen editing
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(false);

  // === Settings modal handlers ===
  const openModal = (modal: SettingsModal) => {
    setShowUserMenu(false);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setPasswordError("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) { setPasswordError("Mật khẩu mới không khớp"); return; }
    if (newPassword.length < 6) { setPasswordError("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    setIsChangingPassword(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.push({ type: "success", title: "Đổi mật khẩu thành công" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      closeModal();
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Không thể đổi mật khẩu");
    } finally { setIsChangingPassword(false); }
  };

  const allTools = [...DEFAULT_TEACHING_TOOLS, ...customTools];

  const toggleTool = (tool: string) => {
    const next = selectedTools.includes(tool) ? selectedTools.filter((t) => t !== tool) : [...selectedTools, tool];
    setSelectedTools(next);
    setSavingTools(true);
    saveSettings({ teaching_tools: next }).finally(() => setSavingTools(false));
  };

  const addCustomTool = () => {
    const trimmed = newTool.trim();
    if (!trimmed || allTools.some((t) => t.toLowerCase() === trimmed.toLowerCase())) { setNewTool(""); return; }
    const nextCustom = [...customTools, trimmed];
    const nextSelected = [...selectedTools, trimmed];
    setCustomTools(nextCustom); setSelectedTools(nextSelected); setNewTool("");
    setSavingTools(true);
    saveSettings({ custom_tools: nextCustom, teaching_tools: nextSelected }).finally(() => setSavingTools(false));
  };

  const removeCustomTool = (tool: string) => {
    const nextCustom = customTools.filter((t) => t !== tool);
    const nextSelected = selectedTools.filter((t) => t !== tool);
    setCustomTools(nextCustom); setSelectedTools(nextSelected);
    setSavingTools(true);
    saveSettings({ custom_tools: nextCustom, teaching_tools: nextSelected }).finally(() => setSavingTools(false));
  };

  const handleSaveStyle = async () => {
    setSavingStyle(true);
    try {
      await saveSettings({ teaching_style: teachingStyle || null });
      setOriginalStyle(teachingStyle);
      toast.push({ type: "success", title: "Đã lưu phong cách dạy học" });
    } catch { /* handled by hook */ }
    finally { setSavingStyle(false); }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  // Handlers
  const handleLessonSelect = useCallback((lesson: LessonDetail) => {
    setSelectedLesson(lesson);
    setActivities([]);
    setNlsSelections([]);
    setGeneratedResult(null);
    setError(null);
    setCurrentStep("configure");
  }, []);

  const handleActivitiesChange = useCallback((newActivities: ActivityConfig[]) => {
    setActivities(newActivities);
  }, []);

  const handleGenerate = () => {
    if (!selectedLesson) return;

    setIsGenerating(true);
    setError(null);
    setProgress(null);

    // Gắn NLS selections vào mỗi activity trước khi gửi
    const activitiesWithNLS = activities.map((a) => ({
      ...a,
      nls_selections: nlsSelections.length > 0 ? nlsSelections : undefined,
    }));

    generateLessonPlanStream(
      {
        book_type: selectedLesson.book_type,
        grade: selectedLesson.grade,
        topic: selectedLesson.topic,
        lesson_id: selectedLesson.id,
        lesson_name: selectedLesson.name,
        activities: activitiesWithNLS,
      },
      (evt) => setProgress(evt),
      (result) => {
        setGeneratedResult(result);
        setCurrentStep("result");
        setIsGenerating(false);
        setProgress(null);
      },
      (msg) => {
        setError(msg || "Có lỗi xảy ra khi sinh kế hoạch bài dạy");
        setIsGenerating(false);
        setProgress(null);
      },
    );
  };

  const handleSectionUpdate = (sectionId: string, newContent: string) => {
    if (!generatedResult) return;
    const updatedSections = generatedResult.sections.map((s) =>
      s.section_id === sectionId ? { ...s, content: newContent } : s
    );
    setGeneratedResult({ ...generatedResult, sections: updatedSections });
  };

  const handleReset = () => {
    setCurrentStep("select");
    setSelectedLesson(null);
    setActivities([]);
    setNlsSelections([]);
    setGeneratedResult(null);
    setError(null);
    setSidebarResetKey((k) => k + 1);
  };

  const handleBackToConfigure = () => {
    setCurrentStep("configure");
    setError(null);
  };

  return (
    <div className="h-screen flex bg-stone-50">
      {/* Left Sidebar - Chọn bài học */}
      {!isLeftSidebarCollapsed && (
        <LessonPlanBuilderSidebar
          key={sidebarResetKey}
          onLessonSelect={handleLessonSelect}
          selectedLesson={selectedLesson}
          onCollapse={() => setIsLeftSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Left: Toggle sidebar + Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              {/* Toggle sidebar button - chỉ hiện khi sidebar đang ẩn */}
              {isLeftSidebarCollapsed && (
                <button
                  onClick={() => setIsLeftSidebarCollapsed(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"
                  title="Hiện thanh chọn bài"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              )}
              <span className="text-stone-600 font-medium">Kế hoạch bài dạy</span>
              {selectedLesson && (
                <>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                  <span className="text-brand font-semibold truncate max-w-[250px]">
                    {selectedLesson.name}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => window.open("/lesson-builder/saved", "_blank")}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                KHBD đã lưu
              </button>
              <div className="w-px h-5 bg-stone-200 mx-1" />
              <button
                onClick={() => window.open("/classes", "_blank")}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Quản lý lớp & học liệu</span>
              </button>
              <div className="w-px h-5 bg-stone-200 mx-1" />
              <button
                onClick={() => window.open("/huong-dan", "_blank")}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Hướng dẫn sử dụng
              </button>
              <div className="w-px h-5 bg-stone-200 mx-1" />
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Làm mới
              </button>
              <div className="w-px h-5 bg-stone-200 mx-1" />
              {/* User Menu - Avatar Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium text-sm hover:bg-stone-200 transition-colors"
                title={user?.email || "Tài khoản"}
              >
                {getInitials(user?.email || "U")}
              </button>
            </div>
          </div>

          {/* Progress Steps - Collapsible */}
          {!isProgressCollapsed ? (
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center">
              <div className="flex-1 flex items-center justify-center gap-2">
                {STEPS.map((step, index) => {
                  const isActive = currentStepIndex === index;
                  const isCompleted = currentStepIndex > index;
                  const isClickable = index === 0 || (index === 1 && selectedLesson) || (index === 2 && generatedResult);

                  return (
                    <React.Fragment key={step.key}>
                      {/* Step */}
                      <button
                        onClick={() => {
                          if (index === 0) handleReset();
                          else if (index === 1 && selectedLesson) setCurrentStep("configure");
                          else if (index === 2 && generatedResult) setCurrentStep("result");
                        }}
                        disabled={!isClickable}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-all rounded-lg ${
                          isActive
                            ? "bg-brand text-white shadow-md shadow-brand/25"
                            : isCompleted
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-stone-400 bg-stone-100"
                        } ${!isClickable && !isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                          isActive
                            ? "bg-white/25"
                            : isCompleted
                            ? "bg-green-200 text-green-700"
                            : "bg-stone-200 text-stone-500"
                        }`}>
                          {isCompleted ? "✓" : index + 1}
                        </span>
                        <span className="font-semibold">
                          {step.label}
                        </span>
                      </button>

                      {/* Connector */}
                      {index < STEPS.length - 1 && (
                        <div className={`w-12 h-0.5 rounded-full ${
                          currentStepIndex > index
                            ? "bg-green-400"
                            : "bg-stone-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Collapse progress button */}
              <button
                onClick={() => setIsProgressCollapsed(true)}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded transition-colors ml-2"
                title="Ẩn thanh tiến trình"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Collapsed progress - minimal expand button */
            <div className="px-6 py-1 border-t border-stone-100 bg-stone-50 flex justify-center">
              <button
                onClick={() => setIsProgressCollapsed(false)}
                className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded transition-colors"
                title="Hiện thanh tiến trình"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto bg-stone-100 ${currentStep === 'result' ? 'p-0' : 'p-6'}`}>
          {/* Step 1: Select Lesson */}
          {currentStep === "select" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white p-10 max-w-md text-center rounded-2xl border border-stone-200 shadow-lg">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileText className="w-8 h-8 text-brand" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 mb-3">
                  Chọn bài học để bắt đầu
                </h2>
                <p className="text-sm text-stone-600 mb-5 leading-relaxed">
                  Sử dụng thanh bên trái để chọn lớp, chủ đề và bài học
                </p>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-stone-600 font-medium">
                    <span className="px-2.5 py-1 bg-white rounded-md shadow-sm">Lớp</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                    <span className="px-2.5 py-1 bg-white rounded-md shadow-sm">Chủ đề</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                    <span className="px-2.5 py-1 bg-sky-100 text-brand-dark rounded-md shadow-sm">Bài học</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure Activities */}
          {currentStep === "configure" && selectedLesson && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Section: Thông tin bài học */}
              <section className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-stone-50 border-b border-stone-200">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-brand" />
                    Thông tin bài học
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Tên bài</label>
                      <p className="text-sm text-stone-800 font-semibold">{selectedLesson.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Lớp</label>
                      <p className="text-sm text-stone-800 font-semibold">Lớp {selectedLesson.grade}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Chủ đề</label>
                      <p className="text-sm text-stone-800 font-semibold">{selectedLesson.topic}</p>
                    </div>
                  </div>

                  {/* Chỉ mục */}
                  {selectedLesson.chi_muc_list && selectedLesson.chi_muc_list.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-stone-200">
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 block">Chỉ mục nội dung</label>
                      <div className="space-y-2">
                        {selectedLesson.chi_muc_list.map((cm) => (
                          <div
                            key={cm.order}
                            className="flex items-start gap-3 py-2.5 px-3 bg-stone-50 rounded-lg border-l-3 border-l-brand"
                          >
                            <span className="text-xs font-bold text-brand bg-sky-50 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{cm.order}</span>
                            <span className="text-sm text-stone-700">{cm.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section: Cấu hình hoạt động */}
              <section className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 uppercase tracking-wide">
                      <Settings className="w-4 h-4 text-brand" />
                      Cấu hình phương pháp & kỹ thuật dạy học
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Chọn phương pháp và kỹ thuật dạy học phù hợp cho từng hoạt động
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNlsModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-700 rounded-lg text-teal-700 dark:text-teal-300 transition-colors text-xs font-medium"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Năng lực số
                    {nlsSelections.length > 0 && (
                      <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {nlsSelections.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="p-5">
                  <ActivityConfigPanel
                    lessonDetail={selectedLesson}
                    activities={activities}
                    onActivitiesChange={handleActivitiesChange}
                  />
                </div>
              </section>

              {/* Modal Năng lực số */}
              {showNlsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowNlsModal(false)}
                  />
                  {/* Modal */}
                  <div className="relative bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 w-[640px] max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                          <Monitor className="w-4 h-4 text-teal-600" />
                          Cấu hình năng lực số
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Chọn chỉ báo năng lực số phù hợp cho bài học
                        </p>
                      </div>
                      <button
                        onClick={() => setShowNlsModal(false)}
                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-stone-500" />
                      </button>
                    </div>
                    {/* Body */}
                    <div className="p-5 overflow-y-auto flex-1">
                      <NLSConfigSection
                        selections={nlsSelections}
                        onSelectionsChange={setNlsSelections}
                      />
                    </div>
                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-700 flex justify-end">
                      <button
                        onClick={() => setShowNlsModal(false)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Xong
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Đã xảy ra lỗi</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button + Progress Overlay */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={activities.length === 0 || isGenerating}
                  className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 transition-all font-semibold shadow-lg shadow-brand/25 hover:shadow-brand/40"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang sinh...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Sinh kế hoạch bài dạy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Show Result */}
          {currentStep === "result" && generatedResult && (
            <LessonPlanOutput
              result={generatedResult}
              onSectionUpdate={handleSectionUpdate}
              onExportPDF={() => {}}
              activities={activities}
              onBack={handleBackToConfigure}
            />
          )}
        </main>
      </div>

      {/* Backdrop */}
      {showUserMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Sidebar Panel - Slide in from right */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-white border-l border-stone-200 shadow-lg z-50 transform transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          showUserMenu ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
        }`}
      >
        {/* Header với avatar và info */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-200 text-stone-600 font-semibold text-base">
              {getInitials(user?.email || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user?.email || "Tài khoản"}</p>
              <p className="text-xs text-stone-500">
                {user?.roles?.some((r) => r.name === "admin") ? "Admin" : "Giáo viên"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            onClick={() => openModal("password")}
          >
            <KeyRound className="w-4 h-4 text-stone-500" />
            <span>Đổi mật khẩu</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            onClick={() => openModal("tools")}
          >
            <Wrench className="w-4 h-4 text-stone-500" />
            <span>Công cụ dạy học</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
            onClick={() => openModal("style")}
          >
            <Palette className="w-4 h-4 text-stone-500" />
            <span>Phong cách dạy học</span>
          </button>

          <div className="my-2 mx-5 border-t border-stone-100"></div>

          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* === Settings Modals === */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Password Modal */}
          {activeModal === "password" && (
            <div className="relative bg-white rounded-xl shadow-2xl border border-stone-200 w-[420px] max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 uppercase tracking-wide">
                  <KeyRound className="w-4 h-4 text-stone-600" />
                  Đổi mật khẩu
                </h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              <div className="p-5">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Mật khẩu hiện tại</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Mật khẩu mới</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">Xác nhận mật khẩu mới</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-brand focus:border-brand transition-colors" required />
                  </div>
                  <button type="submit" disabled={isChangingPassword} className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-all flex items-center gap-2">
                    {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tools Modal */}
          {activeModal === "tools" && (
            <div className="relative bg-white rounded-xl shadow-2xl border border-stone-200 w-[520px] max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 uppercase tracking-wide">
                    <Wrench className="w-4 h-4 text-stone-600" />
                    Công cụ dạy học
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Áp dụng tự động khi sinh kế hoạch bài dạy</p>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {allTools.map((tool) => {
                    const isSelected = selectedTools.includes(tool);
                    const isCustom = customTools.includes(tool);
                    return (
                      <button key={tool} type="button" onClick={() => toggleTool(tool)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-sky-50 text-brand-dark border-sky-300 shadow-sm"
                            : "bg-stone-50 text-stone-500 border-stone-200 hover:border-sky-300 hover:text-brand"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {tool}
                        {isCustom && (
                          <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); removeCustomTool(tool); }} className="ml-0.5 hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value={newTool} onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTool(); } }}
                    placeholder="Thêm công cụ mới..." maxLength={100}
                    className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                  />
                  <button type="button" onClick={addCustomTool} disabled={!newTool.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
                {savingTools && (
                  <p className="text-xs text-brand flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Style Modal */}
          {activeModal === "style" && (
            <div className="relative bg-white rounded-xl shadow-2xl border border-stone-200 w-[520px] max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 uppercase tracking-wide">
                    <Palette className="w-4 h-4 text-stone-600" />
                    Phong cách dạy học
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Áp dụng tự động khi sinh kế hoạch bài dạy</p>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <textarea value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} rows={6} maxLength={2000}
                  placeholder="Mô tả phong cách dạy học của bạn để AI tạo kế hoạch bài dạy phù hợp hơn..."
                  className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-brand focus:border-brand resize-none transition-colors"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{teachingStyle.length}/2000</span>
                  <button type="button" onClick={handleSaveStyle} disabled={teachingStyle === originalStyle || savingStyle}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      teachingStyle !== originalStyle
                        ? "bg-brand hover:bg-brand-dark text-white"
                        : "bg-stone-100 text-stone-400 cursor-not-allowed"
                    } disabled:opacity-50`}
                  >
                    {savingStyle ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonPlanBuilderPage;
