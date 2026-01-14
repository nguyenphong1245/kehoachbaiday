import type {
  Permission,
  Role,
  User,
  UserRoleUpdate,
} from "@/types/auth";
import { api } from "@/services/authService";

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>("/users");
  return data;
};

export const updateUserRoles = async (userId: number, payload: UserRoleUpdate): Promise<User> => {
  const { data } = await api.put<User>(`/users/${userId}/roles`, payload);
  return data;
};

export const getRoles = async (): Promise<Role[]> => {
  const { data } = await api.get<Role[]>("/roles");
  return data;
};

export const createRole = async (payload: Omit<Role, "id" | "permissions">): Promise<Role> => {
  const { data } = await api.post<Role>("/roles", payload);
  return data;
};

export const getPermissions = async (): Promise<Permission[]> => {
  const { data } = await api.get<Permission[]>("/permissions");
  return data;
};

export const createPermission = async (payload: Omit<Permission, "id">): Promise<Permission> => {
  const { data } = await api.post<Permission>("/permissions", payload);
  return data;
};

export const updateRolePermissions = async (
  roleId: number,
  permissionIds: number[],
): Promise<Role> => {
  const { data } = await api.post<Role>(`/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
  return data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};
