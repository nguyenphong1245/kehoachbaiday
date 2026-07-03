import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SummaryBar } from "@/components/kg-lpv/SummaryBar";
import type { ReportResponse } from "@/types/kgLpv";

const makeReport = (overrides: Partial<ReportResponse> = {}): ReportResponse => ({
  job_id: 1,
  status: "done",
  branches: [],
  unjudged: [],
  summary: { D1: 1, M2: 2, total_confirmed: 3, total_unjudged: 1 },
  ...overrides,
});

describe("SummaryBar", () => {
  it("counts only CONFIRMED findings, excluding unjudged from the error count", () => {
    render(<SummaryBar report={makeReport()} />);

    expect(screen.getByText("3 lỗi đã xác nhận")).toBeInTheDocument();
    expect(screen.getByText("D1: 1")).toBeInTheDocument();
    expect(screen.getByText("M2: 2")).toBeInTheDocument();
  });

  it("shows the unjudged count separately from the confirmed error count", () => {
    render(<SummaryBar report={makeReport()} />);

    expect(screen.getByText(/1 không phán xử được/)).toBeInTheDocument();
  });

  it("shows a clean state when there are no confirmed findings", () => {
    render(
      <SummaryBar
        report={makeReport({ summary: { total_confirmed: 0, total_unjudged: 0 } })}
      />
    );

    expect(screen.getByText("Không phát hiện lỗi")).toBeInTheDocument();
  });
});
