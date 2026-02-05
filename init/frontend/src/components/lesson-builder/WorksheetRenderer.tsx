/**
 * WorksheetRenderer - Render phiếu học tập từ worksheet_data JSON
 * Hỗ trợ:
 * - Câu hỏi với answer_lines (dòng trả lời)
 * - sub_items với blanks (ô trống inline)
 * - fill_blanks (điền khuyết)
 * - code_template (mẫu code có chỗ trống)
 * - kwl_table (bảng KWL)
 */
import React from "react";
import type {
  WorksheetData,
  WorksheetQuestion,
  WorksheetBlank,
} from "@/types/lessonBuilder";

interface WorksheetRendererProps {
  data: WorksheetData;
  title?: string;
  editable?: boolean;
  className?: string;
  forPrint?: boolean;
}

const getBlankWidth = (width?: "short" | "medium" | "long"): string => {
  switch (width) {
    case "short":
      return "80px";
    case "long":
      return "200px";
    default:
      return "120px";
  }
};

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

const BlankInput: React.FC<{
  label: string;
  width?: "short" | "medium" | "long";
  editable?: boolean;
}> = ({ label, width, editable }) => (
  <div className="flex items-baseline gap-1 mb-1">
    <span className="text-gray-600 text-sm flex-shrink-0">{label}:</span>
    {editable ? (
      <input
        type="text"
        className="flex-1 border-b border-dotted border-gray-400 bg-transparent px-1 min-w-[80px] focus:outline-none focus:border-blue-500"
      />
    ) : (
      <span
        className="flex-1 border-b border-dotted border-gray-400"
        style={{ height: "1.2em" }}
      />
    )}
  </div>
);

const FillBlankItem: React.FC<{
  before: string;
  after?: string;
  editable?: boolean;
}> = ({ before, after, editable }) => (
  <div className="flex items-baseline flex-wrap gap-1 mb-2">
    <span>{before}</span>
    {editable ? (
      <input
        type="text"
        className="border-b border-dotted border-gray-400 bg-transparent px-1 min-w-[120px] focus:outline-none focus:border-blue-500"
      />
    ) : (
      <span
        className="inline-block border-b border-dotted border-gray-400"
        style={{ width: "150px", height: "1.2em" }}
      />
    )}
    {after && <span>{after}</span>}
  </div>
);

const CodeTemplate: React.FC<{ code: string }> = ({ code }) => (
  <pre
    className="bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-sm overflow-x-auto my-2"
    style={{ whiteSpace: "pre-wrap", tabSize: 4 }}
  >
    {code.split("____").map((part, i, arr) =>
      i < arr.length - 1 ? (
        <React.Fragment key={i}>
          {part}
          <span
            className="inline-block border-b-2 border-dotted border-blue-400 bg-blue-50 mx-1"
            style={{ minWidth: "60px", height: "1.2em" }}
          />
        </React.Fragment>
      ) : (
        part
      )
    )}
  </pre>
);

const KWLTable: React.FC<{ editable?: boolean; forPrint?: boolean }> = ({
  editable,
  forPrint,
}) => {
  const cellHeight = forPrint ? "120px" : "100px";
  return (
    <table className="w-full border-collapse border border-gray-300 my-3">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 p-2 text-center font-bold w-1/3">
            K (Đã biết)
          </th>
          <th className="border border-gray-300 p-2 text-center font-bold w-1/3">
            W (Muốn biết)
          </th>
          <th className="border border-gray-300 p-2 text-center font-bold w-1/3">
            L (Đã học được)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {[0, 1, 2].map((i) => (
            <td
              key={i}
              className="border border-gray-300 p-2 align-top"
              style={{ height: cellHeight }}
            >
              {editable ? (
                <textarea
                  className="w-full h-full resize-none border-none focus:outline-none bg-transparent"
                  placeholder="Nhập nội dung..."
                />
              ) : (
                <div className="space-y-2">
                  <DottedLine count={4} />
                </div>
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

const QuestionRenderer: React.FC<{
  question: WorksheetQuestion;
  editable?: boolean;
  forPrint?: boolean;
}> = ({ question, editable, forPrint }) => {
  return (
    <div className="mb-4">
      <div className="font-medium mb-2">
        <strong>Câu {question.id}:</strong> {question.text}
      </div>

      {/* KWL Table */}
      {question.kwl_table && (
        <KWLTable editable={editable} forPrint={forPrint} />
      )}

      {/* Code template */}
      {question.code_template && <CodeTemplate code={question.code_template} />}

      {/* Fill blanks */}
      {question.fill_blanks && question.fill_blanks.length > 0 && (
        <div className="ml-4 mt-2">
          {question.fill_blanks.map((fb, i) => (
            <FillBlankItem
              key={i}
              before={fb.before}
              after={fb.after}
              editable={editable}
            />
          ))}
        </div>
      )}

      {/* Inline blanks (outside sub_items) */}
      {question.blanks && question.blanks.length > 0 && (
        <div className="ml-4 mt-2">
          {question.blanks.map((blank, i) => (
            <BlankInput
              key={i}
              label={blank.label}
              width={blank.width}
              editable={editable}
            />
          ))}
        </div>
      )}

      {/* Sub items (a, b, c, d...) */}
      {question.sub_items && question.sub_items.length > 0 && (
        <div className="ml-4 mt-2 space-y-3">
          {question.sub_items.map((item) => (
            <div key={item.id}>
              <div className="mb-1">
                <strong>{item.id})</strong> {item.text}
              </div>

              {/* Blanks in sub item */}
              {item.blanks && item.blanks.length > 0 && (
                <div className="ml-4">
                  {item.blanks.map((blank, i) => (
                    <BlankInput
                      key={i}
                      label={blank.label}
                      width={blank.width}
                      editable={editable}
                    />
                  ))}
                </div>
              )}

              {/* Answer lines in sub item */}
              {item.answer_lines && item.answer_lines > 0 && (
                <div className="ml-4">
                  <DottedLine count={item.answer_lines} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Answer lines for main question (only if no sub_items, no blanks, no fill_blanks, no code, no kwl) */}
      {!question.sub_items &&
        !question.blanks &&
        !question.fill_blanks &&
        !question.code_template &&
        !question.kwl_table &&
        question.answer_lines &&
        question.answer_lines > 0 && (
          <div className="ml-4 mt-2">
            <DottedLine count={question.answer_lines} />
          </div>
        )}

      {/* If has code_template with answer_lines, add lines after */}
      {question.code_template && question.answer_lines && question.answer_lines > 0 && (
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
  editable = false,
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
              className="inline-block border-b border-dotted border-gray-400"
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
        {data.questions.map((q) => (
          <QuestionRenderer
            key={q.id}
            question={q}
            editable={editable}
            forPrint={forPrint}
          />
        ))}
      </div>
    </div>
  );
};

export default WorksheetRenderer;
