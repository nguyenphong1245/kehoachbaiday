import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import type { Permission, Role, User } from "@/types/auth";
import {
  createPermission,
  createRole,
  deleteUser,
  getPermissions,
  getRoles,
  getUsers,
  updateRolePermissions,
  updateUserRoles,
} from "@/services/rbacService";

interface RolePayload {
  name: string;
  description?: string | null;
}

interface PermissionPayload {
  name: string;
  description?: string | null;
}

const parseError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail ?? err.message;
    return Array.isArray(detail) ? detail.join(", ") : String(detail);
  }
  return "Unexpected error. Please try again.";
};

const useRbacManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData, permissionsData] = await Promise.all([
        getUsers(),
        getRoles(),
        getPermissions(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateRole = useCallback(
    async (payload: RolePayload) => {
      setError(null);
      try {
        const role = await createRole(payload);
        setRoles((prev) => [...prev, role]);
        return role;
      } catch (err) {
        const message = parseError(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const handleCreatePermission = useCallback(
    async (payload: PermissionPayload) => {
      setError(null);
      try {
        const permission = await createPermission(payload);
        setPermissions((prev) => [...prev, permission]);
        return permission;
      } catch (err) {
        const message = parseError(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const handleUpdateUserRoles = useCallback(
    async (userId: number, roleIds: number[]) => {
      setError(null);
      try {
        const updated = await updateUserRoles(userId, { role_ids: roleIds });
        setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
        return updated;
      } catch (err) {
        const message = parseError(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const handleUpdateRolePermissions = useCallback(
    async (roleId: number, permissionIds: number[]) => {
      setError(null);
      try {
        const updated = await updateRolePermissions(roleId, permissionIds);
        setRoles((prev) => prev.map((role) => (role.id === updated.id ? updated : role)));
        return updated;
      } catch (err) {
        const message = parseError(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const handleDeleteUser = useCallback(
    async (userId: number) => {
      setError(null);
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        const message = parseError(err);
        setError(message);
        throw err;
      }
    },
    [],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    users,
    roles,
    permissions,
    error,
    isLoading,
    refresh: loadAll,
    resetError,
    createRole: handleCreateRole,
    createPermission: handleCreatePermission,
    updateUserRoles: handleUpdateUserRoles,
    updateRolePermissions: handleUpdateRolePermissions,
    deleteUser: handleDeleteUser,
  };
};

export default useRbacManagement;
