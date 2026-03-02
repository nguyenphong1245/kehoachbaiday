import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
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

  // Run
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunTestResult[] | null>(null);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitCodeResponse | null>(null);

  // Guards
  const isRunningRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // UI
  const [activeTab, setActiveTab] = useState<"problem" | "testcases">("problem");
  const [outputTab, setOutputTab] = useState<"run" | "submit">("run");

  // Teacher mode
  const [isTeacher, setIsTeacher] = useState(false);
  const [allTestCases, setAllTestCases] = useState<TestCaseTeacher[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTestCases, setEditTestCases] = useState<TestCaseTeacher[]>([]);
  const [editProblemStatement, setEditProblemStatement] = useState("");

  // Load exercise
  useEffect(() => {
    const loadExercise = async () => {
      if (!shareCode) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPublicExercise(shareCode);
        setExercise(data);
        setCode(data.starter_code || getDefaultCode(data.language));

        const currentUser = getStoredAuthUser();
        if (currentUser) {
          try {
            const teacherData = await getTeacherExercise(shareCode);
            setAllTestCases(teacherData.test_cases);
            setIsTeacher(true);
          } catch {
            // Not the creator
          }
        }
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { detail?: string } } }).response;
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

  // Handle student registration
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
    setEditProblemStatement(exercise?.problem_statement || "");
    setIsEditing(true);
  };

  // Teacher: cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTestCases([]);
    setEditProblemStatement("");
  };

  // Teacher: save changes
  const handleSave = useCallback(async () => {
    if (!shareCode) return;
    setIsSaving(true);
    try {
      await updateExerciseByShareCode(shareCode, {
        starter_code: code,
        test_cases: editTestCases,
        problem_statement: editProblemStatement || undefined,
      });
      setAllTestCases(editTestCases.map((tc) => ({ ...tc })));
      if (exercise) {
        setExercise({
          ...exercise,
          starter_code: code,
          problem_statement: editProblemStatement || exercise.problem_statement,
          test_cases: editTestCases
            .filter((tc) => !tc.is_hidden)
            .map((tc) => ({ input: tc.input, expected_output: tc.expected_output })),
        });
      }
      setIsEditing(false);
      setEditTestCases([]);
      setEditProblemStatement("");
    } catch {
      toast.push({ type: "error", title: "Lỗi khi lưu thay đổi" });
    } finally {
      setIsSaving(false);
    }
  }, [shareCode, code, editTestCases, editProblemStatement, exercise]);

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

  // Tab key handler for textarea
  const handleCodeKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  }, [code]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
          <p className="text-stone-500">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center border border-stone-200 dark:border-stone-700">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-800 dark:text-white mb-2">
            Không thể tải bài tập
          </h2>
          <p className="text-stone-500 dark:text-stone-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  // Student registration form (skip for teachers)
  if (!studentInfo && !isTeacher) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-stone-200 dark:border-stone-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {exercise.title}
            </h1>
          </div>

          <form onSubmit={handleStudentRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-white"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Lớp *
              </label>
              <input
                type="text"
                required
                value={studentForm.className}
                onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-white"
                placeholder="10A1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Nhóm (nếu có)
              </label>
              <input
                type="text"
                value={studentForm.group}
                onChange={(e) => setStudentForm({ ...studentForm, group: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-white"
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

  // Main exercise page - matching student layout
  return (
    <div className="h-screen bg-stone-50 dark:bg-stone-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-sm font-semibold text-stone-900 dark:text-white truncate">
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
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {studentInfo.name} - {studentInfo.className}
            </span>
          )}
          <div className="flex gap-1.5">
            {isTeacher && (
              isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 text-xs font-medium rounded transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
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
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full w-full">
          {/* Left panel - Problem description + test cases */}
          <div className="w-[38%] flex flex-col border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            {isTeacher ? (
              <div className="flex border-b border-stone-200 dark:border-stone-700 shrink-0">
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    activeTab === "problem"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                  }`}
                >
                  Đề bài
                </button>
                <button
                  onClick={() => setActiveTab("testcases")}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    activeTab === "testcases"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                  }`}
                >
                  Test cases ({allTestCases.length})
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 border-b border-stone-200 dark:border-stone-700 shrink-0">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Đề bài</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {(!isTeacher || activeTab === "problem") ? (
                <>
                  {isTeacher && isEditing ? (
                    /* Teacher editing mode: textarea for problem_statement */
                    <div>
                      <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                        Đề bài (Markdown)
                      </label>
                      <textarea
                        value={editProblemStatement}
                        onChange={(e) => setEditProblemStatement(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg text-sm font-mono text-stone-900 dark:text-stone-100 resize-y focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        rows={20}
                        placeholder="Nhập đề bài (hỗ trợ Markdown)..."
                      />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`prose prose-sm dark:prose-invert max-w-none ${!isTeacher ? "select-none" : ""}`}
                        onCopy={!isTeacher ? (e) => e.preventDefault() : undefined}
                        onCut={!isTeacher ? (e) => e.preventDefault() : undefined}
                        onContextMenu={!isTeacher ? (e) => e.preventDefault() : undefined}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {exercise.problem_statement}
                        </ReactMarkdown>
                      </div>

                      {/* Sample test cases - chỉ hiện cho học sinh */}
                      {!isTeacher && exercise.test_cases.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">Ví dụ</h3>
                          <div className="space-y-3">
                            {exercise.test_cases.map((tc, i) => (
                              <div key={i} className="rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                                <div className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-700">
                                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Test {i + 1}</span>
                                </div>
                                <div className="p-3 space-y-2 text-sm">
                                  <div>
                                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Input</span>
                                    <pre className="mt-1 font-mono text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap bg-stone-50 dark:bg-stone-900/50 rounded px-3 py-2">{tc.input || "(trống)"}</pre>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Output</span>
                                    <pre className="mt-1 font-mono text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap bg-stone-50 dark:bg-stone-900/50 rounded px-3 py-2">{tc.expected_output}</pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : isTeacher && activeTab === "testcases" ? (
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      {editTestCases.map((tc, i) => (
                        <div
                          key={i}
                          className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-lg p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                              Test case {i + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.is_hidden}
                                  onChange={(e) => updateEditTestCase(i, "is_hidden", e.target.checked)}
                                  className="rounded border-stone-300 dark:border-stone-600"
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
                            <span className="text-xs text-stone-400">Input:</span>
                            <textarea
                              value={tc.input}
                              onChange={(e) => updateEditTestCase(i, "input", e.target.value)}
                              className="w-full mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs font-mono resize-y min-h-[40px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-stone-900 dark:text-stone-100"
                              rows={2}
                            />
                          </div>
                          <div>
                            <span className="text-xs text-stone-400">Expected Output:</span>
                            <textarea
                              value={tc.expected_output}
                              onChange={(e) => updateEditTestCase(i, "expected_output", e.target.value)}
                              className="w-full mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs font-mono resize-y min-h-[40px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-stone-900 dark:text-stone-100"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addEditTestCase}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-blue-400 rounded-lg text-xs text-stone-500 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm test case
                      </button>
                    </>
                  ) : (
                    allTestCases.map((tc, i) => (
                      <div
                        key={i}
                        className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-lg p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
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
                          <span className="text-xs text-stone-400">Input:</span>
                          <pre className="mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-800 dark:text-stone-200 text-xs whitespace-pre-wrap font-mono">
                            {tc.input || "(không có input)"}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs text-stone-400">Expected Output:</span>
                          <pre className="mt-1 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-blue-700 dark:text-blue-400 text-xs whitespace-pre-wrap font-mono">
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

          {/* Right panel - Code Editor + Output */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Code Editor (textarea) */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between shrink-0">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {exercise.language.toUpperCase()}
                </span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                spellCheck={false}
                className="flex-1 w-full px-4 py-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-sm leading-relaxed resize-none focus:outline-none border-none"
                style={{ tabSize: 4 }}
                placeholder="Viết code của bạn ở đây..."
              />
            </div>

            {/* Output panel */}
            <div className="h-[35%] border-t border-stone-200 dark:border-stone-700 flex flex-col shrink-0 bg-white dark:bg-stone-800">
              <div className="flex items-center border-b border-stone-200 dark:border-stone-700 shrink-0">
                <button
                  onClick={() => setOutputTab("run")}
                  className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
                    outputTab === "run"
                      ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                      : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  Kết quả
                  {runResults && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      runPassedCount === runResults.length
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {runPassedCount}/{runResults.length}
                    </span>
                  )}
                </button>
                {!isTeacher && (
                  <button
                    onClick={() => setOutputTab("submit")}
                    className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
                      outputTab === "submit"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-stone-500 hover:text-stone-700 dark:text-stone-400"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Kết quả chấm
                    {submitResult && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        submitResult.status === "passed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {submitResult.passed_tests}/{submitResult.total_tests}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {outputTab === "run" ? (
                  <RunResultsPanel
                    isRunning={isRunning}
                    results={runResults}
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
    </div>
  );
};

// Run results panel
const RunResultsPanel: React.FC<{
  isRunning: boolean;
  results: RunTestResult[] | null;
}> = ({ isRunning, results }) => {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Đang chạy code với các test cases...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-stone-400 dark:text-stone-500 text-sm">
        Nhấn "Chạy thử" để kiểm tra code với các test cases.
      </div>
    );
  }

  const passed = results.filter((r) => r.passed).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`flex items-center justify-between rounded-lg p-2.5 ${
        passed === results.length
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
      }`}>
        <div className="flex items-center gap-2">
          {passed === results.length ? (
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          )}
          <span className={`text-sm font-medium ${
            passed === results.length ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
          }`}>
            {passed === results.length ? "Đúng hết" : "Chưa đúng hết"}
          </span>
        </div>
        <span className="text-sm text-stone-600 dark:text-stone-400">
          <span className="font-bold">{passed}</span>/{results.length} test cases
        </span>
      </div>

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
    <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          )}
          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
            Test {result.test_num}
          </span>
          {result.timed_out && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> Quá thời gian
            </span>
          )}
          {result.error && !result.timed_out && (
            <span className="text-xs text-red-500 dark:text-red-400 truncate max-w-[200px]">{result.error.split("\n").pop()}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-stone-200 dark:border-stone-700 pt-2">
          <div>
            <span className="text-[10px] text-stone-400 uppercase">Input</span>
            <pre className="mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap font-mono">
              {result.input || "(không có)"}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase">Expected Output</span>
            <pre className="mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
              {result.expected_output}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase">Actual Output</span>
            <pre className={`mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs whitespace-pre-wrap font-mono ${
              result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {result.actual_output || "(không có output)"}
            </pre>
          </div>
          {result.error && (
            <div>
              <span className="text-[10px] text-red-400 uppercase">Error</span>
              <pre className="mt-0.5 p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
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
      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Đang chấm bài...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-stone-400 dark:text-stone-500 text-sm">
        Nhấn "Nộp bài" để chấm điểm.
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; label: string }> = {
    passed: { color: "text-green-600 dark:text-green-400", label: "Đúng hết" },
    failed: { color: "text-red-600 dark:text-red-400", label: "Chưa đúng hết" },
    error: { color: "text-red-600 dark:text-red-400", label: "Lỗi" },
    timeout: { color: "text-yellow-600 dark:text-yellow-400", label: "Quá thời gian" },
  };

  const cfg = statusConfig[result.status] || statusConfig.error;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`flex items-center justify-between rounded-lg p-3 ${
        result.status === "passed"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      }`}>
        <div className="flex items-center gap-2">
          {result.status === "passed" ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
        <div className="text-sm">
          <span className="text-stone-900 dark:text-white font-bold">{result.passed_tests}</span>
          <span className="text-stone-500 dark:text-stone-400">/{result.total_tests} test cases</span>
          <span className="ml-2 text-stone-400">({result.percentage}%)</span>
        </div>
      </div>

      {/* Individual test results */}
      <div className="space-y-2">
        {result.test_results.map((tr: TestResultItem, i: number) => (
          <TestResultCard key={i} result={tr} />
        ))}
      </div>

      {result.execution_time_ms != null && (
        <div className="text-xs text-stone-400">
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
      <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          )}
          <span className="text-xs text-stone-500 dark:text-stone-400">Test cases ẩn</span>
        </div>
        <span className="text-xs text-stone-400">{result.passed ? "Đúng" : "Sai"}</span>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          )}
          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
            Test {result.test_num}
          </span>
          {result.error && (
            <span className="text-xs text-red-500 dark:text-red-400">{result.error}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-stone-200 dark:border-stone-700 pt-2">
          <div>
            <span className="text-[10px] text-stone-400 uppercase">Input</span>
            <pre className="mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap font-mono">
              {result.input || "(không có)"}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase">
              Expected Output
            </span>
            <pre className="mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
              {result.expected_output}
            </pre>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase">
              Actual Output
            </span>
            <pre
              className={`mt-0.5 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs whitespace-pre-wrap font-mono ${
                result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
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
