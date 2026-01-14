import axios from "axios";

import type {
  AuthMessage,
  AuthResponse,
  ChangePasswordPayload,
  EmailVerificationConfirmPayload,
  EmailVerificationResendPayload,
  LoginPayload,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  User,
} from "@/types/auth";
import { getStoredAccessToken } from "@/utils/authStorage";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    `${window.location.protocol}//${window.location.hostname}:8000/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (!config.headers) {
    config.headers = {};
  }
  const headers = config.headers as Record<string, string>;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    delete headers.Authorization;
  }
  return config;
});

// Response interceptor để xử lý lỗi 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ - xóa auth data và redirect về login
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");
      
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (payload: RegisterPayload): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const verifyEmail = async (payload: EmailVerificationConfirmPayload): Promise<AuthMessage> => {
  const { data } = await api.post<AuthMessage>("/auth/verify-email", payload);
  return data;
};

export const resendVerificationEmail = async (payload: EmailVerificationResendPayload): Promise<AuthMessage> => {
  const { data } = await api.post<AuthMessage>("/auth/resend-verification", payload);
  return data;
};

export const requestPasswordReset = async (payload: PasswordResetRequestPayload): Promise<AuthMessage> => {
  const { data } = await api.post<AuthMessage>("/auth/request-password-reset", payload);
  return data;
};

export const resetPassword = async (payload: PasswordResetConfirmPayload): Promise<AuthMessage> => {
  const { data } = await api.post<AuthMessage>("/auth/reset-password", payload);
  return data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<AuthMessage> => {
  const { data } = await api.post<AuthMessage>("/users/me/change-password", payload);
  return data;
};
