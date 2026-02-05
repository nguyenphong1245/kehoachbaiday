/**
 * LessonPlanBuilderPage - Trang soạn Kế hoạch bài dạy
 * Phong cách hành chính - Giao diện chuyên nghiệp, rõ ràng
 */
import React, { useState, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStoredAuthUser } from "@/utils/authStorage";
import { logoutUser } from "@/services/authService";
import {
  LessonPlanBuilderSidebar,
  ActivityConfigPanel,
  LessonPlanOutput,
} from "@/components/lesson-builder";
import type {
  LessonDetail,
  ActivityConfig,
  GenerateLessonPlanResponse,
} from "@/types/lessonBuilder";
import { generateLessonPlanStream, type SSEProgressEvent } from "@/services/lessonBuilderService";

type PageStep = "select" | "configure" | "result";

// Step configuration - chỉ label đơn giản
const STEPS = [
  { key: "select", label: "Chọn bài học" },
  { key: "configure", label: "Cấu hình" },
  { key: "result", label: "Kết quả" },
];

export const LessonPlanBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredAuthUser();

  // State
  const [currentStep, setCurrentStep] = useState<PageStep>("select");
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [activities, setActivities] = useState<ActivityConfig[]>([]);
  const [generatedResult, setGeneratedResult] = useState<GenerateLessonPlanResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SSEProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

    generateLessonPlanStream(
      {
        book_type: selectedLesson.book_type,
        grade: selectedLesson.grade,
        topic: selectedLesson.topic,
        lesson_id: selectedLesson.id,
        lesson_name: selectedLesson.name,
        activities: activities,
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
    setGeneratedResult(null);
    setError(null);
  };

  const handleBackToConfigure = () => {
    setCurrentStep("configure");
    setError(null);
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left Sidebar - Chọn bài học */}
      {!isLeftSidebarCollapsed && (
        <LessonPlanBuilderSidebar
          onLessonSelect={handleLessonSelect}
          selectedLesson={selectedLesson}
          onCollapse={() => setIsLeftSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Left: Toggle sidebar + Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              {/* Toggle sidebar button - chỉ hiện khi sidebar đang ẩn */}
              {isLeftSidebarCollapsed && (
                <button
                  onClick={() => setIsLeftSidebarCollapsed(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  title="Hiện thanh chọn bài"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              )}
              <span className="text-slate-600 font-medium">Kế hoạch bài dạy</span>
              {selectedLesson && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-blue-600 font-semibold truncate max-w-[250px]">
                    {selectedLesson.name}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => window.open("/lesson-builder/saved", "_blank")}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                KHBD đã lưu
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button
                onClick={() => window.open("/classes", "_blank")}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Quản lý lớp & học liệu</span>
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Làm mới
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              {/* User Menu - Avatar Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors"
                title={user?.email || "Tài khoản"}
              >
                {getInitials(user?.email || "U")}
              </button>
            </div>
          </div>

          {/* Progress Steps - Collapsible */}
          {!isProgressCollapsed ? (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center">
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
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            : isCompleted
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-slate-400 bg-slate-100"
                        } ${!isClickable && !isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                          isActive
                            ? "bg-white/25"
                            : isCompleted
                            ? "bg-green-200 text-green-700"
                            : "bg-slate-200 text-slate-500"
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
                            : "bg-slate-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              {/* Collapse progress button */}
              <button
                onClick={() => setIsProgressCollapsed(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors ml-2"
                title="Ẩn thanh tiến trình"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Collapsed progress - minimal expand button */
            <div className="px-6 py-1 border-t border-slate-100 bg-slate-50 flex justify-center">
              <button
                onClick={() => setIsProgressCollapsed(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                title="Hiện thanh tiến trình"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto bg-slate-100 ${currentStep === 'result' ? 'p-0' : 'p-6'}`}>
          {/* Step 1: Select Lesson */}
          {currentStep === "select" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white p-10 max-w-md text-center rounded-2xl border border-slate-200 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-3">
                  Chọn bài học để bắt đầu
                </h2>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Sử dụng thanh bên trái để chọn lớp, chủ đề và bài học
                </p>
                <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                    <span className="px-2.5 py-1 bg-white rounded-md shadow-sm">Lớp</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 bg-white rounded-md shadow-sm">Chủ đề</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md shadow-sm">Bài học</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure Activities */}
          {currentStep === "configure" && selectedLesson && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Section: Thông tin bài học */}
              <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Thông tin bài học
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên bài</label>
                      <p className="text-sm text-slate-800 font-semibold">{selectedLesson.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lớp</label>
                      <p className="text-sm text-slate-800 font-semibold">Lớp {selectedLesson.grade}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chủ đề</label>
                      <p className="text-sm text-slate-800 font-semibold">{selectedLesson.topic}</p>
                    </div>
                  </div>

                  {/* Chỉ mục */}
                  {selectedLesson.chi_muc_list && selectedLesson.chi_muc_list.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-200">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Chỉ mục nội dung</label>
                      <div className="space-y-2">
                        {selectedLesson.chi_muc_list.map((cm) => (
                          <div
                            key={cm.order}
                            className="flex items-start gap-3 py-2.5 px-3 bg-slate-50 rounded-lg border-l-3 border-l-blue-500"
                          >
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{cm.order}</span>
                            <span className="text-sm text-slate-700">{cm.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section: Cấu hình hoạt động */}
              <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <Settings className="w-4 h-4 text-blue-500" />
                    Cấu hình phương pháp & kỹ thuật dạy học
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Chọn phương pháp và kỹ thuật dạy học phù hợp cho từng hoạt động
                  </p>
                </div>
                <div className="p-5">
                  <ActivityConfigPanel
                    lessonDetail={selectedLesson}
                    activities={activities}
                    onActivitiesChange={handleActivitiesChange}
                  />
                </div>
              </section>

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
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 transition-all font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
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
        className={`fixed top-0 right-0 h-screen w-72 bg-white border-l border-slate-200 shadow-lg z-50 transform transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          showUserMenu ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
        }`}
      >
        {/* Header với avatar và info */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-semibold text-base">
              {getInitials(user?.email || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.email || "Tài khoản"}</p>
              <p className="text-xs text-slate-500">Giáo viên</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => { setShowUserMenu(false); navigate('/account'); }}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Cài đặt tài khoản</span>
          </button>

          <div className="my-2 mx-5 border-t border-slate-100"></div>

          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanBuilderPage;
