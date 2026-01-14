import type { ReactNode } from "react";

interface FormAlertProps {
  variant?: "error" | "success";
  children: ReactNode;
}

const variants = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-green-50 text-green-700 border-green-200",
};

const FormAlert = ({ variant = "error", children }: FormAlertProps) => {
  return (
    <div className={`w-full rounded-lg border px-3 py-2 text-sm ${variants[variant]}`}>
      {children}
    </div>
  );
};

export default FormAlert;
