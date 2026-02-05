/**
 * Lesson Plan Builder Service - API calls
 */
import { api } from "./authService";
import type {
  LessonBasicInfo,
  LessonDetail,
  LessonSearchResponse,
  GenerateLessonPlanRequest,
  GenerateLessonPlanResponse,
  LessonPlanSection,
  SaveLessonPlanRequest,
  SaveLessonPlanResponse,
  SavedLessonPlanListResponse,
  SavedLessonPlan,
} from "@/types/lessonBuilder";

/**
 * Lấy danh sách chủ đề từ Neo4j theo loại sách và lớp
 */
export const getTopics = async (
  bookType: string,
  grade: string
): Promise<string[]> => {
  const { data } = await api.get<{ topics: string[] }>(
    "/lesson-builder/topics",
    { params: { book_type: bookType, grade: grade } }
  );
  return data.topics;
};

/**
 * Tìm kiếm bài học từ Neo4j
 */
export const searchLessons = async (
  bookType: string,
  grade: string,
  topic: string
): Promise<LessonSearchResponse> => {
  const { data } = await api.post<LessonSearchResponse>(
    "/lesson-builder/lessons/search",
    {
      book_type: bookType,
      grade: grade,
      topic: topic,
    }
  );
  return data;
};

/**
 * Lấy chi tiết bài học
 */
export const getLessonDetail = async (
  lessonId: string
): Promise<LessonDetail> => {
  const { data } = await api.get<LessonDetail>(
    `/lesson-builder/lessons/${lessonId}`
  );
  return data;
};

/**
 * Sinh kế hoạch bài dạy
 */
export const generateLessonPlan = async (
  request: GenerateLessonPlanRequest
): Promise<GenerateLessonPlanResponse> => {
  const { data } = await api.post<GenerateLessonPlanResponse>(
    "/lesson-builder/generate",
    request
  );
  return data;
};

/**
 * SSE progress event types
 */
export interface SSEProgressEvent {
  type: "progress";
  step: number;
  total_steps: number;
  message: string;
}

export interface SSEResultEvent {
  type: "result";
  data: GenerateLessonPlanResponse;
}

export interface SSEErrorEvent {
  type: "error";
  message: string;
}

export type SSEEvent = SSEProgressEvent | SSEResultEvent | SSEErrorEvent;

/**
 * Sinh kế hoạch bài dạy với SSE progress streaming
 */
export const generateLessonPlanStream = (
  request: GenerateLessonPlanRequest,
  onProgress: (event: SSEProgressEvent) => void,
  onResult: (result: GenerateLessonPlanResponse) => void,
  onError: (message: string) => void,
): AbortController => {
  const controller = new AbortController();
  const baseURL =
    import.meta.env.VITE_API_URL ?? "/api/v1";

  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

  fetch(`${baseURL}/lesson-builder/generate-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
    },
    credentials: "include", // Send httpOnly cookies
    body: JSON.stringify(request),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        // Xử lý lỗi 401/403 với thông báo thân thiện
        if (response.status === 401 || response.status === 403) {
          throw new Error("Phiên đăng nhập đã hết hạn hoặc bạn hết lượt soạn bài. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.");
        }
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Lỗi server: ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event: SSEEvent = JSON.parse(jsonStr);
            if (event.type === "progress") {
              onProgress(event as SSEProgressEvent);
            } else if (event.type === "result") {
              onResult((event as SSEResultEvent).data);
            } else if (event.type === "error") {
              onError((event as SSEErrorEvent).message);
            }
          } catch {
            // skip invalid JSON lines
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        // Xử lý lỗi mạng/CORS với thông báo thân thiện
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          onError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đăng nhập lại.");
        } else {
          onError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
      }
    });

  return controller;
};

/**
 * Cải thiện nội dung section với AI
 */
export interface RelatedAppendix {
  section_id: string;
  section_type: string;
  title: string;
  content: string;
}

export interface UpdatedAppendix {
  section_id: string;
  improved_content: string;
}

export interface ImproveResult {
  improved_content: string;
  updated_appendices?: UpdatedAppendix[];
}

export const improveWithAI = async (
  sectionType: string,
  sectionTitle: string,
  currentContent: string,
  userRequest: string,
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string },
  relatedAppendices?: RelatedAppendix[]
): Promise<ImproveResult> => {
  const { data } = await api.post<{
    improved_content: string;
    updated_appendices?: UpdatedAppendix[];
  }>(
    "/lesson-builder/improve-section",
    {
      section_type: sectionType,
      section_title: sectionTitle,
      current_content: currentContent,
      user_request: userRequest,
      lesson_info: lessonInfo || {},
      related_appendices: relatedAppendices || null,
    }
  );
  return {
    improved_content: data.improved_content,
    updated_appendices: data.updated_appendices,
  };
};

// ============== MINDMAP GENERATION API ==============

/**
 * Sinh sơ đồ tư duy (markdown headings) cho một hoạt động
 */
export const generateMindmap = async (
  lessonId: string,
  lessonName: string,
  activityContent: string,
  activityName: string,
): Promise<string> => {
  const { data } = await api.post<{ mindmap_data: string }>(
    "/lesson-builder/generate-mindmap",
    {
      lesson_id: lessonId,
      lesson_name: lessonName,
      activity_content: activityContent,
      activity_name: activityName,
    }
  );
  return data.mindmap_data;
};

// ============== SAVED LESSON PLANS API ==============

/**
 * Lưu giáo án
 */
export const saveLessonPlan = async (
  request: SaveLessonPlanRequest
): Promise<SaveLessonPlanResponse> => {
  const { data } = await api.post<SaveLessonPlanResponse>(
    "/lesson-builder/saved",
    request
  );
  return data;
};

/**
 * Lấy danh sách giáo án đã lưu
 */
export const getSavedLessonPlans = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<SavedLessonPlanListResponse> => {
  const { data } = await api.get<SavedLessonPlanListResponse>(
    "/lesson-builder/saved",
    {
      params: {
        page,
        page_size: pageSize,
        ...(search && { search }),
      },
    }
  );
  return data;
};
/**
 * Lấy chi tiết một giáo án đã lưu
 */
export const getSavedLessonPlan = async (
  lessonPlanId: string
): Promise<SavedLessonPlan> => {
  const { data } = await api.get<SavedLessonPlan>(
    `/lesson-builder/saved/${lessonPlanId}`
  );
  return data;
};

/**
 * Cập nhật một giáo án đã lưu
 */
export const updateSavedLessonPlan = async (
  lessonPlanId: string,
  updateData: {
    title?: string;
    sections?: LessonPlanSection[];
    full_content?: string;
  }
): Promise<SavedLessonPlan> => {
  const { data } = await api.put<SavedLessonPlan>(
    `/lesson-builder/saved/${lessonPlanId}`,
    updateData
  );
  return data;
};

/**
 * Xóa một giáo án đã lưu
 */
export const deleteSavedLessonPlan = async (
  lessonPlanId: string
): Promise<void> => {
  await api.delete(`/lesson-builder/saved/${lessonPlanId}`);
};

// Export as lessonBuilderApi object for convenience
export const lessonBuilderApi = {
  getTopics,
  searchLessons,
  getLessonDetail,
  generateLessonPlan,
  improveWithAI,
  generateMindmap,
  saveLessonPlan,
  getSavedLessonPlans,
  getSavedLessonPlan,
  deleteSavedLessonPlan,
};
