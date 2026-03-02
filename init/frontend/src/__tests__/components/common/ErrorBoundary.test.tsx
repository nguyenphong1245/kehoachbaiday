import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/common/ErrorBoundary";

// A component that throws an error on render
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Content rendered successfully</div>;
};

describe("ErrorBoundary", () => {
  // Suppress React error boundary console.error noise during tests
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Content rendered successfully")).toBeInTheDocument();
  });

  it("catches errors and shows error UI with Vietnamese message", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Content rendered successfully")).not.toBeInTheDocument();
    expect(screen.getByText("Đã xảy ra lỗi")).toBeInTheDocument();
    expect(screen.getByText("Trang gặp sự cố. Vui lòng tải lại.")).toBeInTheDocument();
  });

  it("shows a reload button in the error UI", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
  });
});
