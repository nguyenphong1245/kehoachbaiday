import { Link } from "react-router-dom";

import AuthCard from "@/components/layout/AuthCard";
import { usePageTitle } from "@/hooks/usePageTitle";

const ServerErrorPage = () => {
  usePageTitle("Lỗi hệ thống");
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <AuthCard title="Đã xảy ra lỗi" description="Hệ thống gặp lỗi không mong muốn.">
        <div className="flex flex-col gap-3 text-sm text-stone-600">
          <p>
            Chúng tôi đang khắc phục sự cố. Vui lòng thử lại sau ít phút hoặc quay về trang an toàn.
          </p>
          <div className="flex flex-col gap-2 text-brand">
            <Link to="/lesson-builder">Quay về trang chính</Link>
            <Link to="/login">Đăng nhập lại</Link>
          </div>
        </div>
      </AuthCard>
    </main>
  );
};

export default ServerErrorPage;
