import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

import NotFoundPage from "@/pages/error/NotFoundPage";
import ServerErrorPage from "@/pages/error/ServerErrorPage";

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
    expect(screen.getByText("Trang chủ")).toHaveAttribute("href", "/lesson-builder");
  });
});

describe("ServerErrorPage", () => {
  it("shows the server error title", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("Đã xảy ra lỗi")).toBeInTheDocument();
  });

  it("shows a description about the error", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("Hệ thống gặp lỗi không mong muốn.")).toBeInTheDocument();
  });

  it("has navigation links to account and sign-in", () => {
    render(<ServerErrorPage />);
    expect(screen.getByText("Quay về trang chính")).toHaveAttribute("href", "/lesson-builder");
    expect(screen.getByText("Đăng nhập lại")).toHaveAttribute("href", "/login");
  });
});

