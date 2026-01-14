/**
 * Shared Worksheets Service - API calls cho phiếu học tập chia sẻ
 */
import { api } from "./authService";

// ============== TYPES ==============

export interface CreateSharedWorksheetRequest {
  title: string;
  content: string;
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
  expires_hours?: number;
  max_submissions?: number;
}

export interface SharedWorksheet {
  id: number;
  share_code: string;
  share_url: string;
  title: string;
  is_active: boolean;
  expires_at?: string;
  max_submissions?: number;
  response_count: number;
  created_at: string;
}

export interface WorksheetQuestion {
  id: string;
  number: number;
  text: string;
  type: string;
}

export interface WorksheetPublic {
  title: string;
  content: string;
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
  sections?: {
    section_id: string;
    section_type: string;
    title: string;
    content: string;
  }[];
  questions?: WorksheetQuestion[];
  is_active: boolean;
  teacher_name?: string;
}

export interface SubmitWorksheetRequest {
  student_name: string;
  student_class?: string;
  answers: Record<string, string>;
}

export interface WorksheetResponseItem {
  id: number;
  student_name: string;
  student_class?: string;
  answers: Record<string, string>;
  submitted_at: string;
}

export interface WorksheetResponsesList {
  worksheet_id: number;
  title: string;
  total_responses: number;
  responses: WorksheetResponseItem[];
}

// ============== API CALLS ==============

/**
 * Tạo phiếu học tập chia sẻ mới
 */
export const createSharedWorksheet = async (
  request: CreateSharedWorksheetRequest
): Promise<{ id: number; share_code: string; share_url: string; title: string; message: string }> => {
  const { data } = await api.post("/worksheets/share", request);
  return data;
};

/**
 * Lấy danh sách phiếu học tập của tôi
 */
export const getMySharedWorksheets = async (): Promise<{
  worksheets: SharedWorksheet[];
  total: number;
}> => {
  const { data } = await api.get("/worksheets/my-worksheets");
  return data;
};

/**
 * Lấy danh sách câu trả lời của học sinh
 */
export const getWorksheetResponses = async (
  worksheetId: number
): Promise<WorksheetResponsesList> => {
  const { data } = await api.get(`/worksheets/${worksheetId}/responses`);
  return data;
};

/**
 * Xóa phiếu học tập
 */
export const deleteSharedWorksheet = async (
  worksheetId: number
): Promise<{ message: string }> => {
  const { data } = await api.delete(`/worksheets/${worksheetId}`);
  return data;
};

/**
 * Bật/tắt phiếu học tập
 */
export const toggleWorksheetActive = async (
  worksheetId: number
): Promise<{ message: string; is_active: boolean }> => {
  const { data } = await api.patch(`/worksheets/${worksheetId}/toggle-active`);
  return data;
};

// ============== PUBLIC API (Không cần auth) ==============

/**
 * Lấy phiếu học tập theo mã chia sẻ (public)
 */
export const getPublicWorksheet = async (
  shareCode: string
): Promise<WorksheetPublic> => {
  const { data } = await api.get(`/worksheets/public/${shareCode}`);
  return data;
};

/**
 * Submit câu trả lời (public)
 */
export const submitWorksheet = async (
  shareCode: string,
  request: SubmitWorksheetRequest
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post(`/worksheets/public/${shareCode}/submit`, request);
  return data;
};
