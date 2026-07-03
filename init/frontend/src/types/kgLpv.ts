/**
 * Types module KG-LPV — mirror trực tiếp các Pydantic schema backend
 * (`init/backend/app/modules/kg_lpv/schemas.py`).
 */

export interface GraphStatus {
  connected: boolean;
  node_count?: number | null;
}

export type KgLpvAvailability = "ok" | "degraded" | "disabled";

export interface KgLpvStatusResponse {
  enabled: boolean;
  availability: KgLpvAvailability;
  graph: GraphStatus;
  version: string;
}

export interface VerifyResponse {
  job_id: number;
}

export interface JobStatusResponse {
  status: string;
  progress: number;
  stats: Record<string, unknown> | null;
}

/** Một mục bằng chứng — dạng {kg_node_id, ma_nguon, so_ky_hieu, ngay_hieu_luc, vi_tri_trang, trich_dan} hoặc {text_span}. */
export type FindingEvidence = Record<string, unknown>;

export type FindingStatus =
  | "open"
  | "repaired"
  | "dismissed"
  | "reverified_ok"
  | "reverified_fail"
  | "unjudged";

export interface FindingOut {
  id: number;
  code: string;
  branch: "N1" | "N2" | "N3";
  truc: number | null;
  section_id: string;
  span: Record<string, unknown> | null;
  evidence: FindingEvidence[];
  explanation: string;
  status: FindingStatus;
}

export interface BranchReport {
  branch: string;
  counts_by_code: Record<string, number>;
  findings: FindingOut[];
}

export interface ReportResponse {
  job_id: number;
  status: string;
  branches: BranchReport[];
  unjudged: FindingOut[];
  summary: Record<string, number>;
}
