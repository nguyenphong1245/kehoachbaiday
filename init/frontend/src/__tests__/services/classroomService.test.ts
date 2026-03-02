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
  getClassrooms,
  createClassroom,
  getClassroomDetail,
  updateClassroom,
  deleteClassroom,
  uploadStudents,
  addStudent,
  removeStudent,
  createGroup,
  deleteGroup,
} from "@/services/classroomService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("classroomService", () => {
  // -----------------------------------------------------------------------
  // Classroom CRUD
  // -----------------------------------------------------------------------
  describe("getClassrooms", () => {
    it("makes GET request to /classrooms/", async () => {
      const mockData = { items: [], total: 0 };
      (api.get as Mock).mockResolvedValueOnce({ data: mockData });

      const result = await getClassrooms();

      expect(api.get).toHaveBeenCalledWith("/classrooms/");
      expect(result).toEqual(mockData);
    });
  });

  describe("createClassroom", () => {
    it("makes POST request to /classrooms/ with payload", async () => {
      const payload = { name: "Class A", grade: "10" };
      const mockClassroom = { id: 1, name: "Class A", grade: "10" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockClassroom });

      const result = await createClassroom(payload);

      expect(api.post).toHaveBeenCalledWith("/classrooms/", payload);
      expect(result).toEqual(mockClassroom);
    });
  });

  describe("getClassroomDetail", () => {
    it("makes GET request to /classrooms/:id", async () => {
      const mockDetail = { id: 5, name: "Class B", students: [] };
      (api.get as Mock).mockResolvedValueOnce({ data: mockDetail });

      const result = await getClassroomDetail(5);

      expect(api.get).toHaveBeenCalledWith("/classrooms/5");
      expect(result).toEqual(mockDetail);
    });
  });

  describe("updateClassroom", () => {
    it("makes PATCH request to /classrooms/:id with data", async () => {
      const updateData = { name: "Updated Name" };
      const mockResult = { id: 3, name: "Updated Name" };
      (api.patch as Mock).mockResolvedValueOnce({ data: mockResult });

      const result = await updateClassroom(3, updateData);

      expect(api.patch).toHaveBeenCalledWith("/classrooms/3", updateData);
      expect(result).toEqual(mockResult);
    });
  });

  describe("deleteClassroom", () => {
    it("makes DELETE request to /classrooms/:id", async () => {
      (api.delete as Mock).mockResolvedValueOnce({ data: undefined });

      await deleteClassroom(7);

      expect(api.delete).toHaveBeenCalledWith("/classrooms/7");
    });
  });

  // -----------------------------------------------------------------------
  // Student management
  // -----------------------------------------------------------------------
  describe("uploadStudents", () => {
    it("posts FormData to the upload endpoint", async () => {
      const file = new File(["name\nAlice"], "students.csv", {
        type: "text/csv",
      });
      const mockResp = { added: 1, skipped: 0 };
      (api.post as Mock).mockResolvedValueOnce({ data: mockResp });

      const result = await uploadStudents(1, file);

      expect(api.post).toHaveBeenCalledWith(
        "/classrooms/1/upload-students",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      expect(result).toEqual(mockResp);
    });
  });

  describe("addStudent", () => {
    it("posts student data to /classrooms/:id/students", async () => {
      const studentData = { full_name: "Bob" };
      const mockStudent = { id: 10, full_name: "Bob" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockStudent });

      const result = await addStudent(2, studentData);

      expect(api.post).toHaveBeenCalledWith("/classrooms/2/students", studentData);
      expect(result).toEqual(mockStudent);
    });
  });

  describe("removeStudent", () => {
    it("makes DELETE request to /classrooms/:classId/students/:studentId", async () => {
      (api.delete as Mock).mockResolvedValueOnce({ data: undefined });

      await removeStudent(2, 10);

      expect(api.delete).toHaveBeenCalledWith("/classrooms/2/students/10");
    });
  });

  // -----------------------------------------------------------------------
  // Group management
  // -----------------------------------------------------------------------
  describe("createGroup", () => {
    it("posts group data to /classrooms/:id/groups", async () => {
      const groupData = { name: "Group 1", student_ids: [1, 2, 3] };
      const mockGroup = { id: 1, name: "Group 1" };
      (api.post as Mock).mockResolvedValueOnce({ data: mockGroup });

      const result = await createGroup(5, groupData);

      expect(api.post).toHaveBeenCalledWith("/classrooms/5/groups", groupData);
      expect(result).toEqual(mockGroup);
    });
  });

  describe("deleteGroup", () => {
    it("makes DELETE request to /classrooms/:classId/groups/:groupId", async () => {
      (api.delete as Mock).mockResolvedValueOnce({ data: undefined });

      await deleteGroup(5, 1);

      expect(api.delete).toHaveBeenCalledWith("/classrooms/5/groups/1");
    });
  });
});
