import React, { useState, useRef } from "react";
import {
  UserPlus,
  Upload,
  Trash2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { uploadStudents, addStudent, removeStudent } from "@/services/classroomService";
import type { ClassroomDetail, ClassStudent } from "@/types/classroom";

interface StudentPanelProps {
  classroom: ClassroomDetail;
  classroomId: number;
  onReload: () => Promise<void>;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const StudentPanel: React.FC<StudentPanelProps> = ({
  classroom,
  classroomId,
  onReload,
  onError,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    created: number;
    skipped: number;
    details: string[];
  } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addDob, setAddDob] = useState("");
  const [adding, setAdding] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadStudents(classroomId, file);
      setUploadResult({
        created: result.total_created,
        skipped: result.total_skipped,
        details: result.skipped_details,
      });
      onSuccess(`Đã thêm ${result.total_created} học sinh`);
      await onReload();
    } catch {
      onError("Lỗi khi upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAdding(true);
    try {
      await addStudent(classroomId, {
        full_name: addName.trim(),
        student_code: addCode.trim() || undefined,
        date_of_birth: addDob.trim() || undefined,
      });
      setAddName("");
      setAddCode("");
      setAddDob("");
      setShowAddForm(false);
      onSuccess("Đã thêm học sinh");
      await onReload();
    } catch {
      onError("Lỗi khi thêm học sinh");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (studentId: number) => {
    if (!window.confirm("Xóa học sinh này khỏi lớp?")) return;
    try {
      await removeStudent(classroomId, studentId);
      onSuccess("Đã xóa học sinh");
      await onReload();
    } catch {
      onError("Lỗi khi xóa học sinh");
    }
  };

  const getPassword = (student: ClassStudent) => {
    return student.date_of_birth
      ? `hs${student.date_of_birth.split("-").reverse().join("")}`
      : "hocsinh2026";
  };

  const formatDob = (dob?: string | null) => {
    if (!dob) return "-";
    const parts = dob.split("-");
    if (parts.length === 3 && parts[1] === "01" && parts[2] === "01") {
      return parts[0];
    }
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const copyCredentials = (student: ClassStudent) => {
    const pw = getPassword(student);
    const text = `Tài khoản: ${student.email}\nMật khẩu: ${pw}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* Upload result */}
      {uploadResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2.5 rounded-lg mb-4 text-sm">
          <p>Đã tạo: {uploadResult.created} | Bỏ qua: {uploadResult.skipped}</p>
          {uploadResult.details.length > 0 && (
            <ul className="mt-1.5 list-disc pl-5 text-xs">
              {uploadResult.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
          <button onClick={() => setUploadResult(null)} className="mt-1.5 text-xs underline">
            Đóng
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload danh sách
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Thêm thủ công
        </button>
      </div>

      {/* Add student form */}
      {showAddForm && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-800">
          <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text" placeholder="Họ tên *" value={addName}
              onChange={(e) => setAddName(e.target.value)} required
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <input
              type="text" placeholder="Mã HS" value={addCode}
              onChange={(e) => setAddCode(e.target.value)}
              className="w-28 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <input
              type="text" placeholder="Ngày sinh (DD/MM/YYYY)" value={addDob}
              onChange={(e) => setAddDob(e.target.value)}
              className="w-40 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button type="submit" disabled={adding}
              className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5">
              {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Thêm
            </button>
            <button type="button" onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-slate-400 hover:text-slate-600 text-sm">
              Hủy
            </button>
          </form>
        </div>
      )}

      {/* Student table */}
      {classroom.students.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Chưa có học sinh. Upload file Excel/CSV hoặc thêm thủ công.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ tên</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã HS</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Năm sinh</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tài khoản</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mật khẩu</th>
                    <th className="px-3 py-2.5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {classroom.students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="px-3 py-2.5 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">{student.full_name}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{student.student_code || "-"}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{formatDob(student.date_of_birth)}</td>
                      <td className="px-3 py-2.5">
                        <code className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                          {student.email}
                        </code>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {getPassword(student)}
                          </code>
                          <button
                            onClick={() => copyCredentials(student)}
                            className="p-0.5 text-slate-300 hover:text-blue-500 transition-colors"
                            title="Copy TK + MK"
                          >
                            {copiedId === student.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => handleRemove(student.id)}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                          title="Xóa khỏi lớp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            MK mặc định: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">hocsinh2026</code> (khi không có ngày sinh)
          </p>
        </>
      )}
    </div>
  );
};

export default StudentPanel;
