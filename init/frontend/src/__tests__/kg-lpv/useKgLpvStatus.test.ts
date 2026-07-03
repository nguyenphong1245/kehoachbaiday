import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useKgLpvStatus } from "@/hooks/useKgLpvStatus";
import { getStatus } from "@/services/kgLpvApi";

vi.mock("@/services/kgLpvApi", () => ({
  getStatus: vi.fn(),
}));

const mockedGetStatus = vi.mocked(getStatus);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useKgLpvStatus", () => {
  it("returns loading=true before the status call resolves", () => {
    mockedGetStatus.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useKgLpvStatus());

    expect(result.current.loading).toBe(true);
    expect(result.current.enabled).toBe(false);
  });

  it("hides UI (enabled=false) when module disabled", async () => {
    mockedGetStatus.mockResolvedValueOnce({
      enabled: false,
      availability: "disabled",
      graph: { connected: false },
      version: "1.0",
    });

    const { result } = renderHook(() => useKgLpvStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.enabled).toBe(false);
    expect(result.current.availability).toBe("disabled");
  });

  it("shows UI (enabled=true, availability=ok) when module fully ready", async () => {
    mockedGetStatus.mockResolvedValueOnce({
      enabled: true,
      availability: "ok",
      graph: { connected: true, node_count: 42 },
      version: "1.0",
    });

    const { result } = renderHook(() => useKgLpvStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.enabled).toBe(true);
    expect(result.current.availability).toBe("ok");
  });

  it("treats a failed status call as disabled (fail-safe)", async () => {
    mockedGetStatus.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useKgLpvStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.enabled).toBe(false);
    expect(result.current.availability).toBe("disabled");
  });
});
