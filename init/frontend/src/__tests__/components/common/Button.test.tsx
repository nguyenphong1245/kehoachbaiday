import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/common/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders with default variant styles", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button", { name: "Default" });
    // Default variant applies bg-brand class
    expect(btn.className).toContain("bg-brand");
  });

  it("renders with ghost variant styles", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).toContain("bg-transparent");
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    await user.click(screen.getByRole("button", { name: "Clickable" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables when disabled prop is set", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Disabled" });
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("forwards additional props to the button element", () => {
    render(<Button data-testid="custom-btn" type="submit">Submit</Button>);
    const btn = screen.getByTestId("custom-btn");
    expect(btn).toHaveAttribute("type", "submit");
  });
});
