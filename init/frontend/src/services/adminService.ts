import { api } from "./authService";

// ============== TYPES ==============

export interface RecentUser {
  id: number;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TopTeacher {
  id: number;
  email: string;
  tokens_used: number;
  token_balance: number;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  total_lesson_plans: number;
  total_quizzes: number;
  total_worksheets: number;
  total_code_exercises: number;
  total_quiz_responses: number;
  total_worksheet_responses: number;
  total_code_submissions: number;
  recent_users: RecentUser[];
  top_teachers: TopTeacher[];
  total_tokens_allocated: number;
  total_tokens_used: number;
  total_tokens_remaining: number;
}

export interface LessonInfo {
  lesson_name?: string;
  grade?: string;
  book_type?: string;
  topic?: string;
}

export interface ContentItem {
  id: number;
  type: "quiz" | "worksheet" | "code_exercise" | "lesson_plan";
  title: string;
  creator_email: string;
  creator_id: number;
  created_at: string;
  is_active: boolean | null;
  response_count: number;
  lesson_info: LessonInfo | null;
  share_code: string | null;
  content: string | null;
}

export interface ContentListResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AIModelFeatureSetting {
  feature_key: string;
  feature_label: string;
  description: string;
  model_name: string;
}

export interface AIModelSettings {
  allowed_models: string[];
  settings: AIModelFeatureSetting[];
}

export interface AIModelSettingUpdateItem {
  feature_key: string;
  model_name: string;
}

// ============== API CALLS ==============

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/admin/dashboard-stats");
  return data;
};

export const getAllContent = async (
  contentType: string = "all",
  page: number = 1,
  limit: number = 20
): Promise<ContentListResponse> => {
  const { data } = await api.get("/admin/all-content", {
    params: { content_type: contentType, page, limit },
  });
  return data;
};

export const deleteContent = async (
  contentType: string,
  contentId: number
): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/content/${contentType}/${contentId}`);
  return data;
};

export const updateTokenBalance = async (
  userId: number,
  tokenBalance: number
): Promise<{ message: string; token_balance: number }> => {
  const { data } = await api.put(`/admin/users/${userId}/token-balance`, {
    token_balance: tokenBalance,
  });
  return data;
};

export const getAIModelSettings = async (): Promise<AIModelSettings> => {
  const { data } = await api.get("/admin/ai-model-settings");
  return data;
};

export const updateAIModelSettings = async (
  settings: AIModelSettingUpdateItem[]
): Promise<AIModelSettings> => {
  const { data } = await api.put("/admin/ai-model-settings", { settings });
  return data;
};

// ============== GUIDE CARDS ==============

export interface GuideCardPublic {
  id: number;
  card_key: string;
  icon_name: string;
  color: string;
  icon_color: string;
  title: string;
  description: string;
  content_html: string;
  video_url: string | null;
  sort_order: number;
}

export interface GuideCardAdmin extends GuideCardPublic {
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface GuideCardUpdatePayload {
  title?: string;
  description?: string;
  content_html?: string;
  video_url?: string | null;
  icon_name?: string;
  color?: string;
  icon_color?: string;
  is_active?: boolean;
}

export const getPublicGuideCards = async (): Promise<GuideCardPublic[]> => {
  const { data } = await api.get("/guide-cards/");
  return data;
};

export const getAdminGuideCards = async (): Promise<GuideCardAdmin[]> => {
  const { data } = await api.get("/guide-cards/admin/all");
  return data;
};

export const updateGuideCard = async (
  cardId: number,
  payload: GuideCardUpdatePayload
): Promise<GuideCardAdmin> => {
  const { data } = await api.put(`/guide-cards/admin/${cardId}`, payload);
  return data;
};

export const reorderGuideCards = async (
  cardIds: number[]
): Promise<GuideCardAdmin[]> => {
  const { data } = await api.put("/guide-cards/admin/reorder", {
    card_ids: cardIds,
  });
  return data;
};
