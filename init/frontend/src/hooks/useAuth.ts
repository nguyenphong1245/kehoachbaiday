import { useCallback, useState } from "react";

import type { LoginPayload, LoginResponse, RegisterPayload, StudentLoginPayload, User } from "@/types/auth";
import { loginUser, registerUser, studentLoginUser } from "@/services/authService";
import { getUserSettings } from "@/services/accountService";
import { parseAuthApiError } from "@/utils/authText";
import { setStoredAuthUser } from "@/utils/authStorage";
import { useTheme } from "@/contexts/Theme";

interface UseAuthResult {
  register: (payload: RegisterPayload) => Promise<User>;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  studentLogin: (payload: StudentLoginPayload) => Promise<LoginResponse>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

const useAuth = (): UseAuthResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  const parseError = useCallback((err: unknown) => {
    setError(parseAuthApiError(err, "Đã có lỗi xảy ra. Vui lòng thử lại."));
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
      // Tokens are now in httpOnly cookies — only store user data

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

  const studentLogin = useCallback(async (payload: StudentLoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentLoginUser(payload);
      setStoredAuthUser(response.user);
      return response;
    } catch (err) {
      parseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [parseError]);

  const resetError = useCallback(() => setError(null), []);

  return {
    register,
    login,
    studentLogin,
    isLoading,
    error,
    resetError,
  };
};

export default useAuth;

export { clearStoredAuth, getStoredAuthUser } from "@/utils/authStorage";
