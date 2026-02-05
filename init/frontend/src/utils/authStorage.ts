import type { User } from "@/types/auth";

const USER_STORAGE_KEY = "auth_user";

/**
 * @deprecated Token is now in httpOnly cookie — not accessible from JS.
 * Kept for backward compatibility during migration; always returns null.
 */
export const getStoredAccessToken = (): string | null => null;

/**
 * @deprecated Token is now in httpOnly cookie — do not store in localStorage.
 */
export const setStoredAccessToken = (_token: string) => {
  // no-op: access token is managed via httpOnly cookies
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
  localStorage.removeItem("access_token"); // clean up legacy key if present
  localStorage.removeItem(USER_STORAGE_KEY);
};
