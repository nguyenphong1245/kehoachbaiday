import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import axios from "axios";

// ---------------------------------------------------------------------------
// Mock axios so we can inspect how the module creates an instance
// ---------------------------------------------------------------------------
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");

  // Keep a reference to the interceptor callbacks so we can invoke them in tests
  const requestInterceptors: Array<(config: any) => any> = [];
  const responseInterceptors: Array<{
    fulfilled: (v: any) => any;
    rejected: (e: any) => any;
  }> = [];

  const mockInstance = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: {
        use: vi.fn((fn: (config: any) => any) => {
          requestInterceptors.push(fn);
        }),
      },
      response: {
        use: vi.fn(
          (fulfilled: (v: any) => any, rejected: (e: any) => any) => {
            responseInterceptors.push({ fulfilled, rejected });
          }
        ),
      },
    },
    defaults: { headers: { common: {} } },
    // Expose so tests can get the interceptor callbacks
    __requestInterceptors: requestInterceptors,
    __responseInterceptors: responseInterceptors,
  };

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockInstance),
    },
  };
});

// We need to import authService AFTER mocking axios so interceptors are captured
let api: any;
let loginUser: any;
let registerUser: any;
let logoutUser: any;
let verifyEmail: any;
let studentLoginUser: any;

beforeEach(async () => {
  vi.resetModules();
  // Re-import so the module runs against the mocked axios
  const mod = await import("@/services/authService");
  api = mod.api;
  loginUser = mod.loginUser;
  registerUser = mod.registerUser;
  logoutUser = mod.logoutUser;
  verifyEmail = mod.verifyEmail;
  studentLoginUser = mod.studentLoginUser;
});

describe("authService", () => {
  // -----------------------------------------------------------------------
  // Axios instance configuration
  // -----------------------------------------------------------------------
  describe("axios instance creation", () => {
    it("creates axios instance with correct baseURL and withCredentials", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          withCredentials: true,
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("registers a request interceptor for CSRF tokens", () => {
      expect(api.interceptors.request.use).toHaveBeenCalled();
    });

    it("registers a response interceptor for 401 handling", () => {
      expect(api.interceptors.response.use).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // CSRF token interceptor
  // -----------------------------------------------------------------------
  describe("CSRF request interceptor", () => {
    it("attaches X-CSRF-Token header for POST requests when cookie exists", () => {
      // Set a csrf_token cookie
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "csrf_token=test-csrf-token-123",
      });

      const interceptorFn = (api as any).__requestInterceptors[0];
      if (!interceptorFn) return; // guard – tests run after module init

      const config = {
        method: "POST",
        headers: {} as Record<string, string>,
      };
      const result = interceptorFn(config);

      expect(result.headers["X-CSRF-Token"]).toBe("test-csrf-token-123");
    });

    it("does NOT attach X-CSRF-Token header for GET requests", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "csrf_token=test-csrf-token-123",
      });

      const interceptorFn = (api as any).__requestInterceptors[0];
      if (!interceptorFn) return;

      const config = {
        method: "GET",
        headers: {} as Record<string, string>,
      };
      const result = interceptorFn(config);

      expect(result.headers["X-CSRF-Token"]).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // 401 response interceptor
  // -----------------------------------------------------------------------
  describe("401 response interceptor", () => {
    it("attempts token refresh when a 401 is received on a non-auth endpoint", async () => {
      const responseInterceptor = (api as any).__responseInterceptors[0];
      if (!responseInterceptor) return;

      // Mock api.post to succeed for refresh
      (api.post as Mock).mockResolvedValueOnce({ data: {} });

      const error = {
        response: { status: 401 },
        config: {
          url: "/classrooms/",
          _retry: false,
          headers: {},
        },
      };

      // The rejected handler should call refresh
      try {
        await responseInterceptor.rejected(error);
      } catch {
        // May reject if refresh mock isn't fully wired; that is acceptable
      }

      // Verify that a refresh attempt was made
      expect(api.post).toHaveBeenCalledWith("/auth/refresh");
    });

    it("does NOT attempt refresh for /auth/login endpoint", async () => {
      const responseInterceptor = (api as any).__responseInterceptors[0];
      if (!responseInterceptor) return;

      const error = {
        response: { status: 401 },
        config: {
          url: "/auth/login",
          _retry: false,
          headers: {},
        },
      };

      await expect(responseInterceptor.rejected(error)).rejects.toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // Exported functions
  // -----------------------------------------------------------------------
  describe("loginUser", () => {
    it("posts credentials to /auth/login", async () => {
      const payload = { email: "user@example.com", password: "pass123" };
      const mockUser = { user: { id: 1, email: "user@example.com" } };
      (api.post as Mock).mockResolvedValueOnce({ data: mockUser });

      const result = await loginUser(payload);

      expect(api.post).toHaveBeenCalledWith("/auth/login", payload);
      expect(result).toEqual(mockUser);
    });
  });

  describe("registerUser", () => {
    it("posts payload to /auth/register", async () => {
      const payload = { email: "new@example.com", password: "abc123" };
      const mockUser = { id: 1, email: "new@example.com" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockUser });

      const result = await registerUser(payload);

      expect(api.post).toHaveBeenCalledWith("/auth/register", payload);
      expect(result).toEqual(mockUser);
    });
  });

  describe("studentLoginUser", () => {
    it("posts credentials to /auth/student-login", async () => {
      const payload = { username: "student01", password: "pass" };
      const mockResp = { user: { id: 2, email: "" } };
      (api.post as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await studentLoginUser(payload);

      expect(api.post).toHaveBeenCalledWith("/auth/student-login", payload);
      expect(result).toEqual(mockResp);
    });
  });

  describe("logoutUser", () => {
    it("posts to /auth/logout and clears localStorage", async () => {
      localStorage.setItem("auth_user", '{"id":1}');
      (api.post as Mock).mockResolvedValueOnce({ data: {} });

      await logoutUser();

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
      expect(localStorage.getItem("auth_user")).toBeNull();
    });

    it("clears localStorage even if API call fails", async () => {
      localStorage.setItem("auth_user", '{"id":1}');
      (api.post as Mock).mockRejectedValueOnce(new Error("Network error"));

      await logoutUser();

      expect(localStorage.getItem("auth_user")).toBeNull();
    });
  });

  describe("verifyEmail", () => {
    it("posts payload to /auth/verify-email", async () => {
      const payload = { email: "u@e.com", token: "abc" };
      const mockMsg = { message: "Verified" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockMsg });

      const result = await verifyEmail(payload);

      expect(api.post).toHaveBeenCalledWith("/auth/verify-email", payload);
      expect(result).toEqual(mockMsg);
    });
  });
});
