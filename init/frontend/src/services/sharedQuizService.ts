import { api } from "./authService";

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>; // {A: "...", B: "...", C: "...", D: "..."}
  correct_answer?: string;
}

export interface QuizPublic {
  title: string;
  description?: string;
  total_questions: number;
  time_limit?: number;
  questions: QuizQuestion[];
}

export interface SubmitQuizRequest {
  student_name: string;
  student_class: string;
  student_email?: string;
  answers: Record<string, string>; // {question_1: "A", question_2: "B", ...}
  time_spent?: number;
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
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
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
}

export interface QuizResponseItem {
  id: number;
  student_name: string;
  student_class: string;
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
