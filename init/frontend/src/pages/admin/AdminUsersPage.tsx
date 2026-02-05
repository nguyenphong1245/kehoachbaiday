import { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  ShieldCheck,
  AlertCircle,
  Coins,
  Save,
  GraduationCap,
} from "lucide-react";
import useRbacManagement from "@/hooks/useRbacManagement";
import { getStoredAuthUser } from "@/utils/authStorage";
import { updateTokenBalance } from "@/services/adminService";

const AdminUsersPage = () => {
  const {
    users,
    roles,
    error,
    isLoading,
    resetError,
    updateUserRoles,
    deleteUser,
    refresh,
  } = useRbacManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<{ userId: number; roleId: number } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTokenId, setEditingTokenId] = useState<number | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [savingTokenId, setSavingTokenId] = useState<number | null>(null);
  const currentUser = getStoredAuthUser();

  // Auto-hide success message
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase() === "admin" || role.name.toLowerCase() === "teacher" || role.name.toLowerCase() === "student"
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, searchQuery]);

  // Helper to check if user has specific role
  const hasRole = (user: typeof users[0], roleName: string) => {
    return user.roles.some((r) => r.name.toLowerCase() === roleName.toLowerCase());
  };

  // Check if user is ONLY a student (no teacher or admin role)
  const isOnlyStudent = (user: typeof users[0]) => {
    return hasRole(user, "student") && !hasRole(user, "teacher") && !hasRole(user, "admin");
  };

  // Check if user is a teacher (has teacher role)
  const isTeacher = (user: typeof users[0]) => {
    return hasRole(user, "teacher") && !hasRole(user, "admin");
  };

  // Independent roles - each role is toggled independently
  const handleToggleRole = async (userId: number, roleId: number, checked: boolean) => {
    resetError();
    setSuccessMessage(null);
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const roleIds = new Set(user.roles.map((r) => r.id));

    if (checked) {
      roleIds.add(roleId);
    } else {
      roleIds.delete(roleId);
    }

    setUpdatingRole({ userId, roleId });
    try {
      await updateUserRoles(userId, Array.from(roleIds));
      showSuccess("Đã cập nhật vai trò.");
    } catch {
      // error handled by hook
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async (userId: number, email: string) => {
    if (!confirm(`Xóa tài khoản "${email}"?\n\nHành động này không thể hoàn tác!`)) return;
    resetError();
    setSuccessMessage(null);
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      showSuccess("Đã xóa tài khoản.");
    } catch {
      // error handled by hook
    } finally {
      setDeletingId(null);
    }
  };

  const handleTokenEdit = (userId: number, currentBalance: number) => {
    setEditingTokenId(userId);
    setTokenInput(String(currentBalance));
  };

  const handleTokenSave = async (userId: number) => {
    const newBalance = parseInt(tokenInput, 10);
    if (isNaN(newBalance) || newBalance < 0) return;

    setSavingTokenId(userId);
    setSuccessMessage(null);
    try {
      await updateTokenBalance(userId, newBalance);
      showSuccess("Đã cập nhật token.");
      setEditingTokenId(null);
      refresh();
    } catch (err: any) {
      resetError();
    } finally {
      setSavingTokenId(null);
    }
  };

  const handleTokenKeyDown = (e: React.KeyboardEvent, userId: number) => {
    if (e.key === "Enter") handleTokenSave(userId);
    if (e.key === "Escape") setEditingTokenId(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTokens = (n: number) => {
    return n.toLocaleString("vi-VN");
  };

  // Render token cell based on user role
  const renderTokenCell = (user: typeof users[0], isMobile = false) => {
    // Students don't have tokens
    if (isOnlyStudent(user)) {
      return (
        <span className="text-xs text-slate-400 italic">-</span>
      );
    }

    // For teachers and admins, show token balance
    const tokenBalance = user.token_balance ?? 0;
    const tokensUsed = user.tokens_used ?? 0;

    if (editingTokenId === user.id) {
      return (
        <div className={`flex items-center ${isMobile ? "gap-1" : "justify-end gap-1"}`}>
          <input
            type="number"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => handleTokenKeyDown(e, user.id)}
            className={`${isMobile ? "w-24" : "w-28"} px-2 py-1 text-xs ${isMobile ? "" : "text-right"} border border-blue-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            autoFocus
          />
          <button
            onClick={() => handleTokenSave(user.id)}
            disabled={savingTokenId === user.id}
            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
          >
            {savingTokenId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          </button>
        </div>
      );
    }

    // For teachers (not admin), show tokens used
    if (isTeacher(user)) {
      return (
        <div className={`flex flex-col ${isMobile ? "" : "items-end"}`}>
          <button
            onClick={() => handleTokenEdit(user.id, tokenBalance)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            title="Nhấn để chỉnh sửa số dư"
          >
            Còn: {formatTokens(tokenBalance)}
          </button>
          <span className="text-xs text-slate-400">
            Đã dùng: {formatTokens(tokensUsed)}
          </span>
        </div>
      );
    }

    // For admins, show balance
    return (
      <button
        onClick={() => handleTokenEdit(user.id, tokenBalance)}
        className={`text-xs font-mono px-2 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
          tokenBalance === 0
            ? "text-red-500"
            : "text-amber-600 dark:text-amber-400"
        }`}
        title="Nhấn để chỉnh sửa"
      >
        {formatTokens(tokenBalance)}
      </button>
    );
  };

  // Get role icon
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return <ShieldCheck className="w-3 h-3" />;
      case "teacher":
        return <Shield className="w-3 h-3" />;
      case "student":
        return <GraduationCap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Get role display name in Vietnamese
  const getRoleDisplayName = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return "Admin";
      case "teacher":
        return "Giáo viên";
      case "student":
        return "Học sinh";
      default:
        return roleName;
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Tài khoản
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Phân quyền và quản lý tài khoản người dùng
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {searchQuery ? "Không tìm thấy người dùng phù hợp" : "Chưa có người dùng"}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredUsers.length} người dùng {searchQuery && `(lọc từ ${users.length})`}
            </p>
          </div>

          {/* Mobile cards */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">#{user.id}</span>
                      {user.created_at && (
                        <span className="text-xs text-slate-400">{formatDate(user.created_at)}</span>
                      )}
                      {user.is_verified ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </div>
                  {currentUser?.id !== user.id && (
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deletingId === user.id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Token balance - only show for teachers/admins */}
                {!isOnlyStudent(user) && (
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {renderTokenCell(user, true)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {filteredRoles.map((role) => {
                    const checked = user.roles.some((r) => r.id === role.id);
                    return (
                      <label key={role.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                        updatingRole?.userId === user.id && updatingRole?.roleId === role.id
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-slate-50 dark:bg-slate-700/50"
                      }`}>
                        {updatingRole?.userId === user.id && updatingRole?.roleId === role.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleToggleRole(user.id, role.id, e.target.checked)}
                            disabled={updatingRole !== null}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-500"
                          />
                        )}
                        <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          {getRoleIcon(role.name)}
                          {getRoleDisplayName(role.name)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Ngày đăng ký</th>
                <th className="px-5 py-3 font-medium text-center">Xác thực</th>
                <th className="px-5 py-3 font-medium text-right">Token (GV)</th>
                {filteredRoles.map((role) => (
                  <th key={role.id} className="px-5 py-3 font-medium text-center">{getRoleDisplayName(role.name)}</th>
                ))}
                <th className="px-5 py-3 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300">
                  <td className="px-5 py-3">
                    <div>
                      <span className="font-medium">{user.email}</span>
                      <span className="text-xs text-slate-400 ml-2">#{user.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">
                    {user.created_at ? formatDate(user.created_at) : "-"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {user.is_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {renderTokenCell(user)}
                  </td>
                  {filteredRoles.map((role) => {
                    const checked = user.roles.some((r) => r.id === role.id);
                    const isUpdating = updatingRole?.userId === user.id && updatingRole?.roleId === role.id;
                    return (
                      <td key={role.id} className="px-5 py-3 text-center">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleToggleRole(user.id, role.id, e.target.checked)}
                            disabled={updatingRole !== null}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 cursor-pointer disabled:opacity-50"
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-5 py-3 text-center">
                    {currentUser?.id !== user.id ? (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Xóa
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Bạn</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsersPage;
