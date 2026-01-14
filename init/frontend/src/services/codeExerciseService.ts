import { api } from "./authService";
import {
  CreateCodeExerciseRequest,
  CreateCodeExerciseResponse,
  PublicCodeExerciseResponse,
  SubmitParsonsRequest,
  SubmitCodingRequest,
  SubmitExerciseResponse,
  TeacherExerciseListResponse,
  ExerciseSubmissionsResponse,
  GenerateCodeExerciseRequest,
  GenerateCodeExerciseResponse,
} from "../types/codeExercise";

const API_BASE = "/code-exercises";

/**
 * Tạo và chia sẻ bài tập code
 */
export async function createCodeExercise(
  request: CreateCodeExerciseRequest
): Promise<CreateCodeExerciseResponse> {
  const response = await api.post<CreateCodeExerciseResponse>(API_BASE, request);
  return response.data;
}

/**
 * Lấy thông tin bài tập công khai (cho học sinh)
 */
export async function getPublicExercise(
  shareCode: string
): Promise<PublicCodeExerciseResponse> {
  const response = await api.get<PublicCodeExerciseResponse>(
    `${API_BASE}/public/${shareCode}`
  );
  return response.data;
}

/**
 * Nộp bài Parsons (ghép thẻ code)
 */
export async function submitParsons(
  shareCode: string,
  request: SubmitParsonsRequest
): Promise<SubmitExerciseResponse> {
  const response = await api.post<SubmitExerciseResponse>(
    `${API_BASE}/public/${shareCode}/submit/parsons`,
    request
  );
  return response.data;
}

/**
 * Nộp bài Coding (viết code)
 */
export async function submitCoding(
  shareCode: string,
  request: SubmitCodingRequest
): Promise<SubmitExerciseResponse> {
  const response = await api.post<SubmitExerciseResponse>(
    `${API_BASE}/public/${shareCode}/submit/coding`,
    request
  );
  return response.data;
}

/**
 * Lấy danh sách bài tập của giáo viên
 */
export async function getMyExercises(): Promise<TeacherExerciseListResponse> {
  const response = await api.get<TeacherExerciseListResponse>(`${API_BASE}/my`);
  return response.data;
}

/**
 * Lấy danh sách bài nộp của bài tập
 */
export async function getExerciseSubmissions(
  shareCode: string
): Promise<ExerciseSubmissionsResponse> {
  const response = await api.get<ExerciseSubmissionsResponse>(
    `${API_BASE}/${shareCode}/submissions`
  );
  return response.data;
}

/**
 * Xóa bài tập
 */
export async function deleteExercise(shareCode: string): Promise<void> {
  await api.delete(`${API_BASE}/${shareCode}`);
}

/**
 * Tạo bài tập code bằng AI từ nội dung section
 */
export async function generateCodeExercise(
  request: GenerateCodeExerciseRequest
): Promise<GenerateCodeExerciseResponse> {
  const response = await api.post<GenerateCodeExerciseResponse>(
    `${API_BASE}/generate`,
    request
  );
  return response.data;
}
