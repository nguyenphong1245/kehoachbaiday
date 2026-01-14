/**
 * Types cho Lesson Plan Builder
 */

// ============== CONSTANTS ==============
// NOTE: BOOK_TYPES và GRADES dùng làm fallback, thực tế sẽ lấy từ API
export const BOOK_TYPES = [
  { value: "Kết nối tri thức với cuộc sống", label: "Kết nối tri thức với cuộc sống" },
  { value: "Cánh diều", label: "Cánh diều" },
] as const;

export const GRADES = [
  { value: "10", label: "Lớp 10" },
  { value: "11", label: "Lớp 11" },
  { value: "12", label: "Lớp 12" },
] as const;

// NOTE: Topics sẽ được lấy động từ Neo4j theo book_type và grade
// Không còn hardcode TOPICS_BY_GRADE nữa

export const TEACHING_METHODS = [
  { value: "Dạy học hợp tác", label: "Dạy học hợp tác" },
  { value: "Dạy học theo dự án", label: "Dạy học theo dự án" },
  { value: "Giải quyết vấn đề", label: "Giải quyết vấn đề" },
  { value: "Dạy học khám phá", label: "Dạy học khám phá" },
  { value: "Dạy học qua trò chơi", label: "Dạy học qua trò chơi" },
  { value: "Nghiên cứu tình huống", label: "Nghiên cứu tình huống" },
  { value: "Thảo luận nhóm", label: "Thảo luận nhóm" },
  { value: "Thực hành", label: "Thực hành" },
  { value: "Thuyết trình", label: "Thuyết trình" },
] as const;

export const TEACHING_TECHNIQUES = [
  { value: "Think-Pair-Share", label: "Think-Pair-Share" },
  { value: "Mảnh ghép (Jigsaw)", label: "Mảnh ghép (Jigsaw)" },
  { value: "Phòng tranh (Gallery Walk)", label: "Phòng tranh (Gallery Walk)" },
  { value: "KWL", label: "KWL" },
  { value: "Động não (Brainstorming)", label: "Động não (Brainstorming)" },
  { value: "Sơ đồ tư duy", label: "Sơ đồ tư duy" },
  { value: "Bể cá (Fishbowl)", label: "Bể cá (Fishbowl)" },
  { value: "Đóng vai", label: "Đóng vai" },
  { value: "Trắc nghiệm", label: "Trắc nghiệm" },
  { value: "Flashcard", label: "Flashcard" },
  { value: "Dạy học đồng đẳng", label: "Dạy học đồng đẳng" },
] as const;

// ============== INTERFACES ==============

export interface LessonBasicInfo {
  id: string;
  name: string;
  lesson_type?: string;
}

export interface ChiMucInfo {
  order: number;
  content: string;
}

export interface LessonDetail {
  id: string;
  name: string;
  grade: string;
  book_type: string;
  topic: string;
  lesson_type?: string;
  objectives: string[];
  competencies: string[];
  chi_muc_list: ChiMucInfo[];
  content?: string;
  orientation?: string;
}

export interface ActivityConfig {
  activity_name: string;
  activity_type: "khoi_dong" | "hinh_thanh_kien_thuc" | "luyen_tap" | "van_dung";
  chi_muc?: string;
  selected_methods: string[];
  selected_techniques: string[];
  // Lưu nội dung cách tổ chức của phương pháp/kỹ thuật đã chọn
  methods_content?: { [key: string]: string };
  techniques_content?: { [key: string]: string };
}

export interface QuizQuestionItem {
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  answer: string;
}

// Import code exercise types
import { CodeExercise } from './codeExercise';

export interface LessonPlanSection {
  section_id: string;
  section_type: string;
  title: string;
  content: string;
  questions?: QuizQuestionItem[]; // Chỉ cho section trac_nghiem
  code_exercises?: CodeExercise[]; // Bài tập code (Parsons/Coding)
  editable: boolean;
}

export interface GenerateLessonPlanRequest {
  book_type: string;
  grade: string;
  topic: string;
  lesson_id: string;
  lesson_name: string;
  activities: ActivityConfig[];
}

export interface GenerateLessonPlanResponse {
  lesson_info: {
    book_type: string;
    grade: string;
    topic: string;
    lesson_name: string;
  };
  sections: LessonPlanSection[];
  full_content: string;
}

export interface LessonSearchResponse {
  lessons: LessonBasicInfo[];
  total: number;
}

// ============== STATE INTERFACES ==============

export interface LessonBuilderState {
  // Selection state
  selectedBookType: string;
  selectedGrade: string;
  selectedTopic: string;
  selectedLesson: LessonBasicInfo | null;
  lessonDetail: LessonDetail | null;
  
  // Activities configuration
  activities: ActivityConfig[];
  
  // Loading states
  isLoadingLessons: boolean;
  isLoadingDetail: boolean;
  isGenerating: boolean;
  
  // Results
  generatedPlan: GenerateLessonPlanResponse | null;
  
  // Errors
  error: string | null;
}

// Default activities configuration
export const DEFAULT_ACTIVITIES: ActivityConfig[] = [
  {
    activity_name: "Khởi động",
    activity_type: "khoi_dong",
    selected_methods: [],
    selected_techniques: [],
  },
  {
    activity_name: "Hình thành kiến thức",
    activity_type: "hinh_thanh_kien_thuc",
    selected_methods: [],
    selected_techniques: [],
  },
  {
    activity_name: "Luyện tập",
    activity_type: "luyen_tap",
    selected_methods: [],
    selected_techniques: [],
  },
  {
    activity_name: "Vận dụng",
    activity_type: "van_dung",
    selected_methods: [],
    selected_techniques: [],
  },
];

// ============== SAVED LESSON PLAN INTERFACES ==============

export interface SaveLessonPlanRequest {
  title: string;
  lesson_info: {
    book_type: string;
    grade: string;
    topic: string;
    lesson_name: string;
    lesson_id?: string;
  };
  sections: LessonPlanSection[];
  full_content: string;
  activities?: ActivityConfig[];
  original_content?: string;
  is_printed?: boolean;
}

export interface SaveLessonPlanResponse {
  id: number;
  message: string;
}

export interface SavedLessonPlanListItem {
  id: number;
  title: string;
  lesson_name?: string;
  book_type?: string;
  grade?: string;
  topic?: string;
  is_printed: boolean;
  print_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedLessonPlanListResponse {
  lesson_plans: SavedLessonPlanListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface SavedLessonPlan {
  id: number;
  user_id: number;
  title: string;
  book_type?: string;
  grade?: string;
  topic?: string;
  lesson_name?: string;
  lesson_id?: string;
  content: string;
  sections?: LessonPlanSection[];
  generation_params?: any;
  original_content?: string;
  is_printed: boolean;
  print_count: number;
  created_at: string;
  updated_at: string;
  // Computed/derived fields for ViewSavedLessonPlanPage
  lesson_info?: {
    book_type: string;
    grade: string;
    topic: string;
    lesson_name: string;
  };
  full_content?: string;
  activities?: ActivityConfig[];
}
