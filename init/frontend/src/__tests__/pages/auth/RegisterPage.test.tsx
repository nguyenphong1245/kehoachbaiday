import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockRegister = vi.fn();
const mockResetError = vi.fn();
let mockError: string | null = null;
let mockIsLoading = false;

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    login: vi.fn(),
    register: mockRegister,
    studentLogin: vi.fn(),
    isLoading: mockIsLoading,
    error: mockError,
    resetError: mockResetError,
  }),
}));

import RegisterPage from "@/pages/auth/RegisterPage";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockError = null;
    mockIsLoading = false;
  });

  // F1.6 - renders register form
  it("F1.6 - renders register form with email, password, and confirm password fields", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Địa chỉ email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Chọn mật khẩu an toàn")).toBeInTheDocument();
    expect(screen.getByText("Xác nhận mật khẩu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nhập lại mật khẩu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đăng ký" }),
    ).toBeInTheDocument();
  });

  // F1.7 - validates password match
  it("F1.7 - shows error when passwords do not match", async () => {
    render(<RegisterPage />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Chọn mật khẩu an toàn"), "password123");
    await user.type(screen.getByPlaceholderText("Nhập lại mật khẩu"), "differentPassword");
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    await waitFor(() => {
      expect(screen.getByText("Mật khẩu xác nhận không khớp")).toBeInTheDocument();
    });

    // register should NOT have been called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // F1.8 - redirects to /verify-email on success
  it("F1.8 - redirects to /verify-email on successful registration", async () => {
    mockRegister.mockResolvedValueOnce({
      id: 1,
      email: "test@example.com",
    });

    render(<RegisterPage />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Chọn mật khẩu an toàn"), "password123");
    await user.type(screen.getByPlaceholderText("Nhập lại mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng ký" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/verify-email", {
        state: { email: "test@example.com" },
      });
    });
  });
});
