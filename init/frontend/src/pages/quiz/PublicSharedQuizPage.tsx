import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Send,
  RefreshCw,
  User,
  Users,
  Mail,
} from "lucide-react";
import {
  getPublicQuiz,
  submitQuiz,
  type QuizPublic,
  type QuizQuestion,
  type SubmitQuizResponse,
} from "@/services/sharedQuizService";

// Form đăng ký thông tin học sinh
interface StudentInfo {
  name: string;
  className: string;
  email?: string;
}

export const PublicSharedQuizPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  
  // States
  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Student info
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [studentForm, setStudentForm] = useState({ name: "", className: "", email: "" });
  
  // Quiz states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Result states
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz
  useEffect(() => {
    const loadQuiz = async () => {
      if (!shareCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPublicQuiz(shareCode);
        setQuiz(data);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { detail?: string } } }).response;
          setError(response?.data?.detail || "Không thể tải bài trắc nghiệm");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [shareCode]);

  // Timer
  useEffect(() => {
    if (!startTime || !quiz?.time_limit || result) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = quiz.time_limit! * 60 - elapsed;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        handleSubmit();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, quiz?.time_limit, result]);

  const handleStartQuiz = () => {
    if (!studentForm.name.trim() || !studentForm.className.trim()) {
      alert("Vui lòng nhập đầy đủ họ tên và lớp!");
      return;
    }
    
    setStudentInfo({
      name: studentForm.name.trim(),
      className: studentForm.className.trim(),
      email: studentForm.email.trim() || undefined,
    });
    setStartTime(Date.now());
    if (quiz?.time_limit) {
      setTimeLeft(quiz.time_limit * 60);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!shareCode || !studentInfo || !quiz) return;
    
    // Kiểm tra đã trả lời hết chưa
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && timeLeft !== 0) {
      const confirm = window.confirm(
        `Bạn còn ${unanswered.length} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);
    
    try {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : undefined;
      
      const response = await submitQuiz(shareCode, {
        student_name: studentInfo.name,
        student_class: studentInfo.className,
        student_email: studentInfo.email,
        answers,
        time_spent: timeSpent,
      });
      
      setResult(response);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Có lỗi khi nộp bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = quiz?.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Đang tải bài trắc nghiệm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Không thể tải bài trắc nghiệm
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Student info form
  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden max-w-lg w-full">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{quiz?.title?.replace(/^Trắc nghiệm:\s*/i, '')}</h1>
                <p className="text-blue-100 text-sm">Bài trắc nghiệm trực tuyến</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lớp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={studentForm.className}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, className: e.target.value }))}
                    placeholder="Ví dụ: 10A1"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={!studentForm.name.trim() || !studentForm.className.trim()}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    const isPassed = result.percentage >= 50;
    
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 sm:p-8 max-w-md w-full text-center">
          {/* Trophy */}
          <div className={`w-20 h-20 ${isPassed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'} rounded-lg flex items-center justify-center mx-auto mb-4`}>
            <Trophy className={`w-10 h-10 ${isPassed ? 'text-green-500' : 'text-orange-500'}`} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isPassed ? "Chúc mừng!" : "Hoàn thành!"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Bạn đã hoàn thành bài trắc nghiệm
          </p>

          {/* Score */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-6">
            <div className={`text-5xl font-bold mb-2 ${
              result.percentage >= 80 ? 'text-green-500' :
              result.percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {result.percentage}%
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {result.total_correct} / {result.total_questions} câu đúng
            </p>
          </div>

          {/* Correct answers (if shown) */}
          {result.correct_answers && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Đáp án đúng:</h3>
              <div className="grid grid-cols-5 gap-2 text-sm">
                {Object.entries(result.correct_answers).map(([qId, answer]) => (
                  <div key={qId} className="flex items-center gap-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      {qId.replace("question_", "")}:
                    </span>
                    <span className={`font-semibold ${
                      answers[qId] === answer ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {answer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white truncate">
            {quiz?.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {studentInfo.name} - {studentInfo.className}
          </p>
        </div>
        
        {/* Timer */}
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${
            timeLeft <= 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
            timeLeft <= 300 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
            'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </header>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
          <span>Câu {currentQuestion + 1} / {quiz?.total_questions}</span>
          <span>{answeredCount} / {quiz?.total_questions} đã trả lời</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / (quiz?.total_questions || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            {/* Question text */}
            <div className="mb-6">
              <span className="text-sm font-medium text-blue-600 mb-2 block">
                Câu {currentQuestion + 1}
              </span>
              <p className="text-lg text-slate-900 dark:text-white whitespace-pre-wrap">
                {currentQ?.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ && Object.entries(currentQ.options).map(([key, value]) => {
                const isSelected = answers[currentQ.id] === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectAnswer(currentQ.id, key)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {key}
                      </span>
                      <span className="text-slate-900 dark:text-white pt-1">
                        {value}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Câu trước</span>
          </button>

          {/* Question dots */}
          <div className="flex-1 flex items-center justify-center gap-1 flex-wrap">
            {quiz?.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white scale-110'
                    : answers[q.id]
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === (quiz?.total_questions || 0) - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Nộp bài
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min((quiz?.total_questions || 1) - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Câu sau</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSharedQuizPage;
