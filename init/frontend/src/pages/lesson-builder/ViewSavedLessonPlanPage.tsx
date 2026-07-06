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
import { usePageTitle } from "@/hooks/usePageTitle";
import { useKgLpvStatus } from "@/hooks/useKgLpvStatus";
import { useKgLpvJob } from "@/hooks/useKgLpvJob";
import { VerifyButton } from "@/components/kg-lpv/VerifyButton";
import { VerificationPanel } from "@/components/kg-lpv/VerificationPanel";

const ViewSavedLessonPlanPage: React.FC = () => {
  usePageTitle("Xem KHBD");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState<SavedLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // KG-LPV: kiểm chứng KHBD bằng đồ thị tri thức
  const kgLpvStatus = useKgLpvStatus();
  const kgLpvJob = useKgLpvJob();
  const [kgLpvPanelOpen, setKgLpvPanelOpen] = useState(false);
  const [kgLpvDocked, setKgLpvDocked] = useState(false);
  // Docked chỉ áp dụng ở màn hình >= md; dưới đó luôn dùng overlay để không vỡ layout.
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleVerify = () => {
    if (!lessonPlan) return;
    setKgLpvPanelOpen(true);
    kgLpvJob.start(lessonPlan.id);
  };

  const handleAutoFix = useCallback(async () => {
    setKgLpvDocked(true);
    setKgLpvPanelOpen(true);
    // Nếu chưa có job ở trạng thái cuối trong phiên → chạy kiểm chứng.
    if (!kgLpvJob.job || !["done", "repaired"].includes(kgLpvJob.job.status)) {
      await handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kgLpvJob.job, lessonPlan]);

  const handleLocateSection = useCallback((sectionId: string) => {
    const el = document.getElementById(`kglpv-section-${sectionId}`);
    if (!el) return; // KHBD tải từ HTML đã lưu có thể chưa có neo — bỏ qua
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("kglpv-locate-highlight");
    window.setTimeout(() => el.classList.remove("kglpv-locate-highlight"), 2000);
  }, []);

  const kgLpvVariant: "overlay" | "docked" = kgLpvDocked && isDesktop ? "docked" : "overlay";
  const kgLpvDockedActive = kgLpvVariant === "docked" && kgLpvPanelOpen;

  const verificationPanel = (
    <VerificationPanel
      variant={kgLpvVariant}
      open={kgLpvPanelOpen}
      onClose={() => {
        setKgLpvPanelOpen(false);
        setKgLpvDocked(false);
      }}
      job={kgLpvJob.job}
      report={kgLpvJob.report}
      progress={kgLpvJob.progress}
      phase={kgLpvJob.phase}
      loading={kgLpvJob.loading}
      error={kgLpvJob.error}
      onDismiss={kgLpvJob.dismiss}
      onLocate={handleLocateSection}
      onRepair={kgLpvJob.repair}
      diffs={kgLpvJob.diffs}
      repairing={kgLpvJob.repairing}
      repairError={kgLpvJob.repairError}
      onApplyDiffs={kgLpvJob.applyDiffs}
      onCloseDiffModal={kgLpvJob.closeDiffModal}
      onRepairBatch={kgLpvJob.repairBatch}
    />
  );

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
      {/* KG-LPV: nút kiểm chứng KHBD (ẩn khi module tắt) */}
      {!isLoading && lessonPlan && (
        <div className="fixed top-3 right-3 z-30">
          <VerifyButton
            enabled={kgLpvStatus.enabled}
            availability={kgLpvStatus.availability}
            loading={kgLpvJob.loading}
            onClick={handleVerify}
          />
        </div>
      )}
      {!kgLpvDockedActive && verificationPanel}

      {/* Content Area (+ panel docked cạnh khi Sửa tự động đang mở trên desktop) */}
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0 overflow-y-auto bg-stone-100 dark:bg-stone-900 p-0">
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
              onAutoFix={handleAutoFix}
              autoFixEnabled={kgLpvStatus.enabled && kgLpvStatus.availability === "ok"}
            />
          )}
        </main>

        {kgLpvDockedActive && (
          <div className="w-full max-w-md flex-shrink-0 border-l border-stone-200 dark:border-stone-700">
            {verificationPanel}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSavedLessonPlanPage;
