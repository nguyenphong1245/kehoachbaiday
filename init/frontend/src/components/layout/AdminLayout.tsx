import { Outlet, Link } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="w-full border-b bg-white dark:bg-stone-900 dark:border-stone-800 shrink-0">
          <div className="mx-auto px-3 sm:px-4 py-2 flex items-center justify-end gap-2">
            <Link
              to="/lesson-builder"
              className="text-sm text-stone-600 dark:text-stone-300 hover:text-sky-600 dark:hover:text-sky-400 no-underline transition-colors"
            >
              Kế hoạch bài dạy
            </Link>
          </div>
        </header>
        <main className="flex-1 lg:pl-6 lg:pr-4 py-4 sm:py-6 px-2 sm:px-4 mx-auto w-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
