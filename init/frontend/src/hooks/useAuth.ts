import { useCallback, useState } from "react";
import axios from "axios";

import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/auth";
import { loginUser, registerUser } from "@/services/authService";
import { getUserSettings } from "@/services/accountService";
import { setStoredAccessToken, setStoredAuthUser } from "@/utils/authStorage";
import { useTheme } from "@/contexts/Theme";

interface UseAuthResult {
  register: (payload: RegisterPayload) => Promise<User>;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

const useAuth = (): UseAuthResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const parseError = useCallback((err: unknown) => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(Array.isArray(detail) ? detail.join(", ") : String(detail));
        return;
      }
    }
    setError("Unexpected error. Please try again.");
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await registerUser(payload);
      return user;
    } catch (err) {
      parseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [parseError]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(payload);
      setStoredAccessToken(response.access_token);
      
      // Load user settings và áp dụng theme
      try {
        const settings = await getUserSettings(response.user.id);
        // Cập nhật user với settings
        const userWithSettings = { ...response.user, settings };
        setStoredAuthUser(userWithSettings);
        
        // Áp dụng theme từ settings của user
        if (settings.theme) {
          setTheme(settings.theme as "light" | "dark" | "system");
        }
      } catch {
        // Nếu không load được settings, vẫn lưu user
        setStoredAuthUser(response.user);
      }
      
      return response;
    } catch (err) {
      parseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [parseError, setTheme]);

  const resetError = useCallback(() => setError(null), []);

  return {
    register,
    login,
    isLoading,
    error,
    resetError,
  };
};

export default useAuth;

export { clearStoredAuth, getStoredAccessToken, getStoredAuthUser } from "@/utils/authStorage";
