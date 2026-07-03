/**
 * KG-LPV Service - API calls kiểm chứng KHBD (/api/v1/kg-lpv)
 */
import { api } from "./authService";
import type {
  FindingOut,
  JobStatusResponse,
  KgLpvStatusResponse,
  ReportResponse,
  VerifyResponse,
} from "@/types/kgLpv";

/**
 * Trạng thái hiệu dụng module KG-LPV — luôn gọi được kể cả khi module tắt.
 */
export const getStatus = async (): Promise<KgLpvStatusResponse> => {
  const { data } = await api.get<KgLpvStatusResponse>("/kg-lpv/status");
  return data;
};

/**
 * Bắt đầu kiểm chứng 1 KHBD đã lưu — trả về job chạy nền.
 */
export const startVerify = async (lessonPlanId: number): Promise<VerifyResponse> => {
  const { data } = await api.post<VerifyResponse>("/kg-lpv/verify", {
    lesson_plan_id: lessonPlanId,
  });
  return data;
};

/**
 * Trạng thái job kiểm chứng — dùng để poll tiến độ.
 */
export const getJob = async (jobId: number): Promise<JobStatusResponse> => {
  const { data } = await api.get<JobStatusResponse>(`/kg-lpv/jobs/${jobId}`);
  return data;
};

/**
 * Sổ lỗi đầy đủ của job, nhóm theo nhánh N1/N2/N3.
 */
export const getReport = async (jobId: number): Promise<ReportResponse> => {
  const { data } = await api.get<ReportResponse>(`/kg-lpv/jobs/${jobId}/report`);
  return data;
};

/**
 * Bác bỏ 1 phát hiện (quyền tự chủ giáo viên).
 */
export const dismissFinding = async (findingId: number): Promise<FindingOut> => {
  const { data } = await api.post<FindingOut>(`/kg-lpv/findings/${findingId}/dismiss`);
  return data;
};

export const kgLpvApi = {
  getStatus,
  startVerify,
  getJob,
  getReport,
  dismissFinding,
};
