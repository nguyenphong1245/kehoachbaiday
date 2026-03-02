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

const mockLogin = vi.fn();
const mockResetError = vi.fn();
let mockError: string | null = null;
let mockIsLoading = false;

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    login: mockLogin,
    register: vi.fn(),
    studentLogin: vi.fn(),
    isLoading: mockIsLoading,
    error: mockError,
    resetError: mockResetError,
  }),
}));

import LoginPage from "@/pages/auth/LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockError = null;
    mockIsLoading = false;
  });

  // F1.1 - renders login form with email and password fields
  it("F1.1 - renders login form with email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đăng nhập" }),
    ).toBeInTheDocument();
  });

  // F1.2 - shows error message on failed login
  it("F1.2 - shows error message on failed login", () => {
    mockError = "Sai email hoặc mật khẩu";

    render(<LoginPage />);

    expect(screen.getByText("Sai email hoặc mật khẩu")).toBeInTheDocument();
  });

  // F1.3 - redirects to /lesson-builder on successful login
  it("F1.3 - redirects to /lesson-builder on successful login", async () => {
    mockLogin.mockResolvedValueOnce({
      user: { id: 1, email: "test@example.com" },
    });

    render(<LoginPage />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/lesson-builder");
    });
  });
});
