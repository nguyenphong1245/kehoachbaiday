import React, { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadStudents } from "@/services/classroomService";

interface StudentUploadModalProps {
  classroomId: number;
  classroomName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onUploadComplete?: () => Promise<void>;
}

const StudentUploadModal: React.FC<StudentUploadModalProps> = ({
  classroomId,
  classroomName,
  isOpen,
  onClose,
  onSuccess,
  onError,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      onError("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadStudents(classroomId, file);
      onSuccess(
        `Đã thêm ${result.total_created} học sinh vào lớp ${classroomName}` +
        (result.total_skipped > 0 ? `. Bỏ qua ${result.total_skipped} học sinh.` : '')
      );

      if (onUploadComplete) await onUploadComplete();
      onClose();
    } catch (err: any) {
      onError(err.response?.data?.detail || "Lỗi khi tải lên danh sách");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 dark:border-stone-700">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
              Tải lên danh sách học sinh
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{classroomName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="px-5 py-4">
          {/* Vùng kéo thả */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-all
              ${dragActive
                ? "border-brand bg-sky-50 dark:bg-sky-900/20"
                : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500"
              }
              ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin mb-2" />
                <p className="text-sm text-stone-600 dark:text-stone-300">Đang xử lý...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-stone-300 dark:text-stone-500 mb-2" />
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  {dragActive ? "Thả file vào đây" : "Kéo thả hoặc nhấn để chọn file"}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  Hỗ trợ .xlsx, .xls, .csv
                </p>
              </div>
            )}
          </div>

          {/* Hướng dẫn ngắn gọn */}
          <div className="mt-3 text-xs text-stone-400 dark:text-stone-500 space-y-0.5">
            <p>File cần có cột <span className="text-stone-600 dark:text-stone-300 font-medium">Họ tên</span> và <span className="text-stone-600 dark:text-stone-300 font-medium">Ngày sinh</span> (DD/MM/YYYY)</p>
            <p>Hệ thống sẽ tự tạo tài khoản cho mỗi học sinh. Mật khẩu mặc định là ngày sinh.</p>
          </div>
        </div>

        {/* Chân trang */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 dark:border-stone-700">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            Bỏ qua
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Chọn file
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentUploadModal;
