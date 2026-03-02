import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

describe("Sidebar", () => {
  const renderSidebar = () => {
    return render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it("renders the sidebar element", () => {
    renderSidebar();
    // The sidebar renders an <aside> element
    expect(document.querySelector("aside")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderSidebar();
    // Check for the known navigation items
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("contains the expected navigation labels", () => {
    renderSidebar();
    // Desktop sidebar is expanded by default and should show labels
    expect(screen.getAllByText("Tổng quan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Tài khoản").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Lớp học").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the logo image", () => {
    renderSidebar();
    const logos = screen.getAllByAltText("Logo");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders toggle sidebar buttons", () => {
    renderSidebar();
    const toggleButtons = screen.getAllByLabelText("Toggle sidebar");
    expect(toggleButtons.length).toBeGreaterThanOrEqual(1);
  });
});
