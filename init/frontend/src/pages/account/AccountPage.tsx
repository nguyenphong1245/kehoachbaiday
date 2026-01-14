import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Shield, ArrowLeft, ChevronRight } from "lucide-react";

import FormAlert from "@/components/forms/FormAlert";
import useAccount from "@/hooks/useAccount";
import { getStoredAuthUser } from "@/utils/authStorage";
import { useToast } from "@/contexts/Toast";
import { changePassword } from "@/services/authService";

const AccountPage = () => {
  const navigate = useNavigate();
  const storedUser = useMemo(() => getStoredAuthUser(), []);
  const userId = storedUser?.id ?? null;
  const { user, isLoading, error } = useAccount({
    userId,
  });
  const toast = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  if (!userId) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
        <p className="font-semibold">Yêu cầu đăng nhập</p>
        <p className="mt-2">Vui lòng đăng nhập để quản lý tài khoản.</p>
      </section>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.push({ type: 'success', title: 'Đổi mật khẩu thành công' });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Không thể đổi mật khẩu. Vui lòng thử lại.";
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header - Giống trang chủ */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-5 py-2.5 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Kế hoạch bài dạy</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Cài đặt tài khoản</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/lesson-builder")}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {error ? <FormAlert>{error}</FormAlert> : null}
          {isLoading ? <p className="text-sm text-slate-500">Đang tải...</p> : null}

          {/* Thông tin tài khoản */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Thông tin tài khoản
              </h2>
            </div>
            
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email đăng ký</p>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">
                    {user?.email || storedUser?.email || "Chưa có thông tin"}
                  </p>
                </div>
              </div>
              
              {/* Role */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vai trò</p>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">
                    {storedUser?.role === "admin" ? "Quản trị viên" : "Giáo viên"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                Đổi mật khẩu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cập nhật mật khẩu của bạn để bảo mật tài khoản.
              </p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
