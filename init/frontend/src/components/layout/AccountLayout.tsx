import { Outlet } from "react-router-dom";

const AccountLayout = () => {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-100">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;
