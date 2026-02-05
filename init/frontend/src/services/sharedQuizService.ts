import { api } from "./authService";

export interface QuizQuestion {
  id: string;
  question: string;
  type: string; // Luôn là "multiple_choice"
  options: Record<string, string>; // {A: "...", B: "...", C: "...", D: "..."}
  correct_answer: string; // 1 chữ cái: A, B, C, hoặc D
}

export interface QuizPublic {
  title: string;
  description?: string;
  total_questions: number;
  time_limit?: number;
  questions: QuizQuestion[];
}

export interface StartQuizSessionRequest {
  student_name: string;
  student_class: string;
}

export interface StartQuizSessionResponse {
  session_token: string;
}

export interface SubmitQuizRequest {
  student_name: string;
  student_class: string;
  student_group?: string;
  student_email?: string;
  answers: Record<string, string>; // {question_1: "A", question_2: "B", ...}
  time_spent?: number;
  session_token: string;
}

export interface SubmitQuizResponse {
  response_id: number;
  score: number;
  total_correct: number;
  total_questions: number;
  percentage: number;
  correct_answers?: Record<string, string>;
}

export interface QuizQuestionInput {
  question: string;
  type?: string;
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  answer?: string;
}

export interface LessonInfo {
  book_type?: string;
  grade?: string;
  topic?: string;
  lesson_name?: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  content?: string; // Optional - fallback nếu không có questions
  questions?: QuizQuestionInput[]; // Trực tiếp từ LLM JSON
  time_limit?: number;
  expires_in_days?: number;
  show_correct_answers?: boolean;
  allow_multiple_attempts?: boolean;
  lesson_info?: LessonInfo;
}

export interface CreateQuizResponse {
  quiz_id: number;
  share_code: string;
  share_url: string;
  title: string;
  total_questions: number;
  expires_at: string;
}

export interface SharedQuiz {
  id: number;
  share_code: string;
  title: string;
  description?: string;
  total_questions: number;
  time_limit?: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  show_correct_answers: boolean;
  allow_multiple_attempts: boolean;
  response_count: number;
  lesson_info?: LessonInfo;
}

export interface QuizResponseItem {
  id: number;
  student_name: string;
  student_class: string;
  student_group?: string;
  student_email?: string;
  score: number;
  total_correct: number;
  total_questions: number;
  percentage: number;
  submitted_at: string;
  time_spent?: number;
}

export interface QuizResponsesList {
  quiz_title: string;
  total_responses: number;
  responses: QuizResponseItem[];
}

/**
 * Lấy thông tin quiz công khai (cho học sinh)
 */
export const getPublicQuiz = async (shareCode: string): Promise<QuizPublic> => {
  const response = await api.get(`/quizzes/public/${shareCode}`);
  return response.data;
};

/**
 * Bắt đầu phiên làm bài quiz - trả về session token
 */
export const startQuizSession = async (
  shareCode: string,
  request: StartQuizSessionRequest
): Promise<StartQuizSessionResponse> => {
  const response = await api.post(`/quizzes/public/${shareCode}/start-session`, request);
  return response.data;
};

/**
 * Nộp bài quiz
 */
export const submitQuiz = async (
  shareCode: string,
  data: SubmitQuizRequest
): Promise<SubmitQuizResponse> => {
  const response = await api.post(`/quizzes/public/${shareCode}/submit`, data);
  return response.data;
};

/**
 * Tạo quiz chia sẻ mới
 */
export const createSharedQuiz = async (
  data: CreateQuizRequest
): Promise<CreateQuizResponse> => {
  const response = await api.post("/quizzes/", data);
  return response.data;
};

/**
 * Lấy danh sách quiz đã tạo
 */
export const getMyQuizzes = async (): Promise<SharedQuiz[]> => {
  const response = await api.get("/quizzes/my-quizzes");
  return response.data;
};

/**
 * Lấy danh sách bài làm của học sinh
 */
export const getQuizResponses = async (
  quizId: number
): Promise<QuizResponsesList> => {
  const response = await api.get(`/quizzes/${quizId}/responses`);
  return response.data;
};

/**
 * Lấy chi tiết quiz (bao gồm questions với đáp án đúng)
 */
export const getQuizDetail = async (
  quizId: number
): Promise<{
  id: number;
  title: string;
  questions: QuizQuestion[];
  time_limit?: number;
  show_correct_answers: boolean;
}> => {
  const response = await api.get(`/quizzes/${quizId}/detail`);
  return response.data;
};

/**
 * Cập nhật quiz
 */
export const updateQuiz = async (
  quizId: number,
  data: {
    title?: string;
    questions?: QuizQuestion[];
    time_limit?: number;
    show_correct_answers?: boolean;
  }
): Promise<{ message: string; id: number }> => {
  const response = await api.patch(`/quizzes/${quizId}`, data);
  return response.data;
};

/**
 * Xóa quiz
 */
export const deleteQuiz = async (quizId: number): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

/**
 * Bật/tắt trạng thái active của quiz
 */
export const toggleQuizActive = async (quizId: number): Promise<SharedQuiz> => {
  const response = await api.patch(`/quizzes/${quizId}/toggle-active`);
  return response.data;
};

/**
 * Lấy thống kê quiz
 */
export interface QuizStatistics {
  total_responses: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  average_time_spent?: number;
  score_distribution: Record<string, number>;
}

export const getQuizStatistics = async (
  quizId: number
): Promise<QuizStatistics> => {
  const response = await api.get(`/quizzes/${quizId}/statistics`);
  return response.data;
};
