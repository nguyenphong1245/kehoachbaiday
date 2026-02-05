import React from "react";

type ButtonVariant = "default" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-brand text-white hover:bg-brand-dark shadow-sm",
  ghost:
    "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className = "",
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
