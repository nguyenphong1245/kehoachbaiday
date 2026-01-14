/**
 * LessonPlanBuilderSidebar - Thanh ben trai chon bai hoc
 * Phong cach hanh chinh - Gon gang, chuyen nghiep
 */
import React, { useState, useEffect } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import {
  BOOK_TYPES,
  GRADES,
  type LessonBasicInfo,
  type LessonDetail,
} from "@/types/lessonBuilder";
import { searchLessons, getLessonDetail, getTopics } from "@/services/lessonBuilderService";

interface LessonPlanBuilderSidebarProps {
  onLessonSelect: (lesson: LessonDetail) => void;
  selectedLesson: LessonDetail | null;
}

export const LessonPlanBuilderSidebar: React.FC<LessonPlanBuilderSidebarProps> = ({
  onLessonSelect,
  selectedLesson,
}) => {
  const [selectedBookType, setSelectedBookType] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [lessons, setLessons] = useState<LessonBasicInfo[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (selectedBookType && selectedGrade) {
      loadTopics();
    } else {
      setTopics([]);
    }
    setSelectedTopic("");
    setLessons([]);
    setSelectedLessonId("");
  }, [selectedBookType, selectedGrade]);

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const topicList = await getTopics(selectedBookType, selectedGrade);
      setTopics(topicList);
    } catch (error) {
      console.error("Error loading topics:", error);
      setTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  useEffect(() => {
    if (selectedBookType && selectedGrade && selectedTopic) {
      loadLessons();
    }
  }, [selectedBookType, selectedGrade, selectedTopic]);

  const loadLessons = async () => {
    setIsLoadingLessons(true);
    try {
      const result = await searchLessons(selectedBookType, selectedGrade, selectedTopic);
      setLessons(result.lessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
      setLessons([]);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const handleLessonClick = async (lesson: LessonBasicInfo) => {
    setSelectedLessonId(lesson.id);
    setIsLoadingDetail(true);
    try {
      const detail = await getLessonDetail(lesson.id);
      onLessonSelect(detail);
    } catch (error) {
      console.error("Error loading lesson detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <aside className="w-72 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Tìm kiếm bài học</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chọn sách, lớp và chủ đề</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Loại sách giáo khoa</label>
          <div className="relative">
            <select
              value={selectedBookType}
              onChange={(e) => {
                setSelectedBookType(e.target.value);
                setLessons([]);
                setSelectedLessonId("");
              }}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <option value="">-- Chọn loại sách --</option>
              {BOOK_TYPES.map((book) => (
                <option key={book.value} value={book.value}>{book.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Khối lớp</label>
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              disabled={!selectedBookType}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <option value="">-- Chọn lớp --</option>
              {GRADES.map((grade) => (
                <option key={grade.value} value={grade.value}>{grade.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Chủ đề
            {isLoadingTopics && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </label>
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedGrade || isLoadingTopics || topics.length === 0}
              className="w-full px-3 py-2.5 pr-8 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <option value="">
                {isLoadingTopics ? "Đang tải..." : topics.length === 0 ? "-- Chọn sách và lớp trước --" : "-- Chọn chủ đề --"}
              </option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selectedTopic && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Danh sách bài học</label>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{lessons.length} bài</span>
            </div>

            {isLoadingLessons ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">Không tìm thấy bài học</div>
            ) : (
              <div className="space-y-1.5 max-h-[calc(100vh-420px)] min-h-[200px] overflow-y-auto pr-1">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    disabled={isLoadingDetail}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-all rounded-lg border ${
                      selectedLessonId === lesson.id
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-600 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedLessonId === lesson.id && isLoadingDetail ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-blue-500" />
                      ) : selectedLessonId === lesson.id ? (
                        <Check className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="truncate font-medium">{lesson.name}</span>
                    </div>
                    {lesson.lesson_type && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block pl-6">{lesson.lesson_type}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default LessonPlanBuilderSidebar;
