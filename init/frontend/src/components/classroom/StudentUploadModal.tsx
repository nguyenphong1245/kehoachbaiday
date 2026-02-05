import React, { useRef, useState } from "react";
import { Upload, X, Loader2, FileText, AlertCircle, CheckCircle } from "lucide-react";
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

    // Validate file type
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
      onError(err.response?.data?.detail || "Lỗi khi upload file học sinh");
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

  const handleSkip = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        // Close modal if clicking backdrop (not the modal content)
        if (e.target === e.currentTarget && !uploading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Upload danh sách học sinh
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Lớp: <span className="font-medium text-slate-700 dark:text-slate-300">{classroomName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Instructions */}
          <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Định dạng file Excel/CSV
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1.5 ml-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Tên học sinh</strong> (bắt buộc): Họ và tên đầy đủ</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Năm sinh</strong> (bắt buộc): YYYY hoặc DD/MM/YYYY</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Mã học sinh</strong> (tùy chọn): Tự động tạo nếu bỏ trống</span>
              </li>
            </ul>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-10 text-center transition-all
              ${dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
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
                <Loader2 className="w-14 h-14 text-blue-500 animate-spin mb-4" />
                <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                  Đang xử lý file...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {dragActive ? "Thả file vào đây" : "Kéo thả file hoặc click để chọn"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Hỗ trợ: Excel (.xlsx, .xls) hoặc CSV
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Chọn file từ máy tính
                </button>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Lưu ý:</p>
              <p>
                Hệ thống sẽ tự động tạo tài khoản đăng nhập cho mỗi học sinh.
                Mật khẩu mặc định dựa trên ngày sinh (định dạng: <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded">hsDDMMYYYY</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <button
            onClick={handleSkip}
            disabled={uploading}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            Bỏ qua, upload sau
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
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
