import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Terminal,
  User,
  Users,
  Code2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getPublicExercise,
  getTeacherExercise,
  updateExerciseByShareCode,
  startCodeSession,
  runCode,
  submitCode,
  getHint,
  type CodeExercisePublic,
  type RunCodeResponse,
  type SubmitCodeResponse,
  type TestResultItem,
  type TestCaseTeacher,
} from "@/services/codeExerciseService";
import { getStoredAuthUser } from "@/utils/authStorage";
import { useToast } from "@/contexts/Toast";

interface StudentInfo {
  name: string;
  className: string;
  group?: string;
}

interface RunTestResult {
  test_num: number;
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  error?: string;
  timed_out: boolean;
}

export const PublicCodeExercisePage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const toast = useToast();

  // Exercise data
  const [exercise, setExercise] = useState<CodeExercisePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student info
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    className: "",
    group: "",
  });

  // Code editor
  const [code, setCode] = useState("");

  // Run (chạy thử với test cases)
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunTestResult[] | null>(null);

  // Submit (nộp bài chấm điểm)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitCodeResponse | null>(
    null
  );

  // Guards against double-submit (ref is synchronous, unlike state)
  const isRunningRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // UI
  const [activeTab, setActiveTab] = useState<"problem" | "testcases">(
    "problem"
  );
  const [outputTab, setOutputTab] = useState<"run" | "submit">("run");
  const [showProblem, setShowProblem] = useState(true);

  // Teacher mode
  const [isTeacher, setIsTeacher] = useState(false);
  const [allTestCases, setAllTestCases] = useState<TestCaseTeacher[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTestCases, setEditTestCases] = useState<TestCaseTeacher[]>([]);

  // Load exercise
  useEffect(() => {
    const loadExercise = async () => {
      if (!shareCode) return;
      setIsLoading(true);
      setError(null);
      try {
        // Load public data
        const data = await getPublicExercise(shareCode);
        setExercise(data);
        setCode(data.starter_code || getDefaultCode(data.language));

        // Try teacher endpoint if user is logged in
        const currentUser = getStoredAuthUser();
        if (currentUser) {
          try {
            const teacherData = await getTeacherExercise(shareCode);
            setAllTestCases(teacherData.test_cases);
            setIsTeacher(true);
          } catch {
            // Not the creator or expired token - stay in student mode
          }
        }
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const response = (
            err as { response?: { data?: { detail?: string } } }
          ).response;
          setError(response?.data?.detail || "Không thể tải bài tập");
        } else {
          setError("Lỗi kết nối. Vui lòng thử lại.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadExercise();
  }, [shareCode]);

  const getDefaultCode = (language: string) => {
    switch (language) {
      case "python":
        return '# Viết code của bạn ở đây\n\n';
      case "javascript":
        return "// Viết code của bạn ở đây\n\n";
      case "java":
        return 'public class Main {\n    public static void main(String[] args) {\n        // Viết code của bạn ở đây\n    }\n}\n';
      case "cpp":
        return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Viết code của bạn ở đây\n    return 0;\n}\n';
      case "c":
        return '#include <stdio.h>\n\nint main() {\n    // Viết code của bạn ở đây\n    return 0;\n}\n';
      default:
        return "";
    }
  };

  const getMonacoLanguage = (lang: string) => {
    const map: Record<string, string> = {
      python: "python",
      javascript: "javascript",
      java: "java",
      cpp: "cpp",
      c: "c",
    };
    return map[lang] || "python";
  };

  // Handle student registration + start session
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode || !studentForm.name.trim() || !studentForm.className.trim()) return;
    try {
      const session = await startCodeSession(shareCode, {
        student_name: studentForm.name.trim(),
        student_class: studentForm.className.trim(),
      });
      setSessionToken(session.session_token);
      setStudentInfo({
        name: studentForm.name.trim(),
        className: studentForm.className.trim(),
        group: studentForm.group.trim() || undefined,
      });
    } catch {
      toast.push({ type: "error", title: "Không thể bắt đầu phiên làm bài", description: "Vui lòng thử lại." });
    }
  };

  // Run code against public test cases
  const handleRunCode = useCallback(async () => {
    if (!shareCode || !code.trim() || !exercise) return;
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);
    setRunResults(null);
    setOutputTab("run");

    const results: RunTestResult[] = [];

    for (let i = 0; i < exercise.test_cases.length; i++) {
      const tc = exercise.test_cases[i];
      try {
        const result: RunCodeResponse = await runCode(shareCode, {
          code,
          stdin: tc.input,
        });

        const actual = result.stdout?.trim() ?? "";
        const expected = tc.expected_output?.trim() ?? "";

        results.push({
          test_num: i + 1,
          input: tc.input,
          expected_output: tc.expected_output,
          actual_output: actual,
          passed: result.exit_code === 0 && !result.timed_out && actual === expected,
          error: result.stderr || undefined,
          timed_out: result.timed_out,
        });
      } catch {
        results.push({
          test_num: i + 1,
          input: tc.input,
          expected_output: tc.expected_output,
          actual_output: "",
          passed: false,
          error: "Lỗi kết nối",
          timed_out: false,
        });
      }
    }

    setRunResults(results);
    setIsRunning(false);
    isRunningRef.current = false;
  }, [shareCode, code, exercise]);

  // Submit code
  const handleSubmitCode = useCallback(async () => {
    if (!shareCode || !code.trim() || !studentInfo || !sessionToken) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitResult(null);
    setOutputTab("submit");
    try {
      const result = await submitCode(shareCode, {
        student_name: studentInfo.name,
        student_class: studentInfo.className,
        student_group: studentInfo.group,
        code,
        session_token: sessionToken,
      });
      setSubmitResult(result);
    } catch (err: unknown) {
      let msg = "Lỗi nộp bài";
      if (err && typeof err === "object" && "response" in err) {
        const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
        if (typeof detail === "string") msg = detail;
        else if (Array.isArray(detail)) msg = detail.map((d: { msg?: string }) => d.msg || "").join(", ");
      }
      toast.push({ type: "error", title: "Nộp bài thất bại", description: msg });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [shareCode, code, studentInfo, sessionToken, toast]);

  // Teacher: start editing
  const handleStartEditing = () => {
    setEditTestCases(allTestCases.map((tc) => ({ ...tc })));
    setIsEditing(true);
    setActiveTab("testcases");
  };

  // Teacher: cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTestCases([]);
  };

  // Teacher: save changes
  const handleSave = useCallback(async () => {
    if (!shareCode) return;
    setIsSaving(true);
    try {
      await updateExerciseByShareCode(shareCode, {
        starter_code: code,
        test_cases: editTestCases,
      });
      setAllTestCases(editTestCases.map((tc) => ({ ...tc })));
      // Update public test cases in exercise state
      if (exercise) {
        setExercise({
          ...exercise,
          starter_code: code,
          test_cases: editTestCases
            .filter((tc) => !tc.is_hidden)
            .map((tc) => ({ input: tc.input, expected_output: tc.expected_output })),
        });
      }
      setIsEditing(false);
      setEditTestCases([]);
    } catch {
      toast.push({ type: "error", title: "Lỗi khi lưu thay đổi" });
    } finally {
      setIsSaving(false);
    }
  }, [shareCode, code, editTestCases, exercise]);

  // Teacher: update a test case field
  const updateEditTestCase = (index: number, field: keyof TestCaseTeacher, value: string | boolean) => {
    const updated = [...editTestCases];
    updated[index] = { ...updated[index], [field]: value };
    setEditTestCases(updated);
  };

  // Teacher: add new test case
  const addEditTestCase = () => {
    setEditTestCases([...editTestCases, { input: "", expected_output: "", is_hidden: false }]);
  };

  // Teacher: remove a test case
  const removeEditTestCase = (index: number) => {
    setEditTestCases(editTestCases.filter((_, i) => i !== index));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">
            Đang tải bài tập...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Không thể tải bài tập
          </h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  // Student registration form (skip for teachers)
  if (!studentInfo && !isTeacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {exercise.title}
            </h1>
          </div>

          <form onSubmit={handleStudentRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Lớp *
              </label>
              <input
                type="text"
                required
                value={studentForm.className}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, className: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="10A1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm (nếu có)
              </label>
              <input
                type="text"
                value={studentForm.group}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, group: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Nhóm 1"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Bắt đầu làm bài
            </button>
          </form>
        </div>
      </div>
    );
  }

  const runPassedCount = runResults ? runResults.filter((r) => r.passed).length : 0;

  // Main exercise page (IDE layout) - Light theme
  return (
    <div className="h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-sm font-semibold truncate max-w-[300px] text-gray-800">
            {exercise.title}
          </h1>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
            {exercise.language.toUpperCase()}
          </span>
          {isTeacher && (
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
              Giáo viên
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isTeacher && studentInfo && (
            <span className="text-xs text-gray-500">
              {studentInfo.name} - {studentInfo.className}
            </span>
          )}
          <div className="flex gap-1.5">
            {isTeacher && (
              isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Lưu
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              )
            )}
            <button
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Chạy thử
            </button>
            {!isTeacher && (
              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting || !code.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Nộp bài
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel - Problem description */}
        <div
          className={`${showProblem ? "w-[40%]" : "w-0"} border-r border-gray-200 flex flex-col transition-all overflow-hidden bg-white`}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === "problem"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đề bài
            </button>
            {isTeacher && (
              <button
                onClick={() => setActiveTab("testcases")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "testcases"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Test cases ({allTestCases.length})
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "problem" ? (
              <div
                className={`text-gray-700 text-sm leading-relaxed ${!isTeacher ? "select-none" : ""}`}
                onCopy={!isTeacher ? (e) => e.preventDefault() : undefined}
                onCut={!isTeacher ? (e) => e.preventDefault() : undefined}
                onContextMenu={!isTeacher ? (e) => e.preventDefault() : undefined}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-gray-800 mt-3 mb-1.5">{children}</h3>,
                    p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="text-gray-900 font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-gray-500 italic">{children}</em>,
                    ul: ({ children }) => <ul className="my-2 ml-4 space-y-0.5 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 ml-4 space-y-0.5 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-700">{children}</li>,
                    code: ({ className, children, ...props }) => {
                      const isBlock = className?.includes("language-");
                      if (isBlock) {
                        return (
                          <code className={`${className} block`} {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 border border-gray-300 rounded-lg my-3 p-3 overflow-x-auto text-xs text-gray-800 font-mono">
                        {children}
                      </pre>
                    ),
                    table: ({ children }) => (
                      <div className="my-3 overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 text-xs">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                    th: ({ children }) => <th className="border border-gray-300 px-3 py-1.5 text-left text-gray-700 font-medium">{children}</th>,
                    td: ({ children }) => <td className="border border-gray-300 px-3 py-1.5 text-gray-600">{children}</td>,
                    hr: () => <hr className="border-gray-200 my-3" />,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-3 border-blue-500 pl-3 my-2 text-gray-500 italic bg-blue-50 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {exercise.problem_statement}
                </ReactMarkdown>
                {exercise.description && exercise.description !== exercise.problem_statement && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {exercise.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : isTeacher ? (
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    {editTestCases.map((tc, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 font-medium">
                            Test case {i + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={tc.is_hidden}
                                onChange={(e) => updateEditTestCase(i, "is_hidden", e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              {tc.is_hidden ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              Ẩn
                            </label>
                            <button
                              onClick={() => removeEditTestCase(i)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                              title="Xóa test case"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-xs text-gray-400">Input:</span>
                          <textarea
                            value={tc.input}
                            onChange={(e) => updateEditTestCase(i, "input", e.target.value)}
                            className="w-full mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono resize-y min-h-[40px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Expected Output:</span>
                          <textarea
                            value={tc.expected_output}
                            onChange={(e) => updateEditTestCase(i, "expected_output", e.target.value)}
                            className="w-full mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono resize-y min-h-[40px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addEditTestCase}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm test case
                    </button>
                  </>
                ) : (
                  allTestCases.map((tc, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-medium">
                          Test case {i + 1}
                        </span>
                        {tc.is_hidden && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Ẩn
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Input:</span>
                        <pre className="mt-1 p-2 bg-white border border-gray-200 rounded text-gray-800 text-xs whitespace-pre-wrap font-mono">
                          {tc.input || "(không có input)"}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Expected Output:</span>
                        <pre className="mt-1 p-2 bg-white border border-gray-200 rounded text-blue-700 text-xs whitespace-pre-wrap font-mono">
                          {tc.expected_output}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Toggle problem panel */}
        <button
          onClick={() => setShowProblem(!showProblem)}
          className="w-5 bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-r border-gray-200 transition-colors shrink-0"
          title={showProblem ? "Ẩn đề bài" : "Hiện đề bài"}
        >
          {showProblem ? (
            <ChevronDown className="w-3 h-3 text-gray-400 rotate-90" />
          ) : (
            <ChevronUp className="w-3 h-3 text-gray-400 rotate-90" />
          )}
        </button>

        {/* Right panel - Editor + Output */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor */}
          <div className="flex-1 min-h-0 border-b border-gray-200">
            <Editor
              height="100%"
              language={getMonacoLanguage(exercise.language)}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 8 },
                contextmenu: isTeacher,
              }}
            />
          </div>

          {/* Output panel */}
          <div className="h-[35%] border-t border-gray-200 flex flex-col shrink-0 bg-white">
            {/* Output tabs */}
            <div className="flex items-center border-b border-gray-200 shrink-0">
              <button
                onClick={() => setOutputTab("run")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  outputTab === "run"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Terminal className="w-3 h-3 inline mr-1" />
                Chạy thử
                {runResults && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      runPassedCount === runResults.length
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {runPassedCount}/{runResults.length}
                  </span>
                )}
              </button>
              {!isTeacher && (
                <button
                  onClick={() => setOutputTab("submit")}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    outputTab === "submit"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Kết quả chấm
                  {submitResult && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        submitResult.status === "passed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {submitResult.passed_tests}/{submitResult.total_tests}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Output content */}
            <div className="flex-1 overflow-y-auto p-3">
              {outputTab === "run" ? (
                <RunResultsPanel
                  isRunning={isRunning}
                  results={runResults}
                  shareCode={shareCode || ""}
                  code={code}
                />
              ) : (
                <ResultsPanel
                  isSubmitting={isSubmitting}
                  result={submitResult}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Run results panel - shows results of running code against public test cases
const RunResultsPanel: React.FC<{
  isRunning: boolean;
  results: RunTestResult[] | null;
  shareCode: string;
  code: string;
}> = ({ isRunning, results, shareCode, code }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // Reset hint when results change
  useEffect(() => {
    setHint(null);
  }, [results]);

  const handleGetHint = async () => {
    if (!results || !shareCode) return;
    const failedTests = results
      .filter((r) => !r.passed)
      .map((r) => ({
        test_num: r.test_num,
        input: r.input,
        expected_output: r.expected_output,
        actual_output: r.actual_output,
        error: r.error,
      }));
    if (failedTests.length === 0) return;

    setHintLoading(true);
    try {
      const res = await getHint(shareCode, { code, failed_tests: failedTests });
      setHint(res.hint);
    } catch {
      setHint("Không thể tạo gợi ý lúc này. Vui lòng thử lại sau.");
    } finally {
      setHintLoading(false);
    }
  };

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Đang chạy code với các test cases...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-gray-400 text-sm">
        Nhấn "Chạy thử" để kiểm tra code với các test cases.
      </div>
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const hasFailed = passed < results.length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`flex items-center justify-between rounded-lg p-2.5 ${
        passed === results.length
          ? "bg-green-50 border border-green-200"
          : "bg-orange-50 border border-orange-200"
      }`}>
        <div className="flex items-center gap-2">
          {passed === results.length ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-600" />
          )}
          <span className={`text-sm font-medium ${
            passed === results.length ? "text-green-700" : "text-orange-700"
          }`}>
            {passed === results.length ? "Đúng hết" : "Chưa đúng hết"}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          <span className="font-bold">{passed}</span>/{results.length} test cases
        </span>
      </div>

      {/* Hint button */}
      {hasFailed && (
        <div>
          {!hint && !hintLoading && (
            <button
              onClick={handleGetHint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Phân tích lỗi
            </button>
          )}
          {hintLoading && (
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              AI đang phân tích code...
            </div>
          )}
          {hint && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Gợi ý</span>
              </div>
              <div className="text-xs text-amber-900 leading-relaxed prose prose-xs prose-amber max-w-none [&_code]:bg-amber-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-amber-800 [&_pre]:bg-amber-100 [&_pre]:p-2 [&_pre]:rounded [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual results */}
      {results.map((r) => (
        <RunTestResultCard key={r.test_num} result={r} />
      ))}
    </div>
  );
};

// Individual run test result card
const RunTestResultCard: React.FC<{ result: RunTestResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(!result.passed);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className="text-xs font-medium text-gray-700">
            Test {result.test_num}
          </span>
          {result.timed_out && (
            <span className="text-xs text-yellow-600 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> Quá thời gian
            </span>
          )}
          {result.error && !result.timed_out && (
            <span className="text-xs text-red-500 truncate max-w-[200px]">{result.error.split("\n").pop()}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-2">
          <div>
            <span className="text-[10px] text-gray-400 uppercase">Input</span>
            <pre className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {result.input || "(không có)"}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase">Expected Output</span>
            <pre className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs text-blue-700 whitespace-pre-wrap font-mono">
              {result.expected_output}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase">Actual Output</span>
            <pre className={`mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs whitespace-pre-wrap font-mono ${
              result.passed ? "text-green-600" : "text-red-600"
            }`}>
              {result.actual_output || "(không có output)"}
            </pre>
          </div>
          {result.error && (
            <div>
              <span className="text-[10px] text-red-400 uppercase">Error</span>
              <pre className="mt-0.5 p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 whitespace-pre-wrap font-mono">
                {result.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Results panel component (for submit/grading)
const ResultsPanel: React.FC<{
  isSubmitting: boolean;
  result: SubmitCodeResponse | null;
}> = ({ isSubmitting, result }) => {
  if (isSubmitting) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Đang chấm bài...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-gray-400 text-sm">
        Nhấn "Nộp bài" để chấm điểm.
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; label: string }> = {
    passed: { color: "text-green-600", label: "Đúng hết" },
    failed: { color: "text-red-600", label: "Chưa đúng hết" },
    error: { color: "text-red-600", label: "Lỗi" },
    timeout: { color: "text-yellow-600", label: "Quá thời gian" },
  };

  const cfg = statusConfig[result.status] || statusConfig.error;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`flex items-center justify-between rounded-lg p-3 ${
        result.status === "passed" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}>
        <div className="flex items-center gap-2">
          {result.status === "passed" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-900 font-bold">{result.passed_tests}</span>
          <span className="text-gray-500">/{result.total_tests} test cases</span>
          <span className="ml-2 text-gray-400">({result.percentage}%)</span>
        </div>
      </div>

      {/* Individual test results */}
      <div className="space-y-2">
        {result.test_results.map((tr: TestResultItem, i: number) => (
          <TestResultCard key={i} result={tr} />
        ))}
      </div>

      {result.execution_time_ms != null && (
        <div className="text-xs text-gray-400">
          Tổng thời gian: {result.execution_time_ms}ms
        </div>
      )}
    </div>
  );
};

// Individual test result (for submit)
const TestResultCard: React.FC<{ result: TestResultItem }> = ({ result }) => {
  const [expanded, setExpanded] = useState(!result.passed);

  if (result.is_hidden) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className="text-xs text-gray-500">Test cases ẩn</span>
        </div>
        <span className="text-xs text-gray-400">{result.passed ? "Đúng" : "Sai"}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className="text-xs font-medium text-gray-700">
            Test {result.test_num}
          </span>
          {result.error && (
            <span className="text-xs text-red-500">{result.error}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-2">
          <div>
            <span className="text-[10px] text-gray-400 uppercase">Input</span>
            <pre className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {result.input || "(không có)"}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase">
              Expected Output
            </span>
            <pre className="mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs text-blue-700 whitespace-pre-wrap font-mono">
              {result.expected_output}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase">
              Actual Output
            </span>
            <pre
              className={`mt-0.5 p-1.5 bg-white border border-gray-200 rounded text-xs whitespace-pre-wrap font-mono ${
                result.passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.actual_output || "(không có output)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCodeExercisePage;
