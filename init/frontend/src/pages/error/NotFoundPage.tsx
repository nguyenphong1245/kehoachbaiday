import { Link } from "react-router-dom";

import AuthCard from "@/components/layout/AuthCard";

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <AuthCard
        title="Page not found"
        description="We couldn’t find the page you’re looking for."
      >
        <div className="flex flex-col gap-3 text-sm text-slate-600">
          <p>Double-check the address or return to a safe place:</p>
          <div className="flex flex-col gap-2 text-brand">
            <Link to="/login">Go to login</Link>
            <Link to="/account">Open account dashboard</Link>
          </div>
        </div>
      </AuthCard>
    </main>
  );
};

export default NotFoundPage;
