/**
 * Student Service - API calls cho trang học sinh
 */
import { api } from "./authService";

export interface StudentClassroomInfo {
  classroom_id: number;
  classroom_name: string;
  grade?: string | null;
  school_year?: string | null;
  student_id: number;
  student_code?: string | null;
}

export interface StudentAssignmentInfo {
  id: number;
  title: string;
  content_type: string;
  content_id: number;
  work_type: string;
  is_active: boolean;
  start_at?: string | null;
  due_date?: string | null;
  auto_peer_review?: boolean;
  peer_review_status?: string | null;
  lesson_info?: Record<string, string> | null;
  classroom_id: number;
  classroom_name: string;
  status: string;
  created_at: string;
}

export interface StudentDashboardResponse {
  classrooms: StudentClassroomInfo[];
  assignments: StudentAssignmentInfo[];
}

export interface GroupMemberInfo {
  student_id: number;
  full_name: string;
  student_code?: string | null;
  is_leader?: boolean;
}

export interface MyGroupInfo {
  group_id: number;
  group_name: string;
  members: GroupMemberInfo[];
  my_student_id: number;  // ID của học sinh hiện tại trong nhóm
  work_session_id?: number | null;
  session_status?: string | null;
}

export interface AssignmentContentResponse {
  assignment: StudentAssignmentInfo;
  content?: Record<string, any> | null;
  my_group?: MyGroupInfo | null;
  work_session?: Record<string, any> | null;
}

export interface DiscussionMessage {
  id: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
}

export async function getStudentDashboard(): Promise<StudentDashboardResponse> {
  const res = await api.get("/student/dashboard");
  return res.data;
}

export async function getAssignmentDetail(assignmentId: number): Promise<AssignmentContentResponse> {
  const res = await api.get(`/student/assignments/${assignmentId}`);
  return res.data;
}

export async function getMyGroup(assignmentId: number): Promise<MyGroupInfo | null> {
  const res = await api.get(`/student/assignments/${assignmentId}/my-group`);
  return res.data;
}

export async function startWorkSession(assignmentId: number): Promise<Record<string, any>> {
  const res = await api.post(`/student/assignments/${assignmentId}/start-session`);
  return res.data;
}

export async function submitAssignment(
  assignmentId: number,
  answers: Record<string, any>
): Promise<{ message: string; status: string; peer_review_activated?: boolean; peer_review_status?: string }> {
  const res = await api.post(`/student/assignments/${assignmentId}/submit`, { answers });
  return res.data;
}

export async function getWorkSession(assignmentId: number): Promise<{ session: Record<string, any> | null }> {
  const res = await api.get(`/student/assignments/${assignmentId}/work-session`);
  return res.data;
}

export async function getDiscussion(assignmentId: number): Promise<{ messages: DiscussionMessage[] }> {
  const res = await api.get(`/student/assignments/${assignmentId}/discussion`);
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.post("/student/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return res.data;
}

export interface TestCaseResult {
  test_num: number;
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  is_hidden: boolean;
  error: string | null;
}

export interface RunTestCasesResponse {
  status: string; // "passed" | "failed" | "error" | "timeout"
  total_tests: number;
  passed_tests: number;
  test_results: TestCaseResult[];
  execution_time_ms: number;
}

export async function evaluateGroupMembers(
  assignmentId: number,
  evaluations: Array<{ student_id: number; rating: number; comment?: string }>
): Promise<{ message: string }> {
  const res = await api.post(`/student/assignments/${assignmentId}/evaluate-members`, { evaluations });
  return res.data;
}

export async function runCodeInAssignment(
  assignmentId: number,
  code: string,
  language: string = "python"
): Promise<RunTestCasesResponse> {
  const res = await api.post(`/student/assignments/${assignmentId}/run-code`, {
    code,
    language,
  });
  return res.data;
}

export interface MemberEvaluationStatus {
  submitted: boolean;
  group_submitted: boolean;
  my_student_id: number;
  members: GroupMemberInfo[];
  evaluations: Record<string, Array<{ student_id: number; rating: number; comment?: string }>>;
  evaluators: string[];
  my_evaluation_submitted: boolean;
}

export async function getMemberEvaluationStatus(
  assignmentId: number
): Promise<MemberEvaluationStatus> {
  const res = await api.get(`/student/assignments/${assignmentId}/member-evaluation-status`);
  return res.data;
}
