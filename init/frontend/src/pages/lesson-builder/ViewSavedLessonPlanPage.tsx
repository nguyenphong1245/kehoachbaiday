/**
 * ViewSavedLessonPlanPage - Trang xem và chỉnh sửa chi tiết giáo án đã lưu
 * Đồng nhất bố cục với LessonPlanBuilderPage
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getSavedLessonPlan } from "@/services/lessonBuilderService";
import type { SavedLessonPlan, LessonPlanSection } from "@/types/lessonBuilder";
import { LessonPlanOutput } from "@/components/lesson-builder/LessonPlanOutput";

const ViewSavedLessonPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<SavedLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-stone-100 dark:bg-stone-900 p-0">
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

        {/* Lesson Plan Output */}
        {!isLoading && resultForOutput && (
          <LessonPlanOutput
            result={resultForOutput}
            onSectionUpdate={handleSectionUpdate}
            onExportPDF={() => {}}
            activities={lessonPlan!.activities || lessonPlan!.generation_params || []}
            onBack={() => navigate("/lesson-builder/saved")}
            savedLessonPlanId={id}
            hideFullscreen
          />
        )}
      </main>
    </div>
  );
};

export default ViewSavedLessonPlanPage;
