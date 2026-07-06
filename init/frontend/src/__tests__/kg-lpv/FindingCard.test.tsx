import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { FindingCard } from "@/components/kg-lpv/FindingCard";
import type { FindingOut } from "@/types/kgLpv";

const baseFinding: FindingOut = {
  id: 1,
  code: "D1",
  branch: "N1",
  truc: null,
  section_id: "muc_tieu",
  span: null,
  evidence: [{ ma_nguon: "CT2018", so_ky_hieu: "01/2018", vi_tri_trang: "12" }],
  explanation: "Sai định danh bài học",
  status: "open",
};

describe("FindingCard", () => {
  it("renders code badge, branch, explanation and evidence", () => {
    render(<FindingCard finding={baseFinding} />);

    expect(screen.getByText("D1")).toBeInTheDocument();
    expect(screen.getByText(/N1/)).toBeInTheDocument();
    expect(screen.getByText("Sai định danh bài học")).toBeInTheDocument();
    expect(screen.getByText(/CT2018/)).toBeInTheDocument();
  });

  it("calls onDismiss with the finding id when 'Bỏ qua' is clicked", async () => {
    const onDismiss = vi.fn().mockResolvedValue(undefined);
    render(<FindingCard finding={baseFinding} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: /Bỏ qua/i }));

    await waitFor(() => expect(onDismiss).toHaveBeenCalledWith(1));
  });

  it("calls onLocate with the section_id when the location button is clicked", () => {
    const onLocate = vi.fn();
    render(<FindingCard finding={baseFinding} onLocate={onLocate} />);

    fireEvent.click(screen.getByText("muc_tieu"));

    expect(onLocate).toHaveBeenCalledWith("muc_tieu");
  });

  it("shows a distinct muted badge and NO dismiss button for status='unjudged'", () => {
    const unjudged: FindingOut = { ...baseFinding, id: 2, status: "unjudged" };
    const onDismiss = vi.fn();
    render(<FindingCard finding={unjudged} onDismiss={onDismiss} />);

    expect(screen.getByText("Không phán xử được")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Bỏ qua/i })).not.toBeInTheDocument();
  });

  it("cho sửa nhận xét và gọi onExplanationChange", () => {
    const onExplanationChange = vi.fn();
    const finding = { id: 1, code: "M2", branch: "N2", truc: null, section_id: "muc_tieu", span: null, evidence: [], explanation: "gốc", status: "open" };
    render(<FindingCard finding={finding as any} selectable selected onToggleSelect={vi.fn()} onExplanationChange={onExplanationChange} />);
    fireEvent.click(screen.getByTitle("Sửa nhận xét"));
    const ta = screen.getByRole("textbox");
    fireEvent.change(ta, { target: { value: "GV chỉnh" } });
    expect(onExplanationChange).toHaveBeenCalledWith(1, "GV chỉnh");
  });

  it("checkbox chọn gọi onToggleSelect; unjudged không có checkbox", () => {
    const onToggleSelect = vi.fn();
    const open = { id: 1, code: "M2", branch: "N2", truc: null, section_id: "s", span: null, evidence: [], explanation: "x", status: "open" };
    const { rerender } = render(<FindingCard finding={open as any} selectable selected={false} onToggleSelect={onToggleSelect} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelect).toHaveBeenCalledWith(1, true);
    const unjudged = { ...open, status: "unjudged" };
    rerender(<FindingCard finding={unjudged as any} selectable onToggleSelect={onToggleSelect} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
