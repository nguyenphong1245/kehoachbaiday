/**
 * VerifyButton — nút "Kiểm chứng KHBD".
 * Ẩn hoàn toàn khi module tắt hoặc đồ thị chưa sẵn sàng (`!enabled || availability !== "ok"`).
 */
import React from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import type { KgLpvAvailability } from "@/types/kgLpv";

interface VerifyButtonProps {
  enabled: boolean;
  availability: KgLpvAvailability;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

export const VerifyButton: React.FC<VerifyButtonProps> = ({
  enabled,
  availability,
  loading = false,
  onClick,
  className = "",
}) => {
  if (!enabled || availability !== "ok") return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-dark bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      title="Kiểm chứng KHBD bằng đồ thị tri thức KG-LPV"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShieldCheck className="w-4 h-4" />
      )}
      Kiểm chứng KHBD
    </button>
  );
};

export default VerifyButton;
