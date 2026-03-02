import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock authStorage
vi.mock("@/utils/authStorage", () => ({
  getStoredAuthUser: vi.fn(),
}));

import SessionGuard from "@/components/auth/SessionGuard";
import { getStoredAuthUser } from "@/utils/authStorage";

const mockedGetStoredAuthUser = vi.mocked(getStoredAuthUser);

describe("SessionGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing (returns null) when session is valid", () => {
    mockedGetStoredAuthUser.mockReturnValue({
      id: 1,
      email: "user@example.com",
    } as any);

    const { container } = render(<SessionGuard />);
    // SessionGuard returns null - it renders no visible DOM
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no user is stored (guest)", () => {
    mockedGetStoredAuthUser.mockReturnValue(null);

    const { container } = render(<SessionGuard />);
    expect(container.innerHTML).toBe("");
  });

  it("redirects when session changes via storage event (different user)", () => {
    mockedGetStoredAuthUser.mockReturnValue({
      id: 1,
      email: "user@example.com",
    } as any);

    // Spy on window.location assignment
    const originalHref = window.location.href;
    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, href: originalHref },
      writable: true,
    });
    Object.defineProperty(window.location, "href", {
      set: hrefSetter,
      get: () => originalHref,
    });

    render(<SessionGuard />);

    // Simulate a storage event indicating a different user logged in
    const storageEvent = new StorageEvent("storage", {
      key: "auth_user",
      newValue: JSON.stringify({ id: 2, email: "other@example.com" }),
    });
    window.dispatchEvent(storageEvent);

    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });

  it("does not redirect when storage event is for the same user", () => {
    mockedGetStoredAuthUser.mockReturnValue({
      id: 1,
      email: "user@example.com",
    } as any);

    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location },
      writable: true,
    });
    Object.defineProperty(window.location, "href", {
      set: hrefSetter,
      get: () => "http://localhost/",
    });

    render(<SessionGuard />);

    // Same user id => should NOT redirect
    const storageEvent = new StorageEvent("storage", {
      key: "auth_user",
      newValue: JSON.stringify({ id: 1, email: "user@example.com" }),
    });
    window.dispatchEvent(storageEvent);

    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
