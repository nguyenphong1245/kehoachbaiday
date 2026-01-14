/**
 * PublicCodingPage - Trang công khai cho học sinh viết code
 * Sử dụng Monaco Editor để viết code và chạy test cases
 */
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  Send,
  RefreshCw,
  Play,
  Code,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";
import {
  getPublicExercise,
  submitCoding,
} from "@/services/codeExerciseService";
import type {
  PublicCodeExerciseResponse,
  PublicCodingData,
  SubmitExerciseResponse,
} from "@/types/codeExercise";

// Monaco Editor - dynamic import để tránh lỗi SSR
let MonacoEditor: any = null;
if (typeof window !== "undefined") {
  import("@monaco-editor/react").then((mod) => {
    MonacoEditor = mod.default;
  });
}

// Form đăng ký thông tin học sinh
interface StudentInfo {
  name: string;
}

export const PublicCodingPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  
  // States
  const [exercise, setExercise] = useState<PublicCodeExerciseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  
  // Student info
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [studentName, setStudentName] = useState("");
  
  // Code editor state
  const [code, setCode] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  
  // Test run state
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  
  // Result states
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Monaco Editor
  useEffect(() => {
    import("@monaco-editor/react").then((mod) => {
      MonacoEditor = mod.default;
      setMonacoLoaded(true);
    });
  }, []);

  // Load exercise
  useEffect(() => {
    const loadExercise = async () => {
      if (!shareCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPublicExercise(shareCode);
        
        if (data.exercise_type !== "coding") {
          setError("Bài tập này không phải dạng viết code");
          return;
        }
        
        setExercise(data);
        
        // Initialize code with starter code
        const codingData = data.exercise_data as PublicCodingData;
        setCode(codingData.starter_code || "");
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { detail?: string } } }).response;
          setError(response?.data?.detail || "Không thể tải bài tập");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadExercise();
  }, [shareCode]);

  const handleStartExercise = () => {
    if (!studentName.trim()) {
      alert("Vui lòng nhập họ tên!");
      return;
    }
    
    setStudentInfo({ name: studentName.trim() });
  };

  // Run code locally using Pyodide (browser Python)
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunOutput(null);
    
    try {
      // @ts-ignore
      const pyodide = await loadPyodide();
      
      // Redirect stdout
      let output = "";
      pyodide.setStdout({
        batched: (text: string) => {
          output += text;
        },
      });
      
      await pyodide.runPythonAsync(code);
      setRunOutput(output || "(Không có output)");
    } catch (err: any) {
      setRunOutput(`Lỗi: ${err.message || err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!shareCode || !studentInfo || !exercise) return;
    
    if (!code.trim()) {
      alert("Vui lòng viết code trước khi nộp bài!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitCoding(shareCode, {
        student_name: studentInfo.name,
        submitted_code: code,
      });
      
      setResult(response);
    } catch (err) {
      console.error("Error submitting:", err);
      alert("Có lỗi khi nộp bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!exercise) return;
    
    const codingData = exercise.exercise_data as PublicCodingData;
    setCode(codingData.starter_code || "");
    setResult(null);
    setRunOutput(null);
  };

  const showNextHint = () => {
    const codingData = exercise?.exercise_data as PublicCodingData;
    if (codingData?.hints && currentHintIndex < codingData.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể tải bài tập</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const codingData = exercise.exercise_data as PublicCodingData;

  // Student info form
  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{exercise.title}</h1>
            <p className="text-gray-600">{exercise.description}</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
              <span>Viết Code Python</span>
              <span>•</span>
              <span className="capitalize">{exercise.difficulty}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <button
              onClick={handleStartExercise}
              className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    const isPassed = result.is_correct;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
            {isPassed ? (
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isPassed ? "Chính xác! 🎉" : "Chưa đúng hoàn toàn"}
            </h2>
            
            <div className="my-6">
              <div className={`text-6xl font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
                {result.percentage.toFixed(0)}%
              </div>
              <p className="text-gray-600 mt-2">
                {result.passed_tests}/{result.total_tests} test cases passed
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-700 whitespace-pre-wrap">{result.feedback}</p>
            </div>
          </div>

          {/* Test results detail */}
          {result.test_results && result.test_results.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Chi tiết kết quả</h3>
              <div className="space-y-3">
                {result.test_results.map((test, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      test.passed
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {test.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{test.test_case}</span>
                    </div>
                    {!test.passed && (
                      <div className="text-sm font-mono">
                        <p className="text-gray-600">
                          <span className="text-gray-500">Expected:</span> {test.expected_output}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-500">Actual:</span> {test.actual_output || "(no output)"}
                        </p>
                        {test.error && (
                          <p className="text-red-600 mt-1">Error: {test.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main exercise UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{exercise.title}</h1>
              <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Xin chào,</p>
              <p className="font-medium text-gray-800">{studentInfo.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Problem description + Test cases */}
          <div className="space-y-4">
            {/* Test cases */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Test Cases</h3>
              <div className="space-y-2">
                {codingData.test_cases.map((tc, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm font-mono">
                    <div className="flex gap-4">
                      <span className="text-gray-500">Input:</span>
                      <span>{tc.input}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-500">Expected:</span>
                      <span className="text-emerald-600">{tc.expected}</span>
                    </div>
                    {tc.description && (
                      <p className="text-gray-500 text-xs mt-1">{tc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            {codingData.hints && codingData.hints.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Gợi ý ({currentHintIndex + 1}/{codingData.hints.length})
                  </span>
                  {showHints ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {showHints && (
                  <div className="mt-3 space-y-2">
                    {codingData.hints.slice(0, currentHintIndex + 1).map((hint, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        <span className="font-medium text-yellow-700">Gợi ý {idx + 1}:</span>{" "}
                        {hint}
                      </div>
                    ))}
                    
                    {currentHintIndex < codingData.hints.length - 1 && (
                      <button
                        onClick={showNextHint}
                        className="text-sm text-yellow-600 hover:text-yellow-700"
                      >
                        Xem gợi ý tiếp theo →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Run output */}
            {runOutput && (
              <div className="bg-gray-900 rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Output
                </h3>
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {runOutput}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Code editor */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">Python</span>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                Chạy thử
              </button>
            </div>
            
            <div className="h-[400px]">
              {monacoLoaded && MonacoEditor ? (
                <MonacoEditor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(value: string | undefined) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                  }}
                />
              ) : (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
                  placeholder="Viết code Python của bạn ở đây..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset code
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            className="px-8 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang chấm...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Nộp bài
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to load Pyodide (browser Python)
declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

async function loadPyodide() {
  if (typeof window === "undefined") {
    throw new Error("Pyodide only works in browser");
  }
  
  // Check if already loaded
  if ((window as any).pyodide) {
    return (window as any).pyodide;
  }
  
  // Load Pyodide script
  if (!document.getElementById("pyodide-script")) {
    const script = document.createElement("script");
    script.id = "pyodide-script";
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  
  // Initialize Pyodide
  const pyodide = await (window as any).loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
  });
  
  (window as any).pyodide = pyodide;
  return pyodide;
}

export default PublicCodingPage;
