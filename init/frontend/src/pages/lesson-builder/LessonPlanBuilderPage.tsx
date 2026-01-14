/**
 * LessonPlanBuilderPage - Trang soạn Kế hoạch bài dạy
 * Phong cách hành chính - Giao diện chuyên nghiệp, rõ ràng
 */
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Settings,
  ArrowLeft,
  User,
} from "lucide-react";
import {
  LessonPlanBuilderSidebar,
  ActivityConfigPanel,
  LessonPlanOutput,
  SavedLessonsSidebar,
} from "@/components/lesson-builder";
import type {
  LessonDetail,
  ActivityConfig,
  GenerateLessonPlanResponse,
} from "@/types/lessonBuilder";
import { generateLessonPlan } from "@/services/lessonBuilderService";

type PageStep = "select" | "configure" | "result";

// Step configuration - chỉ label đơn giản
const STEPS = [
  { key: "select", label: "Chọn bài học" },
  { key: "configure", label: "Cấu hình" },
  { key: "result", label: "Kết quả" },
];

export const LessonPlanBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [currentStep, setCurrentStep] = useState<PageStep>("select");
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [activities, setActivities] = useState<ActivityConfig[]>([]);
  const [generatedResult, setGeneratedResult] = useState<GenerateLessonPlanResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleGenerate = async () => {
    if (!selectedLesson) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateLessonPlan({
        book_type: selectedLesson.book_type,
        grade: selectedLesson.grade,
        topic: selectedLesson.topic,
        lesson_id: selectedLesson.id,
        lesson_name: selectedLesson.name,
        activities: activities,
      });

      setGeneratedResult(result);
      setCurrentStep("result");
    } catch (err: any) {
      console.error("Error generating lesson plan:", err);
      setError(err?.response?.data?.detail || "Có lỗi xảy ra khi sinh kế hoạch bài dạy");
    } finally {
      setIsGenerating(false);
    }
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
    <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Left Sidebar - Chọn bài học */}
      <LessonPlanBuilderSidebar
        onLessonSelect={handleLessonSelect}
        selectedLesson={selectedLesson}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Gọn gàng, hành chính */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Kế hoạch bài dạy</span>
              {selectedLesson && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[250px]">
                    {selectedLesson.name}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/lesson-builder/saved")}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                Giáo án đã lưu
              </button>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Làm mới
              </button>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Tài khoản"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Steps - Gọn nhẹ */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center justify-center gap-2">
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
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50"
                      } ${!isClickable && !isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                        isActive
                          ? "bg-white/25"
                          : isCompleted
                          ? "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
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
                          ? "bg-green-400 dark:bg-green-500"
                          : "bg-slate-200 dark:bg-slate-600"
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900">
          {/* Step 1: Select Lesson */}
          {currentStep === "select" && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white dark:bg-slate-800 p-10 max-w-md text-center rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  Chọn bài học để bắt đầu
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  Sử dụng thanh bên trái để chọn loại sách, lớp, chủ đề và bài học
                </p>
                <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-600 rounded-md shadow-sm">Sách</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-600 rounded-md shadow-sm">Lớp</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-600 rounded-md shadow-sm">Chủ đề</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md shadow-sm">Bài học</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure Activities */}
          {currentStep === "configure" && selectedLesson && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Section: Thông tin bài học */}
              <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Thông tin bài học
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tên bài</label>
                      <p className="text-sm text-slate-800 dark:text-white font-semibold">{selectedLesson.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lớp</label>
                      <p className="text-sm text-slate-800 dark:text-white font-semibold">Lớp {selectedLesson.grade}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Loại sách</label>
                      <p className="text-sm text-slate-800 dark:text-white font-semibold">{selectedLesson.book_type}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chủ đề</label>
                      <p className="text-sm text-slate-800 dark:text-white font-semibold">{selectedLesson.topic}</p>
                    </div>
                  </div>

                  {/* Chỉ mục */}
                  {selectedLesson.chi_muc_list && selectedLesson.chi_muc_list.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">Chỉ mục nội dung</label>
                      <div className="space-y-2">
                        {selectedLesson.chi_muc_list.map((cm) => (
                          <div
                            key={cm.order}
                            className="flex items-start gap-3 py-2.5 px-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border-l-3 border-l-blue-500"
                          >
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{cm.order}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{cm.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section: Cấu hình hoạt động */}
              <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                    <Settings className="w-4 h-4 text-blue-500" />
                    Cấu hình phương pháp & kỹ thuật dạy học
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">Đã xảy ra lỗi</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || activities.length === 0}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 transition-all font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang sinh kế hoạch bài dạy...
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
            <div className="max-w-5xl mx-auto">
              {/* Back button */}
              <div className="mb-5">
                <button
                  onClick={handleBackToConfigure}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại chỉnh sửa cấu hình
                </button>
              </div>
              
              <LessonPlanOutput
                result={generatedResult}
                onSectionUpdate={handleSectionUpdate}
                onExportPDF={() => {}}
                activities={activities}
              />
            </div>
          )}
        </main>
      </div>

      {/* Right Sidebar - Saved Lessons */}
      <SavedLessonsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default LessonPlanBuilderPage;
