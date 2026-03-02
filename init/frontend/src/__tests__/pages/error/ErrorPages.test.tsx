import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

import NotFoundPage from "@/pages/error/NotFoundPage";
import ServerErrorPage from "@/pages/error/ServerErrorPage";
import UnauthorizedPage from "@/pages/error/UnauthorizedPage";

describe("NotFoundPage", () => {
  it("shows the not-found title", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("Không tìm thấy trang")).toBeInTheDocument();
  });

  it("shows a description about the missing page", () => {
    render(<NotFoundPage />);
    expect(
      screen.getByText("Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.")
    ).toBeInTheDocument();
  });

  it("has navigation links back to login and home", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("Đăng nhập")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Trang chủ")).toHaveAttribute("href", "/account");
  });
});

describe("ServerErrorPage", () => {
  it("shows the server error title", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows a description about the error", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });

  it("has navigation links to account and sign-in", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("Go to your account")).toHaveAttribute("href", "/account");
    expect(screen.getByText("Sign in again")).toHaveAttribute("href", "/login");
  });
});

describe("UnauthorizedPage", () => {
  it("shows the access denied title", () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText("Access denied")).toBeInTheDocument();
  });

  it("shows a description about insufficient permissions", () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByText("You don\u2019t have permission to view this page.")
    ).toBeInTheDocument();
  });

  it("has navigation links to account and sign-in", () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText("Return to your account")).toHaveAttribute("href", "/account");
    expect(screen.getByText("Sign in with another account")).toHaveAttribute("href", "/login");
  });
});
