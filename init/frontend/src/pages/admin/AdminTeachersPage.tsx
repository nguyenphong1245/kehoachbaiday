import { useState, useEffect } from "react";
import {
  Users,
  School,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  GraduationCap,
  FileText,
  Code,
  ClipboardList,
  Coins,
} from "lucide-react";
import { api } from "@/services/authService";

interface Student {
  id: number;
  full_name: string;
  student_code: string | null;
  student_number: number | null;
}

interface ClassroomMaterials {
  quiz: number;
  worksheet: number;
  code_exercise: number;
  total: number;
}

interface ClassroomData {
  id: number;
  name: string;
  grade: string | null;
  school_year: string | null;
  description: string | null;
  created_at: string | null;
  student_count: number;
  materials: ClassroomMaterials;
  students: Student[];
}

interface TeacherData {
  id: number;
  email: string;
  token_balance: number;
  tokens_used: number;
  created_at: string | null;
  classrooms: ClassroomData[];
  total_classrooms: number;
  total_students: number;
  total_materials: number;
}

const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set());
  const [expandedClassrooms, setExpandedClassrooms] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/teachers-overview");
      setTeachers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Không thể tải dữ liệu giáo viên");
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacher = (teacherId: number) => {
    setExpandedTeachers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const toggleClassroom = (key: string) => {
    setExpandedClassrooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (n: number) => {
    return n.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Lớp học
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Xem thông tin lớp học, học liệu và học sinh của từng giáo viên
        </p>
      </div>

      {/* Teachers list */}
      {teachers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          Chưa có giáo viên nào
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Teacher header */}
              <button
                onClick={() => toggleTeacher(teacher.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 dark:text-white">{teacher.email}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <School className="w-3 h-3" />
                        {teacher.total_classrooms} lớp
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {teacher.total_students} học sinh
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {teacher.total_materials} học liệu
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        Đã dùng: {formatNumber(teacher.tokens_used)} token
                      </span>
                    </div>
                  </div>
                </div>
                {expandedTeachers.has(teacher.id) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Classrooms */}
              {expandedTeachers.has(teacher.id) && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  {teacher.classrooms.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-400 text-sm">
                      Giáo viên chưa tạo lớp học nào
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {teacher.classrooms.map((classroom) => {
                        const classroomKey = `${teacher.id}-${classroom.id}`;
                        const isExpanded = expandedClassrooms.has(classroomKey);

                        return (
                          <div key={classroom.id}>
                            {/* Classroom header */}
                            <button
                              onClick={() => toggleClassroom(classroomKey)}
                              className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              <div className="flex items-center gap-3 ml-8">
                                <School className="w-4 h-4 text-green-500" />
                                <div className="text-left">
                                  <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                    {classroom.name}
                                    {classroom.grade && (
                                      <span className="ml-2 text-xs text-slate-400">
                                        Khối {classroom.grade}
                                      </span>
                                    )}
                                    {classroom.school_year && (
                                      <span className="ml-2 text-xs text-slate-400">
                                        ({classroom.school_year})
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    <span>{classroom.student_count} học sinh</span>
                                    <span className="flex items-center gap-1">
                                      <ClipboardList className="w-3 h-3" />
                                      {classroom.materials.quiz} quiz
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {classroom.materials.worksheet} phiếu bài tập
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Code className="w-3 h-3" />
                                      {classroom.materials.code_exercise} bài lập trình
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>

                            {/* Students list */}
                            {isExpanded && (
                              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 ml-8">
                                {classroom.students.length === 0 ? (
                                  <p className="text-sm text-slate-400 py-2">Chưa có học sinh</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {classroom.students.map((student) => (
                                      <div
                                        key={student.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                      >
                                        <GraduationCap className="w-4 h-4 text-purple-500" />
                                        <div className="min-w-0">
                                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                            {student.student_number && (
                                              <span className="text-slate-400 mr-1">
                                                {student.student_number}.
                                              </span>
                                            )}
                                            {student.full_name}
                                          </p>
                                          {student.student_code && (
                                            <p className="text-xs text-slate-400">{student.student_code}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminTeachersPage;
