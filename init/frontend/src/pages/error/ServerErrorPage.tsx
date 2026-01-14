import { Link } from "react-router-dom";

import AuthCard from "@/components/layout/AuthCard";

const ServerErrorPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <AuthCard title="Something went wrong" description="An unexpected error occurred.">
        <div className="flex flex-col gap-3 text-sm text-slate-600">
          <p>
            We’re working to fix the issue. Try again in a moment or head back to a safe page in the
            meantime.
          </p>
          <div className="flex flex-col gap-2 text-brand">
            <Link to="/account">Go to your account</Link>
            <Link to="/login">Sign in again</Link>
          </div>
        </div>
      </AuthCard>
    </main>
  );
};

export default ServerErrorPage;
