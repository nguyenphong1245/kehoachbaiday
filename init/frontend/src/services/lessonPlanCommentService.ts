import { api } from "./authService";

export type CommentAnalysisStatus = "pending" | "processing" | "completed" | "failed" | "skipped";

export interface LessonPlanComment {
  id: number;
  parent_comment_id?: number | null;
  selected_text: string;
  context_before?: string | null;
  context_after?: string | null;
  section_type?: string | null;
  comment_text: string;
  is_resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: number | null;
  rule_id?: number | null;
  analysis_status: CommentAnalysisStatus;
  created_at: string;
}

export interface CreateLessonPlanCommentRequest {
  selected_text?: string;
  context_before?: string;
  context_after?: string;
  section_type?: string;
  comment_text: string;
  parent_comment_id?: number;
}

export interface CreateLessonPlanCommentResponse {
  id: number;
  created_at: string;
  parent_comment_id?: number | null;
}

export const getLessonPlanComments = async (
  lessonPlanId: number
): Promise<LessonPlanComment[]> => {
  const { data } = await api.get<LessonPlanComment[]>(`/lesson-plans/${lessonPlanId}/comments`);
  return data;
};

export const createLessonPlanComment = async (
  lessonPlanId: number,
  payload: CreateLessonPlanCommentRequest
): Promise<CreateLessonPlanCommentResponse> => {
  const { data } = await api.post<CreateLessonPlanCommentResponse>(
    `/lesson-plans/${lessonPlanId}/comments`,
    payload,
  );
  return data;
};

export const updateLessonPlanComment = async (
  lessonPlanId: number,
  commentId: number,
  commentText: string,
): Promise<{ status: string }> => {
  const { data } = await api.put<{ status: string }>(
    `/lesson-plans/${lessonPlanId}/comments/${commentId}`,
    { comment_text: commentText },
  );
  return data;
};

export const deleteLessonPlanComment = async (
  lessonPlanId: number,
  commentId: number
): Promise<{ status: string }> => {
  const { data } = await api.delete<{ status: string }>(
    `/lesson-plans/${lessonPlanId}/comments/${commentId}`,
  );
  return data;
};

export const resolveLessonPlanCommentThread = async (
  lessonPlanId: number,
  commentId: number,
  resolved: boolean,
): Promise<{ status: string; thread_id: number }> => {
  const { data } = await api.post<{ status: string; thread_id: number }>(
    `/lesson-plans/${lessonPlanId}/comments/${commentId}/resolve`,
    { resolved },
  );
  return data;
};

export const analyzeLessonPlanComments = async (
  lessonPlanId: number
): Promise<{ status: string; count: number }> => {
  const { data } = await api.post<{ status: string; count: number }>(
    `/lesson-plans/${lessonPlanId}/analyze-comments`,
  );
  return data;
};
