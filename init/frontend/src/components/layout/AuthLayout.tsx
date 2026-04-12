import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/contexts/Theme";
import { getStoredAuthUser } from "@/utils/authStorage";
import authBackground from "@/assets/nen.svg";

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
    <div className="relative min-h-screen w-full overflow-hidden text-stone-900">
      <img
        src={authBackground}
        alt="Nền đăng nhập"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-125 saturate-110"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/22 via-slate-900/10 to-sky-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_80%_85%,rgba(56,189,248,0.14),transparent_40%)]" />
      <main className="relative z-10">
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
