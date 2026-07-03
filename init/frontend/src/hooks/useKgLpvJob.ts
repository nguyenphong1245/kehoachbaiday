/**
 * Hook chạy + theo dõi job kiểm chứng KG-LPV.
 * `start(lessonPlanId)` tạo job rồi poll `GET /jobs/{id}` mỗi ~2.5s, dừng khi
 * job đạt trạng thái cuối (done/failed/repaired) — khi đó tải sổ lỗi (report).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { dismissFinding, getJob, getReport, startVerify } from "@/services/kgLpvApi";
import type { JobStatusResponse, ReportResponse } from "@/types/kgLpv";

const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = new Set(["done", "failed", "repaired"]);

const PHASE_LABELS: Record<string, string> = {
  pending: "Đang chờ",
  segmenting: "Tách đoạn",
  verifying: "Định danh & Đối chiếu",
  verifying_n3: "Nhất quán sư phạm",
  repairing: "Đang sửa",
  re_verifying: "Đang kiểm lại",
  done: "Hoàn tất",
  failed: "Thất bại",
  repaired: "Hoàn tất",
};

export interface UseKgLpvJobResult {
  job: JobStatusResponse | null;
  report: ReportResponse | null;
  progress: number;
  phase: string;
  loading: boolean;
  error: string | null;
  start: (lessonPlanId: number) => Promise<void>;
  dismiss: (findingId: number) => Promise<void>;
}

export function useKgLpvJob(): UseKgLpvJobResult {
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Dừng polling khi unmount
  useEffect(() => stopPolling, [stopPolling]);

  const poll = useCallback(async () => {
    if (jobIdRef.current === null) return;
    try {
      const jobStatus = await getJob(jobIdRef.current);
      setJob(jobStatus);

      if (TERMINAL_STATUSES.has(jobStatus.status)) {
        stopPolling();
        setLoading(false);

        if (jobStatus.status !== "failed") {
          try {
            const reportData = await getReport(jobIdRef.current);
            setReport(reportData);
          } catch (err: any) {
            setError(err.response?.data?.detail || "Không thể tải sổ lỗi");
          }
        }
      }
    } catch (err: any) {
      stopPolling();
      setLoading(false);
      setError(err.response?.data?.detail || "Không thể lấy trạng thái kiểm chứng");
    }
  }, [stopPolling]);

  const start = useCallback(
    async (lessonPlanId: number) => {
      stopPolling();
      setError(null);
      setReport(null);
      setJob(null);
      setLoading(true);
      try {
        const { job_id } = await startVerify(lessonPlanId);
        jobIdRef.current = job_id;
        await poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data?.detail || "Không thể bắt đầu kiểm chứng");
      }
    },
    [poll, stopPolling]
  );

  const dismiss = useCallback(async (findingId: number) => {
    await dismissFinding(findingId);
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        branches: prev.branches.map((b) => ({
          ...b,
          findings: b.findings.map((f) =>
            f.id === findingId ? { ...f, status: "dismissed" as const } : f
          ),
        })),
      };
    });
  }, []);

  const progress = job?.progress ?? 0;
  const phase = job ? PHASE_LABELS[job.status] ?? job.status : "";

  return { job, report, progress, phase, loading, error, start, dismiss };
}
