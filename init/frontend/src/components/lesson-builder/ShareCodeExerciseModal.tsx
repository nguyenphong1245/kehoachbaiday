/**
 * ShareCodeExerciseModal - Modal để chia sẻ bài tập code (Parsons/Coding)
 */
import React, { useState } from "react";
import {
  X,
  Code,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Share2,
} from "lucide-react";
import { createCodeExercise } from "@/services/codeExerciseService";
import type {
  CodeExercise,
  CreateCodeExerciseResponse,
} from "@/types/codeExercise";

interface ShareCodeExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: CodeExercise[];
  lessonTitle?: string;
}

export const ShareCodeExerciseModal: React.FC<ShareCodeExerciseModalProps> = ({
  isOpen,
  onClose,
  exercises,
  lessonTitle,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<CodeExercise | null>(
    exercises.length === 1 ? exercises[0] : null
  );
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<CreateCodeExerciseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!selectedExercise) return;

    setIsSharing(true);
    setError(null);

    try {
      // LLM sinh ra format flat, cần convert sang format API
      // Format LLM: { exercise_type, title, description, blocks, correct_order, ... }
      // Format API: { exercise_type, title, description, parsons_data: { blocks, correct_order, ... } }
      
      let requestData: any = {
        title: selectedExercise.title,
        description: selectedExercise.description,
        exercise_type: selectedExercise.exercise_type,
        difficulty: selectedExercise.difficulty,
        language: "python",
        expires_in_days: 3,
      };

      if (selectedExercise.exercise_type === "parsons") {
        // Nếu đã có parsons_data (format cũ) thì dùng, không thì build từ flat format
        if (selectedExercise.parsons_data) {
          requestData.parsons_data = selectedExercise.parsons_data;
        } else {
          // Build từ flat format (LLM sinh ra)
          const exercise = selectedExercise as any;
          requestData.parsons_data = {
            blocks: exercise.blocks || [],
            correct_order: exercise.correct_order || [],
            distractors: exercise.distractors || [],
          };
        }
      } else if (selectedExercise.exercise_type === "coding") {
        // Nếu đã có coding_data (format cũ) thì dùng, không thì build từ flat format
        if (selectedExercise.coding_data) {
          requestData.coding_data = selectedExercise.coding_data;
        } else {
          // Build từ flat format (LLM sinh ra)
          const exercise = selectedExercise as any;
          requestData.coding_data = {
            starter_code: exercise.starter_code || "",
            solution_code: exercise.solution_code || "",
            test_code: exercise.test_code || "",
            test_cases: exercise.test_cases || [],
            hints: exercise.hints || [],
          };
        }
      }

      const result = await createCodeExercise(requestData);

      setShareResult(result);
    } catch (err: any) {
      console.error("Share failed:", err);
      setError(err.response?.data?.detail || "Lỗi khi tạo link chia sẻ");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareResult) return;

    await navigator.clipboard.writeText(shareResult.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSelectedExercise(exercises.length === 1 ? exercises[0] : null);
    setShareResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Code className="w-5 h-5 text-sky-500" />
            Chia sẻ bài tập Code
          </h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Success state */}
          {shareResult ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Tạo link thành công!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {shareResult.exercise_type === "parsons"
                  ? "Bài ghép thẻ code"
                  : "Bài viết code"}: {shareResult.title}
              </p>

              {/* Share URL */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareResult.share_url}
                    className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                    title="Sao chép link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={shareResult.share_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                    title="Mở trong tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {shareResult.expires_at && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Link hết hạn: {new Date(shareResult.expires_at).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Exercise selection */}
              {exercises.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn bài tập để chia sẻ
                  </label>
                  <div className="space-y-2">
                    {exercises.map((ex, index) => (
                      <label
                        key={ex.id || index}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedExercise === ex
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30"
                            : "border-gray-200 dark:border-gray-600 hover:border-sky-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="exercise"
                          checked={selectedExercise === ex}
                          onChange={() => setSelectedExercise(ex)}
                          className="text-sky-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {ex.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ex.exercise_type === "parsons"
                              ? "Ghép thẻ code"
                              : "Viết code"}{" "}
                            • {ex.difficulty}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected exercise preview */}
              {selectedExercise && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-1">
                    {selectedExercise.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {selectedExercise.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        selectedExercise.exercise_type === "parsons"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      }`}
                    >
                      {selectedExercise.exercise_type === "parsons"
                        ? "Ghép thẻ"
                        : "Viết code"}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          {shareResult ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleShare}
                disabled={!selectedExercise || isSharing}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Tạo link chia sẻ
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareCodeExerciseModal;
