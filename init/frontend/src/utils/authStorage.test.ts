import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredAuthUser,
  setStoredAuthUser,
  clearStoredAuth,
} from "./authStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("authStorage", () => {
  describe("access token", () => {
    it("returns null when no token stored", () => {
      expect(getStoredAccessToken()).toBeNull();
    });

    it("stores and retrieves a token", () => {
      setStoredAccessToken("my-token");
      expect(getStoredAccessToken()).toBe("my-token");
    });
  });

  describe("auth user", () => {
    it("returns null when no user stored", () => {
      expect(getStoredAuthUser()).toBeNull();
    });

    it("stores and retrieves a user", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        is_active: true,
        is_verified: false,
        token_balance: 20000,
        created_at: "2025-01-01T00:00:00Z",
        roles: [],
        profile: null,
        settings: null,
      } as any;
      setStoredAuthUser(user);
      const retrieved = getStoredAuthUser();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.email).toBe("test@example.com");
    });

    it("returns null for corrupted JSON", () => {
      localStorage.setItem("auth_user", "not-valid-json");
      expect(getStoredAuthUser()).toBeNull();
    });
  });

  describe("clearStoredAuth", () => {
    it("removes both token and user", () => {
      setStoredAccessToken("my-token");
      setStoredAuthUser({ id: 1, email: "t@t.com" } as any);
      clearStoredAuth();
      expect(getStoredAccessToken()).toBeNull();
      expect(getStoredAuthUser()).toBeNull();
    });
  });
});
