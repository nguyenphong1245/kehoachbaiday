import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";

describe("Header", () => {
  it("renders the title", () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders with a description", () => {
    render(<Header title="Settings" description="Manage your preferences" />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage your preferences")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<Header title="Page Title" />);
    const header = screen.getByRole("banner");
    // Only the title heading should be present, no <p> tag for description
    expect(header.querySelectorAll("p")).toHaveLength(0);
  });

  it("renders actions when provided", () => {
    render(
      <Header
        title="Users"
        actions={<button>Add User</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add User" })).toBeInTheDocument();
  });

  it("does not render actions container when actions not provided", () => {
    const { container } = render(<Header title="Simple" />);
    // The header should only have one direct child div (the title area)
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });
});
