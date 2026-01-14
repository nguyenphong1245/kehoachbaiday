import { Outlet } from "react-router-dom";
import Topbar from "../layout/Topbar";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Topbar />
      <main>
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
