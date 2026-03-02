import React from "react";

type ButtonVariant = "default" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-brand text-white hover:bg-brand-dark shadow-sm shadow-brand/20",
  ghost:
    "bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800",
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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50",
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
