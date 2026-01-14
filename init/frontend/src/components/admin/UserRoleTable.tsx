import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { Role, User } from "@/types/auth";

interface UserRoleTableProps {
  users: User[];
  roles: Role[];
  currentUserId?: number;
  onChange: (userId: number, roleIds: number[]) => Promise<void>;
  onDelete?: (userId: number) => Promise<void>;
}

const UserRoleTable = ({ users, roles, currentUserId, onChange, onDelete }: UserRoleTableProps) => {
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const handleToggle = async (user: User, role: Role, isChecked: boolean) => {
    const roleIds = new Set(user.roles.map((item) => item.id));
    if (isChecked) {
      roleIds.add(role.id);
    } else {
      roleIds.delete(role.id);
    }

    setUpdatingUserId(user.id);
    try {
      await onChange(user.id, Array.from(roleIds));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!onDelete) return;
    
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${user.email}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      await onDelete(user.id);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!users.length) {
    return <p className="text-sm text-slate-500">Không tìm thấy người dùng nào.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      {/* Mobile: Card view */}
      <div className="block sm:hidden space-y-3 px-3">
        {users.map((user) => (
          <div key={user.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">#{user.id}</p>
              </div>
              {onDelete && currentUserId !== user.id && (
                <button
                  onClick={() => handleDelete(user)}
                  disabled={deletingUserId === user.id}
                  className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const checked = user.roles.some((item) => item.id === role.id);
                const disabled = updatingUserId === user.id;
                return (
                  <label key={role.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sky-500"
                      checked={checked}
                      onChange={(event) => handleToggle(user, role, event.target.checked)}
                      disabled={disabled}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table view */}
      <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Người dùng</th>
            {roles.map((role) => (
              <th key={role.id} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                {role.name}
              </th>
            ))}
            {onDelete && (
              <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                <div className="flex flex-col">
                  <span>{user.email}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">#{user.id}</span>
                </div>
              </td>
              {roles.map((role) => {
                const checked = user.roles.some((item) => item.id === role.id);
                const disabled = updatingUserId === user.id;
                return (
                  <td key={role.id} className="px-4 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sky-500 focus:ring-sky-500 dark:bg-gray-700"
                        checked={checked}
                        onChange={(event) => handleToggle(user, role, event.target.checked)}
                        disabled={disabled}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{role.name}</span>
                    </label>
                  </td>
                );
              })}
              {onDelete && (
                <td className="px-4 py-3 text-center">
                  {currentUserId !== user.id ? (
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingUserId === user.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingUserId === user.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">Bạn</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserRoleTable;
