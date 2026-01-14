import type {
  AuthResponse,
  User,
  UserProfile,
  UserProfileUpdatePayload,
  UserSettings,
  UserSettingsUpdatePayload,
} from "@/types/auth";
import { api } from "@/services/authService";

export const getUser = async (userId: number): Promise<User> => {
  const { data } = await api.get<User>(`/users/${userId}`);
  return data;
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>(`/users/${userId}/profile`);
  return data;
};

export const updateUserProfile = async (
  userId: number,
  payload: UserProfileUpdatePayload,
): Promise<UserProfile> => {
  const { data } = await api.put<UserProfile>(`/users/${userId}/profile`, payload);
  return data;
};

export const getUserSettings = async (userId: number): Promise<UserSettings> => {
  const { data } = await api.get<UserSettings>(`/users/${userId}/settings`);
  return data;
};

export const updateUserSettings = async (
  userId: number,
  payload: UserSettingsUpdatePayload,
): Promise<UserSettings> => {
  const { data } = await api.put<UserSettings>(`/users/${userId}/settings`, payload);
  return data;
};

export const refreshAuthUser = async (response: AuthResponse): Promise<AuthResponse> => {
  const user = await getUser(response.user.id);
  return { ...response, user };
};
