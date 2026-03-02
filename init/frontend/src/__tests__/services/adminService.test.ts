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
  getDashboardStats,
  getAllContent,
  deleteContent,
  updateTokenBalance,
  getPublicGuideCards,
  getAdminGuideCards,
  updateGuideCard,
  reorderGuideCards,
} from "@/services/adminService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminService", () => {
  // -----------------------------------------------------------------------
  // Dashboard stats
  // -----------------------------------------------------------------------
  describe("getDashboardStats", () => {
    it("fetches dashboard statistics from /admin/dashboard-stats", async () => {
      const mockStats = {
        total_users: 100,
        active_users: 80,
        verified_users: 70,
        total_lesson_plans: 50,
        total_quizzes: 30,
        total_worksheets: 20,
        total_code_exercises: 10,
        total_quiz_responses: 200,
        total_worksheet_responses: 150,
        total_code_submissions: 100,
        recent_users: [],
        top_teachers: [],
      };
      (api.get as Mock).mockResolvedValueOnce({ data: mockStats });

      const result = await getDashboardStats();

      expect(api.get).toHaveBeenCalledWith("/admin/dashboard-stats");
      expect(result).toEqual(mockStats);
      expect(result.total_users).toBe(100);
    });
  });

  // -----------------------------------------------------------------------
  // Content management (getAllContent serves as "user list" for content)
  // -----------------------------------------------------------------------
  describe("getAllContent", () => {
    it("fetches all content with default params", async () => {
      const mockContent = {
        items: [{ id: 1, type: "quiz", title: "Quiz 1" }],
        total: 1,
        page: 1,
        limit: 20,
      };
      (api.get as Mock).mockResolvedValueOnce({ data: mockContent });

      const result = await getAllContent();

      expect(api.get).toHaveBeenCalledWith("/admin/all-content", {
        params: { content_type: "all", page: 1, limit: 20 },
      });
      expect(result).toEqual(mockContent);
    });

    it("passes custom content type, page, and limit", async () => {
      const mockContent = { items: [], total: 0, page: 2, limit: 10 };
      (api.get as Mock).mockResolvedValueOnce({ data: mockContent });

      const result = await getAllContent("quiz", 2, 10);

      expect(api.get).toHaveBeenCalledWith("/admin/all-content", {
        params: { content_type: "quiz", page: 2, limit: 10 },
      });
      expect(result).toEqual(mockContent);
    });
  });

  describe("deleteContent", () => {
    it("sends DELETE to /admin/content/:type/:id", async () => {
      const mockResp = { message: "Deleted" };
      (api.delete as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await deleteContent("quiz", 5);

      expect(api.delete).toHaveBeenCalledWith("/admin/content/quiz/5");
      expect(result).toEqual(mockResp);
    });
  });

  describe("updateTokenBalance", () => {
    it("puts new token balance for a user", async () => {
      const mockResp = { message: "Updated", token_balance: 5000 };
      (api.put as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await updateTokenBalance(3, 5000);

      expect(api.put).toHaveBeenCalledWith("/admin/users/3/token-balance", {
        token_balance: 5000,
      });
      expect(result.token_balance).toBe(5000);
    });
  });

  // -----------------------------------------------------------------------
  // Guide cards
  // -----------------------------------------------------------------------
  describe("getPublicGuideCards", () => {
    it("fetches public guide cards", async () => {
      const mockCards = [
        { id: 1, card_key: "welcome", title: "Welcome" },
      ];
      (api.get as Mock).mockResolvedValueOnce({ data: mockCards });

      const result = await getPublicGuideCards();

      expect(api.get).toHaveBeenCalledWith("/guide-cards/");
      expect(result).toEqual(mockCards);
    });
  });

  describe("getAdminGuideCards", () => {
    it("fetches admin guide cards list", async () => {
      const mockCards = [
        { id: 1, card_key: "welcome", title: "Welcome", is_active: true },
      ];
      (api.get as Mock).mockResolvedValueOnce({ data: mockCards });

      const result = await getAdminGuideCards();

      expect(api.get).toHaveBeenCalledWith("/guide-cards/admin/all");
      expect(result).toEqual(mockCards);
    });
  });

  describe("updateGuideCard", () => {
    it("puts updated card data", async () => {
      const payload = { title: "Updated Card" };
      const mockResp = { id: 2, title: "Updated Card" };
      (api.put as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await updateGuideCard(2, payload);

      expect(api.put).toHaveBeenCalledWith("/guide-cards/admin/2", payload);
      expect(result).toEqual(mockResp);
    });
  });

  describe("reorderGuideCards", () => {
    it("puts new card order", async () => {
      const mockResp = [{ id: 2 }, { id: 1 }];
      (api.put as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await reorderGuideCards([2, 1]);

      expect(api.put).toHaveBeenCalledWith("/guide-cards/admin/reorder", {
        card_ids: [2, 1],
      });
      expect(result).toEqual(mockResp);
    });
  });
});
