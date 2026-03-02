import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook, act as hookAct } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mock the authStorage dependency used by ThemeProvider
// ---------------------------------------------------------------------------
vi.mock("@/utils/authStorage", () => ({
  getStoredAuthUser: vi.fn(() => null),
}));

// ---------------------------------------------------------------------------
// Mock window.matchMedia which jsdom does not implement
// ---------------------------------------------------------------------------
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { ThemeProvider, useTheme } from "@/contexts/Theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("Theme context", () => {
  // -----------------------------------------------------------------------
  // Default behaviour
  // -----------------------------------------------------------------------
  describe("default theme", () => {
    it("renders children and provides default 'system' theme", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("system");
      expect(typeof result.current.setTheme).toBe("function");
    });

    it("renders child content within ThemeProvider", () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Hello</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Hello");
    });
  });

  // -----------------------------------------------------------------------
  // Theme changes
  // -----------------------------------------------------------------------
  describe("setTheme", () => {
    it("changes theme to dark and applies dark class to documentElement", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      hookAct(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("changes theme to light and removes dark class from documentElement", () => {
      // Start with dark
      document.documentElement.classList.add("dark");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      hookAct(() => {
        result.current.setTheme("light");
      });

      expect(result.current.theme).toBe("light");
      expect(localStorage.getItem("theme")).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("persists theme to localStorage", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      hookAct(() => {
        result.current.setTheme("dark");
      });

      expect(localStorage.getItem("theme")).toBe("dark");

      hookAct(() => {
        result.current.setTheme("light");
      });

      expect(localStorage.getItem("theme")).toBe("light");
    });
  });

  // -----------------------------------------------------------------------
  // Reads from localStorage on mount
  // -----------------------------------------------------------------------
  describe("initialization from localStorage", () => {
    it("reads saved theme from localStorage on mount", () => {
      localStorage.setItem("theme", "dark");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe("dark");
    });
  });

  // -----------------------------------------------------------------------
  // syncThemeFromUser
  // -----------------------------------------------------------------------
  describe("syncThemeFromUser", () => {
    it("exposes syncThemeFromUser function", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(typeof result.current.syncThemeFromUser).toBe("function");
    });
  });
});
