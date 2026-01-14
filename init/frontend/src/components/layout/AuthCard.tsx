import type { PropsWithChildren, ReactNode } from "react";

interface AuthCardProps extends PropsWithChildren {
  title: string;
  description?: ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200 dark:bg-gray-800 dark:shadow-none">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
      </header>
      {children}
    </section>
  );
};

export default AuthCard;
