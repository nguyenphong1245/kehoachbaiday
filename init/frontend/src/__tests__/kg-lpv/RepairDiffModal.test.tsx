import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { RepairDiffModal } from "@/components/kg-lpv/RepairDiffModal";
import type { SectionDiff } from "@/types/kgLpv";

const diffs: SectionDiff[] = [
  {
    section_id: "muc_tieu",
    before: "Mục tiêu cũ.",
    after: "Mục tiêu đã sửa.",
    findings_addressed: [1],
  },
  {
    section_id: "khoi_dong",
    before: "Nội dung cũ.",
    after: "Nội dung đã sửa.",
    findings_addressed: [2],
  },
];

describe("RepairDiffModal", () => {
  it("renders before/after content for every section diff", () => {
    render(<RepairDiffModal open diffs={diffs} onClose={vi.fn()} onApply={vi.fn()} />);

    expect(screen.getByText("muc_tieu")).toBeInTheDocument();
    expect(screen.getByText("Mục tiêu cũ.")).toBeInTheDocument();
    expect(screen.getByText("Mục tiêu đã sửa.")).toBeInTheDocument();
    expect(screen.getByText("khoi_dong")).toBeInTheDocument();
    expect(screen.getByText("Nội dung cũ.")).toBeInTheDocument();
    expect(screen.getByText("Nội dung đã sửa.")).toBeInTheDocument();
  });

  it("calls onApply with the section ids that remain approved", async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(<RepairDiffModal open diffs={diffs} onClose={vi.fn()} onApply={onApply} />);

    // Bỏ duyệt đoạn "khoi_dong" — chỉ "muc_tieu" còn được duyệt.
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    fireEvent.click(screen.getByRole("button", { name: /Áp dụng/i }));

    await waitFor(() => expect(onApply).toHaveBeenCalledWith(["muc_tieu"]));
  });

  it("calls onApply with all section ids when none are unchecked", async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(<RepairDiffModal open diffs={diffs} onClose={vi.fn()} onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Áp dụng/i }));

    await waitFor(() =>
      expect(onApply).toHaveBeenCalledWith(expect.arrayContaining(["muc_tieu", "khoi_dong"]))
    );
    expect(onApply.mock.calls[0][0]).toHaveLength(2);
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<RepairDiffModal open diffs={diffs} onClose={onClose} onApply={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Đóng"));

    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when open=false", () => {
    render(<RepairDiffModal open={false} diffs={diffs} onClose={vi.fn()} onApply={vi.fn()} />);

    expect(screen.queryByText("muc_tieu")).not.toBeInTheDocument();
  });
});
