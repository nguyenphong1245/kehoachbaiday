import type { User } from "@/types/auth";

const TOKEN_STORAGE_KEY = "access_token";
const USER_STORAGE_KEY = "auth_user";

export const getStoredAccessToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getStoredAuthUser = (): User | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (err) {
    console.error("Failed to parse stored user", err);
    return null;
  }
};

export const setStoredAuthUser = (user: User) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
