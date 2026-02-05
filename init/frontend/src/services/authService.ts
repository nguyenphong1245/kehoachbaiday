import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type {
  AuthMessage,
  ChangePasswordPayload,
  EmailVerificationConfirmPayload,
  EmailVerificationResendPayload,
  LoginPayload,
  LoginResponse,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  StudentLoginPayload,
  User,
} from "@/types/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send httpOnly cookies automatically
});

// ---------------------------------------------------------------------------
// CSRF Token interceptor - send X-CSRF-Token header for state-changing requests
// ---------------------------------------------------------------------------
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (config.method && !safeMethods.includes(config.method.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

// ---------------------------------------------------------------------------
// Refresh-on-401 interceptor with request queue
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh for 401 errors (not on auth endpoints themselves)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/student-login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        // Refresh succeeded — cookies updated automatically
        processQueue(null);
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — clear user data and redirect to login
        localStorage.removeItem("auth_user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const registerUser = async (payload: RegisterPayload): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
};

export const studentLoginUser = async (payload: StudentLoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/student-login", payload);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Even if API call fails, we still clear client-side data
  }
  localStorage.removeItem("auth_user");
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
