import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook, act as hookAct } from "@testing-library/react";
import React from "react";

import { ToastProvider, useToast } from "@/contexts/Toast";

// Suppress the "useToast must be used within ToastProvider" error in certain tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("useToast must be used within ToastProvider")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

describe("Toast context", () => {
  // -----------------------------------------------------------------------
  // Basic rendering
  // -----------------------------------------------------------------------
  describe("ToastProvider rendering", () => {
    it("renders children without any toasts initially", () => {
      render(
        <ToastProvider>
          <div data-testid="app-content">App</div>
        </ToastProvider>
      );

      expect(screen.getByTestId("app-content")).toHaveTextContent("App");
      // No toast text should be visible
      expect(screen.queryByText("Test toast")).not.toBeInTheDocument();
    });

    it("provides toasts array, push, and remove via context", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      expect(result.current.toasts).toEqual([]);
      expect(typeof result.current.push).toBe("function");
      expect(typeof result.current.remove).toBe("function");
    });
  });

  // -----------------------------------------------------------------------
  // Showing toasts
  // -----------------------------------------------------------------------
  describe("push toast", () => {
    it("shows a toast when push is called", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      hookAct(() => {
        result.current.push({
          title: "Success!",
          description: "Operation completed",
          type: "success",
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("Success!");
      expect(result.current.toasts[0].description).toBe("Operation completed");
      expect(result.current.toasts[0].type).toBe("success");
    });

    it("renders toast content in the DOM", () => {
      function TestComponent() {
        const { push } = useToast();
        return (
          <button
            data-testid="trigger"
            onClick={() => push({ title: "Hello Toast", type: "info" })}
          >
            Show
          </button>
        );
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      // Initially no toast
      expect(screen.queryByText("Hello Toast")).not.toBeInTheDocument();

      // Trigger the toast
      act(() => {
        screen.getByTestId("trigger").click();
      });

      // Toast should now be visible
      expect(screen.getByText("Hello Toast")).toBeInTheDocument();
    });

    it("can show multiple toasts", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      hookAct(() => {
        result.current.push({ title: "Toast 1", type: "info" });
        result.current.push({ title: "Toast 2", type: "error" });
        result.current.push({ title: "Toast 3", type: "warning" });
      });

      expect(result.current.toasts).toHaveLength(3);
    });
  });

  // -----------------------------------------------------------------------
  // Removing toasts
  // -----------------------------------------------------------------------
  describe("remove toast", () => {
    it("removes a specific toast by id", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      hookAct(() => {
        result.current.push({ title: "To Remove", type: "success" });
      });

      const toastId = result.current.toasts[0].id;

      hookAct(() => {
        result.current.remove(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // Auto-dismiss
  // -----------------------------------------------------------------------
  describe("auto-dismiss", () => {
    it("auto-removes toast after specified duration", () => {
      vi.useFakeTimers();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useToast(), { wrapper });

      hookAct(() => {
        result.current.push({
          title: "Auto Dismiss",
          type: "info",
          duration: 1000,
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      // Advance time past the duration
      hookAct(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(result.current.toasts).toHaveLength(0);

      vi.useRealTimers();
    });
  });

  // -----------------------------------------------------------------------
  // Error when used outside provider
  // -----------------------------------------------------------------------
  describe("useToast outside provider", () => {
    it("throws an error when used outside ToastProvider", () => {
      expect(() => {
        renderHook(() => useToast());
      }).toThrow("useToast must be used within ToastProvider");
    });
  });
});
