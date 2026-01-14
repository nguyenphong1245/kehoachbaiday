import React, { useState, useEffect } from "react";
import {
  FileQuestion,
  Users,
  Clock,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getMyQuizzes,
  getQuizResponses,
  deleteQuiz,
  toggleQuizActive,
  type SharedQuiz,
  type QuizResponseItem,
  type QuizResponsesList,
} from "@/services/sharedQuizService";

export const SharedQuizManagementPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<number, QuizResponsesList>>({});
  const [loadingResponses, setLoadingResponses] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyQuizzes();
      setQuizzes(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi khi tải danh sách quiz";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = async (quizId: number) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      return;
    }

    setExpandedQuiz(quizId);
    
    // Load responses nếu chưa có
    if (!responses[quizId]) {
      setLoadingResponses(quizId);
      try {
        const data = await getQuizResponses(quizId);
        setResponses(prev => ({ ...prev, [quizId]: data }));
      } catch (err) {
        console.error("Error loading responses:", err);
      } finally {
        setLoadingResponses(null);
      }
    }
  };

  const handleCopyLink = async (shareCode: string, quizId: number) => {
    const link = `${window.location.origin}/quiz/${shareCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(quizId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleDelete = async (quizId: number) => {
    if (!confirm("Bạn có chắc muốn xóa quiz này? Tất cả bài làm của học sinh cũng sẽ bị xóa.")) {
      return;
    }

    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("Có lỗi khi xóa quiz. Vui lòng thử lại!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (quizId: number) => {
    setTogglingId(quizId);
    try {
      const updatedQuiz = await toggleQuizActive(quizId);
      setQuizzes(prev => prev.map(q => q.id === quizId ? updatedQuiz : q));
    } catch (err) {
      console.error("Error toggling quiz:", err);
      alert("Có lỗi khi cập nhật trạng thái quiz. Vui lòng thử lại!");
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileQuestion className="w-8 h-8 text-sky-500" />
              Quản lý Quiz Trắc nghiệm
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chia sẻ bài trắc nghiệm cho học sinh làm bài online
            </p>
          </div>
          <button
            onClick={loadQuizzes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FileQuestion className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có quiz nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tạo quiz từ kế hoạch bài dạy để chia sẻ cho học sinh làm bài
            </p>
          </div>
        ) : (
          /* Quiz list */
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Quiz header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {quiz.title}
                        </h3>
                        {!quiz.is_active && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            Đã tắt
                          </span>
                        )}
                        {isExpired(quiz.expires_at) && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                            Hết hạn
                          </span>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FileQuestion className="w-4 h-4" />
                          {quiz.total_questions} câu
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {quiz.response_count} bài nộp
                        </span>
                        {quiz.time_limit && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {quiz.time_limit} phút
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {quiz.show_correct_answers ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          {quiz.show_correct_answers ? "Hiện đáp án" : "Ẩn đáp án"}
                        </span>
                      </div>

                      {/* Share code */}
                      <div className="flex items-center gap-2 mt-3">
                        <code className="px-3 py-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg font-mono text-sm">
                          {quiz.share_code}
                        </code>
                        <button
                          onClick={() => handleCopyLink(quiz.share_code, quiz.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Sao chép link"
                        >
                          {copiedId === quiz.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <a
                          href={`/quiz/${quiz.share_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Mở quiz"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </a>
                      </div>

                      {/* Created date */}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Tạo lúc: {formatDate(quiz.created_at)}
                        {quiz.expires_at && (
                          <span className="ml-2">
                            • Hết hạn: {formatDate(quiz.expires_at)}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(quiz.id)}
                        disabled={togglingId === quiz.id}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={quiz.is_active ? "Tắt quiz" : "Bật quiz"}
                      >
                        {togglingId === quiz.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                        ) : quiz.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        disabled={deletingId === quiz.id}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Xóa quiz"
                      >
                        {deletingId === quiz.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleExpand(quiz.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-lg transition-colors text-sm font-medium"
                      >
                        {expandedQuiz === quiz.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Ẩn kết quả
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Xem kết quả ({quiz.response_count})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded responses */}
                {expandedQuiz === quiz.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    {loadingResponses === quiz.id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          Đang tải kết quả...
                        </span>
                      </div>
                    ) : responses[quiz.id]?.responses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Chưa có học sinh nào nộp bài
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600 dark:text-gray-400">
                              <th className="pb-3 font-medium">Họ tên</th>
                              <th className="pb-3 font-medium">Lớp</th>
                              <th className="pb-3 font-medium text-center">Điểm</th>
                              <th className="pb-3 font-medium text-center">Số câu đúng</th>
                              <th className="pb-3 font-medium text-center">Thời gian</th>
                              <th className="pb-3 font-medium">Nộp lúc</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {responses[quiz.id]?.responses.map((response) => (
                              <tr key={response.id} className="text-gray-900 dark:text-gray-100">
                                <td className="py-3 font-medium">{response.student_name}</td>
                                <td className="py-3">{response.student_class}</td>
                                <td className="py-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-medium ${
                                      response.percentage >= 80
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : response.percentage >= 50
                                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    }`}
                                  >
                                    {response.percentage}%
                                  </span>
                                </td>
                                <td className="py-3 text-center">
                                  {response.total_correct}/{response.total_questions}
                                </td>
                                <td className="py-3 text-center">
                                  {formatTimeSpent(response.time_spent)}
                                </td>
                                <td className="py-3 text-gray-600 dark:text-gray-400">
                                  {formatDate(response.submitted_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedQuizManagementPage;
