/**
 * ViewSavedLessonPlanPage - Trang xem và chỉnh sửa chi tiết giáo án đã lưu
 * Đồng nhất bố cục với LessonPlanBuilderPage
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Calendar,
  BookOpen,
  GraduationCap,
  Save,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { getSavedLessonPlan, updateSavedLessonPlan } from "@/services/lessonBuilderService";
import type { SavedLessonPlan, LessonPlanSection } from "@/types/lessonBuilder";
import { LessonPlanOutput } from "@/components/lesson-builder/LessonPlanOutput";

const ViewSavedLessonPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<SavedLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchLessonPlan = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getSavedLessonPlan(id);
        setLessonPlan(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Lỗi tải KHBD");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonPlan();
  }, [id]);

  // Xử lý cập nhật section
  const handleSectionUpdate = useCallback((sectionId: string, newContent: string) => {
    if (!lessonPlan) return;

    const updatedSections = lessonPlan.sections?.map((s: LessonPlanSection) =>
      s.section_id === sectionId ? { ...s, content: newContent } : s
    ) || [];

    setLessonPlan({
      ...lessonPlan,
      sections: updatedSections,
    });
    setHasChanges(true);
  }, [lessonPlan]);

  // Xử lý lưu thay đổi
  const handleSaveChanges = async () => {
    if (!lessonPlan || !id) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const fullContent = lessonPlan.sections
        ?.map((s: LessonPlanSection) => `## ${s.title}\n\n${s.content}\n\n`)
        .join("\n") || "";

      await updateSavedLessonPlan(id, {
        sections: lessonPlan.sections,
        full_content: fullContent,
      });

      setSaveMessage({ type: "success", text: "Đã lưu thay đổi thành công!" });
      setHasChanges(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage({
        type: "error",
        text: err.response?.data?.detail || "Lỗi khi lưu thay đổi"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Build lesson_info
  const lessonInfo = lessonPlan ? (lessonPlan.lesson_info || {
    book_type: lessonPlan.book_type || "",
    grade: lessonPlan.grade || "",
    topic: lessonPlan.topic || "",
    lesson_name: lessonPlan.lesson_name || lessonPlan.title,
  }) : null;

  // Convert to GenerateLessonPlanResponse format for LessonPlanOutput
  const resultForOutput = lessonPlan ? {
    lesson_info: lessonInfo!,
    sections: lessonPlan.sections || [],
    full_content: lessonPlan.full_content || lessonPlan.content || "",
  } : null;

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header - đồng nhất với LessonPlanBuilderPage */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/lesson-builder/saved")}
              className="text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Kế hoạch đã lưu
            </button>
            {lessonInfo && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[350px]">
                  {lessonInfo.lesson_name}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {lessonInfo && (
              <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {lessonInfo.book_type || "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Lớp {lessonInfo.grade || "N/A"}
                </span>
                {lessonPlan && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(lessonPlan.updated_at)}
                  </span>
                )}
              </div>
            )}
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area - đồng nhất layout với LessonPlanBuilderPage */}
      <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-0">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!isLoading && (error || !lessonPlan) && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-lg">{error || "Không tìm thấy KHBD"}</span>
            </div>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div className={`mx-6 mt-4 p-4 flex items-center gap-3 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}>
            {saveMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Lesson Plan Output */}
        {!isLoading && resultForOutput && (
          <LessonPlanOutput
            result={resultForOutput}
            onSectionUpdate={handleSectionUpdate}
            onExportPDF={() => {}}
            activities={lessonPlan!.activities || lessonPlan!.generation_params || []}
            onBack={() => navigate("/lesson-builder/saved")}
          />
        )}
      </main>
    </div>
  );
};

export default ViewSavedLessonPlanPage;
