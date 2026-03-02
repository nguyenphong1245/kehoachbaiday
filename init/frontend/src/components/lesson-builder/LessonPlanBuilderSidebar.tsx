/**
 * LessonPlanBuilderSidebar - Thanh ben trai chon bai hoc
 * Phong cach hanh chinh - Gon gang, chuyen nghiep
 */
import React, { useState, useEffect } from "react";
import { ChevronDown, Loader2, Check, PanelLeftClose } from "lucide-react";
import {
  GRADES,
  type LessonBasicInfo,
  type LessonDetail,
} from "@/types/lessonBuilder";
import { searchLessons, getLessonDetail, getTopics, getSubjects } from "@/services/lessonBuilderService";

interface LessonPlanBuilderSidebarProps {
  onLessonSelect: (lesson: LessonDetail) => void;
  selectedLesson: LessonDetail | null;
  onCollapse?: () => void;
}

export const LessonPlanBuilderSidebar: React.FC<LessonPlanBuilderSidebarProps> = ({
  onLessonSelect,
  selectedLesson,
  onCollapse,
}) => {
  const [selectedBookType] = useState<string>("Kết nối tri thức với cuộc sống");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [lessons, setLessons] = useState<LessonBasicInfo[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Load subjects on mount, default to first (Tin Học)
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getSubjects();
        setSubjects(list);
        if (list.length > 0) setSelectedSubject(list[0]);
      } catch {
        setSubjects(["Tin Học"]);
        setSelectedSubject("Tin Học");
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedBookType && selectedGrade && selectedSubject) {
      loadTopics();
    } else {
      setTopics([]);
    }
    setSelectedTopic("");
    setLessons([]);
    setSelectedLessonId("");
  }, [selectedBookType, selectedGrade, selectedSubject]);

  const loadTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const topicList = await getTopics(selectedBookType, selectedGrade, selectedSubject);
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
      const result = await searchLessons(selectedBookType, selectedGrade, selectedTopic, selectedSubject);
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
    <aside className="w-72 h-full bg-white border-r border-stone-200 flex flex-col overflow-hidden shadow-sm">
      {/* Header - Fixed */}
      <div className="px-4 py-4 border-b border-stone-200 bg-stone-50 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Tìm kiếm bài học</h2>
          <p className="text-xs text-stone-500 mt-1">Chọn môn, lớp và chủ đề</p>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded transition-colors"
            title="Thu gọn"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selectors - Fixed */}
      <div className="p-4 space-y-4 border-b border-stone-100">
        {/* Môn học */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Môn học</label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand focus:border-brand appearance-none cursor-pointer hover:border-brand-light transition-colors"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Khối lớp */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Khối lớp</label>
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand focus:border-brand appearance-none cursor-pointer hover:border-brand-light transition-colors"
            >
              <option value="">-- Chọn lớp --</option>
              {GRADES.map((grade) => (
                <option key={grade.value} value={grade.value}>{grade.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Chủ đề */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 uppercase tracking-wide">
            Chủ đề
            {isLoadingTopics && <Loader2 className="w-3 h-3 animate-spin text-brand" />}
          </label>
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedGrade || isLoadingTopics || topics.length === 0}
              className="w-full px-3 py-2.5 pr-8 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:ring-2 focus:ring-brand focus:border-brand appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate hover:border-brand-light transition-colors"
            >
              <option value="">
                {isLoadingTopics ? "Đang tải..." : topics.length === 0 ? "-- Chọn lớp trước --" : "-- Chọn chủ đề --"}
              </option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Lesson List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {selectedTopic && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Danh sách bài học</label>
              <span className="text-xs font-medium text-brand bg-sky-50 px-2 py-0.5 rounded-full">{lessons.length} bài</span>
            </div>

            {isLoadingLessons ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-8 text-sm text-stone-400">Không tìm thấy bài học</div>
            ) : (
              <div className="space-y-1.5">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    disabled={isLoadingDetail}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-all rounded-lg border ${
                      selectedLessonId === lesson.id
                        ? "bg-sky-50 text-brand-dark border-sky-300 shadow-sm"
                        : "text-stone-700 bg-stone-50 border-stone-200 hover:bg-sky-50/50 hover:border-sky-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedLessonId === lesson.id && isLoadingDetail ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-brand" />
                      ) : selectedLessonId === lesson.id ? (
                        <Check className="w-4 h-4 flex-shrink-0 text-brand" />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="truncate font-medium">{lesson.name}</span>
                    </div>
                    {lesson.lesson_type && (
                      <span className="text-xs text-stone-500 mt-1 block pl-6">{lesson.lesson_type}</span>
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
