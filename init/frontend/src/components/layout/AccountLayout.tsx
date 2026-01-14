import { Outlet } from "react-router-dom";

const AccountLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;
