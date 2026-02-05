/**
 * Assignment Service - API calls cho giao bài
 */
import { api } from "./authService";

export interface Assignment {
  id: number;
  classroom_id: number;
  classroom_name: string;
  content_type: string;
  content_id: number;
  content_title: string;
  title: string;
  description?: string | null;
  work_type: string;
  is_active: boolean;
  start_at?: string | null;
  due_date?: string | null;
  auto_peer_review?: boolean;
  lesson_info?: Record<string, string> | null;
  peer_review_status?: string | null;
  peer_review_start_time?: string | null;
  peer_review_end_time?: string | null;
  submission_count: number;
  total_students: number;
  created_at: string;
  updated_at?: string | null;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  total: number;
}

export async function createAssignment(data: {
  classroom_id: number;
  content_type: string;
  content_id: number;
  title: string;
  description?: string;
  work_type: string;
  lesson_plan_id?: number;
  lesson_info?: Record<string, string>;
  due_date?: string;
  start_at?: string;
  auto_peer_review?: boolean;
  peer_review_start_time?: string;
  peer_review_end_time?: string;
}): Promise<Assignment> {
  const res = await api.post("/assignments/", data);
  return res.data;
}

export async function getClassAssignments(classroomId: number): Promise<AssignmentListResponse> {
  const res = await api.get(`/assignments/classroom/${classroomId}`);
  return res.data;
}

export async function getAssignment(id: number): Promise<Assignment> {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
}

export async function updateAssignment(
  id: number,
  data: {
    title?: string;
    description?: string;
    work_type?: string;
    is_active?: boolean;
    due_date?: string;
    start_at?: string;
    auto_peer_review?: boolean;
    peer_review_start_time?: string;
    peer_review_end_time?: string;
  }
): Promise<Assignment> {
  const res = await api.patch(`/assignments/${id}`, data);
  return res.data;
}

export async function deleteAssignment(id: number): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export async function getSubmissions(assignmentId: number): Promise<any> {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
}

export async function getClassroomStatistics(classroomId: number): Promise<any> {
  const res = await api.get(`/assignments/classroom/${classroomId}/statistics`);
  return res.data;
}

export async function gradeSubmission(
  assignmentId: number,
  data: { submission_type: string; submission_id: number; student_id?: number; score: number; comment?: string }
): Promise<any> {
  const res = await api.put(`/assignments/${assignmentId}/grade`, data);
  return res.data;
}
