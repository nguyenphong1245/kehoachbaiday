/**
 * RepairDiffModal — hiển thị các đoạn đã sửa (before/after), giáo viên duyệt
 * TỪNG đoạn rồi bấm "Áp dụng" để ghi vào KHBD (`POST /jobs/{id}/apply`). Không
 * bao giờ tự động ghi — luôn cần xác nhận rõ ràng từ giáo viên (§7 Bước 4, §8).
 */
import React, { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { SectionDiff } from "@/types/kgLpv";

interface RepairDiffModalProps {
  open: boolean;
  diffs: SectionDiff[];
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onApply: (sectionIds: string[]) => void | Promise<void>;
}

export const RepairDiffModal: React.FC<RepairDiffModalProps> = ({
  open,
  diffs,
  loading = false,
  error = null,
  onClose,
  onApply,
}) => {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  // Mặc định duyệt tất cả các đoạn đề xuất khi diffs thay đổi (giáo viên có thể bỏ chọn).
  useEffect(() => {
    setApproved(new Set(diffs.map((d) => d.section_id)));
  }, [diffs]);

  if (!open) return null;

  const toggle = (sectionId: string) => {
    setApproved((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    try {
      await onApply(Array.from(approved));
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-sm font-bold text-stone-800 dark:text-white uppercase tracking-wide">
            Xem &amp; duyệt bản sửa
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang sửa & kiểm lại...
            </div>
          )}

          {!loading && diffs.length === 0 && !error && (
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">
              Không có đoạn nào được sửa.
            </p>
          )}

          {!loading &&
            diffs.map((diff) => (
              <div
                key={diff.section_id}
                className="rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-stone-900/40">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                    {diff.section_id}
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={approved.has(diff.section_id)}
                      onChange={() => toggle(diff.section_id)}
                      className="rounded border-stone-300 dark:border-stone-600"
                    />
                    Duyệt đoạn này
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-700">
                  <div className="p-3 space-y-1">
                    <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase">
                      Trước
                    </p>
                    <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap">
                      {diff.before}
                    </p>
                  </div>
                  <div className="p-3 space-y-1 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                      Sau
                    </p>
                    <p className="text-sm text-stone-800 dark:text-stone-100 whitespace-pre-wrap">
                      {diff.after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!loading && diffs.length > 0 && (
          <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-3 border-t border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-md transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applying || approved.size === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-md transition-colors disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" />
              {applying ? "Đang áp dụng..." : `Áp dụng (${approved.size})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairDiffModal;
