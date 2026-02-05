import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label: string;
}

const SubmitButton = ({ isLoading = false, label, disabled, ...props }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:bg-brand/50"
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "Vui lòng chờ..." : label}
    </button>
  );
};

export default SubmitButton;
