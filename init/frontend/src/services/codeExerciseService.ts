/**
 * Code Exercise Service - API calls cho bài tập lập trình
 */
import { api } from "./authService";

// ============== TYPES ==============

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface CreateCodeExerciseRequest {
  title: string;
  description?: string;
  language?: string;
  problem_statement: string;
  starter_code?: string;
  test_cases: TestCase[];
  time_limit_seconds?: number;
  memory_limit_mb?: number;
  expires_in_days?: number;
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
}

export interface CreateCodeExerciseResponse {
  exercise_id: number;
  share_code: string;
  share_url: string;
  title: string;
  total_test_cases: number;
  expires_at: string;
}

export interface CodeExercise {
  id: number;
  share_code: string;
  title: string;
  description?: string;
  language: string;
  total_test_cases: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  submission_count: number;
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
}

export interface TestCasePublic {
  input: string;
  expected_output: string;
}

export interface CodeExercisePublic {
  title: string;
  description?: string;
  language: string;
  problem_statement: string;
  starter_code?: string;
  test_cases: TestCasePublic[];
  time_limit_seconds: number;
}

export interface RunCodeRequest {
  code: string;
  language?: string;
  stdin?: string;
}

export interface RunCodeResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms?: number;
  timed_out: boolean;
}

export interface StartSessionRequest {
  student_name: string;
  student_class: string;
}

export interface StartSessionResponse {
  session_token: string;
}

export interface SubmitCodeRequest {
  student_name: string;
  student_class: string;
  student_group?: string;
  code: string;
  language?: string;
  session_token: string;
}

export interface TestResultItem {
  test_num: number;
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  is_hidden: boolean;
  error?: string;
}

export interface SubmitCodeResponse {
  submission_id: number;
  status: string; // passed, failed, error, timeout
  total_tests: number;
  passed_tests: number;
  percentage: number;
  test_results: TestResultItem[];
  execution_time_ms?: number;
}

export interface SubmissionItem {
  id: number;
  student_name: string;
  student_class: string;
  student_group?: string;
  status: string;
  total_tests: number;
  passed_tests: number;
  percentage: number;
  code: string;
  submitted_at: string;
  execution_time_ms?: number;
}

export interface SubmissionsListResponse {
  exercise_title: string;
  total_submissions: number;
  submissions: SubmissionItem[];
}

// ============== Statistics Types ==============

export interface CodeExerciseStatistics {
  total_submissions: number;
  pass_rate: number;
  average_percentage: number;
  highest_percentage: number;
  lowest_percentage: number;
  average_execution_time_ms: number;
  status_distribution: Record<string, number>;
  score_distribution: Record<string, number>;
}

// ============== Code Extraction Types ==============

export interface ExtractCodeExercisesRequest {
  lesson_plan_content: string;
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
  auto_create: boolean;
  expires_in_days?: number;
}

export interface ExtractedExerciseItem {
  title: string;
  description: string;
  source_activity: string;
  language: string;
  starter_code?: string;
  test_cases: TestCase[];
  lesson_info?: {
    book_type?: string;
    grade?: string;
    topic?: string;
    lesson_name?: string;
  };
}

export interface ExtractCodeExercisesResponse {
  found: boolean;
  exercises: ExtractedExerciseItem[];
  reason?: string;
  created_exercises?: CreateCodeExerciseResponse[];
}

// ============== AUTHENTICATED API (Giáo viên) ==============

export const createCodeExercise = async (
  request: CreateCodeExerciseRequest
): Promise<CreateCodeExerciseResponse> => {
  const { data } = await api.post("/code-exercises/", request);
  return data;
};

export const getMyCodeExercises = async (): Promise<CodeExercise[]> => {
  const { data } = await api.get("/code-exercises/my-exercises");
  return data;
};

export const getExerciseSubmissions = async (
  exerciseId: number
): Promise<SubmissionsListResponse> => {
  const { data } = await api.get(`/code-exercises/${exerciseId}/submissions`);
  return data;
};

export const deleteCodeExercise = async (
  exerciseId: number
): Promise<void> => {
  await api.delete(`/code-exercises/${exerciseId}`);
};

export const toggleExerciseActive = async (
  exerciseId: number
): Promise<{ message: string; is_active: boolean }> => {
  const { data } = await api.patch(
    `/code-exercises/${exerciseId}/toggle-active`
  );
  return data;
};

export const getExerciseStatistics = async (
  exerciseId: number
): Promise<CodeExerciseStatistics> => {
  const { data } = await api.get(`/code-exercises/${exerciseId}/statistics`);
  return data;
};

// ============== Teacher View & Update Types ==============

export interface TestCaseTeacher {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface CodeExerciseTeacherView {
  title: string;
  description?: string;
  language: string;
  problem_statement: string;
  starter_code?: string;
  test_cases: TestCaseTeacher[];
  time_limit_seconds: number;
}

export interface UpdateCodeExerciseRequest {
  starter_code?: string;
  test_cases?: TestCaseTeacher[];
}

// ============== Teacher View & Update API ==============

export const getTeacherExercise = async (
  shareCode: string
): Promise<CodeExerciseTeacherView> => {
  const { data } = await api.get(`/code-exercises/public/${shareCode}/teacher`);
  return data;
};

export const updateExerciseByShareCode = async (
  shareCode: string,
  request: UpdateCodeExerciseRequest
): Promise<{ message: string }> => {
  const { data } = await api.put(
    `/code-exercises/public/${shareCode}/update`,
    request
  );
  return data;
};

// ============== Code Extraction API ==============

export const extractCodeExercisesFromLesson = async (
  request: ExtractCodeExercisesRequest
): Promise<ExtractCodeExercisesResponse> => {
  const { data } = await api.post(
    "/code-exercises/extract-from-lesson",
    request
  );
  return data;
};

// ============== PUBLIC API (Học sinh) ==============

export const getPublicExercise = async (
  shareCode: string
): Promise<CodeExercisePublic> => {
  const { data } = await api.get(`/code-exercises/public/${shareCode}`);
  return data;
};

export const startCodeSession = async (
  shareCode: string,
  request: StartSessionRequest
): Promise<StartSessionResponse> => {
  const { data } = await api.post(
    `/code-exercises/public/${shareCode}/start-session`,
    request
  );
  return data;
};

export const runCode = async (
  shareCode: string,
  request: RunCodeRequest
): Promise<RunCodeResponse> => {
  const { data } = await api.post(
    `/code-exercises/public/${shareCode}/run`,
    request
  );
  return data;
};

export const submitCode = async (
  shareCode: string,
  request: SubmitCodeRequest
): Promise<SubmitCodeResponse> => {
  const { data } = await api.post(
    `/code-exercises/public/${shareCode}/submit`,
    request
  );
  return data;
};

// ============== Hint (Phân tích lỗi) ==============

export interface FailedTestInfo {
  test_num: number;
  input: string;
  expected_output: string;
  actual_output: string;
  error?: string;
}

export interface HintRequest {
  code: string;
  failed_tests: FailedTestInfo[];
}

export interface HintResponse {
  hint: string;
}

export const getHint = async (
  shareCode: string,
  request: HintRequest
): Promise<HintResponse> => {
  const { data } = await api.post(
    `/code-exercises/public/${shareCode}/hint`,
    request
  );
  return data;
};
