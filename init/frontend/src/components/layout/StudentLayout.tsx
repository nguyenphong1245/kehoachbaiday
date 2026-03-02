import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, KeyRound, Loader2, Eye, EyeOff, X } from "lucide-react";
import { logoutUser } from "@/services/authService";
import { clearStoredAuth, getStoredAuthUser } from "@/utils/authStorage";
import { changePassword } from "@/services/studentService";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredAuthUser();
  const isDashboard = location.pathname === "/student/dashboard" || location.pathname === "/student";

  /* ── Sidebar state ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  /* ── Change password modal ── */
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Close sidebar on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    clearStoredAuth();
    navigate("/login");
  };

  const openPwModal = () => {
    setSidebarOpen(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwError("");
    setPwSuccess("");
    setShowPwModal(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPw.length < 8) {
      setPwError("Mật khẩu mới tối thiểu 8 ký tự");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Mật khẩu xác nhận không khớp");
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => setShowPwModal(false), 1500);
    } catch {
      setPwError("Mật khẩu hiện tại không đúng");
    } finally {
      setPwSaving(false);
    }
  };

  const displayName = user?.email?.split("@")[0] || "Học sinh";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {isDashboard && (
        <nav className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="px-4 sm:px-6 py-2.5 flex items-center justify-end">
            <div ref={sidebarRef}>
              {/* Avatar button */}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 font-medium text-sm hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                aria-label="Menu"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Backdrop */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Sidebar panel */}
              <div
                className={`fixed top-0 right-0 h-screen w-72 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-700 shadow-lg z-50 transform transition-all duration-300 ease-out flex flex-col overflow-hidden ${
                  sidebarOpen ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible"
                }`}
              >
                {/* Header */}
                <div className="flex-shrink-0 px-5 py-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-base">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{displayName}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Học sinh</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="flex-1 overflow-y-auto py-2">
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    onClick={openPwModal}
                  >
                    <KeyRound className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <span>Đổi mật khẩu</span>
                  </button>

                  <div className="my-2 mx-5 border-t border-stone-100 dark:border-stone-800" />

                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main>
        <Outlet />
      </main>

      {/* Change password modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="font-bold text-stone-800 dark:text-stone-200">Đổi mật khẩu</h2>
              <button onClick={() => setShowPwModal(false)} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="px-5 py-4 space-y-3">
              {/* Current password */}
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* New password */}
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>

              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSuccess && <p className="text-xs text-green-600">{pwSuccess}</p>}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pwSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
