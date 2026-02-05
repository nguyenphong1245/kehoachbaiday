import { describe, it, expect } from "vitest";
import { isTokenExpired } from "./tokenUtils";

/**
 * Helper: tạo JWT giả với payload tuỳ ý (không cần signature hợp lệ)
 */
const makeToken = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
};

describe("isTokenExpired", () => {
  it("returns false for a token expiring far in the future", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    expect(isTokenExpired(makeToken({ exp }))).toBe(false);
  });

  it("returns true for a token that already expired", () => {
    const exp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
    expect(isTokenExpired(makeToken({ exp }))).toBe(true);
  });

  it("returns true for a token expiring within the 30s buffer", () => {
    const exp = Math.floor(Date.now() / 1000) + 10; // 10 seconds from now
    expect(isTokenExpired(makeToken({ exp }))).toBe(true);
  });

  it("returns true for a malformed token", () => {
    expect(isTokenExpired("not.a.valid.jwt")).toBe(true);
    expect(isTokenExpired("")).toBe(true);
    expect(isTokenExpired("onlyone")).toBe(true);
  });

  it("returns true when payload has no exp claim", () => {
    expect(isTokenExpired(makeToken({ sub: "123" }))).toBe(true);
  });
});
