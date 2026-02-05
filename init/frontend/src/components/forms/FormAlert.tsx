import type { ReactNode } from "react";

interface FormAlertProps {
  variant?: "error" | "success";
  children: ReactNode;
}

const variants = {
  error: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  success: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
};

const FormAlert = ({ variant = "error", children }: FormAlertProps) => {
  return (
    <div className={`w-full rounded-lg border px-3 py-2 text-sm ${variants[variant]}`}>
      {children}
    </div>
  );
};

export default FormAlert;
