import { Link } from "react-router-dom";

import AuthCard from "@/components/layout/AuthCard";

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <AuthCard
        title="Không tìm thấy trang"
        description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
      >
        <div className="flex flex-col gap-3 text-sm text-slate-600">
          <p>Vui lòng kiểm tra lại địa chỉ hoặc quay về:</p>
          <div className="flex flex-col gap-2 text-brand">
            <Link to="/login">Đăng nhập</Link>
            <Link to="/account">Trang chủ</Link>
          </div>
        </div>
      </AuthCard>
    </main>
  );
};

export default NotFoundPage;
