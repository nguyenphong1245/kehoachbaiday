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

const mockStudentLogin = vi.fn();
const mockResetError = vi.fn();
let mockError: string | null = null;
let mockIsLoading = false;

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    login: vi.fn(),
    register: vi.fn(),
    studentLogin: mockStudentLogin,
    isLoading: mockIsLoading,
    error: mockError,
    resetError: mockResetError,
  }),
}));

import StudentLoginPage from "@/pages/auth/StudentLoginPage";

describe("StudentLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockError = null;
    mockIsLoading = false;
  });

  // F1.4 - renders student login form
  it("F1.4 - renders student login form with username and password fields", () => {
    render(<StudentLoginPage />);

    expect(screen.getByText("Tài khoản")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("VD: HS07012015123")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("VD: 07012015")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Đăng nhập" }),
    ).toBeInTheDocument();
  });

  // F1.5 - redirects to /student/dashboard on success
  it("F1.5 - redirects to /student/dashboard on successful login", async () => {
    mockStudentLogin.mockResolvedValueOnce({
      user: { id: 2, username: "HS07012015123" },
    });

    render(<StudentLoginPage />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("VD: HS07012015123"), "HS07012015123");
    await user.type(screen.getByPlaceholderText("VD: 07012015"), "07012015");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(mockStudentLogin).toHaveBeenCalledWith({
        username: "HS07012015123",
        password: "07012015",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
    });
  });
});
