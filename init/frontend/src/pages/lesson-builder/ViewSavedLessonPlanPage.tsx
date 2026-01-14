/**
 * ViewSavedLessonPlanPage - Trang xem chi tiết giáo án đã lưu
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { getSavedLessonPlan, exportToPDF } from "@/services/lessonBuilderService";
import type { SavedLessonPlan } from "@/types/lessonBuilder";
import { LessonPlanOutput } from "@/components/lesson-builder/LessonPlanOutput";

const ViewSavedLessonPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<SavedLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonPlan = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getSavedLessonPlan(id);
        setLessonPlan(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Lỗi tải giáo án");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonPlan();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (error || !lessonPlan) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-8 pb-20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate("/lesson-builder/saved")}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-800 dark:text-red-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="text-lg">{error || "Không tìm thấy giáo án"}</span>
          </div>
        </div>
      </div>
    );
  }

  // Build lesson_info from SavedLessonPlan fields
  const lessonInfo = lessonPlan.lesson_info || {
    book_type: lessonPlan.book_type || "",
    grade: lessonPlan.grade || "",
    topic: lessonPlan.topic || "",
    lesson_name: lessonPlan.lesson_name || lessonPlan.title,
  };

  // Convert to GenerateLessonPlanResponse format for LessonPlanOutput
  const resultForOutput = {
    lesson_info: lessonInfo,
    sections: lessonPlan.sections || [],
    full_content: lessonPlan.full_content || lessonPlan.content || "",
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8 pb-20 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/lesson-builder/saved")}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>

        {/* Meta info */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {lessonInfo.book_type || "N/A"}
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Lớp {lessonInfo.grade || "N/A"}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Cập nhật: {formatDate(lessonPlan.updated_at)}
            </span>
          </div>
        </div>

        {/* Lesson Plan Output */}
        <LessonPlanOutput
          result={resultForOutput}
          onSectionUpdate={() => {}}
          onExportPDF={() => {}}
          activities={lessonPlan.activities || lessonPlan.generation_params || []}
        />
      </div>
    </div>
  );
};

export default ViewSavedLessonPlanPage;
