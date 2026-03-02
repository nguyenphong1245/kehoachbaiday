import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ state: { email: "test@example.com" } }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@/services/authService", () => ({
  resetPassword: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

// Mock lucide-react ArrowLeft icon used in step 2
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon" />,
}));

import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

describe("ResetPasswordPage", () => {
  // F1.11 - renders reset password page with OTP and new password steps
  it("F1.11 - renders reset password page with OTP step first, then password step", () => {
    render(<ResetPasswordPage />);

    // Step 1: OTP code entry
    expect(
      screen.getByRole("heading", { name: "NHẬP MÃ XÁC MINH" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nhập mã đặt lại 8 chữ số")).toBeInTheDocument();

    // 8 OTP digit inputs are rendered
    const digitInputs = screen.getAllByRole("textbox");
    expect(digitInputs).toHaveLength(8);

    // Verify code button for step 1
    expect(
      screen.getByRole("button", { name: "Xác nhận mã" }),
    ).toBeInTheDocument();

    // Step 2 fields (password inputs) should NOT be visible in step 1
    expect(screen.queryByPlaceholderText("Chọn mật khẩu mới")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Nhập lại mật khẩu mới")).not.toBeInTheDocument();
  });
});
