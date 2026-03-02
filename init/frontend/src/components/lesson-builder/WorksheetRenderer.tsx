/**
 * WorksheetRenderer - Render phiếu học tập từ worksheet_data JSON
 * Chỉ hỗ trợ 2 dạng câu hỏi:
 * - Dạng 1: Câu hỏi + dòng kẻ trả lời
 * - Dạng 2: Câu hỏi + code + dòng kẻ trả lời
 */
import React from "react";
import type { WorksheetData } from "@/types/lessonBuilder";

interface WorksheetRendererProps {
  data: WorksheetData;
  title?: string;
  editable?: boolean;
  className?: string;
  forPrint?: boolean;
}

const DottedLine: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="worksheet-answer-line"
        style={{
          borderBottom: "1px dotted #000",
          height: "1.8em",
          margin: "0.3em 0",
          width: "100%",
        }}
      />
    ))}
  </>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <pre
    className="bg-stone-50 border border-stone-200 rounded-md p-3 font-mono text-sm overflow-x-auto my-2"
    style={{ whiteSpace: "pre-wrap", tabSize: 4 }}
  >
    {code}
  </pre>
);

const QuestionRenderer: React.FC<{
  question: { id: string; text: string; code?: string; answer_lines?: number };
  qIndex: number;
}> = ({ question, qIndex }) => {
  return (
    <div className="mb-4">
      {/* Câu hỏi */}
      <div className="font-medium mb-2">
        <strong>Câu {qIndex + 1}:</strong> {question.text}
      </div>

      {/* Code block (Dạng 2) */}
      {question.code && <CodeBlock code={question.code} />}

      {/* Dòng kẻ trả lời */}
      {question.answer_lines && question.answer_lines > 0 && (
        <div className="ml-4 mt-2">
          <DottedLine count={question.answer_lines} />
        </div>
      )}
    </div>
  );
};

export const WorksheetRenderer: React.FC<WorksheetRendererProps> = ({
  data,
  title,
  className = "",
  forPrint = false,
}) => {
  const worksheetTitle =
    title || `Phiếu học tập số ${data.worksheet_number}`;
  const isGroup = data.type === "group";

  return (
    <div
      className={`worksheet-container ${className}`}
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: forPrint ? "13pt" : "14px",
        lineHeight: 1.6,
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold uppercase mb-2">{worksheetTitle}</h3>
        {isGroup && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-medium">NHÓM:</span>
            <span
              className="inline-block border-b border-dotted border-stone-400"
              style={{ width: "150px", height: "1.2em" }}
            />
          </div>
        )}
      </div>

      {/* Task description */}
      {data.task && (
        <div className="mb-4">
          <strong>Nhiệm vụ:</strong> {data.task}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {data.questions.map((q, idx) => (
          <QuestionRenderer
            key={q.id}
            question={q}
            qIndex={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default WorksheetRenderer;
