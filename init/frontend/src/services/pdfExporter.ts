import { sanitizeHTMLForExport } from "@/utils/sanitize";

export const exportToPDF = async (
  content: string,
  fileName: string,
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string },
  /** If provided, use this HTML directly instead of converting markdown */
  directHtml?: string
): Promise<Blob> => {
  // Convert Markdown sang HTML theo chuẩn Công văn 5512
  const markdownToHtml = (md: string): string => {
    // Tách thành từng dòng để xử lý
    let lines = md.split('\n');

    // ===== 0. LOẠI BỎ PHẦN THÔNG TIN CHUNG BỊ LẶP =====
    lines = lines.filter(line => {
      const trimmed = line.trim();
      // Xóa các dòng thông tin lặp
      if (/^#\s*KẾ HOẠCH BÀI DẠY/i.test(trimmed)) return false;
      if (/^Thông tin chung/i.test(trimmed)) return false;
      if (/^\*\*TRƯỜNG:\*\*/i.test(trimmed)) return false;
      if (/^\*\*GIÁO VIÊN:\*\*/i.test(trimmed)) return false;
      if (/^\*\*TỔ:\*\*/i.test(trimmed)) return false;
      if (/^\*\*CHỦ ĐỀ:\*\*/i.test(trimmed)) return false;
      if (/^\*\*BÀI:\*\*/i.test(trimmed)) return false;
      if (/^\*\*Môn học:\*\*/i.test(trimmed)) return false;
      if (/^\*\*Lớp:\*\*/i.test(trimmed)) return false;
      if (/^\*\*Bộ sách:\*\*/i.test(trimmed)) return false;
      if (/^\*\*Thời lượng:\*\*/i.test(trimmed)) return false;
      if (/^Thiết bị dạy học$/i.test(trimmed)) return false;
      if (/^---+$/.test(trimmed)) return false;
      return true;
    });

    // ===== 1. XỬ LÝ BẢNG MARKDOWN TRƯỚC =====
    function convertMarkdownTables(linesArray: string[]): string[] {
      const result: string[] = [];
      let i = 0;

      while (i < linesArray.length) {
        const line = linesArray[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const tableLines: string[] = [];
          while (i < linesArray.length) {
            const currentLine = linesArray[i].trim();
            if (currentLine.startsWith('|') && currentLine.endsWith('|')) {
              tableLines.push(currentLine);
              i++;
            } else if (currentLine === '') {
              break;
            } else {
              break;
            }
          }

          if (tableLines.length >= 2) {
            const tableHtml = parseMarkdownTable(tableLines);
            result.push(tableHtml);
          } else {
            tableLines.forEach(tl => result.push(tl));
          }
        } else {
          result.push(line);
          i++;
        }
      }

      return result;
    }

    function parseMarkdownTable(tableLines: string[]): string {
      let separatorIndex = -1;
      for (let j = 0; j < tableLines.length; j++) {
        const withoutPipes = tableLines[j].replace(/\|/g, '');
        if (/^[\s\-:]+$/.test(withoutPipes)) {
          separatorIndex = j;
          break;
        }
      }

      if (separatorIndex === -1 && tableLines.length >= 2) {
        separatorIndex = 1;
      }

      const headerCells = parseCells(tableLines[0]);
      const dataRows: string[][] = [];
      for (let j = 1; j < tableLines.length; j++) {
        const withoutPipes = tableLines[j].replace(/\|/g, '');
        if (/^[\s\-:]+$/.test(withoutPipes)) continue;
        dataRows.push(parseCells(tableLines[j]));
      }

      let html = '<table style="width:100%; border-collapse:collapse; margin:15px 0;">\n';

      if (headerCells.length > 0) {
        html += '  <thead>\n    <tr>\n';
        headerCells.forEach(cell => {
          html += `      <th style="border:1px solid #000; padding:8px; background-color:#f5f5f5; font-weight:bold; text-align:center;">${processInlineMarkdown(cell)}</th>\n`;
        });
        html += '    </tr>\n  </thead>\n';
      }

      if (dataRows.length > 0) {
        html += '  <tbody>\n';
        dataRows.forEach(row => {
          html += '    <tr>\n';
          row.forEach(cell => {
            html += `      <td style="border:1px solid #000; padding:8px; vertical-align:top;">${processInlineMarkdown(cell)}</td>\n`;
          });
          html += '    </tr>\n';
        });
        html += '  </tbody>\n';
      }

      html += '</table>';
      return html;
    }

    function parseCells(line: string): string[] {
      let content = line.trim();
      if (content.startsWith('|')) content = content.substring(1);
      if (content.endsWith('|')) content = content.substring(0, content.length - 1);
      return content.split('|').map(cell => cell.trim());
    }

    // Xử lý inline markdown (bold, italic, code)
    function processInlineMarkdown(text: string): string {
      let result = text;
      // Code inline
      result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
      // Bold + Italic (***text***)
      result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
      // Bold (**text**)
      result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic (*text*)
      result = result.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      // Italic với underscore (_text_)
      result = result.replace(/_([^_\n]+)_/g, '<em>$1</em>');
      // Replace long dot sequences with dotted line spans
      result = result.replace(/\.{6,}/g, '<span style="display:inline-block;min-width:40%;border-bottom:1px dotted #000;height:1.1em;vertical-align:bottom;">&nbsp;</span>');
      return result;
    }

    // ===== XỬ LÝ CODE BLOCKS TRƯỚC =====
    let contentWithCodeBlocks = lines.join('\n');

    contentWithCodeBlocks = contentWithCodeBlocks.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<!--CODE_BLOCK_START--><pre class="code-block"><code class="language-${lang}">${escapedCode}</code></pre><!--CODE_BLOCK_END-->`;
    });

    contentWithCodeBlocks = contentWithCodeBlocks.replace(/```\n?([\s\S]*?)```/g, (match, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<!--CODE_BLOCK_START--><pre class="code-block"><code class="language-python">${escapedCode}</code></pre><!--CODE_BLOCK_END-->`;
    });

    lines = contentWithCodeBlocks.split('\n');
    lines = convertMarkdownTables(lines);

    // Xử lý từng dòng
    let insideCodeBlock = false;
    const processedLines = lines.map(line => {
      if (line.includes('<!--CODE_BLOCK_START-->')) {
        insideCodeBlock = true;
        return line.replace('<!--CODE_BLOCK_START-->', '');
      }
      if (line.includes('<!--CODE_BLOCK_END-->')) {
        insideCodeBlock = false;
        return line.replace('<!--CODE_BLOCK_END-->', '');
      }

      if (insideCodeBlock) {
        return line;
      }

      const trimmed = line.trim();
      if (!trimmed) return '';

      // Bỏ qua các thẻ HTML đã xử lý
      if (trimmed.startsWith('<pre') || trimmed.startsWith('</pre') ||
          trimmed.startsWith('<code') || trimmed.startsWith('</code') ||
          trimmed.startsWith('<table') || trimmed.startsWith('</table') ||
          trimmed.startsWith('<thead') || trimmed.startsWith('</thead') ||
          trimmed.startsWith('<tbody') || trimmed.startsWith('</tbody') ||
          trimmed.startsWith('<tr') || trimmed.startsWith('</tr') ||
          trimmed.startsWith('<th') || trimmed.startsWith('</th') ||
          trimmed.startsWith('<td') || trimmed.startsWith('</td')) {
        return line;
      }

      // ===== HEADERS theo chuẩn Công văn 5512 =====
      // H1: Các mục chính (I. MỤC TIÊU, II. THIẾT BỊ, III. TIẾN TRÌNH, IV. PHỤ LỤC)
      if (trimmed.startsWith('# ') || trimmed.startsWith('#I.') || trimmed.match(/^#\s*(I|II|III|IV)\./)) {
        const content = trimmed.replace(/^#\s*/, '');
        return `<h1 id="${content.toLowerCase().replace(/\s+/g, '-')}">${content}</h1>`;
      }
      if (trimmed.startsWith('####')) {
        return `<h4>${processInlineMarkdown(trimmed.replace(/^#{4}\s*/, ''))}</h4>`;
      }
      if (trimmed.startsWith('###')) {
        return `<h3>${processInlineMarkdown(trimmed.replace(/^#{3}\s*/, ''))}</h3>`;
      }
      if (trimmed.startsWith('##')) {
        return `<h2>${processInlineMarkdown(trimmed.replace(/^#{2}\s*/, ''))}</h2>`;
      }
      if (trimmed.startsWith('#')) {
        return `<h1>${processInlineMarkdown(trimmed.replace(/^#{1}\s*/, ''))}</h1>`;
      }

      // ===== BLOCKQUOTE cho các bước (Bước 1, Bước 2...) =====
      if (trimmed.startsWith('> ')) {
        const blockContent = trimmed.substring(2);
        return `<blockquote><p>${processInlineMarkdown(blockContent)}</p></blockquote>`;
      }

      // ===== CÁC BƯỚC TRONG TỔ CHỨC THỰC HIỆN =====
      // Pattern: **Bước 1. Chuyển giao nhiệm vụ** hoặc - **B1. Chuyển giao nhiệm vụ:**
      const stepPatterns = [
        /^-?\s*\*\*((Bước\s*\d+|B\d+)\.\s*[^*]+)\*\*:?$/i,
        /^>?\s*\*\*((Bước\s*\d+|B\d+)\.\s*[^*]+)\*\*$/i,
      ];

      for (const pattern of stepPatterns) {
        const stepMatch = trimmed.match(pattern);
        if (stepMatch) {
          const stepContent = stepMatch[1].replace(/:\s*$/, '');
          return `<blockquote><p><strong>${stepContent}</strong></p></blockquote>`;
        }
      }

      // ===== DANH SÁCH =====
      // Ordered list (1. 2. 3.) hoặc (a) b) c)) - also handle escaped periods (1\. from Turndown)
      const orderedMatch = trimmed.match(/^(\d+)\\?\.\s+(.+)$/);
      if (orderedMatch) {
        return `<li class="ordered-item" value="${orderedMatch[1]}">${processInlineMarkdown(orderedMatch[2])}</li>`;
      }

      // Letter list (a) b) c) hoặc A. B. C.)
      const letterMatch = trimmed.match(/^([a-z])\)\s+(.+)$/i);
      if (letterMatch) {
        return `<li class="letter-item">${processInlineMarkdown(letterMatch[2])}</li>`;
      }

      // Unordered list với dấu - (level 1)
      if (trimmed.startsWith('- ')) {
        return `<li class="bullet-item">${processInlineMarkdown(trimmed.substring(2))}</li>`;
      }

      // Unordered list với dấu + (level 2)
      if (trimmed.startsWith('+ ')) {
        return `<li class="plus-item">${processInlineMarkdown(trimmed.substring(2))}</li>`;
      }

      // Unordered list với dấu ○ (circle bullet - cho năng lực) -> đổi thành dấu +
      if (trimmed.startsWith('○ ') || (trimmed.startsWith('○') && trimmed.length > 1)) {
        const content = trimmed.startsWith('○ ') ? trimmed.substring(2) : trimmed.substring(1).trim();
        return `<li class="plus-item">${processInlineMarkdown(content)}</li>`;
      }

      // Unordered list với dấu ◦ -> đổi thành dấu +
      if (trimmed.startsWith('◦ ') || (trimmed.startsWith('◦') && trimmed.length > 1)) {
        const content = trimmed.startsWith('◦ ') ? trimmed.substring(2) : trimmed.substring(1).trim();
        return `<li class="plus-item">${processInlineMarkdown(content)}</li>`;
      }

      // Unordered list với dấu •
      if (trimmed.startsWith('• ')) {
        return `<li class="bullet-item">${processInlineMarkdown(trimmed.substring(2))}</li>`;
      }

      // Unordered list với dấu *
      if (trimmed.startsWith('* ') && !trimmed.startsWith('**')) {
        return `<li class="bullet-item">${processInlineMarkdown(trimmed.substring(2))}</li>`;
      }

      // Nếu đã là HTML tag thì giữ nguyên
      if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('worksheet-box'))) {
        return line;
      }

      // Các dòng bình thường -> paragraph
      return `<p>${processInlineMarkdown(trimmed)}</p>`;
    });

    // Gộp lại và wrap lists
    let html = processedLines.join('\n');

    // Wrap các li liên tiếp trong ul/ol
    html = html.replace(/(<li class="ordered-item"[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ol class="ordered-list">$&</ol>');
    html = html.replace(/(<li class="letter-item">[\s\S]*?<\/li>\n?)+/g, '<ol class="letter-list" type="a">$&</ol>');
    html = html.replace(/(<li class="bullet-item">[\s\S]*?<\/li>\n?)+/g, '<ul class="bullet-list">$&</ul>');
    html = html.replace(/(<li class="plus-item">[\s\S]*?<\/li>\n?)+/g, '<ul class="plus-list">$&</ul>');

    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');

    // Phiếu học tập trong PDF xuất ra không cần đóng khung
    // (Chỉ tính năng "In PHT" riêng mới đóng khung - xử lý trong LessonPlanOutput)

    return html;
  };

  let htmlContent = sanitizeHTMLForExport(directHtml || markdownToHtml(content));

  // If using directHtml, strip repeated header info that's already in the template
  if (directHtml) {
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (tempDiv) {
      tempDiv.innerHTML = htmlContent;
      // Remove header elements that duplicate the template header
      const toRemove: Element[] = [];
      tempDiv.querySelectorAll('h1, h2, h3, p, strong').forEach(el => {
        const text = (el.textContent || '').trim();
        if (/^KẾ HOẠCH BÀI DẠY/i.test(text)) toRemove.push(el);
        if (/^Thông tin chung/i.test(text)) toRemove.push(el);
        if (/^(TRƯỜNG|GIÁO VIÊN|TỔ|CHỦ ĐỀ|BÀI|Môn học|Lớp|Bộ sách|Thời lượng):/i.test(text)) toRemove.push(el);
        if (/^Thiết bị dạy học$/i.test(text)) toRemove.push(el);
      });
      // Remove <hr> elements (--- separators)
      tempDiv.querySelectorAll('hr').forEach(el => toRemove.push(el));
      toRemove.forEach(el => el.remove());
      htmlContent = tempDiv.innerHTML;
    }
  }

  // Tạo HTML đầy đủ cho in - theo mẫu template.html (Công văn 5512)
  const printHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${fileName}</title>
      <!-- Highlight.js cho syntax highlighting -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
      <style>
        /* Ẩn header/footer của trình duyệt khi in (URL, ngày giờ, tiêu đề trang) */
        @page {
          size: A4;
          margin: 2cm 2cm 2cm 3cm;
          /* Ẩn header và footer mặc định của trình duyệt */
          margin-top: 0;
          margin-bottom: 0;
        }

        @media print {
          @page {
            size: A4;
            margin: 1.5cm 1.5cm 1.5cm 2.5cm;
          }

          /* Tạo padding cho body để nội dung không sát mép */
          body {
            padding-top: 1cm;
            padding-bottom: 1cm;
          }

          /* Ẩn các element không cần thiết khi in */
          .no-print {
            display: none !important;
          }
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.5;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
        }

        /* Header table - theo mẫu template */
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .header-table th {
          text-align: center;
          font-weight: bold;
          padding: 8px;
          vertical-align: middle;
        }

        .header-table .school-cell {
          width: 45%;
        }

        .header-table .teacher-cell {
          width: 55%;
        }

        /* Thông tin bài học - căn giữa, in đậm */
        .lesson-header {
          text-align: center;
          margin: 20px 0;
        }

        .lesson-header p {
          margin: 8px 0;
          text-align: center;
        }

        .lesson-header .topic-name {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
        }

        .lesson-header .lesson-name {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
        }

        .lesson-header .lesson-info {
          font-size: 13pt;
          font-weight: bold;
        }

        /* Các mục chính - H1 */
        h1 {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 25px 0 15px 0;
          padding-bottom: 5px;
        }

        /* Các mục con - H2 */
        h2 {
          font-size: 13pt;
          font-weight: bold;
          margin: 15px 0 10px 0;
        }

        /* Các mục con hơn - H3 */
        h3 {
          font-size: 13pt;
          font-weight: bold;
          margin: 12px 0 8px 0;
        }

        /* H4 */
        h4 {
          font-size: 13pt;
          font-weight: bold;
          margin: 10px 0 6px 0;
        }

        /* Paragraph */
        p {
          margin: 6px 0;
          text-align: justify;
          line-height: 1.5;
        }

        /* Strong và Em */
        strong { font-weight: bold; }
        em { font-style: italic; }

        /* Blockquote - dùng cho Bước 1, Bước 2... */
        blockquote {
          margin: 10px 0 10px 20px;
          padding: 0;
          border: none;
        }

        blockquote p {
          margin: 5px 0;
        }

        /* Bảng thông tin */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 13pt;
        }

        table, th, td {
          border: 1px solid #000;
        }

        th {
          background-color: #f5f5f5;
          font-weight: bold;
          padding: 8px;
          text-align: center;
          vertical-align: middle;
        }

        td {
          padding: 8px;
          vertical-align: top;
        }

        /* Colgroup cho bảng */
        colgroup col {
          width: auto;
        }

        /* Danh sách */
        ul, ol {
          margin: 8px 0 8px 20px;
          padding-left: 20px;
        }

        /* Danh sách có thứ tự (1. 2. 3.) */
        ol.ordered-list {
          margin-left: 25px;
          padding-left: 0;
          list-style-type: decimal;
        }

        ol.ordered-list li.ordered-item {
          margin: 5px 0;
          text-align: justify;
        }

        /* Danh sách theo chữ cái (a) b) c)) */
        ol.letter-list {
          margin-left: 25px;
          padding-left: 0;
          list-style-type: lower-alpha;
        }

        ol.letter-list li.letter-item {
          margin: 5px 0;
          text-align: justify;
        }

        /* Danh sách dấu tròn (level 1) */
        ul.bullet-list {
          margin-left: 25px;
          padding-left: 0;
          list-style-type: disc;
        }

        ul.bullet-list li.bullet-item {
          margin: 5px 0;
          text-align: justify;
        }

        /* Danh sách dấu + (level 2 - lùi vào hơn) */
        ul.plus-list {
          margin-left: 45px;
          padding-left: 0;
          list-style-type: none;
        }

        ul.plus-list li.plus-item {
          margin: 5px 0;
          text-align: justify;
        }

        ul.plus-list li.plus-item::before {
          content: "+ ";
          font-weight: normal;
        }

        /* Phiếu học tập: dotted lines for student answers */
        .worksheet-line {
          border-bottom: 1px dotted #000;
          height: 1.5em;
          margin: 0.3em 0;
          width: 100%;
        }

        /* Mindmap container for print */
        .mindmap-inline-container {
          overflow: visible !important;
          height: auto !important;
          border: none !important;
          page-break-inside: avoid;
          margin: 12px 0;
        }
        .mindmap-inline-container svg {
          max-width: 100%;
          height: auto;
        }

        /* Editor content: div elements act as paragraphs */
        .content div {
          margin: 3px 0;
          line-height: 1.5;
        }

        /* Ensure inline font-size from editor is respected */
        .content span[style], .content font {
          line-height: 1.5;
        }

        /* Li chung */
        li {
          margin: 5px 0;
          text-align: justify;
          line-height: 1.5;
        }

        li p {
          margin: 3px 0;
        }

        /* Code block styling - với syntax highlighting */
        .code-block, pre {
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 10px;
          margin: 8px 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          overflow-x: auto;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 10pt;
          line-height: 1.4;
          white-space: pre;
          tab-size: 4;
          text-indent: 0 !important;
        }

        .code-block code, pre code {
          background: none;
          padding: 0 !important;
          border: none;
          font-size: inherit;
          white-space: pre;
          display: block;
          padding-left: 0 !important;
          margin-left: 0 !important;
          text-indent: 0 !important;
        }

        /* Reset margin cho code block trong list */
        li .code-block, li pre,
        ul .code-block, ul pre,
        ol .code-block, ol pre {
          margin-left: 0 !important;
        }

        /* Highlight.js syntax colors */
        .hljs-keyword { color: #0000ff; font-weight: bold; }
        .hljs-built_in { color: #0086b3; }
        .hljs-string { color: #a31515; }
        .hljs-number { color: #098658; }
        .hljs-comment { color: #008000; font-style: italic; }
        .hljs-function { color: #795e26; }
        .hljs-params { color: #001080; }
        .hljs-title { color: #795e26; }

        .inline-code, code:not([class*="language-"]):not(.hljs) {
          background-color: #f0f0f0;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 10pt;
        }

        /* Hình ảnh */
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px auto;
        }

        /* Mark - highlight text */
        mark {
          background-color: #ffff00;
          padding: 0 2px;
        }

        /* Footer ký tên */
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
        }

        .signature {
          text-align: center;
          width: 280px;
        }

        .signature .date {
          font-style: italic;
          margin-bottom: 10px;
        }

        .signature .title {
          font-weight: bold;
          margin-bottom: 60px;
        }

        /* Page break control */
        .page-break {
          page-break-before: always;
        }

        .avoid-break {
          page-break-inside: avoid;
        }

        /* In ấn */
        @media print {
          body {
            padding: 0;
            font-size: 13pt;
          }

          .no-print {
            display: none !important;
          }

          .page-break {
            page-break-before: always;
          }

          .code-block, pre {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Preserve syntax highlighting colors in print */
          .hljs-keyword, .hljs-built_in, .hljs-string, .hljs-number,
          .hljs-comment, .hljs-function, .hljs-params, .hljs-title,
          pre code span[style] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Preserve user-applied text colors and highlights in print */
          span[style*="color"], span[style*="background"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Tránh ngắt trang giữa các phần */
          h1, h2, h3, h4 {
            page-break-after: avoid;
          }

          table, blockquote, .avoid-break {
            page-break-inside: avoid;
          }

          /* Đảm bảo bảng không bị cắt */
          table {
            page-break-inside: avoid;
          }

          th {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header table - theo mẫu template.html -->
      <table class="header-table" style="border: none; width: 100%;">
        <colgroup>
          <col style="width: 50%" />
          <col style="width: 50%" />
        </colgroup>
        <tbody>
          <tr style="border: none;">
            <td style="text-align: left; border: none; vertical-align: top; padding: 5px 0;">
              <strong>TRƯỜNG:</strong> ........................................
            </td>
            <td style="text-align: left; border: none; vertical-align: top; padding: 5px 0;">
              <strong>GIÁO VIÊN:</strong> ........................................
            </td>
          </tr>
          <tr style="border: none;">
            <td style="text-align: left; border: none; vertical-align: top; padding: 5px 0;">
              <strong>TỔ:</strong> ........................................
            </td>
            <td style="text-align: left; border: none; vertical-align: top; padding: 5px 0;">
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Thông tin bài học - căn giữa, in đậm -->
      <div class="lesson-header">
        ${lessonInfo ? `
        <p class="topic-name"><strong>${(lessonInfo.topic || '').toUpperCase()}</strong></p>
        <p class="lesson-name"><strong>${(lessonInfo.lesson_name || '').toUpperCase()}</strong></p>
        <p class="lesson-info"><strong>Môn học: Tin Học; Lớp: ${lessonInfo.grade || ''}</strong></p>
        <p class="lesson-info"><strong>Bộ sách: ${lessonInfo.book_type || ''}</strong></p>
        <p class="lesson-info"><strong>(Thời lượng: 02 tiết)</strong></p>
        ` : ''}
      </div>

      <!-- Nội dung chính -->
      <div class="content">
        ${htmlContent}
      </div>

      <!-- Script để chạy syntax highlighting -->
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
              hljs.highlightElement(block);
            });
          }
        });
      </script>
    </body>
    </html>
  `;

  // Sử dụng iframe ẩn để in mà không mở tab mới
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  printFrame.style.visibility = 'hidden';

  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    // Đợi iframe load xong rồi in (đợi lâu hơn để highlight.js kịp load từ CDN)
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();

        // Xóa iframe sau khi in xong
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 800);
    };
  }

  return new Blob([content], { type: "text/html" });
};
