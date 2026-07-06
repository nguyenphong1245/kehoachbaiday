import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { VerificationPanel } from "@/components/kg-lpv/VerificationPanel";
import type { FindingOut, ReportResponse } from "@/types/kgLpv";

const makeFinding = (overrides: Partial<FindingOut>): FindingOut => ({
  id: 1,
  code: "D1",
  branch: "N1",
  truc: null,
  section_id: "muc_tieu",
  span: null,
  evidence: [{ ma_nguon: "CT2018" }],
  explanation: "Giải thích",
  status: "open",
  ...overrides,
});

const makeReport = (): ReportResponse => ({
  job_id: 1,
  status: "done",
  branches: [
    { branch: "N1", counts_by_code: { D1: 1 }, findings: [makeFinding({ id: 1, code: "D1", branch: "N1" })] },
    { branch: "N2", counts_by_code: { M2: 1 }, findings: [makeFinding({ id: 2, code: "M2", branch: "N2", section_id: "hoat_dong_1" })] },
    { branch: "N3", counts_by_code: {}, findings: [] },
  ],
  unjudged: [makeFinding({ id: 3, code: "M6", branch: "N2", status: "unjudged" })],
  summary: { D1: 1, M2: 1, total_confirmed: 2, total_unjudged: 1 },
});

describe("VerificationPanel", () => {
  it("renders findings grouped by branch (N1/N2/N3)", () => {
    render(
      <VerificationPanel
        open
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/N1 — Định danh/)).toBeInTheDocument();
    expect(screen.getByText(/N2 — Đối chiếu chương trình/)).toBeInTheDocument();
    // N3 has no confirmed findings — its header should not render
    expect(screen.queryByText(/N3 — Nhất quán sư phạm/)).not.toBeInTheDocument();
  });

  it("renders unjudged findings in a separate audit-only section", () => {
    render(
      <VerificationPanel
        open
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/Không phán xử được \(kiểm toán\)/)).toBeInTheDocument();
  });

  it("calls onDismiss when a confirmed finding's 'Bỏ qua' is clicked", async () => {
    const onDismiss = vi.fn();
    render(
      <VerificationPanel
        open
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={onDismiss}
      />
    );

    const dismissButtons = screen.getAllByRole("button", { name: /Bỏ qua/i });
    fireEvent.click(dismissButtons[0]);

    await waitFor(() => expect(onDismiss).toHaveBeenCalled());
  });

  it("shows step progress while the job is still running (no report yet)", () => {
    render(
      <VerificationPanel
        open
        onClose={vi.fn()}
        job={{ status: "verifying", progress: 40, stats: null }}
        report={null}
        progress={40}
        phase="Định danh & Đối chiếu"
        loading
        error={null}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText("Tách đoạn")).toBeInTheDocument();
    expect(screen.getAllByText("Định danh & Đối chiếu").length).toBeGreaterThan(0);
  });

  const makeOneOpenReport = (): ReportResponse => ({
    job_id: 1,
    status: "done",
    branches: [
      { branch: "N1", counts_by_code: {}, findings: [] },
      { branch: "N2", counts_by_code: { M2: 1 }, findings: [makeFinding({ id: 5, code: "M2", branch: "N2", section_id: "hoat_dong_1" })] },
      { branch: "N3", counts_by_code: {}, findings: [] },
    ],
    unjudged: [],
    summary: { M2: 1, total_confirmed: 1 },
  });

  it("docked variant: open finding is auto-selected and batch button calls onRepairBatch", () => {
    const onRepairBatch = vi.fn();
    render(
      <VerificationPanel
        open
        variant="docked"
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeOneOpenReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={vi.fn()}
        onLocate={vi.fn()}
        onRepairBatch={onRepairBatch}
      />
    );

    const batchButton = screen.getByRole("button", { name: /Sửa 1 lỗi đã chọn/i });
    fireEvent.click(batchButton);
    expect(onRepairBatch).toHaveBeenCalledWith([{ id: 5 }]);
  });

  it("docked variant: editing a finding's explanation includes explanation_override in the batch call", () => {
    const onRepairBatch = vi.fn();
    render(
      <VerificationPanel
        open
        variant="docked"
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeOneOpenReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={vi.fn()}
        onLocate={vi.fn()}
        onRepairBatch={onRepairBatch}
      />
    );

    // Mở chế độ sửa nhận xét (nút bút chì) rồi gõ nội dung mới
    fireEvent.click(screen.getByTitle("Sửa nhận xét"));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Giải thích mới" } });

    fireEvent.click(screen.getByRole("button", { name: /Sửa 1 lỗi đã chọn/i }));
    expect(onRepairBatch).toHaveBeenCalledWith([{ id: 5, explanation_override: "Giải thích mới" }]);
  });

  it("overlay variant (default): no batch button is rendered", () => {
    render(
      <VerificationPanel
        open
        onClose={vi.fn()}
        job={{ status: "done", progress: 100, stats: null }}
        report={makeOneOpenReport()}
        progress={100}
        phase="Hoàn tất"
        loading={false}
        error={null}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /lỗi đã chọn/i })).not.toBeInTheDocument();
  });
});
