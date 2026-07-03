/**
 * KG-LPV Service - API calls kiểm chứng KHBD (/api/v1/kg-lpv)
 */
import { api } from "./authService";
import type {
  ApplyResponse,
  FindingOut,
  JobStatusResponse,
  KgLpvStatusResponse,
  RepairResponse,
  ReportResponse,
  SectionDiff,
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

/**
 * Bước 4 — bắt đầu sửa & kiểm lại (chạy nền). `findingIds` rỗng = sửa tất cả
 * finding `status="open"` của job.
 */
export const startRepair = async (jobId: number, findingIds: number[] = []): Promise<RepairResponse> => {
  const { data } = await api.post<RepairResponse>(`/kg-lpv/jobs/${jobId}/repair`, {
    finding_ids: findingIds,
  });
  return data;
};

/**
 * Các đoạn đã sửa của job (before/after + findings_addressed).
 */
export const getDiff = async (jobId: number): Promise<SectionDiff[]> => {
  const { data } = await api.get<SectionDiff[]>(`/kg-lpv/jobs/${jobId}/diff`);
  return data;
};

/**
 * Ghi các đoạn đã sửa (được giáo viên duyệt) vào KHBD. `sectionIds` rỗng/không
 * truyền = áp dụng mọi section đang `status="repaired"`.
 */
export const applyDiff = async (jobId: number, sectionIds?: string[]): Promise<ApplyResponse> => {
  const { data } = await api.post<ApplyResponse>(`/kg-lpv/jobs/${jobId}/apply`, {
    section_ids: sectionIds && sectionIds.length > 0 ? sectionIds : null,
  });
  return data;
};

export const kgLpvApi = {
  getStatus,
  startVerify,
  getJob,
  getReport,
  dismissFinding,
  startRepair,
  getDiff,
  applyDiff,
};
