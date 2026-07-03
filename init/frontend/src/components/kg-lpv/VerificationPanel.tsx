/**
 * VerificationPanel — panel trượt phải: tiến độ kiểm chứng theo bước
 * (Tách đoạn → Định danh & Đối chiếu → Nhất quán sư phạm → Hoàn tất), sau đó
 * sổ lỗi nhóm theo nhánh N1/N2/N3. Kiểm chứng chạy bất đồng bộ — giáo viên có
 * thể đóng panel và tiếp tục chỉnh sửa; không bao giờ tự động thay nội dung KHBD.
 */
import React from "react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import type { JobStatusResponse, ReportResponse } from "@/types/kgLpv";
import { FindingCard } from "./FindingCard";
import { SummaryBar } from "./SummaryBar";

const STEPS = [
  { key: "segmenting", label: "Tách đoạn" },
  { key: "verifying", label: "Định danh & Đối chiếu" },
  { key: "verifying_n3", label: "Nhất quán sư phạm" },
  { key: "done", label: "Hoàn tất" },
];

const BRANCH_ORDER = ["N1", "N2", "N3"];
const BRANCH_TITLES: Record<string, string> = {
  N1: "N1 — Định danh",
  N2: "N2 — Đối chiếu chương trình",
  N3: "N3 — Nhất quán sư phạm",
};

function currentStepIndex(status: string | undefined): number {
  if (!status || status === "pending") return -1;
  if (status === "failed") return -1;
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : STEPS.length - 1;
}

interface VerificationPanelProps {
  open: boolean;
  onClose: () => void;
  job: JobStatusResponse | null;
  report: ReportResponse | null;
  progress: number;
  phase: string;
  loading: boolean;
  error: string | null;
  onDismiss: (findingId: number) => void | Promise<void>;
  onLocate?: (sectionId: string) => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  open,
  onClose,
  job,
  report,
  progress,
  phase,
  loading,
  error,
  onDismiss,
  onLocate,
}) => {
  const activeStep = currentStepIndex(job?.status);
  const isRunning = loading || (job !== null && !report && job.status !== "failed");

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-96 bg-white dark:bg-stone-800 border-l border-stone-200 dark:border-stone-700 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-sm font-bold text-stone-800 dark:text-white uppercase tracking-wide">
            Kiểm chứng KHBD
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {job?.status === "failed" && !error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Kiểm chứng thất bại. Vui lòng thử lại.</span>
            </div>
          )}

          {isRunning && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                {STEPS.map((step, idx) => {
                  const isDone = activeStep > idx || job?.status === "done";
                  const isActive = activeStep === idx && job?.status !== "done";
                  return (
                    <div key={step.key} className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : isActive
                            ? "bg-sky-100 text-brand-dark dark:bg-sky-900/40 dark:text-sky-300"
                            : "bg-stone-100 text-stone-400 dark:bg-stone-700 dark:text-stone-500"
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      <span
                        className={
                          isActive
                            ? "font-semibold text-stone-800 dark:text-stone-100"
                            : "text-stone-500 dark:text-stone-400"
                        }
                      >
                        {step.label}
                      </span>
                      {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-dark dark:text-sky-300" />}
                    </div>
                  );
                })}
              </div>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">{phase || "Đang xử lý..."}</p>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <SummaryBar report={report} />

              {BRANCH_ORDER.map((branchKey) => {
                const branch = report.branches.find((b) => b.branch === branchKey);
                if (!branch || branch.findings.length === 0) return null;
                return (
                  <div key={branchKey} className="space-y-2">
                    <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                      {BRANCH_TITLES[branchKey] || branchKey}
                    </h3>
                    <div className="space-y-2">
                      {branch.findings.map((finding) => (
                        <FindingCard
                          key={finding.id}
                          finding={finding}
                          onDismiss={onDismiss}
                          onLocate={onLocate}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {report.branches.every((b) => b.findings.length === 0) && (
                <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                  Không phát hiện lỗi nào trong KHBD.
                </p>
              )}

              {report.unjudged.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                    Không phán xử được (kiểm toán)
                  </h3>
                  <div className="space-y-2">
                    {report.unjudged.map((finding) => (
                      <FindingCard key={finding.id} finding={finding} onLocate={onLocate} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isRunning && !report && !error && job?.status !== "failed" && (
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">
              Nhấn "Kiểm chứng KHBD" để bắt đầu.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default VerificationPanel;
