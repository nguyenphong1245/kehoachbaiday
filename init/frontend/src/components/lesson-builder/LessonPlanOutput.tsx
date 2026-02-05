/**
 * LessonPlanOutput - Hiển thị kết quả kế hoạch bài dạy dạng WYSIWYG editor
 * - Giao diện giống Word: toolbar cố định, trang A4 bên dưới
 * - Nút lưu, xuất PDF trong toolbar
 * - Nút chia sẻ gộp thành 1 dropdown
 */
import React, { useState, useCallback, useEffect, useRef } from "react";

import {
  Download,
  Copy,
  CheckCircle,
  Info,
  Save,
  Loader2,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Printer,
  Code2,
  GitBranch,
  X,
} from "lucide-react";
import type { LessonPlanSection, GenerateLessonPlanResponse, ActivityConfig } from "@/types/lessonBuilder";
import { exportToPDF, saveLessonPlan } from "@/services/lessonBuilderService";
import { createSharedWorksheet } from "@/services/worksheetService";
import { createSharedQuiz } from "@/services/sharedQuizService";
import { extractCodeExercisesFromLesson } from "@/services/codeExerciseService";
import RichTextEditor from "@/components/common/RichTextEditor";
import MindMapRenderer from "@/components/lesson-builder/MindMapRenderer";
import WorksheetRenderer from "@/components/lesson-builder/WorksheetRenderer";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { marked } from "marked";
import TurndownService from "turndown";

interface LessonPlanOutputProps {
  result: GenerateLessonPlanResponse;
  onSectionUpdate: (sectionId: string, newContent: string) => void;
  onExportPDF?: () => void;
  activities?: ActivityConfig[];
  onBack?: () => void;
}

// ============== Turndown helpers ==============
const createTurndownService = () => {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });
  td.addRule("tableCell", {
    filter: ["th", "td"],
    replacement: (content) => ` ${content.trim()} |`,
  });
  td.addRule("tableRow", {
    filter: "tr",
    replacement: (content) => `|${content}\n`,
  });
  td.addRule("table", {
    filter: "table",
    replacement: (_content, node) => {
      const el = node as HTMLTableElement;
      const rows = Array.from(el.rows);
      if (rows.length === 0) return "";
      const lines: string[] = [];
      rows.forEach((row, i) => {
        const cells = Array.from(row.cells).map(c => ` ${c.textContent?.trim() || ""} `);
        lines.push(`|${cells.join("|")}|`);
        if (i === 0) {
          lines.push(`|${cells.map(() => "---").join("|")}|`);
        }
      });
      return `\n${lines.join("\n")}\n`;
    },
  });
  td.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });
  return td;
};

/**
 * Simple Python syntax highlighter for code blocks.
 * Adds colored spans to code inside <pre><code> blocks.
 * This runs on the HTML string before setting it into the editor.
 */
const highlightCodeBlocks = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const codeBlocks = tempDiv.querySelectorAll('pre code');
  codeBlocks.forEach(codeEl => {
    const code = codeEl.textContent || '';
    // Process each line
    const highlighted = code.split('\n').map(line => {
      // Preserve leading whitespace (indentation)
      const leadingSpaces = line.match(/^(\s*)/)?.[0] || '';
      let rest = line.substring(leadingSpaces.length);

      // Comment lines
      if (rest.trimStart().startsWith('#')) {
        return leadingSpaces + `<span style="color:#008000;font-style:italic;">${escapeHtml(rest)}</span>`;
      }

      // Tokenize and highlight
      let result = '';
      const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+\.?\d*|\w+|[^\s\w]+|\s+)/g;
      let match;
      const keywords = ['if', 'else', 'elif', 'for', 'while', 'def', 'class', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'pass', 'break', 'continue', 'yield', 'raise', 'del', 'global', 'nonlocal', 'assert'];
      const builtins = ['print', 'input', 'int', 'str', 'float', 'list', 'dict', 'range', 'len', 'type', 'set', 'tuple', 'abs', 'max', 'min', 'sum', 'sorted', 'enumerate', 'zip', 'map', 'filter', 'open', 'round'];

      while ((match = tokenRegex.exec(rest)) !== null) {
        const token = match[0];
        if (/^["']/.test(token)) {
          result += `<span style="color:#a31515;">${escapeHtml(token)}</span>`;
        } else if (/^\d+\.?\d*$/.test(token)) {
          result += `<span style="color:#098658;">${escapeHtml(token)}</span>`;
        } else if (keywords.includes(token)) {
          result += `<span style="color:#0000ff;font-weight:bold;">${escapeHtml(token)}</span>`;
        } else if (builtins.includes(token)) {
          result += `<span style="color:#0086b3;">${escapeHtml(token)}</span>`;
        } else if (/^\w+$/.test(token) && rest.substring(match.index! + token.length).startsWith('(')) {
          result += `<span style="color:#795e26;">${escapeHtml(token)}</span>`;
        } else {
          result += escapeHtml(token);
        }
      }

      return leadingSpaces.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') + result;
    }).join('\n');

    codeEl.innerHTML = highlighted;
  });

  return tempDiv.innerHTML;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Format quiz answer keys into tables.
 * Detects patterns like "Câu 1: A Câu 2: B Câu 3: C ..."
 * and converts them into a structured table with columns.
 * Also handles "Kết quả mong đợi:" and "Dự kiến câu trả lời:" prefixes.
 * Works on HTML string after marked.parse().
 */
const formatQuizAnswersToTable = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const processNode = (node: Element) => {
    const text = (node.textContent || '').trim();

    // Pattern: "Câu X: Y" where Y is a single letter A-D
    const answerPattern = /Câu\s*(\d+)\s*[:\.]\s*([A-Da-d])\b/g;
    const matches = [...text.matchAll(answerPattern)];

    if (matches.length < 3) return; // Need at least 3 answer pairs

    // Find where the answer keys start
    const firstMatchIdx = matches[0].index!;

    // Get the original HTML content and find the split point
    const nodeHtml = node.innerHTML || node.textContent || '';

    // Extract prefix: everything before first "Câu X: Y"
    // Try to split at "Dự kiến câu trả lời:" or "Kết quả mong đợi:" if present
    let prefixText = text.substring(0, firstMatchIdx).trim();
    // Clean trailing colon/whitespace
    prefixText = prefixText.replace(/[:]\s*$/, '').trim();

    // Build answer pairs
    const answers: { num: number; answer: string }[] = matches.map(m => ({
      num: parseInt(m[1], 10),
      answer: m[2].toUpperCase(),
    }));

    // Calculate layout: 5 pairs per row
    const totalQuestions = answers.length;
    const cols = Math.min(5, totalQuestions);
    const rows = Math.ceil(totalQuestions / cols);

    // Build replacement HTML
    let tableHtml = '';

    // Preserve prefix text as a paragraph
    if (prefixText) {
      // Reconstruct with original HTML formatting for the prefix part
      // Find the prefix in the original HTML
      const prefixHtmlMatch = nodeHtml.match(
        new RegExp(`^([\\s\\S]*?)(?=Câu\\s*\\d+\\s*[:\\.]\\s*[A-Da-d])`)
      );
      const prefixHtml = prefixHtmlMatch
        ? prefixHtmlMatch[1].replace(/[:]\s*$/, '').trim()
        : prefixText;

      if (prefixHtml) {
        // Wrap in same tag type as original node
        const tag = node.tagName.toLowerCase();
        if (tag === 'li') {
          tableHtml += `<li>${prefixHtml}:</li>`;
        } else {
          tableHtml += `<p>${prefixHtml}:</p>`;
        }
      }
    }

    const cellStyle = 'border:1px solid #ccc;padding:6px 10px;text-align:center;';
    const headerStyle = cellStyle + 'background:#f0f4ff;font-weight:bold;';

    tableHtml += '<table style="width:auto;border-collapse:collapse;border:1px solid #ccc;margin:8px 0;">';
    tableHtml += '<thead><tr>';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="${headerStyle}">Câu</th>`;
      tableHtml += `<th style="${headerStyle}">Đáp án</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx < answers.length) {
          tableHtml += `<td style="${cellStyle}">${answers[idx].num}</td>`;
          tableHtml += `<td style="${cellStyle}font-weight:bold;">${answers[idx].answer}</td>`;
        } else {
          tableHtml += `<td style="${cellStyle}">&nbsp;</td>`;
          tableHtml += `<td style="${cellStyle}">&nbsp;</td>`;
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = tableHtml;
    node.replaceWith(...Array.from(wrapper.childNodes));
  };

  // Find elements containing "Câu X: Y" patterns (process in reverse)
  const candidates = Array.from(tempDiv.querySelectorAll('p, div, li, span')).reverse();
  for (const candidate of candidates) {
    if (candidate.closest('table')) continue; // Skip if already in a table
    processNode(candidate);
  }

  return tempDiv.innerHTML;
};

/**
 * Split answer parts (a, b, c, d, e) that appear on the same line onto separate lines.
 * E.g. "Question text a) Answer A  b) Answer B  c) Answer C" → each on its own line.
 */
const formatSanPhamAnswers = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const processTextNode = (node: Text) => {
    const text = node.textContent || "";
    // Check if text contains 2+ answer markers like a) b) c) d) e)
    const matches = text.match(/[a-eA-E]\)\s/g);
    if (!matches || matches.length < 2) return;

    // Split at each a), b), c), d), e) marker — puts a) on its own line too
    const fragment = document.createDocumentFragment();
    const parts = text.split(/(?=[a-eA-E]\)\s)/);
    parts.forEach((part, idx) => {
      if (idx > 0) {
        fragment.appendChild(document.createElement("br"));
      }
      if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  };

  // Walk through text nodes that contain multiple answer markers
  const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.textContent || "";
      const matches = text.match(/[a-eA-E]\)\s/g);
      return matches && matches.length >= 2
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach(processTextNode);

  return tempDiv.innerHTML;
};

/**
 * Replace long dot sequences (10+) with clean CSS-based dotted lines.
 * - Standalone dot paragraphs → full-width dotted line div
 * - Inline dots (e.g. "Họ tên: ............") → inline dotted span
 */
const formatWorksheetDotLines = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const processTextNode = (node: Text) => {
    const text = node.textContent || "";
    if (!/\.{6,}/.test(text)) return;

    const fragment = document.createDocumentFragment();
    const parts = text.split(/(\.{6,})/);
    for (const part of parts) {
      if (/^\.{6,}$/.test(part)) {
        const span = document.createElement("span");
        span.style.cssText =
          "display:inline-block;min-width:40%;border-bottom:1px dotted #6b7280;height:1.1em;vertical-align:bottom;";
        span.innerHTML = "&nbsp;";
        fragment.appendChild(span);
      } else if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
    }
    node.replaceWith(fragment);
  };

  // Check paragraphs that contain ONLY dots
  const paragraphs = tempDiv.querySelectorAll("p");
  paragraphs.forEach((p) => {
    const text = (p.textContent || "").trim();
    if (/^\.{6,}$/.test(text)) {
      const line = document.createElement("div");
      line.className = "worksheet-line";
      p.replaceWith(line);
      return;
    }
  });

  // Process remaining text nodes with inline dots
  const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      /\.{6,}/.test(node.textContent || "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach(processTextNode);

  // Add blank dotted lines between consecutive answer parts (a, b, c, d, e)
  // in worksheet questions to give space for student answers
  const children = Array.from(tempDiv.children);
  const answerPartRegex = /^\s*[a-eA-E][)\.]\s/;
  for (let i = children.length - 1; i > 0; i--) {
    const currText = (children[i].textContent || "").trim();
    const prevText = (children[i - 1].textContent || "").trim();
    // Both current and previous elements start with answer markers
    if (answerPartRegex.test(currText) && answerPartRegex.test(prevText)) {
      // Check if previous element contains a dotted line (inline span or worksheet-line)
      const prevEl = children[i - 1] as HTMLElement;
      const hasDots = prevEl.querySelector('span[style*="border-bottom"]') ||
        prevEl.classList?.contains("worksheet-line") ||
        /\.{6,}/.test(prevText);
      if (hasDots) {
        const blankLine = document.createElement("div");
        blankLine.className = "worksheet-line";
        children[i].parentNode?.insertBefore(blankLine, children[i]);
      }
    }
  }

  return tempDiv.innerHTML;
};

// ============== Mind map inline rendering ==============
const mmTransformer = new Transformer();

/**
 * Convert Markmap SVG for print: replace <foreignObject> (HTML text) with native
 * SVG <text> elements. foreignObject content doesn't render in print/iframe contexts,
 * but SVG <text> works universally.
 */
const serializeSvgForPrint = (origSvg: Element): string => {
  const clone = origSvg.cloneNode(true) as SVGElement;

  // Read computed styles from original live DOM foreignObjects
  const origFOs = Array.from(origSvg.querySelectorAll('foreignObject'));
  const cloneFOs = Array.from(clone.querySelectorAll('foreignObject'));

  cloneFOs.forEach((fo, index) => {
    const textContent = (fo.textContent || '').trim();
    if (!textContent) {
      fo.remove();
      return;
    }

    const x = parseFloat(fo.getAttribute('x') || '0');
    const y = parseFloat(fo.getAttribute('y') || '0');
    const height = parseFloat(fo.getAttribute('height') || '20');

    // Get font-size & color from the live DOM element's computed style
    let fontSize = '14px';
    let color = '#333';
    const origFO = origFOs[index];
    if (origFO) {
      const div = origFO.querySelector('div, span');
      if (div) {
        const cs = window.getComputedStyle(div);
        if (cs.fontSize) fontSize = cs.fontSize;
        if (cs.color) color = cs.color;
      }
    }

    const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svgText.setAttribute('x', String(x + 4));
    svgText.setAttribute('y', String(y + height / 2));
    svgText.setAttribute('font-size', fontSize);
    svgText.setAttribute('font-family', 'Arial, sans-serif');
    svgText.setAttribute('fill', color);
    svgText.setAttribute('dominant-baseline', 'central');
    svgText.textContent = textContent;

    fo.parentNode?.replaceChild(svgText, fo);
  });

  // Set proper viewBox from the original SVG's rendered dimensions so it scales for print
  try {
    const bbox = (origSvg as SVGSVGElement).getBBox();
    const pad = 20;
    clone.setAttribute('viewBox',
      `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`);
    clone.setAttribute('width', '100%');
    clone.setAttribute('height', String(Math.round(bbox.height + pad * 2)));
    clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    // Remove CSS width/height that override the attributes
    clone.style.removeProperty('width');
    clone.style.removeProperty('height');
  } catch {
    clone.setAttribute('width', '100%');
    clone.setAttribute('height', '400');
  }

  return new XMLSerializer().serializeToString(clone);
};

// ============== Print PHT block model ==============
interface WorksheetBlock {
  id: string;
  type: 'content' | 'dotted-line';
  html?: string;
}

let _blockIdCounter = 0;
const newBlockId = () => `wb-${++_blockIdCounter}`;

// ============== Worksheet Data to HTML ==============
import type { WorksheetData, WorksheetQuestion } from "@/types/lessonBuilder";

const renderWorksheetDataToMarkdown = (data: WorksheetData, title?: string): string => {
  const worksheetTitle = title || `Phiếu học tập số ${data.worksheet_number}`;
  const isGroup = data.type === "group";

  let md = `**${worksheetTitle.toUpperCase()}**\n\n`;

  if (isGroup) {
    md += `**NHÓM:** ....................................\n\n`;
  } else {
    md += `**HỌ VÀ TÊN:** ....................................\n\n`;
  }

  if (data.task) {
    md += `**Nhiệm vụ:** ${data.task}\n\n`;
  }

  for (const q of data.questions) {
    md += `**Câu ${q.id}:** ${q.text}\n\n`;

    // KWL table
    if (q.kwl_table) {
      md += `| K (Đã biết) | W (Muốn biết) | L (Đã học được) |\n`;
      md += `|-------------|---------------|------------------|\n`;
      md += `| | | |\n\n`;
    }

    // Code block
    if (q.code) {
      md += "```python\n" + q.code + "\n```\n\n";
    }

    // Sub items
    if (q.sub_items && q.sub_items.length > 0) {
      for (const item of q.sub_items) {
        md += `${item.id}) ${item.text}\n\n`;
      }
    }

    // Answer lines (dotted lines)
    const lines = q.answer_lines || 3;
    for (let i = 0; i < lines; i++) {
      md += `......................................................................................................................................................\n\n`;
    }
  }

  return md;
};

const renderWorksheetDataToHtml = (data: WorksheetData, title?: string): string => {
  const worksheetTitle = title || `Phiếu học tập số ${data.worksheet_number}`;
  const isGroup = data.type === "group";

  const renderBlank = () => {
    return `<span style="display:inline-block;border-bottom:1px dotted #000;flex:1;height:1.2em;margin-left:4px;"></span>`;
  };

  const renderDottedLines = (count: number) => {
    return Array.from({ length: count })
      .map(() => '<div style="border-bottom:1px dotted #000;height:1.8em;margin:0.3em 0;width:100%;"></div>')
      .join("");
  };

  const renderQuestion = (q: WorksheetQuestion): string => {
    let html = `<div style="margin-bottom:16px;">`;
    html += `<div style="font-weight:500;margin-bottom:8px;"><strong>Câu ${q.id}:</strong> ${q.text}</div>`;

    // KWL table
    if (q.kwl_table) {
      html += `<table style="width:100%;border-collapse:collapse;border:1px solid #000;margin:12px 0;">
        <thead><tr style="background:#f5f5f5;">
          <th style="border:1px solid #000;padding:8px;width:33.33%;font-weight:bold;">K (Đã biết)</th>
          <th style="border:1px solid #000;padding:8px;width:33.33%;font-weight:bold;">W (Muốn biết)</th>
          <th style="border:1px solid #000;padding:8px;width:33.33%;font-weight:bold;">L (Đã học được)</th>
        </tr></thead>
        <tbody><tr>
          <td style="border:1px solid #000;padding:8px;height:120px;vertical-align:top;">${renderDottedLines(4)}</td>
          <td style="border:1px solid #000;padding:8px;height:120px;vertical-align:top;">${renderDottedLines(4)}</td>
          <td style="border:1px solid #000;padding:8px;height:120px;vertical-align:top;">${renderDottedLines(4)}</td>
        </tr></tbody>
      </table>`;
    }

    // Code template (with blanks)
    if (q.code_template) {
      const codeHtml = q.code_template.split("____").map((part, i, arr) =>
        i < arr.length - 1
          ? `${escapeHtml(part)}<span style="display:inline-block;border-bottom:2px dotted #3b82f6;background:#eff6ff;min-width:60px;height:1.2em;margin:0 4px;"></span>`
          : escapeHtml(part)
      ).join("");
      html += `<pre style="background:#f8f8f8;border:1px solid #ddd;border-radius:4px;padding:10px;font-family:Consolas,Monaco,monospace;font-size:10pt;white-space:pre-wrap;margin:8px 0 8px 16px;">${codeHtml}</pre>`;
    }

    // Simple code block (type 3 question)
    if (q.code && !q.code_template) {
      html += `<pre style="background:#f8f8f8;border:1px solid #ddd;border-radius:4px;padding:10px;font-family:Consolas,Monaco,monospace;font-size:10pt;white-space:pre-wrap;margin:8px 0 8px 16px;">${escapeHtml(q.code)}</pre>`;
    }

    // Fill blanks
    if (q.fill_blanks && q.fill_blanks.length > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">`;
      for (const fb of q.fill_blanks) {
        html += `<div style="display:flex;align-items:baseline;margin-bottom:8px;"><span>${fb.before}</span>${renderBlank()}<span>${fb.after || ""}</span></div>`;
      }
      html += `</div>`;
    }

    // Inline blanks
    if (q.blanks && q.blanks.length > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">`;
      for (const blank of q.blanks) {
        html += `<div style="display:flex;align-items:baseline;margin-bottom:4px;"><span style="flex-shrink:0;">${blank.label}:</span>${renderBlank()}</div>`;
      }
      html += `</div>`;
    }

    // Sub items
    if (q.sub_items && q.sub_items.length > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">`;
      for (const item of q.sub_items) {
        html += `<div style="margin-bottom:12px;">`;
        html += `<div style="margin-bottom:4px;"><strong>${item.id})</strong> ${item.text}</div>`;
        if (item.blanks && item.blanks.length > 0) {
          html += `<div style="margin-left:16px;">`;
          for (const blank of item.blanks) {
            html += `<div style="display:flex;align-items:baseline;margin-bottom:4px;"><span style="flex-shrink:0;">${blank.label}:</span>${renderBlank()}</div>`;
          }
          html += `</div>`;
        }
        if (item.answer_lines && item.answer_lines > 0) {
          html += `<div style="margin-left:16px;">${renderDottedLines(item.answer_lines)}</div>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }

    // Answer lines (main question - only for simple questions without code/sub_items)
    if (!q.sub_items && !q.blanks && !q.fill_blanks && !q.code_template && !q.code && !q.kwl_table && q.answer_lines && q.answer_lines > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">${renderDottedLines(q.answer_lines)}</div>`;
    }

    // Answer lines after code block (for code questions)
    if (q.code && !q.code_template && q.answer_lines && q.answer_lines > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">${renderDottedLines(q.answer_lines)}</div>`;
    }

    // Answer lines after sub_items (placed AFTER all sub-items)
    if (q.sub_items && q.sub_items.length > 0 && q.answer_lines && q.answer_lines > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">${renderDottedLines(q.answer_lines)}</div>`;
    }

    // Answer lines after code template
    if (q.code_template && q.answer_lines && q.answer_lines > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">${renderDottedLines(q.answer_lines)}</div>`;
    }

    html += `</div>`;
    return html;
  };

  let html = `<div style="font-family:'Times New Roman',Times,serif;font-size:13pt;line-height:1.6;">`;

  // Header
  html += `<div style="text-align:center;margin-bottom:16px;">`;
  html += `<h3 style="font-size:14pt;font-weight:bold;text-transform:uppercase;margin:0 0 8px 0;">${worksheetTitle}</h3>`;
  if (isGroup) {
    html += `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">`;
    html += `<span style="font-weight:500;">NHÓM:</span>`;
    html += `<span style="display:inline-block;border-bottom:1px dotted #000;width:150px;height:1.2em;"></span>`;
    html += `</div>`;
  }
  html += `</div>`;

  // Task
  if (data.task) {
    html += `<div style="margin-bottom:16px;"><strong>Nhiệm vụ:</strong> ${data.task}</div>`;
  }

  // Questions
  for (const q of data.questions) {
    html += renderQuestion(q);
  }

  html += `</div>`;
  return html;
};

// ============== MAIN COMPONENT ==============
export const LessonPlanOutput: React.FC<LessonPlanOutputProps> = ({
  result,
  onSectionUpdate,
  activities,
  onBack,
}) => {
  const [sections, setSections] = useState<LessonPlanSection[]>(result.sections);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [materialsCreated, setMaterialsCreated] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Share
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareSection, setShareSection] = useState<LessonPlanSection | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ url: string; code: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Code extraction
  const [isExtractingCode, setIsExtractingCode] = useState(false);
  const [codeExtractionResult, setCodeExtractionResult] = useState<{
    found: boolean;
    message: string;
    exercises?: { title: string; url: string; share_code: string }[];
  } | null>(null);
  const codeExtractionRef = useRef<HTMLDivElement>(null);

  // Mindmap modal
  const [showMindmapModal, setShowMindmapModal] = useState(false);
  const [mindmapEditorData, setMindmapEditorData] = useState("");
  const [selectedMindmapSectionId, setSelectedMindmapSectionId] = useState("");

  // Print PHT modal
  const [showPrintPHTModal, setShowPrintPHTModal] = useState(false);
  const [printWorksheetBlocks, setPrintWorksheetBlocks] = useState<WorksheetBlock[][]>([]);
  const [activePHTIndex, setActivePHTIndex] = useState(0);

  // Insert mindmap placeholder before "d) Tổ chức thực hiện" in section content
  const insertMindmapPlaceholder = (sectionContent: string, sectionId: string): string => {
    const placeholder = `\n\n<div class="mindmap-inline" data-section-id="${sectionId}"></div>\n`;
    // Look for "d)" or "**d)" at the start of a line
    const match = sectionContent.match(/\n(\*{0,2})d[\)\.]\s/);
    if (match && match.index !== undefined) {
      return sectionContent.slice(0, match.index) + placeholder + sectionContent.slice(match.index);
    }
    // Fallback: append at end
    return sectionContent + placeholder;
  };

  // Ghép toàn bộ sections thành 1 chuỗi markdown liên tục
  const getFullMarkdown = useCallback(() => {
    const mainSections = sections.filter(
      (s) => !["thong_tin_chung", "phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
    );
    const worksheetSections = sections.filter(s => s.section_type === "phieu_hoc_tap");
    const quizSections = sections.filter(s => s.section_type === "trac_nghiem");

    let content = mainSections.map(s => {
      let sectionContent = s.content;
      if (s.mindmap_data?.trim()) {
        sectionContent = insertMindmapPlaceholder(sectionContent, s.section_id);
      }
      return sectionContent;
    }).join("\n\n");

    if (worksheetSections.length > 0 || quizSections.length > 0) {
      content += "\n\n## **IV. PHỤ LỤC**\n\n";
      if (worksheetSections.length > 0) {
        content += "### **1. Phiếu học tập**\n\n";
        worksheetSections.forEach(s => {
          // Prefer worksheet_data, fall back to content
          if (s.worksheet_data) {
            content += renderWorksheetDataToMarkdown(s.worksheet_data, s.title) + "\n\n";
          } else if (s.content) {
            content += `${s.content}\n\n`;
          }
        });
      }
      if (quizSections.length > 0) {
        content += "### **2. Trắc nghiệm**\n\n";
        quizSections.forEach(s => {
          const cleanedContent = s.content.replace(/\n---\n/g, '\n');
          content += `${cleanedContent}\n\n`;
        });
      }
    }

    return content;
  }, [sections]);

  // Tự động khởi tạo editor khi component mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const fullMd = getFullMarkdown();
      let html = marked.parse(fullMd) as string;
      // Auto-format quiz answer keys into tables
      html = formatQuizAnswersToTable(html);
      // Apply syntax highlighting to code blocks
      html = highlightCodeBlocks(html);
      // Split answer parts (a, b, c, d) on the same line onto separate lines
      html = formatSanPhamAnswers(html);
      // Replace long dot sequences with CSS dotted lines
      html = formatWorksheetDotLines(html);

      // Replace mindmap placeholders with container divs for post-render Markmap injection
      // (SVG is NOT embedded in the HTML string — it's rendered directly into the DOM
      // after DOMPurify processes the HTML, so foreignObject text labels are preserved)
      const mindmapSections = sections.filter(s => s.mindmap_data?.trim());
      if (mindmapSections.length > 0) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const placeholders = tempDiv.querySelectorAll(".mindmap-inline");

        for (const ph of Array.from(placeholders)) {
          const sectionId = ph.getAttribute("data-section-id");
          const section = mindmapSections.find(s => s.section_id === sectionId);
          if (section?.mindmap_data) {
            const wrapper = document.createElement("div");
            wrapper.setAttribute("contenteditable", "false");
            wrapper.className = "mindmap-inline-container";
            wrapper.setAttribute("data-section-id", sectionId || "");
            wrapper.style.cssText = "margin:16px 0;page-break-inside:avoid;border:1px solid #d1d5db;border-radius:8px;overflow:hidden;background:#fff;height:380px;";
            wrapper.innerHTML = '<p style="padding:40px;color:#9ca3af;text-align:center;font-style:italic;">Đang tải sơ đồ tư duy...</p>';
            ph.replaceWith(wrapper);
          }
        }

        html = tempDiv.innerHTML;
      }

      if (!cancelled) {
        setEditContent(html);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // Render Markmap directly into DOM containers AFTER DOMPurify has processed the HTML.
  // This bypasses DOMPurify entirely for the SVG, preserving foreignObject text labels.
  const renderedMindmapIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const mindmapSecs = sections.filter(s => s.mindmap_data?.trim());
    if (mindmapSecs.length === 0) return;

    const timer = setTimeout(() => {
      const containers = document.querySelectorAll('.mindmap-inline-container[data-section-id]');
      containers.forEach(container => {
        const sectionId = container.getAttribute('data-section-id');
        if (!sectionId) return;
        // Skip if already rendered with a Markmap SVG
        if (container.querySelector('svg.markmap-live')) return;

        const section = mindmapSecs.find(s => s.section_id === sectionId);
        if (!section?.mindmap_data) return;

        try {
          const { root } = mmTransformer.transform(section.mindmap_data);
          container.innerHTML = '';
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.classList.add('markmap-live');
          svg.style.width = '100%';
          svg.style.height = '100%';
          container.appendChild(svg);
          const mm = Markmap.create(svg, { autoFit: true, duration: 0, paddingX: 16 }, root);
          // Fit after layout settles
          setTimeout(() => { mm.fit(); }, 200);
          renderedMindmapIds.current.add(sectionId);
        } catch (err) {
          console.error("Mindmap DOM render error:", err);
          container.innerHTML = '<p style="color:#ef4444;font-style:italic;text-align:center;padding:12px;">Không thể tạo sơ đồ tư duy</p>';
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [editContent, sections]);

  // Share handlers
  const shareableSections = sections.filter(
    s => s.section_type === 'phieu_hoc_tap' || s.section_type === 'trac_nghiem'
  );

  const handleOpenShare = (section: LessonPlanSection) => {
    setShareSection(section);
    setShowShareDialog(true);
    setShowShareDropdown(false);
    setShareResult(null);
    setShareError(null);
  };

  const handleShare = async () => {
    if (!shareSection) return;
    setIsSharing(true);
    setShareError(null);
    const isQuizShare = shareSection.section_type === 'trac_nghiem';
    try {
      if (isQuizShare) {
        const res = await createSharedQuiz({
          title: result.lesson_info?.lesson_name ? `Trắc nghiệm: ${result.lesson_info.lesson_name}` : shareSection.title || "Bài trắc nghiệm",
          description: `${result.lesson_info?.topic || ''} - ${result.lesson_info?.grade || ''} - ${result.lesson_info?.book_type || ''}`.trim(),
          content: shareSection.content,
          questions: shareSection.questions,
          show_correct_answers: true,
          allow_multiple_attempts: true,
          lesson_info: result.lesson_info,
        });
        setShareResult({ url: res.share_url, code: res.share_code });
      } else {
        const res = await createSharedWorksheet({
          title: shareSection.title || "Phiếu học tập",
          content: shareSection.content,
          lesson_info: result.lesson_info,
        });
        setShareResult({ url: res.share_url, code: res.share_code });
      }
    } catch (error: any) {
      setShareError(error.response?.data?.detail || "Lỗi khi tạo link chia sẻ. Vui lòng thử lại.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (shareResult) {
      await navigator.clipboard.writeText(shareResult.url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Code extraction handler
  const handleExtractCodeExercises = async () => {
    setIsExtractingCode(true);
    setCodeExtractionResult(null);
    try {
      // Ghép các section chính (KHÔNG lấy phiếu học tập, trắc nghiệm)
      const mainSections = sections.filter(
        (s) => !["thong_tin_chung", "phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
      );
      const lessonContent = mainSections.map(s => s.content).join("\n\n");

      const res = await extractCodeExercisesFromLesson({
        lesson_plan_content: lessonContent,
        lesson_info: result.lesson_info,
        auto_create: true,
        expires_in_days: 30,
      });

      if (res.found && res.created_exercises && res.created_exercises.length > 0) {
        const exercises = res.created_exercises.map((e, idx) => ({
          title: res.exercises[idx]?.title || e.title,
          url: e.share_url,
          share_code: e.share_code,
        }));
        setCodeExtractionResult({
          found: true,
          message: `Tìm thấy ${res.exercises.length} bài tập lập trình và đã tạo thành công!`,
          exercises,
        });
      } else if (res.found && res.exercises.length > 0) {
        setCodeExtractionResult({
          found: true,
          message: `Tìm thấy ${res.exercises.length} bài tập lập trình nhưng chưa tạo được link.`,
        });
      } else {
        setCodeExtractionResult({
          found: false,
          message: res.reason || "Không tìm thấy bài tập lập trình trong KHBD này.",
        });
      }
    } catch (error: any) {
      setCodeExtractionResult({
        found: false,
        message: error.response?.data?.detail || "Lỗi khi trích xuất bài tập code.",
      });
    } finally {
      setIsExtractingCode(false);
      setTimeout(() => {
        codeExtractionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  // ============== MINDMAP MODAL HANDLERS ==============

  // Sections that already have mindmap_data (generated by AI during SSE)
  const mindmapSections = sections.filter(s => s.mindmap_data?.trim());

  const handleOpenMindmapModal = () => {
    if (mindmapSections.length === 0) return;
    const firstSection = mindmapSections[0];
    setSelectedMindmapSectionId(firstSection.section_id);
    setMindmapEditorData(firstSection.mindmap_data || "");
    setShowMindmapModal(true);
  };

  const handleDownloadMindmap = () => {
    const svg = document.querySelector('.mindmap-modal-preview svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so_do_tu_duy_${result.lesson_info.lesson_name || 'mindmap'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsertMindmap = () => {
    if (!mindmapEditorData.trim() || !selectedMindmapSectionId) return;

    const targetSectionId = selectedMindmapSectionId;

    const updatedSections = sections.map(s =>
      s.section_id === targetSectionId
        ? { ...s, mindmap_data: mindmapEditorData }
        : s
    );
    setSections(updatedSections);
    setShowMindmapModal(false);

    // Re-render the editor with new mindmap data
    const reinit = async () => {
      const mainSections = updatedSections.filter(
        (s) => !["thong_tin_chung", "phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
      );
      let content = mainSections.map(s => {
        let sc = s.content;
        if (s.mindmap_data?.trim()) {
          sc = insertMindmapPlaceholder(sc, s.section_id);
        }
        return sc;
      }).join("\n\n");

      const worksheetSections = updatedSections.filter(s => s.section_type === "phieu_hoc_tap");
      const quizSections = updatedSections.filter(s => s.section_type === "trac_nghiem");
      if (worksheetSections.length > 0 || quizSections.length > 0) {
        content += "\n\n## **IV. PHỤ LỤC**\n\n";
        if (worksheetSections.length > 0) {
          content += "### **1. Phiếu học tập**\n\n";
          worksheetSections.forEach(s => {
            if (s.worksheet_data) {
              content += renderWorksheetDataToMarkdown(s.worksheet_data, s.title) + "\n\n";
            } else if (s.content) {
              content += `${s.content}\n\n`;
            }
          });
        }
        if (quizSections.length > 0) {
          content += "### **2. Trắc nghiệm**\n\n";
          quizSections.forEach(s => {
            content += `${s.content.replace(/\n---\n/g, '\n')}\n\n`;
          });
        }
      }

      let html = marked.parse(content) as string;
      html = formatQuizAnswersToTable(html);
      html = highlightCodeBlocks(html);
      html = formatWorksheetDotLines(html);

      // Replace mindmap placeholders with container divs for post-render Markmap injection
      const mindmapSecs = updatedSections.filter(s => s.mindmap_data?.trim());
      if (mindmapSecs.length > 0) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const placeholders = tempDiv.querySelectorAll(".mindmap-inline");
        for (const ph of Array.from(placeholders)) {
          const sectionId = ph.getAttribute("data-section-id");
          const section = mindmapSecs.find(s => s.section_id === sectionId);
          if (section?.mindmap_data) {
            const wrapper = document.createElement("div");
            wrapper.setAttribute("contenteditable", "false");
            wrapper.className = "mindmap-inline-container";
            wrapper.setAttribute("data-section-id", sectionId || "");
            wrapper.style.cssText = "margin:16px 0;page-break-inside:avoid;border:1px solid #d1d5db;border-radius:8px;overflow:hidden;background:#fff;height:380px;";
            wrapper.innerHTML = '<p style="padding:40px;color:#9ca3af;text-align:center;font-style:italic;">Đang tải sơ đồ tư duy...</p>';
            ph.replaceWith(wrapper);
          }
        }
        html = tempDiv.innerHTML;
      }
      // Clear rendered tracking so the useEffect re-renders new containers
      renderedMindmapIds.current.clear();

      setEditContent(html);
    };
    reinit();
  };

  const handleExportPDF = () => {
    // Read from the actual editor DOM (which includes Markmap SVGs rendered post-sanitization)
    const editorEl = document.querySelector('[contenteditable="true"]');
    if (!editorEl) return;

    const cleanDiv = document.createElement('div');
    cleanDiv.innerHTML = editorEl.innerHTML;

    // Fix SVGs: replace foreignObject (HTML text) with native SVG <text> for print
    // foreignObject content doesn't render in print/iframe contexts
    const origContainers = editorEl.querySelectorAll('.mindmap-inline-container');
    const clonedContainers = cleanDiv.querySelectorAll('.mindmap-inline-container');
    origContainers.forEach((origContainer, index) => {
      const svg = origContainer.querySelector('svg');
      if (svg && clonedContainers[index]) {
        clonedContainers[index].innerHTML = serializeSvgForPrint(svg);
        // Fix container styles for print: remove overflow:hidden, let SVG determine height
        const el = clonedContainers[index] as HTMLElement;
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el.style.border = 'none';
      }
    });

    // Convert <font color="..."> to <span style="color:..."> for PDF compatibility
    cleanDiv.querySelectorAll('font[color]').forEach(el => {
      const color = el.getAttribute('color');
      if (color) {
        const span = document.createElement('span');
        span.style.color = color;
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
      }
    });

    // Ensure images have print-friendly styles
    cleanDiv.querySelectorAll('img').forEach(el => {
      (el as HTMLElement).style.maxWidth = '100%';
      (el as HTMLElement).style.height = 'auto';
    });

    // Also generate markdown for fallback/content param
    const td = createTurndownService();
    let mdContent = td.turndown(cleanDiv.innerHTML);
    mdContent = mdContent.replace(/(\d+)\\\./g, '$1.');

    // Pass HTML directly so formatting (alignment, colors, highlights, etc.) is preserved
    exportToPDF(mdContent, `KHBD_${result.lesson_info.lesson_name}`, result.lesson_info, cleanDiv.innerHTML);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const td = createTurndownService();
      const markdown = td.turndown(editContent);
      const saveSections: LessonPlanSection[] = [{
        section_id: sections[0]?.section_id || "full_content",
        section_type: "full",
        title: "Kế hoạch bài dạy",
        content: markdown,
        editable: true,
      }];

      const fullContent = saveSections
        .map((s) => `## ${s.title}\n\n${s.content}\n\n`)
        .join("\n");

      const response = await saveLessonPlan({
        title: `KHBD - ${result.lesson_info.lesson_name}`,
        lesson_info: result.lesson_info,
        sections: saveSections,
        full_content: fullContent,
        activities: activities,
        is_printed: false,
      });

      // Auto-create shared materials (worksheets + quizzes) — only on first save
      if (!materialsCreated) {
        const worksheetSections = sections.filter(s => s.section_type === "phieu_hoc_tap");
        const quizSections = sections.filter(s => s.section_type === "trac_nghiem");

        for (const ws of worksheetSections) {
          try {
            await createSharedWorksheet({
              title: ws.title || "Phiếu học tập",
              content: ws.content,
              lesson_info: result.lesson_info,
            });
          } catch {
            // Skip if error
          }
        }

        for (const qz of quizSections) {
          try {
            await createSharedQuiz({
              title: result.lesson_info?.lesson_name
                ? `Trắc nghiệm: ${result.lesson_info.lesson_name}`
                : qz.title || "Bài trắc nghiệm",
              description: `${result.lesson_info?.topic || ""} - ${result.lesson_info?.grade || ""} - ${result.lesson_info?.book_type || ""}`.trim(),
              content: qz.content,
              questions: qz.questions,
              show_correct_answers: true,
              allow_multiple_attempts: true,
              lesson_info: result.lesson_info,
            });
          } catch {
            // Skip if error
          }
        }

        if (worksheetSections.length > 0 || quizSections.length > 0) {
          setMaterialsCreated(true);
        }
      }

      setSaveMessage({ type: "success", text: response.message });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({
        type: "error",
        text: error.response?.data?.detail || "Lỗi khi lưu KHBD"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open print PHT modal with editable worksheet blocks
  const handlePrintWorksheets = () => {
    const worksheetSections = sections.filter(s => s.section_type === "phieu_hoc_tap");

    if (worksheetSections.length === 0) {
      setSaveMessage({ type: "error", text: "Không tìm thấy phiếu học tập nào trong nội dung" });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // Convert markdown → HTML → blocks for each worksheet
    // Use worksheet_data if available for better formatting
    const allBlocks: WorksheetBlock[][] = worksheetSections.map(section => {
      let html: string;

      // Prefer worksheet_data if exists
      if (section.worksheet_data) {
        html = renderWorksheetDataToHtml(section.worksheet_data, section.title);
      } else {
        // Fallback to markdown content
        html = marked.parse(section.content) as string;
        html = formatWorksheetDotLines(html);
      }

      // Convert <font color="..."> to <span style="color:...">
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.querySelectorAll('font[color]').forEach(el => {
        const color = el.getAttribute('color');
        if (color) {
          const span = document.createElement('span');
          span.style.color = color;
          span.innerHTML = el.innerHTML;
          el.replaceWith(span);
        }
      });

      return parseWorksheetBlocks(tempDiv.innerHTML);
    });

    setPrintWorksheetBlocks(allBlocks);
    setActivePHTIndex(0);
    setShowPrintPHTModal(true);
  };

  // Actually print worksheets from the edited blocks
  const handleActualPrint = () => {
    const worksheets = printWorksheetBlocks.map(blocks => blocksToHtml(blocks));

    const worksheetPages = worksheets.map((ws, i) => `
      <div class="worksheet-section" ${i > 0 ? 'style="page-break-before:always;"' : ''}>
        <table class="worksheet-border"><tr><td>
          ${ws}
        </td></tr></table>
      </div>
    `).join('\n');

    const printHtml = `<!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Phiếu học tập - ${result.lesson_info.lesson_name}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"><\/script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"><\/script>
      <style>
        @page { size: A4; margin: 1.5cm 2cm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; }

        .worksheet-section { width: 100%; }
        table.worksheet-border { width: 100%; border-collapse: collapse; border: 2px solid #000; }
        table.worksheet-border > tr > td,
        table.worksheet-border > tbody > tr > td { padding: 20px 25px; border: none; vertical-align: top; }

        .worksheet-section h1, .worksheet-section h2, .worksheet-section h3, .worksheet-section h4 { text-align: center; margin: 8px 0 12px; }
        .worksheet-section h2, .worksheet-section h3 { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
        .worksheet-section p { margin: 6px 0; text-align: left; overflow-wrap: anywhere; word-break: break-word; }
        .worksheet-section hr { border: none; border-bottom: 1px dotted #000; margin: 12px 5px; }
        .worksheet-line { border-bottom: 1px dotted #000; height: 1.5em; margin: 0.5em 0; width: 100%; }

        .worksheet-section table:not(.worksheet-border) { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .worksheet-section table:not(.worksheet-border) th,
        .worksheet-section table:not(.worksheet-border) td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
        .worksheet-section table:not(.worksheet-border) th { background: #f5f5f5; font-weight: bold; text-align: center; }

        ul, ol { margin: 6px 0; padding-left: 25px; }
        li { margin: 4px 0; }
        strong { font-weight: bold; }
        em { font-style: italic; }

        pre, .code-block { background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; padding: 8px 10px; margin: 8px 0; overflow-x: auto; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 10pt; line-height: 1.4; white-space: pre; tab-size: 4; }
        pre code, .code-block code { background: none; padding: 0; border: none; font-size: inherit; white-space: pre; display: block; }
        code { background-color: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 10pt; }

        .hljs-keyword { color: #0000ff; font-weight: bold; }
        .hljs-built_in { color: #0086b3; }
        .hljs-string { color: #a31515; }
        .hljs-number { color: #098658; }
        .hljs-comment { color: #008000; font-style: italic; }
        .hljs-function { color: #795e26; }
        .hljs-params { color: #001080; }
        .hljs-title { color: #795e26; }

        @media print {
          body { margin: 0; }
          .worksheet-section { page-break-after: always; }
          .worksheet-section:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
          h1, h2, h3, h4 { page-break-after: avoid; }
          pre, .code-block { background-color: #f8f8f8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .hljs-keyword, .hljs-built_in, .hljs-string, .hljs-number,
          .hljs-comment, .hljs-function, .hljs-params, .hljs-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          span[style*="color"], span[style*="background"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>${worksheetPages}
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(function(block) {
              hljs.highlightElement(block);
            });
          }
        });
      <\/script>
    </body>
    </html>`;

    const printFrame = document.createElement('iframe');
    printFrame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(printFrame);
    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();
      printFrame.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => document.body.removeChild(printFrame), 1000);
        }, 800);
      };
    }
    setShowPrintPHTModal(false);
  };

  // Check if worksheets exist in content
  const hasWorksheets = sections.some(s => s.section_type === 'phieu_hoc_tap');

  // Parse worksheet HTML into structured blocks for interactive editing
  const parseWorksheetBlocks = (html: string): WorksheetBlock[] => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const blocks: WorksheetBlock[] = [];
    for (const child of Array.from(tempDiv.children)) {
      const el = child as HTMLElement;
      if (el.classList?.contains("worksheet-line") ||
          (el.tagName === "DIV" && !el.textContent?.trim() && el.querySelector('span[style*="border-bottom"]'))) {
        blocks.push({ id: newBlockId(), type: 'dotted-line' });
      } else {
        blocks.push({ id: newBlockId(), type: 'content', html: el.outerHTML });
      }
    }
    return blocks;
  };

  // Convert blocks back to HTML string for printing
  const blocksToHtml = (blocks: WorksheetBlock[]): string => {
    return blocks.map(b =>
      b.type === 'dotted-line'
        ? '<div class="worksheet-line"></div>'
        : (b.html || '')
    ).join('\n');
  };

  // Add a dotted line block at a specific position
  const handleAddDottedLine = (worksheetIdx: number, afterBlockIdx: number) => {
    setPrintWorksheetBlocks(prev => {
      const updated = [...prev];
      const ws = [...updated[worksheetIdx]];
      ws.splice(afterBlockIdx + 1, 0, { id: newBlockId(), type: 'dotted-line' });
      updated[worksheetIdx] = ws;
      return updated;
    });
  };

  // Remove a dotted line block
  const handleRemoveDottedLine = (worksheetIdx: number, blockId: string) => {
    setPrintWorksheetBlocks(prev => {
      const updated = [...prev];
      updated[worksheetIdx] = updated[worksheetIdx].filter(b => b.id !== blockId);
      return updated;
    });
  };

  // Toolbar action buttons - rendered inside the RichTextEditor toolbar
  const toolbarActions = (
    <>
      {/* Print worksheets button */}
      {hasWorksheets && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handlePrintWorksheets}
          className="px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded flex items-center gap-1 transition-colors border border-purple-200 dark:border-purple-700"
          title="In phiếu học tập riêng"
        >
          <Printer className="w-3.5 h-3.5" />
          In PHT
        </button>
      )}

      {/* Extract code exercises button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleExtractCodeExercises}
        disabled={isExtractingCode}
        className="px-2.5 py-1 text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded flex items-center gap-1 transition-colors disabled:opacity-50 border border-teal-200 dark:border-teal-700"
        title="Trích xuất bài tập lập trình từ KHBD và tạo test cases tự động"
      >
        {isExtractingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
        {isExtractingCode ? "Đang trích xuất..." : "Bài tập code"}
      </button>

      {/* Mindmap button - only enabled when mindmap data exists */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleOpenMindmapModal}
        disabled={mindmapSections.length === 0}
        className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
        title={mindmapSections.length === 0 ? "Chưa có sơ đồ tư duy (chọn kỹ thuật Sơ đồ tư duy khi sinh KHBD)" : "Chỉnh sửa sơ đồ tư duy"}
      >
        <GitBranch className="w-3.5 h-3.5" />
        Sơ đồ tư duy
      </button>

      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

      {/* Save button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleSave}
        disabled={isSaving}
        className="px-2.5 py-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded flex items-center gap-1 transition-colors disabled:opacity-50 border border-green-200 dark:border-green-700"
        title="Lưu KHBD (Ctrl+S)"
      >
        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {isSaving ? "Đang lưu..." : "Lưu"}
      </button>

      {/* Export PDF button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleExportPDF}
        className="px-2.5 py-1 text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded flex items-center gap-1 transition-colors border border-orange-200 dark:border-orange-700"
        title="Xuất PDF"
      >
        <Download className="w-3.5 h-3.5" />
        Xuất PDF
      </button>
    </>
  );

  return (
    <div>
      {/* Save Message */}
      {saveMessage && (
        <div className={`px-4 py-3 flex items-center gap-3 rounded-lg mb-3 ${
          saveMessage.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}>
          {saveMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Info className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{saveMessage.text}</span>
        </div>
      )}

      {/* Code Extraction Result */}
      {codeExtractionResult && (
        <div ref={codeExtractionRef} className={`px-4 py-3 flex items-start gap-3 rounded-lg mb-3 ${
          codeExtractionResult.found
            ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200"
            : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
        }`}>
          {codeExtractionResult.found ? (
            <Code2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="text-sm">{codeExtractionResult.message}</span>
            {codeExtractionResult.exercises && codeExtractionResult.exercises.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {codeExtractionResult.exercises.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(ex.url, '_blank')}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-xs font-medium bg-teal-100 dark:bg-teal-800/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/60 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 truncate">{ex.title}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setCodeExtractionResult(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor with toolbar + A4 content */}
      <RichTextEditor
        value={editContent}
        onChange={setEditContent}
        placeholder="Nhập nội dung kế hoạch bài dạy..."
        minHeight="1400px"
        toolbarActions={toolbarActions}
        lessonTitle={result.lesson_info.lesson_name}
        lessonSubtitle={`Lớp ${result.lesson_info.grade} - ${result.lesson_info.book_type}`}
        onBack={onBack}
      />

      {/* Mindmap Modal */}
      {showMindmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col" style={{ width: "95vw", maxWidth: "1400px", height: "90vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sơ đồ tư duy</h3>
                {selectedMindmapSectionId && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    — {sections.find(s => s.section_id === selectedMindmapSectionId)?.title || ""}
                  </span>
                )}
                {mindmapSections.length > 1 && (
                  <select
                    value={selectedMindmapSectionId}
                    onChange={(e) => {
                      setSelectedMindmapSectionId(e.target.value);
                      const sec = sections.find(s => s.section_id === e.target.value);
                      setMindmapEditorData(sec?.mindmap_data || "");
                    }}
                    className="ml-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {mindmapSections.map(s => (
                      <option key={s.section_id} value={s.section_id}>{s.title}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMindmap}
                  disabled={!mindmapEditorData.trim()}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Tải về file SVG"
                >
                  <Download className="w-4 h-4" />
                  Tải về
                </button>
                <button
                  onClick={handleInsertMindmap}
                  disabled={!mindmapEditorData.trim()}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Chèn vào KHBD
                </button>
                <button
                  onClick={() => setShowMindmapModal(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content: Editor (35%) + Preview (65%) */}
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* Left: Markdown editor */}
              <div className="w-[35%] flex flex-col border-r border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">
                  Markdown Headings
                </div>
                <textarea
                  value={mindmapEditorData}
                  onChange={(e) => setMindmapEditorData(e.target.value)}
                  placeholder={"# Tên bài học\n## 1. Mục đầu tiên\n### Khái niệm\n### Đặc điểm\n## 2. Mục thứ hai\n### Nội dung A\n### Nội dung B"}
                  className="flex-1 p-4 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>

              {/* Right: Live preview */}
              <div className="w-[65%] flex flex-col">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">
                  Xem trước
                </div>
                <div className="flex-1 overflow-auto mindmap-modal-preview">
                  {mindmapEditorData.trim() ? (
                    <MindMapRenderer data={mindmapEditorData} height="calc(90vh - 130px)" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                      Chưa có dữ liệu sơ đồ tư duy
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print PHT Modal — edit dotted lines before printing */}
      {showPrintPHTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col" style={{ width: "90vw", maxWidth: "800px", height: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">In Phiếu Học Tập</h3>
              </div>
              <button
                onClick={() => setShowPrintPHTModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs if multiple worksheets */}
            {printWorksheetBlocks.length > 1 && (
              <div className="flex gap-1 px-6 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-700/50">
                {printWorksheetBlocks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePHTIndex(idx)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activePHTIndex === idx
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500'
                    }`}
                  >
                    PHT {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Preview area */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
              <div
                className="worksheet-preview mx-auto bg-white dark:bg-gray-800 shadow-lg rounded dark:text-gray-100"
                style={{
                  maxWidth: '650px',
                  padding: '30px 35px',
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '13pt',
                  lineHeight: '1.5',
                }}
              >
                {printWorksheetBlocks[activePHTIndex]?.map((block, blockIdx) => (
                  <div key={block.id} className="relative group/block">
                    {/* Add line button between blocks */}
                    {blockIdx > 0 && (
                      <div className="relative h-0 flex justify-center">
                        <button
                          onClick={() => handleAddDottedLine(activePHTIndex, blockIdx - 1)}
                          className="absolute -top-2.5 z-10 w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover/block:opacity-100 transition-opacity shadow"
                          title="Thêm dòng chấm"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {block.type === 'dotted-line' ? (
                      <div className="relative group/line">
                        <div
                          className="border-b border-dotted border-gray-800 dark:border-gray-400"
                          style={{
                            height: '1.5em',
                            margin: '0.5em 0',
                            width: '100%',
                          }}
                        />
                        <button
                          onClick={() => handleRemoveDottedLine(activePHTIndex, block.id)}
                          className="absolute -right-3 top-0 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover/line:opacity-100 transition-opacity shadow"
                          title="Xóa dòng"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: block.html || '' }} />
                    )}
                  </div>
                ))}
              </div>
              {/* Dark mode overrides for worksheet inline styles */}
              <style>{`
                .dark .worksheet-preview [style*="border-bottom:1px dotted #000"],
                .dark .worksheet-preview [style*="border-bottom: 1px dotted #000"] {
                  border-bottom-color: #9ca3af !important;
                }
                .dark .worksheet-preview [style*="border:1px solid #000"],
                .dark .worksheet-preview [style*="border: 1px solid #000"] {
                  border-color: #6b7280 !important;
                }
                .dark .worksheet-preview [style*="background:#f8f8f8"],
                .dark .worksheet-preview [style*="background: #f8f8f8"] {
                  background: #374151 !important;
                }
                .dark .worksheet-preview [style*="background:#f5f5f5"],
                .dark .worksheet-preview [style*="background: #f5f5f5"] {
                  background: #4b5563 !important;
                }
                .dark .worksheet-preview pre {
                  background: #374151 !important;
                  border-color: #4b5563 !important;
                  color: #e5e7eb !important;
                }
                .dark .worksheet-preview table {
                  border-color: #6b7280 !important;
                }
                .dark .worksheet-preview th,
                .dark .worksheet-preview td {
                  border-color: #6b7280 !important;
                }
                .dark .worksheet-preview th {
                  background: #4b5563 !important;
                }
              `}</style>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Di chuột vào nội dung để thêm (+) hoặc xóa (×) dòng chấm
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddDottedLine(activePHTIndex, (printWorksheetBlocks[activePHTIndex]?.length || 1) - 1)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  + Thêm dòng
                </button>
                <button
                  onClick={() => setShowPrintPHTModal(false)}
                  className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleActualPrint}
                  className="px-4 py-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanOutput;
