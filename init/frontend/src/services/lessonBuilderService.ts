/**
 * Lesson Plan Builder Service - Barrel re-export
 *
 * Tách thành 3 module nhỏ hơn để dễ bảo trì:
 * - lessonBuilderApi.ts: API calls + SSE streaming + AI improve + saved CRUD
 * - wordExporter.ts: Export sang Word (.docx)
 * - pdfExporter.ts: Export sang PDF (print)
 */

// API calls, SSE streaming, AI improve, saved lesson plans CRUD
export {
  getTopics,
  searchLessons,
  getLessonDetail,
  generateLessonPlan,
  generateLessonPlanStream,
  improveWithAI,
  saveLessonPlan,
  getSavedLessonPlans,
  getSavedLessonPlan,
  updateSavedLessonPlan,
  deleteSavedLessonPlan,
  lessonBuilderApi,
} from "./lessonBuilderApi";

// SSE + improve types
export type {
  SSEProgressEvent,
  SSEResultEvent,
  SSEErrorEvent,
  SSEEvent,
  RelatedAppendix,
  UpdatedAppendix,
  ImproveResult,
} from "./lessonBuilderApi";

// Export functions
export { exportToWord } from "./wordExporter";
export { exportToPDF } from "./pdfExporter";
