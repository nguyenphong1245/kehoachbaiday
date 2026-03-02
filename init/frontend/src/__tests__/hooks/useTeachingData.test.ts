import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useTeachingData } from "@/hooks/useTeachingData";

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTeachingData", () => {
  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------
  describe("initial state", () => {
    it("returns loading=true and empty arrays initially", () => {
      // Make fetch hang so we can inspect the initial state
      mockFetch.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useTeachingData());

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.methods).toEqual([]);
      expect(result.current.techniques).toEqual([]);
    });

    it("exposes getMethodContent and getTechniqueContent helpers", () => {
      mockFetch.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useTeachingData());

      expect(typeof result.current.getMethodContent).toBe("function");
      expect(typeof result.current.getTechniqueContent).toBe("function");
    });
  });

  // -----------------------------------------------------------------------
  // Successful fetch
  // -----------------------------------------------------------------------
  describe("successful data fetch", () => {
    it("populates methods and techniques after fetch completes", async () => {
      const mockResponse = {
        book_types: [],
        grades: [],
        methods: [
          { value: "m1", label: "Method 1", cach_tien_hanh: "Step by step" },
        ],
        techniques: [
          { value: "t1", label: "Technique 1", cach_tien_hanh: "Do this" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.methods).toHaveLength(1);
      expect(result.current.methods[0].value).toBe("m1");
      expect(result.current.methods[0].label).toBe("Method 1");
      expect(result.current.methods[0].cach_tien_hanh).toBe("Step by step");

      expect(result.current.techniques).toHaveLength(1);
      expect(result.current.techniques[0].value).toBe("t1");
      expect(result.current.techniques[0].label).toBe("Technique 1");

      expect(result.current.error).toBeNull();
    });

    it("getMethodContent returns content for a known method", async () => {
      const mockResponse = {
        book_types: [],
        grades: [],
        methods: [
          { value: "m1", label: "Method 1", cach_tien_hanh: "How to do it" },
        ],
        techniques: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getMethodContent("m1")).toContain("How to do it");
      expect(result.current.getMethodContent("nonexistent")).toBeNull();
    });

    it("getTechniqueContent returns content for a known technique", async () => {
      const mockResponse = {
        book_types: [],
        grades: [],
        methods: [],
        techniques: [
          { value: "t1", label: "Technique 1", cach_tien_hanh: "Technique steps" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getTechniqueContent("t1")).toContain(
        "Technique steps"
      );
      expect(result.current.getTechniqueContent("unknown")).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------
  describe("error handling", () => {
    it("sets error state when fetch returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.methods).toEqual([]);
      expect(result.current.techniques).toEqual([]);
    });

    it("sets error state when fetch throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const { result } = renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Network failure");
    });
  });

  // -----------------------------------------------------------------------
  // Fetch call details
  // -----------------------------------------------------------------------
  describe("fetch call", () => {
    it("calls fetch with the correct URL and credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            book_types: [],
            grades: [],
            methods: [],
            techniques: [],
          }),
      });

      renderHook(() => useTeachingData());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Find the call that targets the static-data endpoint
      const staticDataCall = mockFetch.mock.calls.find(
        ([url]: [string]) =>
          typeof url === "string" && url.includes("/lesson-builder/static-data")
      );
      expect(staticDataCall).toBeDefined();

      const [url, options] = staticDataCall!;
      expect(url).toContain("/lesson-builder/static-data");
      expect(options.credentials).toBe("include");
      expect(options.headers["Content-Type"]).toBe("application/json");
    });
  });
});
