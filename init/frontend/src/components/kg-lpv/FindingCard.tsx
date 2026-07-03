/**
 * FindingCard — 1 dòng sổ lỗi: badge mã lỗi + nhánh, vị trí, bằng chứng, giải
 * thích, hành động Bỏ qua. Findings `status="unjudged"` (phán xử LLM lỗi,
 * chỉ mang tính kiểm toán) hiển thị badge mờ riêng, KHÔNG có nút Bỏ qua.
 */
import React, { useState } from "react";
import { MapPin, Wrench, X } from "lucide-react";
import type { FindingOut } from "@/types/kgLpv";

interface FindingCardProps {
  finding: FindingOut;
  onDismiss?: (findingId: number) => void | Promise<void>;
  onLocate?: (sectionId: string) => void;
  onRepair?: (findingId: number) => void | Promise<void>;
}

const BRANCH_LABELS: Record<string, string> = {
  N1: "N1 · Định danh",
  N2: "N2 · Đối chiếu chương trình",
  N3: "N3 · Nhất quán sư phạm",
};

function evidenceLabel(ev: Record<string, unknown>): string {
  const parts: string[] = [];
  if (ev.ma_nguon) parts.push(String(ev.ma_nguon));
  if (ev.so_ky_hieu) parts.push(`Số ${ev.so_ky_hieu}`);
  if (ev.vi_tri_trang) parts.push(`Trang ${ev.vi_tri_trang}`);
  if (parts.length === 0 && ev.text_span) parts.push(String(ev.text_span));
  return parts.join(" · ") || "Bằng chứng đồ thị";
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, onDismiss, onLocate, onRepair }) => {
  const [dismissing, setDismissing] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const isUnjudged = finding.status === "unjudged";
  const isDismissed = finding.status === "dismissed";
  const isOpen = finding.status === "open";

  const handleDismiss = async () => {
    if (!onDismiss || dismissing) return;
    setDismissing(true);
    try {
      await onDismiss(finding.id);
    } finally {
      setDismissing(false);
    }
  };

  const handleRepair = async () => {
    if (!onRepair || !isOpen || repairing) return;
    setRepairing(true);
    try {
      await onRepair(finding.id);
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${
        isUnjudged
          ? "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50"
          : isDismissed
          ? "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 opacity-60"
          : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
              isUnjudged
                ? "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
          >
            {finding.code}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {BRANCH_LABELS[finding.branch] || finding.branch}
          </span>
          {isUnjudged && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400 border border-stone-200 dark:border-stone-600">
              Không phán xử được
            </span>
          )}
          {isDismissed && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400">
              Đã bỏ qua
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onLocate?.(finding.section_id)}
          className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-brand-dark dark:hover:text-sky-300 transition-colors flex-shrink-0"
          title="Đi tới vị trí trong KHBD"
        >
          <MapPin className="w-3.5 h-3.5" />
          {finding.section_id}
        </button>
      </div>

      <p className="text-sm text-stone-700 dark:text-stone-200">{finding.explanation}</p>

      {finding.evidence.length > 0 && (
        <ul className="space-y-0.5">
          {finding.evidence.map((ev, idx) => (
            <li key={idx} className="text-[11px] text-stone-500 dark:text-stone-400">
              {evidenceLabel(ev)}
            </li>
          ))}
        </ul>
      )}

      {!isUnjudged && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRepair}
            disabled={!isOpen || repairing}
            title={isOpen ? "Sửa lỗi tự động" : "Chỉ sửa được phát hiện đang mở"}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              isOpen
                ? "text-brand-dark dark:text-sky-300 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 disabled:opacity-60"
                : "text-stone-400 bg-stone-100 dark:bg-stone-700 dark:text-stone-500 cursor-not-allowed"
            }`}
          >
            <Wrench className="w-3 h-3" />
            {repairing ? "Đang sửa..." : "Sửa"}
          </button>
          {!isDismissed && (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={dismissing}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-md transition-colors disabled:opacity-60"
            >
              <X className="w-3 h-3" />
              {dismissing ? "Đang bỏ qua..." : "Bỏ qua"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FindingCard;
