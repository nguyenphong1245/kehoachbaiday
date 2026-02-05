import { describe, it, expect } from "vitest";
import { TOOLBAR, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS } from "./constants";

describe("TOOLBAR", () => {
  it("should contain items", () => {
    expect(TOOLBAR.length).toBeGreaterThan(0);
  });

  it("should have buttons with required properties", () => {
    const buttons = TOOLBAR.filter((item) => item.type === "button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      if (btn.type === "button") {
        expect(btn.icon).toBeDefined();
        expect(btn.label).toBeTruthy();
        expect(btn.command).toBeTruthy();
      }
    }
  });

  it("should have separators", () => {
    const separators = TOOLBAR.filter((item) => item.type === "separator");
    expect(separators.length).toBeGreaterThan(0);
  });
});

describe("FONT_SIZES", () => {
  it("should contain font size options", () => {
    expect(FONT_SIZES.length).toBeGreaterThan(0);
  });

  it("should have label and pt properties", () => {
    for (const fs of FONT_SIZES) {
      expect(fs.label).toBeTruthy();
      expect(fs.pt).toMatch(/^\d+pt$/);
    }
  });
});

describe("TEXT_COLORS", () => {
  it("should contain color options", () => {
    expect(TEXT_COLORS.length).toBeGreaterThan(0);
  });

  it("should have valid hex colors", () => {
    for (const c of TEXT_COLORS) {
      expect(c.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.label).toBeTruthy();
    }
  });
});

describe("HIGHLIGHT_COLORS", () => {
  it("should contain highlight options including transparent", () => {
    expect(HIGHLIGHT_COLORS.length).toBeGreaterThan(0);
    const transparent = HIGHLIGHT_COLORS.find((c) => c.color === "transparent");
    expect(transparent).toBeDefined();
  });
});
