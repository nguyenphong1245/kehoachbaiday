/**
 * Peer Review Service - API calls cho đánh giá chéo
 */
import { api } from "./authService";

export interface PeerReviewRoundInfo {
  id: number;
  assignment_id: number;
  status: string;
  pairings: any[];
  total_reviews: number;
  submitted_reviews: number;
  activated_at?: string | null;
  completed_at?: string | null;
}

export interface PeerReviewItem {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_type: string;
  reviewer_user_name?: string | null;
  comments: Record<string, string>;
  score?: number | null;
  submitted_at?: string | null;
}

export interface WorksheetQuestion {
  id?: string;
  question?: string;
  text?: string;
  title?: string;
  description?: string;
}

export interface GroupMemberInfo {
  student_id: number;
  user_id?: number | null;
  full_name: string;
  is_leader: boolean;
}

export interface GroupInfo {
  group_id: number;
  group_name: string;
  is_leader: boolean;
  work_session_id?: number | null;
  members: GroupMemberInfo[];
}

export interface MyReviewResponse {
  review: PeerReviewItem | null;
  reviewee_answers: Record<string, any> | null;
  questions?: WorksheetQuestion[] | null;
  worksheet_content?: string | null;
  group_info?: GroupInfo | null;
  message?: string;
}

export interface FeedbackItem {
  id: number;
  comments: Record<string, string>;
  score?: number | null;
  reviewer_name: string;
  submitted_at?: string | null;
}

// Teacher endpoints
export async function activatePeerReview(assignmentId: number): Promise<PeerReviewRoundInfo> {
  const res = await api.post(`/peer-review/assignments/${assignmentId}/activate`);
  return res.data;
}

export async function getPeerReviewStatus(assignmentId: number): Promise<PeerReviewRoundInfo> {
  const res = await api.get(`/peer-review/assignments/${assignmentId}/status`);
  return res.data;
}

export async function completePeerReview(assignmentId: number): Promise<{ message: string }> {
  const res = await api.post(`/peer-review/assignments/${assignmentId}/complete`);
  return res.data;
}

export async function getAllReviews(assignmentId: number): Promise<{ reviews: PeerReviewItem[] }> {
  const res = await api.get(`/peer-review/assignments/${assignmentId}/reviews`);
  return res.data;
}

// Student endpoints
export async function getMyReviewTask(assignmentId: number): Promise<MyReviewResponse> {
  const res = await api.get(`/peer-review/my-review/${assignmentId}`);
  return res.data;
}

export async function submitPeerReview(
  reviewId: number,
  comments: Record<string, string>,
  score?: number
): Promise<{ message: string }> {
  const res = await api.post(`/peer-review/${reviewId}/submit`, { comments, score });
  return res.data;
}

export async function getMyFeedback(assignmentId: number): Promise<{ feedback: FeedbackItem[] }> {
  const res = await api.get(`/peer-review/my-feedback/${assignmentId}`);
  return res.data;
}
