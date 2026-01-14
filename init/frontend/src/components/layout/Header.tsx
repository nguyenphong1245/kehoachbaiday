import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

const Header = ({ title, description, actions }: HeaderProps) => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h2>
  {description ? <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </header>
  );
};

export default Header;
