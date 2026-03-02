import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/services/authService", () => ({
  requestPasswordReset: vi.fn(),
}));

import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

describe("ForgotPasswordPage", () => {
  // F1.10 - renders forgot password form with email input
  it("F1.10 - renders forgot password form with email input", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Email tài khoản")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gửi liên kết đặt lại" }),
    ).toBeInTheDocument();
  });
});
