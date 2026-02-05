/**
 * Export kế hoạch bài dạy sang Word theo format Công văn 5512
 * Cấu trúc giống hệt exportToPDF
 */
export const exportToWord = async (
  content: string,
  fileName: string,
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string }
): Promise<void> => {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          WidthType, BorderStyle, AlignmentType, convertInchesToTwip } = await import('docx');

  const FONT = "Times New Roman";
  const SIZE_13 = 26;  // 13pt
  const SIZE_14 = 28;  // 14pt
  const SIZE_12 = 24;  // 12pt cho table
  const SIZE_10 = 20;  // 10pt cho code

  // Xử lý inline markdown (bold, italic, code) - giống PDF
  const processInline = (text: string): InstanceType<typeof TextRun>[] => {
    const runs: InstanceType<typeof TextRun>[] = [];
    let result = text;

    // Tìm và xử lý từng pattern
    const patterns: Array<{regex: RegExp, process: (match: string, content: string) => InstanceType<typeof TextRun>}> = [
      { regex: /`([^`]+)`/g, process: (m, c) => new TextRun({ text: c, font: "Consolas", size: SIZE_10 }) },
      { regex: /\*\*\*([^*]+)\*\*\*/g, process: (m, c) => new TextRun({ text: c, bold: true, italics: true, font: FONT, size: SIZE_13 }) },
      { regex: /\*\*([^*]+)\*\*/g, process: (m, c) => new TextRun({ text: c, bold: true, font: FONT, size: SIZE_13 }) },
      { regex: /\*([^*\n]+)\*/g, process: (m, c) => new TextRun({ text: c, italics: true, font: FONT, size: SIZE_13 }) },
      { regex: /_([^_\n]+)_/g, process: (m, c) => new TextRun({ text: c, italics: true, font: FONT, size: SIZE_13 }) },
    ];

    // Simple approach: process sequentially
    const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        runs.push(new TextRun({ text: text.slice(lastIndex, match.index), font: FONT, size: SIZE_13 }));
      }

      if (match[2]) { // ***bold+italic***
        runs.push(new TextRun({ text: match[2], bold: true, italics: true, font: FONT, size: SIZE_13 }));
      } else if (match[3]) { // **bold**
        runs.push(new TextRun({ text: match[3], bold: true, font: FONT, size: SIZE_13 }));
      } else if (match[4]) { // *italic*
        runs.push(new TextRun({ text: match[4], italics: true, font: FONT, size: SIZE_13 }));
      } else if (match[5]) { // _italic_
        runs.push(new TextRun({ text: match[5], italics: true, font: FONT, size: SIZE_13 }));
      } else if (match[6]) { // `code`
        runs.push(new TextRun({ text: match[6], font: "Consolas", size: SIZE_10 }));
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      runs.push(new TextRun({ text: text.slice(lastIndex), font: FONT, size: SIZE_13 }));
    }

    return runs.length > 0 ? runs : [new TextRun({ text: text, font: FONT, size: SIZE_13 })];
  };

  // Lọc thông tin header bị lặp - giống PDF
  const filterLines = (lines: string[]): string[] => {
    return lines.filter(line => {
      const t = line.trim();
      if (/^#\s*KẾ HOẠCH BÀI DẠY/i.test(t)) return false;
      if (/^Thông tin chung/i.test(t)) return false;
      if (/^\*\*(TRƯỜNG|GIÁO VIÊN|TỔ|CHỦ ĐỀ|BÀI|Môn học|Lớp|Bộ sách|Thời lượng):\*\*/i.test(t)) return false;
      if (/^Thiết bị dạy học$/i.test(t)) return false;
      if (/^---+$/.test(t)) return false;
      return true;
    });
  };

  // Parse bảng markdown - giống PDF
  const parseTable = (tableLines: string[]): InstanceType<typeof Table> => {
    const parseCells = (line: string): string[] => {
      let c = line.trim();
      if (c.startsWith('|')) c = c.substring(1);
      if (c.endsWith('|')) c = c.substring(0, c.length - 1);
      return c.split('|').map(cell => cell.trim());
    };

    const headerCells = parseCells(tableLines[0]);
    const dataRows: string[][] = [];
    for (let j = 1; j < tableLines.length; j++) {
      const withoutPipes = tableLines[j].replace(/\|/g, '');
      if (/^[\s\-:]+$/.test(withoutPipes)) continue;
      dataRows.push(parseCells(tableLines[j]));
    }

    const rows: InstanceType<typeof TableRow>[] = [];
    const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };

    // Header row
    if (headerCells.length > 0) {
      rows.push(new TableRow({
        children: headerCells.map(cell => new TableCell({
          children: [new Paragraph({
            children: processInline(cell),
            alignment: AlignmentType.CENTER,
          })],
          shading: { fill: "F5F5F5" },
          borders: { top: border, bottom: border, left: border, right: border },
        })),
      }));
    }

    // Data rows
    dataRows.forEach(row => {
      rows.push(new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({ children: processInline(cell) })],
          borders: { top: border, bottom: border, left: border, right: border },
        })),
      }));
    });

    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  };

  // Parse toàn bộ markdown - giống logic PDF
  const parseMarkdown = (md: string): any[] => {
    const children: any[] = [];
    let lines = filterLines(md.split('\n'));

    const INDENT_25 = convertInchesToTwip(0.35);  // 25px - bullet list
    const INDENT_45 = convertInchesToTwip(0.63);  // 45px - plus list
    const INDENT_20 = convertInchesToTwip(0.28);  // 20px - blockquote

    // Tạo khung cho phiếu học tập
    const createWorksheetBox = (content: any[]): InstanceType<typeof Table> => {
      const border = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
      return new Table({
        rows: [new TableRow({
          children: [new TableCell({
            children: content,
            borders: { top: border, bottom: border, left: border, right: border },
            margins: { top: 150, bottom: 150, left: 200, right: 200 },
          })],
        })],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
    };

    // Tạo code block với khung, nền và syntax highlighting cho Python
    const createCodeBlock = (codeLines: string[]): InstanceType<typeof Table> => {
      const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };

      // Python keywords cho syntax highlighting
      const pythonKeywords = ['if', 'else', 'elif', 'for', 'while', 'def', 'class', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'print', 'input', 'int', 'str', 'float', 'list', 'dict', 'range'];
      const COLOR_KEYWORD = "0000FF";   // Blue
      const COLOR_STRING = "008000";    // Green
      const COLOR_COMMENT = "808080";   // Gray
      const COLOR_NUMBER = "FF6600";    // Orange
      const COLOR_FUNCTION = "795E26";  // Brown

      const highlightLine = (codeLine: string): InstanceType<typeof TextRun>[] => {
        const runs: InstanceType<typeof TextRun>[] = [];

        // Comment
        if (codeLine.trim().startsWith('#')) {
          return [new TextRun({ text: codeLine, font: "Consolas", size: SIZE_10, color: COLOR_COMMENT, italics: true })];
        }

        // Process token by token
        const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+\.?\d*|\w+|[^\s\w]+|\s+)/g;
        let match;
        while ((match = regex.exec(codeLine)) !== null) {
          const token = match[0];

          if (/^["']/.test(token)) {
            // String
            runs.push(new TextRun({ text: token, font: "Consolas", size: SIZE_10, color: COLOR_STRING }));
          } else if (/^\d+\.?\d*$/.test(token)) {
            // Number
            runs.push(new TextRun({ text: token, font: "Consolas", size: SIZE_10, color: COLOR_NUMBER }));
          } else if (pythonKeywords.includes(token)) {
            // Keyword
            runs.push(new TextRun({ text: token, font: "Consolas", size: SIZE_10, color: COLOR_KEYWORD, bold: true }));
          } else if (/^\w+$/.test(token) && codeLine.includes(token + '(')) {
            // Function call
            runs.push(new TextRun({ text: token, font: "Consolas", size: SIZE_10, color: COLOR_FUNCTION }));
          } else {
            // Normal
            runs.push(new TextRun({ text: token, font: "Consolas", size: SIZE_10, color: "000000" }));
          }
        }

        return runs.length > 0 ? runs : [new TextRun({ text: codeLine || " ", font: "Consolas", size: SIZE_10 })];
      };

      const paragraphs = codeLines.map(line => new Paragraph({
        children: highlightLine(line),
        spacing: { before: 0, after: 0 },
      }));

      return new Table({
        rows: [new TableRow({
          children: [new TableCell({
            children: paragraphs,
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: "F5F5F5" },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
          })],
        })],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
    };

    let i = 0;
    let insideWorksheet = false;
    let worksheetContent: any[] = [];
    let insideAppendix = false;  // Theo dõi đang ở phần PHỤ LỤC

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) { i++; continue; }

      // Phát hiện vào phần PHỤ LỤC
      if (trimmed.startsWith('#') && /PHỤ LỤC/i.test(trimmed)) {
        insideAppendix = true;
      }

      // Chỉ bao phiếu khi đang trong PHỤ LỤC
      // Phát hiện bắt đầu PHIẾU HỌC TẬP - chỉ match tiêu đề đúng format
      const worksheetStartMatch = insideAppendix && trimmed.match(/^\*?\*?PHIẾU HỌC TẬP\s+SỐ\s*\d+\*?\*?\s*$/i);
      if (worksheetStartMatch) {
        // Nếu đang trong phiếu cũ, đóng phiếu cũ trước
        if (insideWorksheet && worksheetContent.length > 0) {
          children.push(new Paragraph({ children: [] }));
          children.push(createWorksheetBox(worksheetContent));
          children.push(new Paragraph({ children: [] }));
        }
        // Bắt đầu phiếu mới
        insideWorksheet = true;
        worksheetContent = [];
        worksheetContent.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/\*\*/g, ''), bold: true, font: FONT, size: SIZE_13 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        }));
        i++;
        continue;
      }

      // Kết thúc PHIẾU HỌC TẬP khi gặp:
      // - Heading bắt đầu bằng # (không phải phiếu)
      // - Dòng "Câu trả lời", "Dự kiến", "Đáp án"
      const isEndWorksheet = insideWorksheet && (
        (trimmed.startsWith('#') && !/phiếu/i.test(trimmed)) ||
        /^(Câu trả lời|Dự kiến|Đáp án)/i.test(trimmed)
      );

      if (isEndWorksheet) {
        // Đóng phiếu hiện tại
        children.push(new Paragraph({ children: [] }));
        children.push(createWorksheetBox(worksheetContent));
        children.push(new Paragraph({ children: [] }));
        insideWorksheet = false;
        worksheetContent = [];
        // Tiếp tục xử lý dòng hiện tại (không i++)
      }

      const addPara = (p: any) => insideWorksheet ? worksheetContent.push(p) : children.push(p);

      // TABLE
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          addPara(new Paragraph({ children: [] }));
          addPara(parseTable(tableLines));
          addPara(new Paragraph({ children: [] }));
        }
        continue;
      }

      // CODE BLOCK - với khung và nền màu
      if (trimmed.startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++;
        if (codeLines.length > 0) {
          addPara(new Paragraph({ children: [] }));
          addPara(createCodeBlock(codeLines));
          addPara(new Paragraph({ children: [] }));
        }
        continue;
      }

      // H1 - Mục chính (I. MỤC TIÊU, II. THIẾT BỊ...)
      if (trimmed.startsWith('# ')) {
        addPara(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^#\s*/, '').toUpperCase(), bold: true, font: FONT, size: SIZE_14 })],
          spacing: { before: 250, after: 150 },
        }));
        i++; continue;
      }

      // H4
      if (trimmed.startsWith('#### ')) {
        addPara(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^####\s*/, ''), bold: true, font: FONT, size: SIZE_13 })],
          spacing: { before: 100, after: 60 },
        }));
        i++; continue;
      }

      // H3
      if (trimmed.startsWith('### ')) {
        addPara(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^###\s*/, ''), bold: true, font: FONT, size: SIZE_13 })],
          spacing: { before: 120, after: 80 },
        }));
        i++; continue;
      }

      // H2
      if (trimmed.startsWith('## ')) {
        addPara(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^##\s*/, ''), bold: true, font: FONT, size: SIZE_13 })],
          spacing: { before: 150, after: 100 },
        }));
        i++; continue;
      }

      // BLOCKQUOTE - Bước 1, Bước 2...
      if (trimmed.startsWith('> ')) {
        addPara(new Paragraph({
          children: processInline(trimmed.substring(2)),
          indent: { left: INDENT_20 },
          spacing: { before: 100, after: 50 },
        }));
        i++; continue;
      }

      // Các bước: **Bước 1. ...**
      const stepMatch = trimmed.match(/^-?\s*\*\*((Bước\s*\d+|B\d+)\.\s*[^*]+)\*\*:?$/i) ||
                        trimmed.match(/^>?\s*\*\*((Bước\s*\d+|B\d+)\.\s*[^*]+)\*\*$/i);
      if (stepMatch) {
        addPara(new Paragraph({
          children: [new TextRun({ text: stepMatch[1].replace(/:\s*$/, ''), bold: true, font: FONT, size: SIZE_13 })],
          indent: { left: INDENT_20 },
          spacing: { before: 100, after: 50 },
        }));
        i++; continue;
      }

      // Ordered list (1. 2. 3.)
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        addPara(new Paragraph({
          children: [new TextRun({ text: `${orderedMatch[1]}. `, font: FONT, size: SIZE_13 }), ...processInline(orderedMatch[2])],
          indent: { left: INDENT_25 },
          spacing: { before: 50, after: 50 },
        }));
        i++; continue;
      }

      // Letter list (a) b) c))
      const letterMatch = trimmed.match(/^([a-z])\)\s+(.+)$/i);
      if (letterMatch) {
        addPara(new Paragraph({
          children: [new TextRun({ text: `${letterMatch[1]}) `, font: FONT, size: SIZE_13 }), ...processInline(letterMatch[2])],
          indent: { left: INDENT_25 },
          spacing: { before: 50, after: 50 },
        }));
        i++; continue;
      }

      // Bullet list (- • *) - level 1
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
        const text = trimmed.substring(2);
        addPara(new Paragraph({
          children: [new TextRun({ text: "- ", font: FONT, size: SIZE_13 }), ...processInline(text)],
          indent: { left: INDENT_25 },
          spacing: { before: 50, after: 50 },
        }));
        i++; continue;
      }

      // Plus list (+ ○ ◦) - level 2
      if (trimmed.startsWith('+ ') || trimmed.startsWith('○ ') || trimmed.startsWith('◦ ')) {
        const text = trimmed.substring(2);
        addPara(new Paragraph({
          children: [new TextRun({ text: "+ ", font: FONT, size: SIZE_13 }), ...processInline(text)],
          indent: { left: INDENT_45 },
          spacing: { before: 50, after: 50 },
        }));
        i++; continue;
      }

      // Dòng trả lời (dấu chấm) - tạo đường kẻ dài đều
      if (/^\.{5,}$/.test(trimmed)) {
        // Tạo đường kẻ dài full width
        const fullLine = ".".repeat(120);
        addPara(new Paragraph({
          children: [new TextRun({ text: fullLine, font: FONT, size: SIZE_13 })],
          spacing: { before: 60, after: 60 },
        }));
        i++; continue;
      }

      // Paragraph thường
      addPara(new Paragraph({
        children: processInline(trimmed),
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 60, after: 60 },
      }));
      i++;
    }

    // Đóng phiếu học tập nếu còn
    if (insideWorksheet && worksheetContent.length > 0) {
      children.push(new Paragraph({ children: [] }));
      children.push(createWorksheetBox(worksheetContent));
    }

    return children;
  };

  // Header table - giống PDF (không có border)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const headerTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "TRƯỜNG: ", bold: true, font: FONT, size: SIZE_13 }),
                         new TextRun({ text: "........................................", font: FONT, size: SIZE_13 })],
            })],
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "GIÁO VIÊN: ", bold: true, font: FONT, size: SIZE_13 }),
                         new TextRun({ text: "........................................", font: FONT, size: SIZE_13 })],
            })],
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: "TỔ: ", bold: true, font: FONT, size: SIZE_13 }),
                         new TextRun({ text: "........................................", font: FONT, size: SIZE_13 })],
            })],
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          }),
          new TableCell({
            children: [new Paragraph({ children: [] })],
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Lesson header - căn giữa, in đậm
  const lessonHeader = [
    new Paragraph({ children: [], spacing: { after: 200 } }),
    new Paragraph({
      children: [new TextRun({ text: (lessonInfo?.topic || '').toUpperCase(), bold: true, font: FONT, size: SIZE_14 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: (lessonInfo?.lesson_name || '').toUpperCase(), bold: true, font: FONT, size: SIZE_14 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Môn học: Tin Học; Lớp: ${lessonInfo?.grade || ''}`, bold: true, font: FONT, size: SIZE_13 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `Bộ sách: ${lessonInfo?.book_type || ''}`, bold: true, font: FONT, size: SIZE_13 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: "(Thời lượng: 02 tiết)", bold: true, font: FONT, size: SIZE_13 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  ];

  const contentElements = parseMarkdown(content);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_13 },
          paragraph: { spacing: { line: 360 } }, // 1.5 line spacing
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.79),   // 2cm
            right: convertInchesToTwip(0.79), // 2cm
            bottom: convertInchesToTwip(0.79), // 2cm
            left: convertInchesToTwip(1.18),  // 3cm
          },
        },
      },
      children: [headerTable, ...lessonHeader, ...contentElements],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
