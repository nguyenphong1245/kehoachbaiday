import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Bell, Palette, Lock, LogOut, Settings as SettingsIcon } from "lucide-react";
import SettingsForm from "@/components/account/SettingsForm";
import useAccount from "@/hooks/useAccount";
import { getStoredAuthUser } from "@/hooks/useAuth";
import { useToast } from "@/contexts/Toast";
import { changePassword } from "@/services/authService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "account" | "appearance" | "password" | "notifications";

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const currentUser = getStoredAuthUser();
  const { settings, saveSettings, error, isLoading } = useAccount({
    userId: currentUser?.id ?? null,
  });
  const toast = useToast();

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");

  if (!isOpen) return null;

  const handleSaveSettings = async (payload: any) => {
    try {
      await saveSettings(payload);
      toast.push({ type: 'success', title: 'Cập nhật cài đặt thành công!' });
    } catch (err) {
      toast.push({ type: 'error', title: 'Lỗi khi cập nhật cài đặt' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.push({ type: 'success', title: 'Đổi mật khẩu thành công!' });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.";
      toast.push({ type: 'error', title: 'Lỗi khi đổi mật khẩu' });
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex overflow-hidden">
        
        {/* Sidebar Menu - Only on desktop */}
        <div className="hidden sm:flex flex-col w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-3">
              Cài đặt
            </h2>
          </div>
          
          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "appearance"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Palette className="w-5 h-5" />
              Giao diện
            </button>
            
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "password"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Lock className="w-5 h-5" />
              Đổi mật khẩu
            </button>
            
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "account"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <User className="w-5 h-5" />
              Tài khoản
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              {activeTab === "appearance" && "Giao diện"}
              {activeTab === "password" && "Đổi mật khẩu"}
              {activeTab === "account" && "Tài khoản"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
              </div>
            ) : (
              <>
                {/* Giao diện Tab */}
                {activeTab === "appearance" && (
                  <div className="max-w-2xl">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tùy chỉnh giao diện ứng dụng theo sở thích của bạn
                      </p>
                    </div>
                    <SettingsForm settings={settings} onSave={handleSaveSettings} />
                  </div>
                )}

                {/* Đổi mật khẩu Tab */}
                {activeTab === "password" && (
                  <div className="max-w-xl">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                      {passwordError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                          minLength={6}
                          required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                          Ít nhất 6 ký tự
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Tài khoản Tab */}
                {activeTab === "account" && (
                  <div className="max-w-2xl">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Thông tin tài khoản của bạn
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {currentUser?.email}
                        </div>
                      </div>
                      
                      {currentUser?.profile && (
                        <>
                          {currentUser.profile.first_name && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Họ tên</div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {currentUser.profile.first_name} {currentUser.profile.last_name}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
