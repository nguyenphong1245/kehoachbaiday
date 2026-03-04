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

type TabType = "staff" | "students";

const AdminUsersPage = () => {
  const {
    users,
    roles,
    error,
    isLoading,
    resetError,
    updateUserRoles,
    deleteUser,
    patchUser,
  } = useRbacManagement();

  const [activeTab, setActiveTab] = useState<TabType>("staff");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<{ userId: number; roleId: number } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTokenId, setEditingTokenId] = useState<number | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [savingTokenId, setSavingTokenId] = useState<number | null>(null);
  const currentUser = getStoredAuthUser();

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

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

  // Roles for staff tab (admin + teacher only, no student)
  const staffRoles = roles.filter(
    (role) => role.name.toLowerCase() === "admin" || role.name.toLowerCase() === "teacher"
  );

  // Split users into staff and students
  const staffUsers = useMemo(() => {
    const list = users.filter((u) => !isOnlyStudent(u));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const studentUsers = useMemo(() => {
    const list = users.filter((u) => isOnlyStudent(u));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const displayedUsers = activeTab === "staff" ? staffUsers : studentUsers;

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
      patchUser(userId, { token_balance: newBalance });
      setEditingTokenId(null);
      showSuccess("Đã cập nhật token.");
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

  const formatTokens = (n: number) => n.toLocaleString("vi-VN");

  // Render token cell for staff
  const renderTokenCell = (user: typeof users[0], isMobile = false) => {
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
            className={`${isMobile ? "w-24" : "w-28"} px-2 py-1 text-xs ${isMobile ? "" : "text-right"} border border-sky-300 rounded bg-white dark:bg-stone-700 dark:border-stone-600 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand`}
            autoFocus
          />
          <button
            onClick={() => handleTokenSave(user.id)}
            disabled={savingTokenId === user.id}
            className="p-1 text-brand hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded"
          >
            {savingTokenId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          </button>
        </div>
      );
    }

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
          <span className="text-xs text-stone-400">
            Đã dùng: {formatTokens(tokensUsed)}
          </span>
        </div>
      );
    }

    // For admins
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

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin": return "Admin";
      case "teacher": return "Giáo viên";
      default: return roleName;
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white">
          Tài khoản
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Quản lý tài khoản người dùng
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

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-stone-200 dark:border-stone-700">
        <button
          onClick={() => { setActiveTab("staff"); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "staff"
              ? "border-brand text-brand"
              : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Admin & Giáo viên
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === "staff" ? "bg-sky-100 dark:bg-sky-900/30 text-brand" : "bg-stone-100 dark:bg-stone-700 text-stone-500"
          }`}>
            {users.filter((u) => !isOnlyStudent(u)).length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab("students"); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "students"
              ? "border-brand text-brand"
              : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Học sinh
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === "students" ? "bg-sky-100 dark:bg-sky-900/30 text-brand" : "bg-stone-100 dark:bg-stone-700 text-stone-500"
          }`}>
            {users.filter((u) => isOnlyStudent(u)).length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          {searchQuery ? "Không tìm thấy người dùng phù hợp" : activeTab === "staff" ? "Chưa có admin/giáo viên" : "Chưa có học sinh"}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-700">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {displayedUsers.length} {activeTab === "staff" ? "tài khoản" : "học sinh"} {searchQuery && `(lọc từ ${activeTab === "staff" ? staffUsers.length : studentUsers.length})`}
            </p>
          </div>

          {activeTab === "staff" ? (
            <>
              {/* Staff - Mobile cards */}
              <div className="block sm:hidden divide-y divide-stone-100 dark:divide-stone-700">
                {displayedUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-400">#{user.id}</span>
                          {user.is_verified ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-stone-300" />
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
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      {renderTokenCell(user, true)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {staffRoles.map((role) => {
                        const checked = user.roles.some((r) => r.id === role.id);
                        return (
                          <label key={role.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                            updatingRole?.userId === user.id && updatingRole?.roleId === role.id
                              ? "bg-sky-100 dark:bg-sky-900/30"
                              : "bg-stone-50 dark:bg-stone-700/50"
                          }`}>
                            {updatingRole?.userId === user.id && updatingRole?.roleId === role.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-brand" />
                            ) : (
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => handleToggleRole(user.id, role.id, e.target.checked)}
                                disabled={updatingRole !== null}
                                className="h-4 w-4 rounded border-stone-300 dark:border-stone-600 text-brand"
                              />
                            )}
                            <span className="text-xs text-stone-600 dark:text-stone-300">
                              {getRoleDisplayName(role.name)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff - Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-900/50">
                    <tr className="text-left text-stone-500 dark:text-stone-400">
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium text-center">Xác thực</th>
                      <th className="px-5 py-3 font-medium text-right">Token</th>
                      {staffRoles.map((role) => (
                        <th key={role.id} className="px-5 py-3 font-medium text-center">{getRoleDisplayName(role.name)}</th>
                      ))}
                      <th className="px-5 py-3 font-medium text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                    {displayedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/30 text-stone-700 dark:text-stone-300">
                        <td className="px-5 py-3">
                          <span className="font-medium">{user.email}</span>
                          <span className="text-xs text-stone-400 ml-2">#{user.id}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {user.is_verified ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-stone-300 mx-auto" />
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {renderTokenCell(user)}
                        </td>
                        {staffRoles.map((role) => {
                          const checked = user.roles.some((r) => r.id === role.id);
                          const isUpdating = updatingRole?.userId === user.id && updatingRole?.roleId === role.id;
                          return (
                            <td key={role.id} className="px-5 py-3 text-center">
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-brand mx-auto" />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => handleToggleRole(user.id, role.id, e.target.checked)}
                                  disabled={updatingRole !== null}
                                  className="h-4 w-4 rounded border-stone-300 dark:border-stone-600 text-brand cursor-pointer disabled:opacity-50"
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
                            <span className="text-xs text-stone-400 italic">Bạn</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Students - Mobile cards */}
              <div className="block sm:hidden divide-y divide-stone-100 dark:divide-stone-700">
                {displayedUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{user.email}</p>
                      <span className="text-xs text-stone-400">#{user.id}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deletingId === user.id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex-shrink-0"
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Students - Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 dark:bg-stone-900/50">
                    <tr className="text-left text-stone-500 dark:text-stone-400">
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-700">
                    {displayedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/30 text-stone-700 dark:text-stone-300">
                        <td className="px-5 py-3">
                          <span className="font-medium">{user.email}</span>
                          <span className="text-xs text-stone-400 ml-2">#{user.id}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminUsersPage;
