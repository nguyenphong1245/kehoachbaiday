import type { PropsWithChildren, ReactNode } from "react";

interface AuthCardProps extends PropsWithChildren {
  title: string;
  description?: ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft border border-stone-200/60 dark:bg-stone-800 dark:border-stone-700/60 dark:shadow-none">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{title}</h1>
        {description ? <p className="mt-2 text-sm text-stone-500 dark:text-stone-300">{description}</p> : null}
      </header>
      {children}
    </section>
  );
};

export default AuthCard;
