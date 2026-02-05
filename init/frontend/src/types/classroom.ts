export interface Classroom {
  id: number;
  name: string;
  grade?: string | null;
  school_year?: string | null;
  description?: string | null;
  student_count: number;
  group_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface ClassStudent {
  id: number;
  user_id: number;
  student_code?: string | null;
  student_number?: number | null;
  full_name: string;
  date_of_birth?: string | null;
  email: string;
  joined_at?: string | null;
}

export interface GroupMember {
  id: number;
  student_id: number;
  full_name: string;
  student_code?: string | null;
}

export interface StudentGroup {
  id: number;
  name: string;
  members: GroupMember[];
  created_at?: string | null;
}

export interface ClassroomDetail extends Omit<Classroom, "student_count" | "group_count"> {
  students: ClassStudent[];
  groups: StudentGroup[];
}

export interface ClassroomListResponse {
  classrooms: Classroom[];
  total: number;
}

export interface StudentUploadResponse {
  total_uploaded: number;
  total_created: number;
  total_skipped: number;
  skipped_details: string[];
  students: ClassStudent[];
}

export interface BulkGroupCreateResponse {
  groups: StudentGroup[];
  message: string;
}
