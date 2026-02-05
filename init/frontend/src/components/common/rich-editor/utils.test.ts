import { describe, it, expect } from "vitest";
import { insertTableHTML } from "./utils";

describe("insertTableHTML", () => {
  it("should be a function", () => {
    expect(typeof insertTableHTML).toBe("function");
  });
});

describe("utility function exports", () => {
  it("should export all required functions", async () => {
    const utils = await import("./utils");
    expect(typeof utils.insertTableHTML).toBe("function");
    expect(typeof utils.insertLink).toBe("function");
    expect(typeof utils.applyFontSize).toBe("function");
    expect(typeof utils.detectCurrentFontSize).toBe("function");
    expect(typeof utils.saveSelection).toBe("function");
    expect(typeof utils.restoreSelection).toBe("function");
    expect(typeof utils.findClosestCell).toBe("function");
    expect(typeof utils.findClosestTable).toBe("function");
    expect(typeof utils.getCellPosition).toBe("function");
  });
});
