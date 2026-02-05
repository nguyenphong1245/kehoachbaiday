import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  FileText,
  HelpCircle,
  Code,
  Users,
  User,
} from "lucide-react";
import { getClassroomDetail } from "@/services/classroomService";
import { createAssignment } from "@/services/assignmentService";
import type { ClassroomDetail } from "@/types/classroom";

// Import services to fetch available content
import { api } from "@/services/authService";

interface ContentItem {
  id: number;
  title: string;
  type: string;
}

const colorClasses: Record<string, { active: string; icon: string; text: string }> = {
  blue: {
    active: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600",
    text: "text-blue-700 dark:text-blue-400",
  },
  green: {
    active: "border-green-500 bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600",
    text: "text-green-700 dark:text-green-400",
  },
  purple: {
    active: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600",
    text: "text-purple-700 dark:text-purple-400",
  },
};

const AssignContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classroomId = Number(id);

  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Available content
  const [worksheets, setWorksheets] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<ContentItem[]>([]);
  const [codeExercises, setCodeExercises] = useState<ContentItem[]>([]);

  // Form
  const [contentType, setContentType] = useState<string>("worksheet");
  const [contentId, setContentId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState("individual");
  const [startAt, setStartAt] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [autoPeerReview, setAutoPeerReview] = useState(false);
  const [peerReviewStartTime, setPeerReviewStartTime] = useState("");
  const [peerReviewEndTime, setPeerReviewEndTime] = useState("");

  useEffect(() => {
    loadData();
  }, [classroomId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classData, wsData, quizData, codeData] = await Promise.all([
        getClassroomDetail(classroomId),
        api.get("/worksheets/my-worksheets").catch(() => ({ data: { worksheets: [] } })),
        api.get("/quizzes/my-quizzes").catch(() => ({ data: [] })),
        api.get("/code-exercises/my-exercises").catch(() => ({ data: [] })),
      ]);

      setClassroom(classData);

      // Map worksheets
      const wsList = (wsData.data.worksheets || wsData.data || []).map((w: any) => ({
        id: w.id,
        title: w.title,
        type: "worksheet",
      }));
      setWorksheets(wsList);

      // Map quizzes
      const qList = (Array.isArray(quizData.data) ? quizData.data : []).map((q: any) => ({
        id: q.id,
        title: q.title,
        type: "quiz",
      }));
      setQuizzes(qList);

      // Map code exercises
      const cList = (Array.isArray(codeData.data) ? codeData.data : []).map((c: any) => ({
        id: c.id,
        title: c.title,
        type: "code_exercise",
      }));
      setCodeExercises(cList);
    } catch {
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentContentList = (): ContentItem[] => {
    switch (contentType) {
      case "worksheet": return worksheets;
      case "quiz": return quizzes;
      case "code_exercise": return codeExercises;
      default: return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createAssignment({
        classroom_id: classroomId,
        content_type: contentType,
        content_id: contentId,
        title: title.trim(),
        description: description.trim() || undefined,
        work_type: workType,
        start_at: startAt || undefined,
        due_date: dueDate || undefined,
        auto_peer_review: autoPeerReview,
        peer_review_start_time: peerReviewStartTime || undefined,
        peer_review_end_time: peerReviewEndTime || undefined,
      });
      navigate(`/classes/${classroomId}`);
    } catch {
      setError("Lỗi khi giao bài");
    } finally {
      setSubmitting(false);
    }
  };

  const contentList = getCurrentContentList();
  const contentTypeLabel = contentType === "worksheet" ? "Phiếu bài tập" : contentType === "quiz" ? "Bài quiz" : "Bài code";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/classes/${classroomId}`)}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Giao bài cho lớp {classroom?.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chọn nội dung và giao cho học sinh
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Loại nội dung</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "worksheet", label: "Phiếu bài tập", icon: FileText, color: "blue" },
                { value: "quiz", label: "Bài quiz", icon: HelpCircle, color: "green" },
                { value: "code_exercise", label: "Bài code", icon: Code, color: "purple" },
              ].map((item) => {
                const colors = colorClasses[item.color];
                const isActive = contentType === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => { setContentType(item.value); setContentId(null); }}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isActive
                        ? colors.active
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <item.icon className={`w-6 h-6 mx-auto mb-2 ${
                      isActive ? colors.icon : "text-slate-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      isActive ? colors.text : "text-slate-600 dark:text-slate-300"
                    }`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Chọn {contentTypeLabel}
            </h2>
            {contentList.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Chưa có {contentTypeLabel.toLowerCase()} nào. Hãy tạo trước trong phần Quản lý học liệu.
              </p>
            ) : (
              <select
                value={contentId || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setContentId(val || null);
                  // Auto-fill title
                  const item = contentList.find((c) => c.id === val);
                  if (item && !title) setTitle(item.title);
                }}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">-- Chọn --</option>
                {contentList.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Title & Description */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề bài giao *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="VD: Phiếu học tập Bài 1 - Hoạt động Khởi động"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mô tả (tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Hướng dẫn cho học sinh..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Work Type */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hình thức làm bài</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWorkType("individual")}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  workType === "individual"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-600"
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${workType === "individual" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={`text-sm font-medium ${workType === "individual" ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}>
                  Cá nhân
                </span>
                <p className="text-xs text-slate-400 mt-1">Mỗi HS làm riêng</p>
              </button>
              <button
                type="button"
                onClick={() => setWorkType("group")}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  workType === "group"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-slate-200 dark:border-slate-600"
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${workType === "group" ? "text-purple-600" : "text-slate-400"}`} />
                <span className={`text-sm font-medium ${workType === "group" ? "text-purple-700 dark:text-purple-400" : "text-slate-600 dark:text-slate-300"}`}>
                  Nhóm
                </span>
                <p className="text-xs text-slate-400 mt-1">Làm theo nhóm đã chia</p>
              </button>
            </div>
          </div>

          {/* Schedule & Options */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Thời gian & tùy chọn</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hạn nộp
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPeerReview}
                onChange={(e) => setAutoPeerReview(e.target.checked)}
                className="rounded text-orange-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Tráo bài tự động (khi tất cả nộp xong → kích hoạt đánh giá chéo)
              </span>
            </label>

            {/* Peer Review Timing */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Thời gian đánh giá chéo (tùy chọn)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Nếu cài đặt thời gian, hệ thống sẽ tự động nộp bài và chuyển sang đánh giá chéo khi đến giờ.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Bắt đầu đánh giá chéo
                  </label>
                  <input
                    type="datetime-local"
                    value={peerReviewStartTime}
                    onChange={(e) => setPeerReviewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kết thúc đánh giá chéo
                  </label>
                  <input
                    type="datetime-local"
                    value={peerReviewEndTime}
                    onChange={(e) => setPeerReviewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !contentId || !title.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-lg"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Giao bài cho lớp
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignContentPage;
