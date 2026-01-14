/**
 * PublicParsonsPage - Trang công khai cho học sinh làm bài Parsons (ghép thẻ code)
 * Sử dụng drag-and-drop để sắp xếp các khối code theo thứ tự đúng
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  Send,
  RefreshCw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Code,
  Trash2,
} from "lucide-react";
import {
  getPublicExercise,
  submitParsons,
} from "@/services/codeExerciseService";
import type {
  PublicCodeExerciseResponse,
  PublicParsonsData,
  ParsonsBlock,
  SubmitExerciseResponse,
} from "@/types/codeExercise";

// Form đăng ký thông tin học sinh
interface StudentInfo {
  name: string;
}

export const PublicParsonsPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  
  // States
  const [exercise, setExercise] = useState<PublicCodeExerciseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Student info
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [studentName, setStudentName] = useState("");
  
  // Parsons state
  const [availableBlocks, setAvailableBlocks] = useState<ParsonsBlock[]>([]);
  const [solutionBlocks, setSolutionBlocks] = useState<ParsonsBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<ParsonsBlock | null>(null);
  const [dragSource, setDragSource] = useState<"available" | "solution" | null>(null);
  
  // Result states
  const [result, setResult] = useState<SubmitExerciseResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load exercise
  useEffect(() => {
    const loadExercise = async () => {
      if (!shareCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPublicExercise(shareCode);
        
        if (data.exercise_type !== "parsons") {
          setError("Bài tập này không phải dạng ghép thẻ code");
          return;
        }
        
        setExercise(data);
        
        // Initialize blocks
        const parsonsData = data.exercise_data as PublicParsonsData;
        const allBlocks = [
          ...parsonsData.blocks,
          ...(parsonsData.distractors || []),
        ];
        // Shuffle blocks
        const shuffled = [...allBlocks].sort(() => Math.random() - 0.5);
        setAvailableBlocks(shuffled);
        setSolutionBlocks([]);
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

  // Drag and drop handlers
  const handleDragStart = (block: ParsonsBlock, source: "available" | "solution") => {
    setDraggedBlock(block);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragSource(null);
  };

  const handleDropToSolution = (dropIndex?: number) => {
    if (!draggedBlock) return;

    // Remove from source
    if (dragSource === "available") {
      setAvailableBlocks(prev => prev.filter(b => b.id !== draggedBlock.id));
    } else {
      setSolutionBlocks(prev => prev.filter(b => b.id !== draggedBlock.id));
    }

    // Add to solution at specific index or end
    setSolutionBlocks(prev => {
      const newBlocks = [...prev];
      if (dropIndex !== undefined) {
        newBlocks.splice(dropIndex, 0, draggedBlock);
      } else {
        newBlocks.push(draggedBlock);
      }
      return newBlocks;
    });

    handleDragEnd();
  };

  const handleDropToAvailable = () => {
    if (!draggedBlock) return;

    // Remove from solution
    if (dragSource === "solution") {
      setSolutionBlocks(prev => prev.filter(b => b.id !== draggedBlock.id));
      setAvailableBlocks(prev => [...prev, draggedBlock]);
    }

    handleDragEnd();
  };

  const moveBlockInSolution = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= solutionBlocks.length) return;

    setSolutionBlocks(prev => {
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      return newBlocks;
    });
  };

  const removeFromSolution = (block: ParsonsBlock) => {
    setSolutionBlocks(prev => prev.filter(b => b.id !== block.id));
    setAvailableBlocks(prev => [...prev, block]);
  };

  const handleSubmit = async () => {
    if (!shareCode || !studentInfo || !exercise) return;
    
    if (solutionBlocks.length === 0) {
      alert("Vui lòng sắp xếp các khối code vào vùng lời giải!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitParsons(shareCode, {
        student_name: studentInfo.name,
        submitted_order: solutionBlocks.map(b => b.id),
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
    
    const parsonsData = exercise.exercise_data as PublicParsonsData;
    const allBlocks = [
      ...parsonsData.blocks,
      ...(parsonsData.distractors || []),
    ];
    const shuffled = [...allBlocks].sort(() => Math.random() - 0.5);
    setAvailableBlocks(shuffled);
    setSolutionBlocks([]);
    setResult(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể tải bài tập</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Student info form
  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{exercise.title}</h1>
            <p className="text-gray-600">{exercise.description}</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              <span>Ghép thẻ Code</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <button
              onClick={handleStartExercise}
              className="w-full py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
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
    const isPassed = result.percentage >= 70;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          {isPassed ? (
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          )}
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isPassed ? "Xuất sắc!" : "Cố gắng thêm nhé!"}
          </h2>
          
          <div className="my-6">
            <div className={`text-6xl font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
              {result.percentage.toFixed(0)}%
            </div>
            <p className="text-gray-600 mt-2">
              {result.correct_positions}/{result.total_positions} vị trí đúng
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">{result.feedback}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4">
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

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Hướng dẫn:</strong> Kéo thả các khối code từ bên trái vào vùng lời giải bên phải 
            theo đúng thứ tự. Một số khối có thể là "bẫy" (code sai) - hãy cẩn thận!
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available blocks */}
          <div
            className="bg-white rounded-xl shadow-lg p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropToAvailable}
          >
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                {availableBlocks.length}
              </span>
              Các khối code có sẵn
            </h3>
            
            <div className="space-y-2 min-h-[300px]">
              {availableBlocks.map((block) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(block, "available")}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-sky-300 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <code className="text-sm font-mono flex-1 whitespace-pre">
                    {"  ".repeat(block.indent)}{block.content}
                  </code>
                </div>
              ))}
              
              {availableBlocks.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Tất cả khối đã được sử dụng</p>
                </div>
              )}
            </div>
          </div>

          {/* Solution area */}
          <div
            className="bg-white rounded-xl shadow-lg p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropToSolution()}
          >
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm">
                {solutionBlocks.length}
              </span>
              Lời giải của bạn
            </h3>
            
            <div className="space-y-2 min-h-[300px] border-2 border-dashed border-sky-200 rounded-lg p-3 bg-sky-50/50">
              {solutionBlocks.map((block, index) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(block, "solution")}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDropToSolution(index);
                  }}
                  className="flex items-center gap-2 p-3 bg-white border border-sky-300 rounded-lg cursor-move hover:border-sky-500 transition-colors group"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <code className="text-sm font-mono flex-1 whitespace-pre">
                    {"  ".repeat(block.indent)}{block.content}
                  </code>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveBlockInSolution(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-sky-500 disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveBlockInSolution(index, "down")}
                      disabled={index === solutionBlocks.length - 1}
                      className="p-1 text-gray-400 hover:text-sky-500 disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromSolution(block)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {solutionBlocks.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 p-8">
                  <p className="text-center">
                    Kéo thả các khối code vào đây<br />
                    theo đúng thứ tự
                  </p>
                </div>
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
            Làm lại
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || solutionBlocks.length === 0}
            className="px-8 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang nộp...
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

export default PublicParsonsPage;
