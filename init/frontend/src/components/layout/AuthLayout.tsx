import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/contexts/Theme";
import { getStoredAuthUser } from "@/utils/authStorage";

const AuthLayout = () => {
  const { theme, setTheme } = useTheme();

  // Mặc định trang đăng nhập là chế độ sáng nếu chưa đăng nhập
  useEffect(() => {
    const user = getStoredAuthUser();
    if (!user && theme !== 'light') {
      setTheme('light');
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">
      <main>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
