import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label: string;
}

const SubmitButton = ({ isLoading = false, label, disabled, ...props }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-blue-400"
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "Vui lòng chờ..." : label}
    </button>
  );
};

export default SubmitButton;
