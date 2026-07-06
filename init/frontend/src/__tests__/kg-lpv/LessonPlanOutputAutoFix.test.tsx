import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { LessonPlanOutput } from "@/components/lesson-builder/LessonPlanOutput";
import type { GenerateLessonPlanResponse } from "@/types/lessonBuilder";

// jsdom does not implement ResizeObserver; RichTextEditor (rendered inside
// LessonPlanOutput) observes its header element on mount.
beforeAll(() => {
  (globalThis as any).ResizeObserver =
    (globalThis as any).ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const makeResult = (): GenerateLessonPlanResponse => ({
  lesson_info: {
    book_type: "Kết nối tri thức",
    grade: "10",
    topic: "Bai 1",
    lesson_name: "Bai 1: Test",
  },
  sections: [
    {
      section_id: "muc_tieu",
      section_type: "muc_tieu",
      title: "I. MỤC TIÊU",
      content: "Nội dung mục tiêu.",
      editable: true,
    },
  ],
  full_content: "",
});

const openActionsMenu = () => {
  const trigger = screen.getByTitle("Hành động");
  fireEvent.click(trigger);
};

describe("LessonPlanOutput - Sửa tự động menu item", () => {
  it("shows the 'Sửa tự động' button when autoFixEnabled and calls onAutoFix on click", () => {
    const onAutoFix = vi.fn();
    render(
      <LessonPlanOutput
        result={makeResult()}
        onSectionUpdate={vi.fn()}
        autoFixEnabled
        onAutoFix={onAutoFix}
      />
    );

    openActionsMenu();

    const button = screen.getByText("Sửa tự động");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onAutoFix).toHaveBeenCalledTimes(1);
  });

  it("does not show the 'Sửa tự động' button when autoFixEnabled is false/undefined", () => {
    render(
      <LessonPlanOutput
        result={makeResult()}
        onSectionUpdate={vi.fn()}
      />
    );

    openActionsMenu();

    expect(screen.queryByText("Sửa tự động")).not.toBeInTheDocument();
  });
});
