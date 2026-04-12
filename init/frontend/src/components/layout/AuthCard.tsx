import type { PropsWithChildren, ReactNode } from "react";

interface AuthCardProps extends PropsWithChildren {
  title: string;
  description?: ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <section className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-2xl shadow-slate-950/25 border border-white/55 backdrop-blur-md">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{title}</h1>
        {description ? <p className="mt-2 text-sm text-stone-500">{description}</p> : null}
      </header>
      {children}
    </section>
  );
};

export default AuthCard;
