/**
 * Classroom Service - API calls cho quản lý lớp học
 */
import { api } from "./authService";
import type {
  Classroom,
  ClassStudent,
  ClassroomDetail,
  ClassroomListResponse,
  StudentUploadResponse,
  StudentGroup,
  BulkGroupCreateResponse,
} from "@/types/classroom";

// ============== CLASSROOM CRUD ==============

export async function createClassroom(data: {
  name: string;
  grade?: string;
  school_year?: string;
  description?: string;
}): Promise<Classroom> {
  const res = await api.post("/classrooms/", data);
  return res.data;
}

export async function getClassrooms(): Promise<ClassroomListResponse> {
  const res = await api.get("/classrooms/");
  return res.data;
}

export async function getClassroomDetail(id: number): Promise<ClassroomDetail> {
  const res = await api.get(`/classrooms/${id}`);
  return res.data;
}

export async function updateClassroom(
  id: number,
  data: { name?: string; grade?: string; school_year?: string; description?: string }
): Promise<Classroom> {
  const res = await api.patch(`/classrooms/${id}`, data);
  return res.data;
}

export async function deleteClassroom(id: number): Promise<void> {
  await api.delete(`/classrooms/${id}`);
}

// ============== STUDENT MANAGEMENT ==============

export async function uploadStudents(
  classroomId: number,
  file: File
): Promise<StudentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/classrooms/${classroomId}/upload-students`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function addStudent(
  classroomId: number,
  data: { full_name: string; student_code?: string; date_of_birth?: string }
): Promise<ClassStudent> {
  const res = await api.post(`/classrooms/${classroomId}/students`, data);
  return res.data;
}

export async function removeStudent(classroomId: number, studentId: number): Promise<void> {
  await api.delete(`/classrooms/${classroomId}/students/${studentId}`);
}

// ============== GROUP MANAGEMENT ==============

export async function createGroup(
  classroomId: number,
  data: { name: string; student_ids: number[] }
): Promise<StudentGroup> {
  const res = await api.post(`/classrooms/${classroomId}/groups`, data);
  return res.data;
}

export async function autoDivideGroups(
  classroomId: number,
  data: { num_groups: number; method: string }
): Promise<BulkGroupCreateResponse> {
  const res = await api.post(`/classrooms/${classroomId}/groups/auto-divide`, data);
  return res.data;
}

export async function updateGroup(
  classroomId: number,
  groupId: number,
  data: { name?: string; student_ids?: number[] }
): Promise<StudentGroup> {
  const res = await api.patch(`/classrooms/${classroomId}/groups/${groupId}`, data);
  return res.data;
}

export async function deleteGroup(classroomId: number, groupId: number): Promise<void> {
  await api.delete(`/classrooms/${classroomId}/groups/${groupId}`);
}

// ============== CLASSROOM MATERIALS (Staging) ==============

export interface ClassroomMaterial {
  id: number;
  classroom_id: number;
  content_type: "worksheet" | "quiz" | "code_exercise";
  content_id: number;
  title: string;
  lesson_info?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string } | null;
  created_at: string;
}

export async function addMaterialToClass(
  classroomId: number,
  data: { content_type: string; content_id: number; title: string; lesson_info?: any }
): Promise<ClassroomMaterial> {
  const res = await api.post(`/classrooms/${classroomId}/materials`, data);
  return res.data;
}

export async function getClassroomMaterials(classroomId: number): Promise<ClassroomMaterial[]> {
  const res = await api.get(`/classrooms/${classroomId}/materials`);
  return res.data;
}

export async function removeMaterialFromClass(classroomId: number, materialId: number): Promise<void> {
  await api.delete(`/classrooms/${classroomId}/materials/${materialId}`);
}
