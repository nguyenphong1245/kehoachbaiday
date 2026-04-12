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
  getSubjects,
  getTopics,
  searchLessons,
  getLessonDetail,
  generateLessonPlan,
  generateLessonPlanStream,
  editSuggest,
  editApply,
  generateMindmap,
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
} from "./lessonBuilderApi";

// Export functions
export { exportToWord } from "./wordExporter";
export { exportToPDF } from "./pdfExporter";
