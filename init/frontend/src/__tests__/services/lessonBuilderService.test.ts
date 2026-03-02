import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// ---------------------------------------------------------------------------
// Mock the api instance exported by authService
// ---------------------------------------------------------------------------
vi.mock("@/services/authService", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/services/authService";
import {
  getSubjects,
  getTopics,
  searchLessons,
  getLessonDetail,
  getSavedLessonPlans,
  getSavedLessonPlan,
  saveLessonPlan,
  updateSavedLessonPlan,
  deleteSavedLessonPlan,
} from "@/services/lessonBuilderService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("lessonBuilderService", () => {
  // -----------------------------------------------------------------------
  // Static / reference data
  // -----------------------------------------------------------------------
  describe("getSubjects", () => {
    it("fetches subjects from /lesson-builder/subjects", async () => {
      const mockSubjects = { subjects: ["Math", "Science"] };
      (api.get as Mock).mockResolvedValueOnce({ data: mockSubjects });

      const result = await getSubjects();

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/subjects");
      expect(result).toEqual(["Math", "Science"]);
    });
  });

  describe("getTopics", () => {
    it("fetches topics with params", async () => {
      const mockTopics = { topics: ["Algebra", "Geometry"] };
      (api.get as Mock).mockResolvedValueOnce({ data: mockTopics });

      const result = await getTopics("SGK", "10", "Math");

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/topics", {
        params: { book_type: "SGK", grade: "10", subject: "Math" },
      });
      expect(result).toEqual(["Algebra", "Geometry"]);
    });
  });

  describe("searchLessons", () => {
    it("posts search criteria and returns lessons", async () => {
      const mockResponse = { lessons: [{ id: "1", name: "Lesson 1" }] };
      (api.post as Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await searchLessons("SGK", "10", "Algebra", "Math");

      expect(api.post).toHaveBeenCalledWith("/lesson-builder/lessons/search", {
        book_type: "SGK",
        grade: "10",
        topic: "Algebra",
        subject: "Math",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getLessonDetail", () => {
    it("fetches detail for a specific lesson", async () => {
      const mockDetail = {
        id: "abc",
        name: "Lesson Detail",
        content: "...",
      };
      (api.get as Mock).mockResolvedValueOnce({ data: mockDetail });

      const result = await getLessonDetail("abc");

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/lessons/abc");
      expect(result).toEqual(mockDetail);
    });
  });

  // -----------------------------------------------------------------------
  // Saved lesson plans
  // -----------------------------------------------------------------------
  describe("getSavedLessonPlans", () => {
    it("lists saved plans with default pagination", async () => {
      const mockList = { items: [], total: 0, page: 1, page_size: 10 };
      (api.get as Mock).mockResolvedValueOnce({ data: mockList });

      const result = await getSavedLessonPlans();

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/saved", {
        params: { page: 1, page_size: 10 },
      });
      expect(result).toEqual(mockList);
    });

    it("passes custom page, pageSize, and search params", async () => {
      const mockList = { items: [], total: 5, page: 2, page_size: 5 };
      (api.get as Mock).mockResolvedValueOnce({ data: mockList });

      const result = await getSavedLessonPlans(2, 5, "algebra");

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/saved", {
        params: { page: 2, page_size: 5, search: "algebra" },
      });
      expect(result).toEqual(mockList);
    });
  });

  describe("getSavedLessonPlan", () => {
    it("fetches a single saved plan by ID", async () => {
      const mockPlan = { id: "plan-1", title: "My Plan" };
      (api.get as Mock).mockResolvedValueOnce({ data: mockPlan });

      const result = await getSavedLessonPlan("plan-1");

      expect(api.get).toHaveBeenCalledWith("/lesson-builder/saved/plan-1");
      expect(result).toEqual(mockPlan);
    });
  });

  describe("saveLessonPlan", () => {
    it("posts new lesson plan to /lesson-builder/saved", async () => {
      const request = { title: "New Plan", sections: [], full_content: "" } as any;
      const mockResp = { id: "new-1", title: "New Plan" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await saveLessonPlan(request);

      expect(api.post).toHaveBeenCalledWith("/lesson-builder/saved", request);
      expect(result).toEqual(mockResp);
    });
  });

  describe("updateSavedLessonPlan", () => {
    it("puts updated data to /lesson-builder/saved/:id", async () => {
      const updateData = { title: "Updated Title" };
      const mockResp = { id: "plan-1", title: "Updated Title" };
      (api.put as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await updateSavedLessonPlan("plan-1", updateData);

      expect(api.put).toHaveBeenCalledWith(
        "/lesson-builder/saved/plan-1",
        updateData
      );
      expect(result).toEqual(mockResp);
    });
  });

  describe("deleteSavedLessonPlan", () => {
    it("sends DELETE to /lesson-builder/saved/:id", async () => {
      (api.delete as Mock).mockResolvedValueOnce({ data: undefined });

      await deleteSavedLessonPlan("plan-1");

      expect(api.delete).toHaveBeenCalledWith("/lesson-builder/saved/plan-1");
    });
  });
});
