/**
 * SummaryBar — đếm lỗi ĐÃ XÁC NHẬN theo mã + trạng thái tổng của job.
 * Findings `status="unjudged"` hiển thị RIÊNG (kiểm toán), không tính vào đếm lỗi.
 */
import React from "react";
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import type { ReportResponse } from "@/types/kgLpv";

interface SummaryBarProps {
  report: ReportResponse;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ report }) => {
  const { summary } = report;
  const totalConfirmed = summary.total_confirmed ?? 0;
  const totalUnjudged = summary.total_unjudged ?? 0;
  const codeCounts = Object.entries(summary).filter(
    ([key]) => key !== "total_confirmed" && key !== "total_unjudged"
  );

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {totalConfirmed > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            {totalConfirmed > 0
              ? `${totalConfirmed} lỗi đã xác nhận`
              : "Không phát hiện lỗi"}
          </span>
        </div>
        {totalUnjudged > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
            <HelpCircle className="w-3.5 h-3.5" />
            {totalUnjudged} không phán xử được
          </span>
        )}
      </div>

      {codeCounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {codeCounts.map(([code, count]) => (
            <span
              key={code}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            >
              {code}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryBar;
