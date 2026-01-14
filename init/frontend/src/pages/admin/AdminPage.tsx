import { useState } from "react";

import UserRoleTable from "@/components/admin/UserRoleTable";
import Header from "@/components/layout/Header";
import useRbacManagement from "@/hooks/useRbacManagement";
import FormAlert from "@/components/forms/FormAlert";
import { getStoredAuthUser } from "@/utils/authStorage";

const AdminPage = () => {
  const {
    users,
    roles,
    error,
    isLoading,
    resetError,
    updateUserRoles,
    deleteUser,
  } = useRbacManagement();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const currentUser = getStoredAuthUser();

  const handleUpdateUserRoles = async (userId: number, roleIds: number[]) => {
    resetError();
    setSuccessMessage(null);
    try {
      await updateUserRoles(userId, roleIds);
      setSuccessMessage("Đã cập nhật vai trò người dùng.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    resetError();
    setSuccessMessage(null);
    try {
      await deleteUser(userId);
      setSuccessMessage("Đã xóa tài khoản người dùng thành công.");
    } catch (err) {
      console.error(err);
    }
  };

  // Chỉ hiển thị 2 vai trò: admin và user
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'user'
  );

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <Header
        title="Quản lý vai trò người dùng"
        description="Gán vai trò admin hoặc user cho từng người dùng."
      />

      <div className="mt-6">
        {error ? <FormAlert>{error}</FormAlert> : null}
        {successMessage ? <FormAlert variant="success">{successMessage}</FormAlert> : null}
        {isLoading ? <p className="text-sm text-slate-500">Đang tải dữ liệu...</p> : null}
      </div>

      <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Gán vai trò cho người dùng
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bật/tắt quyền truy cập vai trò cho từng người dùng bên dưới.
          </p>
        </div>
        
        <UserRoleTable 
          users={users} 
          roles={filteredRoles} 
          currentUserId={currentUser?.id}
          onChange={handleUpdateUserRoles} 
          onDelete={handleDeleteUser}
        />
      </div>
    </section>
  );
};

export default AdminPage;
