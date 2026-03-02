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
  verifyEmail: vi.fn(),
}));

import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

describe("VerifyEmailPage", () => {
  // F1.9 - renders OTP input for 8-digit verification code
  it("F1.9 - renders OTP input for 8-digit verification code", () => {
    render(<VerifyEmailPage />);

    // The title "Xác minh email" appears both in the heading and in the submit button.
    // Use getByRole to target the heading specifically.
    expect(
      screen.getByRole("heading", { name: "Xác minh email" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Nhập mã 8 chữ số")).toBeInTheDocument();

    // The OtpInput component renders 8 individual digit inputs
    const digitInputs = screen.getAllByRole("textbox");
    expect(digitInputs).toHaveLength(8);

    // Each input has aria-label "Chữ số N"
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByLabelText(`Chữ số ${i}`)).toBeInTheDocument();
    }

    expect(
      screen.getByRole("button", { name: "Xác minh email" }),
    ).toBeInTheDocument();
  });
});
