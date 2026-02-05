import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Shield, ArrowLeft, ChevronRight, KeyRound } from "lucide-react";

import FormAlert from "@/components/forms/FormAlert";
import TeachingPreferencesCard from "@/components/account/TeachingPreferencesCard";
import useAccount from "@/hooks/useAccount";
import { getStoredAuthUser } from "@/utils/authStorage";
import { useToast } from "@/contexts/Toast";
import { changePassword } from "@/services/authService";

const AccountPage = () => {
  const navigate = useNavigate();
  const storedUser = useMemo(() => getStoredAuthUser(), []);
  const userId = storedUser?.id ?? null;
  const { user, settings, saveSettings, isLoading, error } = useAccount({
    userId,
  });
  const toast = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      toast.push({ type: "success", title: "Đổi mật khẩu thành công" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        "Không thể đổi mật khẩu. Vui lòng thử lại.";
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Kế hoạch bài dạy
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Cài đặt tài khoản
            </span>
          </div>

          <button
            onClick={() => navigate("/lesson-builder")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {error ? <FormAlert>{error}</FormAlert> : null}
          {isLoading ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : null}

          {/* Thông tin tài khoản */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                  Thông tin tài khoản
                </h2>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Email đăng ký
                  </p>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">
                    {user?.email || storedUser?.email || "Chưa có thông tin"}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vai trò
                  </p>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">
                    {storedUser?.roles?.some((r) => r.name === "admin")
                      ? "Quản trị viên"
                      : "Giáo viên"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Đổi mật khẩu */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                  Đổi mật khẩu
                </h2>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="px-3 py-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          </div>

          {/* Cài đặt dạy học */}
          <TeachingPreferencesCard settings={settings} onSave={saveSettings} />
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
