import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useKgLpvJob } from "@/hooks/useKgLpvJob";
import { getDiff, getJob, startRepairBatch, startVerify } from "@/services/kgLpvApi";

vi.mock("@/services/kgLpvApi", () => ({
  getStatus: vi.fn(),
  startVerify: vi.fn(),
  getJob: vi.fn(),
  getReport: vi.fn(),
  dismissFinding: vi.fn(),
  startRepair: vi.fn(),
  startRepairBatch: vi.fn().mockResolvedValue({ job_id: 7 }),
  getDiff: vi.fn().mockResolvedValue([
    { section_id: "muc_tieu", before: "a", after: "b", findings_addressed: [1] },
  ]),
  applyDiff: vi.fn(),
}));

const mockedStartVerify = vi.mocked(startVerify);
const mockedGetJob = vi.mocked(getJob);
const mockedStartRepairBatch = vi.mocked(startRepairBatch);
const mockedGetDiff = vi.mocked(getDiff);

describe("useKgLpvJob.repairBatch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gọi startRepairBatch với items rồi tải diff sau khi job hoàn tất", async () => {
    mockedStartVerify.mockResolvedValue({ job_id: 7 });
    mockedGetJob.mockResolvedValue({ status: "repaired", progress: 100, stats: {} });
    mockedStartRepairBatch.mockResolvedValue({ job_id: 7 });
    mockedGetDiff.mockResolvedValue([
      { section_id: "muc_tieu", before: "a", after: "b", findings_addressed: [1] },
    ]);

    const { result } = renderHook(() => useKgLpvJob());

    // Cần jobId hiện có: dùng start() để job đạt trạng thái cuối trước.
    await act(async () => {
      await result.current.start(1);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.repairBatch([{ id: 1, explanation_override: "x" }]);
    });

    await waitFor(() =>
      expect(mockedStartRepairBatch).toHaveBeenCalledWith(7, [
        { id: 1, explanation_override: "x" },
      ])
    );
    await waitFor(() => expect(mockedGetDiff).toHaveBeenCalledWith(7));
    await waitFor(() =>
      expect(result.current.diffs).toEqual([
        { section_id: "muc_tieu", before: "a", after: "b", findings_addressed: [1] },
      ])
    );
  });

  it("không gọi API khi items rỗng", async () => {
    mockedStartVerify.mockResolvedValue({ job_id: 7 });
    mockedGetJob.mockResolvedValue({ status: "repaired", progress: 100, stats: {} });

    const { result } = renderHook(() => useKgLpvJob());

    await act(async () => {
      await result.current.start(1);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.repairBatch([]);
    });

    expect(mockedStartRepairBatch).not.toHaveBeenCalled();
  });
});
