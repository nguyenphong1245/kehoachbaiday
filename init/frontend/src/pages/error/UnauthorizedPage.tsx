import { Link } from "react-router-dom";

import AuthCard from "@/components/layout/AuthCard";

const UnauthorizedPage = () => {
  return (
    <main className="flex items-center">
      <AuthCard
        title="Access denied"
        description="You don’t have permission to view this page."
      >
        <div className="flex flex-col gap-3 text-sm text-slate-600">
          <p>
            If you believe this is an error, contact an administrator to update your roles or try a
            different page.
          </p>
          <div className="flex flex-col gap-2 text-brand">
            <Link to="/account">Return to your account</Link>
            <Link to="/login">Sign in with another account</Link>
          </div>
        </div>
      </AuthCard>
    </main>
  );
};

export default UnauthorizedPage;
