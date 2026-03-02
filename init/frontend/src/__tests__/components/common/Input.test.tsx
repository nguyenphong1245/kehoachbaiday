import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/common/Input";

describe("Input", () => {
  it("renders with a label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows required indicator (asterisk) when required", () => {
    render(<Input label="Name" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show asterisk when not required", () => {
    render(<Input label="Name" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("displays a string error message", () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  it("displays generic 'Invalid' when error is boolean true", () => {
    render(<Input label="Email" error={true} />);
    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });

  it("does not display error message when error is falsy", () => {
    render(<Input label="Email" />);
    expect(screen.queryByText("Invalid")).not.toBeInTheDocument();
  });

  it("handles change events", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input label="Username" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "hello");

    expect(handleChange).toHaveBeenCalledTimes(5); // one per character
  });

  it("renders without a label when label prop is omitted", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
});
