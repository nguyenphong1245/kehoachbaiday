import { Link, Outlet } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar className="lg:px-4 px-2 mx-auto" />
        <main className="flex-1 lg:pl-6 lg:pr-4 py-4 sm:py-6 px-2 sm:px-4 mx-auto w-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
