/**
 * LessonPlanOutput - Hiển thị kết quả kế hoạch bài dạy dạng WYSIWYG editor
 * - Giao diện giống Word: toolbar cố định, trang A4 bên dưới
 * - Nút lưu, xuất PDF trong toolbar
 * - Nút chia sẻ gộp thành 1 dropdown
 */
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";

import {
  Download,
  Copy,
  CheckCircle,
  Info,
  MessageSquare,
  Save,
  Loader2,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Printer,
  Code2,
  GitBranch,
  Trash2,
  CornerDownRight,
  X,
  List,
  Sparkles,
} from "lucide-react";
import type { LessonPlanSection, GenerateLessonPlanResponse, ActivityConfig, EditRelatedChange } from "@/types/lessonBuilder";
import { exportToPDF, generateMindmap, saveLessonPlan, updateSavedLessonPlan } from "@/services/lessonBuilderService";

import { createSharedWorksheet } from "@/services/worksheetService";
import { createSharedQuiz } from "@/services/sharedQuizService";
import { extractCodeExercisesFromLesson } from "@/services/codeExerciseService";
import {
  analyzeLessonPlanComments,
  createLessonPlanComment,
  deleteLessonPlanComment,
  getLessonPlanComments,
  resolveLessonPlanCommentThread,
  type LessonPlanComment,
} from "@/services/lessonPlanCommentService";
import RichTextEditor from "@/components/common/RichTextEditor";
import { sanitizeHTML } from "@/utils/sanitize";
import MindMapRenderer from "@/components/lesson-builder/MindMapRenderer";
import WorksheetRenderer from "@/components/lesson-builder/WorksheetRenderer";
import AIEditPanel from "@/components/lesson-builder/AIEditPanel";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { marked } from "marked";
import TurndownService from "turndown";
import { getStoredAuthUser } from "@/utils/authStorage";

interface LessonPlanOutputProps {
  result: GenerateLessonPlanResponse;
  onSectionUpdate: (sectionId: string, newContent: string) => void;
  onExportPDF?: () => void;
  activities?: ActivityConfig[];
  onBack?: () => void;
  savedLessonPlanId?: string;
  hideFullscreen?: boolean;
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

/**
 * Remove duplicated bullet tokens leaked into list item text.
 * Example: marker rendered by CSS + text starts with "+ " => shows "+ + ...".
 */
const dedupeListItemLeadingMarkers = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const markerPrefixPattern = /^\s*(?:[-+*•○◦]\s+)+/;

  const findFirstMeaningfulTextNode = (root: Element): Text | null => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const text = node.textContent || "";
        if (!text.trim()) return NodeFilter.FILTER_SKIP;
        const parentTag = node.parentElement?.tagName;
        if (parentTag === "CODE" || parentTag === "PRE") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const first = walker.nextNode();
    return first ? (first as Text) : null;
  };

  tempDiv.querySelectorAll("li").forEach((li) => {
    const textNode = findFirstMeaningfulTextNode(li);
    if (!textNode) return;
    const original = textNode.textContent || "";
    const cleaned = original.replace(markerPrefixPattern, "");
    if (cleaned !== original) {
      textNode.textContent = cleaned;
    }
  });

  return tempDiv.innerHTML;
};

// ============== Mind map inline rendering ==============
const mmTransformer = new Transformer();

/**
 * Convert Markmap SVG for print: replace <foreignObject> (HTML text) with native
 * SVG <text> elements. foreignObject content doesn't render in print/iframe contexts,
 * but SVG <text> works universally.
 */
const serializeSvgForPrint = (origSvg: Element, fixedWidth?: number): string => {
  const clone = origSvg.cloneNode(true) as SVGElement;

  // Ensure proper SVG namespace
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

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

  // Remove Markmap <style> blocks that may reference unsupported CSS in image context
  clone.querySelectorAll('style').forEach(s => s.remove());

  // Set proper viewBox from the original SVG's rendered dimensions so it scales for print
  try {
    const bbox = (origSvg as SVGSVGElement).getBBox();
    const pad = 20;
    const vbW = bbox.width + pad * 2;
    const vbH = bbox.height + pad * 2;
    clone.setAttribute('viewBox',
      `${bbox.x - pad} ${bbox.y - pad} ${vbW} ${vbH}`);
    const w = fixedWidth || Math.max(Math.round(vbW), 800);
    const h = Math.round(w * vbH / vbW);
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    // Remove CSS width/height that override the attributes
    clone.style.removeProperty('width');
    clone.style.removeProperty('height');
  } catch {
    clone.setAttribute('width', String(fixedWidth || 1200));
    clone.setAttribute('height', '700');
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

  // Convert inline backticks to <code> tags so code terms render in monospace
  const processInlineCode = (text: string): string => {
    return text.replace(/`([^`]+)`/g, '<code>$1</code>');
  };

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
    html += `<div style="font-weight:500;margin-bottom:8px;"><strong>Câu ${q.id}:</strong> ${processInlineCode(q.text)}</div>`;

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
        html += `<div style="display:flex;align-items:baseline;margin-bottom:8px;"><span>${processInlineCode(fb.before)}</span>${renderBlank()}<span>${processInlineCode(fb.after || "")}</span></div>`;
      }
      html += `</div>`;
    }

    // Inline blanks
    if (q.blanks && q.blanks.length > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">`;
      for (const blank of q.blanks) {
        html += `<div style="display:flex;align-items:baseline;margin-bottom:4px;"><span style="flex-shrink:0;">${processInlineCode(blank.label)}:</span>${renderBlank()}</div>`;
      }
      html += `</div>`;
    }

    // Sub items
    if (q.sub_items && q.sub_items.length > 0) {
      html += `<div style="margin-left:16px;margin-top:8px;">`;
      for (const item of q.sub_items) {
        html += `<div style="margin-bottom:12px;">`;
        html += `<div style="margin-bottom:4px;"><strong>${item.id})</strong> ${processInlineCode(item.text)}</div>`;
        if (item.blanks && item.blanks.length > 0) {
          html += `<div style="margin-left:16px;">`;
          for (const blank of item.blanks) {
            html += `<div style="display:flex;align-items:baseline;margin-bottom:4px;"><span style="flex-shrink:0;">${processInlineCode(blank.label)}:</span>${renderBlank()}</div>`;
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
    html += `<div style="margin-bottom:16px;"><strong>Nhiệm vụ:</strong> ${processInlineCode(data.task)}</div>`;
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
  savedLessonPlanId,
  hideFullscreen,
}) => {
  const [sections, setSections] = useState<LessonPlanSection[]>(() => {
    if (result.sections && result.sections.length > 0) {
      return result.sections;
    }

    const fc = (result.full_content || "").trim();
    if (!fc) return [];

    const td = createTurndownService();
    const markdown = fc.startsWith("<") ? td.turndown(fc) : fc;

    return [
      {
        section_id: "full_content",
        section_type: "full",
        title: "Kế hoạch bài dạy",
        content: markdown,
        editable: true,
      },
    ];
  });
  const [currentSavedId, setCurrentSavedId] = useState<string | undefined>(savedLessonPlanId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [materialsCreated, setMaterialsCreated] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [savedContentSnapshot, setSavedContentSnapshot] = useState("");
  const [hasPendingEdits, setHasPendingEdits] = useState(false);

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

  // Teacher comments inline popover (Word-like)
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [showCommentsList, setShowCommentsList] = useState(false);
  const [commentComposerPosition, setCommentComposerPosition] = useState({ top: 120, left: 24 });
  const [activeThreadPopup, setActiveThreadPopup] = useState<{ threadId: number; top: number; left: number } | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [lessonComments, setLessonComments] = useState<LessonPlanComment[]>([]);
  const [replyingThreadId, setReplyingThreadId] = useState<number | null>(null);
  const [replyDraftByThread, setReplyDraftByThread] = useState<Record<number, string>>({});
  const [selectedTextForComment, setSelectedTextForComment] = useState("");
  const [selectedContextBefore, setSelectedContextBefore] = useState("");
  const [selectedContextAfter, setSelectedContextAfter] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const commentSelectionRangeRef = useRef<Range | null>(null);
  const [showActivityEditPicker, setShowActivityEditPicker] = useState(false);
  const [showAIEditPanel, setShowAIEditPanel] = useState(false);
  const [selectedActivityTarget, setSelectedActivityTarget] = useState<{
    id: string;
    label: string;
    sectionId: string;
    originalText: string;
  } | null>(null);
  const [selectedTextForAIEdit, setSelectedTextForAIEdit] = useState("");
  const [fullLessonForAIEdit, setFullLessonForAIEdit] = useState("");
  const canComment = Boolean(currentSavedId) && !hasPendingEdits;

  // Insert mindmap placeholder before "d) Tổ chức thực hiện" in section content
  const insertMindmapPlaceholder = (sectionContent: string, sectionId: string, activityName?: string | null): string => {
    const placeholder = `\n\n<div class="mindmap-inline" data-section-id="${sectionId}"></div>\n`;
    // Regex: match c) at start of a line, optional bold: c), **c)**, **c)
    const cRegex = /\n\*{0,2}c[\)\.]\*{0,2}\s/;
    // Regex: match next section letter (d, e, ...) at start of a line
    const nextLetterRegex = /\n\*{0,2}[d-z][\)\.]\*{0,2}\s/;

    // If activityName provided, search ONLY within that activity's range
    if (activityName) {
      const activityKey = activityName.match(/Hoạt động\s*[\d.]+/)?.[0];
      if (activityKey) {
        const activityPos = sectionContent.indexOf(activityKey);
        if (activityPos !== -1) {
          // Bound: from this activity heading to the NEXT activity heading (must be at start of line)
          const afterKey = sectionContent.slice(activityPos + activityKey.length);
          const nextActivity = afterKey.match(/\n\*{0,2}Hoạt động\s*[\d.]+/);
          const endBound = nextActivity && nextActivity.index !== undefined
            ? activityPos + activityKey.length + nextActivity.index
            : sectionContent.length;

          const activityContent = sectionContent.slice(activityPos, endBound);

          // Find c) Sản phẩm within this activity
          const cMatch = activityContent.match(cRegex);
          if (cMatch && cMatch.index !== undefined) {
            // Find end of c) content: next section letter (d, e...) or end of activity
            const afterC = activityContent.slice(cMatch.index + cMatch[0].length);
            const nextMatch = afterC.match(nextLetterRegex);
            const insertOffset = nextMatch && nextMatch.index !== undefined
              ? cMatch.index + cMatch[0].length + nextMatch.index
              : activityContent.length;
            const insertPos = activityPos + insertOffset;
            return sectionContent.slice(0, insertPos) + placeholder + sectionContent.slice(insertPos);
          }

          // No c) found → insert at end of activity
          return sectionContent.slice(0, endBound) + placeholder + sectionContent.slice(endBound);
        }
      }
    }

    // Fallback: find first c) in the entire content, insert after its content
    const cMatch = sectionContent.match(cRegex);
    if (cMatch && cMatch.index !== undefined) {
      const afterC = sectionContent.slice(cMatch.index + cMatch[0].length);
      const nextMatch = afterC.match(nextLetterRegex);
      if (nextMatch && nextMatch.index !== undefined) {
        const insertPos = cMatch.index + cMatch[0].length + nextMatch.index;
        return sectionContent.slice(0, insertPos) + placeholder + sectionContent.slice(insertPos);
      }
    }
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
      // Strip leaked markmap CSS + node text from previously broken saves
      if (sectionContent.includes('.markmap{')) {
        const paragraphs = sectionContent.split('\n\n');
        const markmapIdx = paragraphs.findIndex(p => p.includes('.markmap{'));
        if (markmapIdx !== -1) {
          // Find next paragraph with markdown formatting (end of leaked text)
          let endIdx = paragraphs.length;
          for (let i = markmapIdx + 1; i < paragraphs.length; i++) {
            const trimmed = paragraphs[i].trim();
            if (/^(\*{1,2}|#{1,6}|-|\d+\.)/.test(trimmed) || /^[a-z]\)\s/.test(trimmed)) {
              endIdx = i;
              break;
            }
          }
          paragraphs.splice(markmapIdx, endIdx - markmapIdx);
          sectionContent = paragraphs.join('\n\n');
        }
      }
      if (s.mindmap_data?.trim()) {
        sectionContent = insertMindmapPlaceholder(sectionContent, s.section_id, s.mindmap_activity_name);
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

  const editableActivityTargets = useMemo(() => {
    const targets: Array<{
      id: string;
      label: string;
      sectionId: string;
      originalText: string;
    }> = [];

    const cleanActivityLabel = (raw: string): string => {
      return raw
        .replace(/<[^>]*>/g, " ")
        .replace(/^\s*#{1,6}\s*/g, "")
        .replace(/\*{1,3}|_{1,3}|`|~~/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
    };

    const headingRegex = /^\s*(?:#{1,6}\s*)?\*{0,2}Hoạt\s*động\s*2\.\d+[^\n]*$/i;
    const numberedPrefixRegex = String.raw`(?:\d+\s*(?:\\?\.|\))\s*)?`;
    const fullActivityHeadingRegex = new RegExp(
      String.raw`^\s*(?:#{1,6}\s*)?(?:\*{0,2})?${numberedPrefixRegex}(?:Hoạt\s*động\s*(?:1|2\.\d+|3|4)\b|(?:Hoạt\s*động\s*)?khởi\s*động\b|(?:Hoạt\s*động\s*)?hình\s*thành\s*kiến\s*thức\b|(?:Hoạt\s*động\s*)?luyện\s*tập\b|(?:Hoạt\s*động\s*)?vận\s*dụng\b)[^\n]*$`,
      "i",
    );
    const excludedHeadingRegex =
      /^\s*(?:\d+\s*(?:\\?\.|\))\s*)?(?:về\s*kiến\s*thức|về\s*phẩm\s*chất|giáo\s*viên|học\s*sinh|phiếu\s*học\s*tập)\b/i;

    const normalizeActivityLabel = (line: string): string => {
      const cleaned = cleanActivityLabel(
        line
          .replace(/^\s*#{1,6}\s*/, "")
          .replace(/^\s*\d+\s*(?:\\?\.|\))\s*/, "")
          .replace(/\*/g, "")
          .trim(),
      );

      if (/(hoạt\s*động\s*)?khởi\s*động/i.test(cleaned)) return "Hoạt động 1: Khởi động";
      if (/(hoạt\s*động\s*)?luyện\s*tập/i.test(cleaned)) return "Hoạt động 3: Luyện tập";
      if (/(hoạt\s*động\s*)?vận\s*dụng/i.test(cleaned)) return "Hoạt động 4: Vận dụng";
      if (/hoạt\s*động\s*hình\s*thành\s*kiến\s*thức/i.test(cleaned)) return "Hoạt động 2: Hình thành kiến thức";

      return cleaned;
    };

    const collectActivityBlocks = (content: string, sectionId: string, keyPrefix: string) => {
      if (!content.trim()) return;

      const lines = content.split("\n");
      const starts: number[] = [];
      let offset = 0;

      lines.forEach((line) => {
        const plainLine = line.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (fullActivityHeadingRegex.test(plainLine) && !excludedHeadingRegex.test(plainLine)) {
          starts.push(offset);
        }
        offset += line.length + 1;
      });

      starts.forEach((start, idx) => {
        const end = starts[idx + 1] ?? content.length;
        const block = content.slice(start, end).trim();
        if (!block) return;

        const firstLine = block.split("\n").find((line) => line.trim()) || "";
        const label = normalizeActivityLabel(firstLine);

        targets.push({
          id: `${sectionId}-${keyPrefix}-${idx}`,
          label: label || `Hoạt động ${idx + 1}`,
          sectionId,
          originalText: block,
        });
      });
    };

    sections.forEach((section) => {
      if (section.section_type.startsWith("hinh_thanh_kien_thuc")) {
        const lines = section.content.split("\n");
        const starts: number[] = [];
        let offset = 0;

        lines.forEach((line) => {
          if (headingRegex.test(line)) {
            starts.push(offset);
          }
          offset += line.length + 1;
        });

        starts.forEach((start, idx) => {
          const end = starts[idx + 1] ?? section.content.length;
          const block = section.content.slice(start, end).trim();
          if (!block) return;

          const firstLine = block.split("\n").find((line) => line.trim()) || "";
          const label = cleanActivityLabel(firstLine
            .replace(/^\s*#{1,6}\s*/, "")
            .replace(/\*/g, "")
            .trim());

          targets.push({
            id: `${section.section_id}-htkt-${idx}`,
            label: label || `Hoạt động 2.${idx + 1}`,
            sectionId: section.section_id,
            originalText: block,
          });
        });
      }

      if (section.section_type === "full") {
        const source = section.content.trimStart().startsWith("<")
          ? createTurndownService().turndown(section.content)
          : section.content;
        collectActivityBlocks(source, section.section_id, "full");
      }

      if (
        section.section_type === "khoi_dong" ||
        section.section_type === "luyen_tap" ||
        section.section_type === "van_dung"
      ) {
        const label = cleanActivityLabel(section.title?.trim() || (
          section.section_type === "khoi_dong"
            ? "Hoạt động 1: Khởi động"
            : section.section_type === "luyen_tap"
              ? "Hoạt động 3: Luyện tập"
              : "Hoạt động 4: Vận dụng"
        ));
        if (section.content.trim()) {
          targets.push({
            id: `${section.section_id}-main`,
            label,
            sectionId: section.section_id,
            originalText: section.content.trim(),
          });
        }
      }
    });

    return targets;
  }, [sections]);

  const renderEditorFromSections = useCallback((updatedSections: LessonPlanSection[]) => {
    const mainSections = updatedSections.filter(
      (s) => !["thong_tin_chung", "phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
    );
    let content = mainSections.map((s) => {
      let sc = s.content;
      if (s.mindmap_data?.trim()) {
        sc = insertMindmapPlaceholder(sc, s.section_id, s.mindmap_activity_name);
      }
      return sc;
    }).join("\n\n");

    const worksheetSections = updatedSections.filter((s) => s.section_type === "phieu_hoc_tap");
    const quizSections = updatedSections.filter((s) => s.section_type === "trac_nghiem");
    if (worksheetSections.length > 0 || quizSections.length > 0) {
      content += "\n\n## **IV. PHỤ LỤC**\n\n";
      if (worksheetSections.length > 0) {
        content += "### **1. Phiếu học tập**\n\n";
        worksheetSections.forEach((s) => {
          if (s.worksheet_data) {
            content += renderWorksheetDataToMarkdown(s.worksheet_data, s.title) + "\n\n";
          } else if (s.content) {
            content += `${s.content}\n\n`;
          }
        });
      }
      if (quizSections.length > 0) {
        content += "### **2. Trắc nghiệm**\n\n";
        quizSections.forEach((s) => {
          content += `${s.content.replace(/\n---\n/g, "\n")}\n\n`;
        });
      }
    }

    let html = marked.parse(content) as string;
    html = formatQuizAnswersToTable(html);
    html = highlightCodeBlocks(html);
    html = formatWorksheetDotLines(html);
    html = dedupeListItemLeadingMarkers(html);

    const mindmapSecs = updatedSections.filter((s) => s.mindmap_data?.trim());
    if (mindmapSecs.length > 0) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const placeholders = tempDiv.querySelectorAll(".mindmap-inline");
      for (const ph of Array.from(placeholders)) {
        const sectionId = ph.getAttribute("data-section-id");
        const section = mindmapSecs.find((s) => s.section_id === sectionId);
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

    renderedMindmapIds.current.clear();
    setEditContent(html);
    setHasPendingEdits(html !== savedContentSnapshot);
  }, [insertMindmapPlaceholder, savedContentSnapshot]);

  // Tự động khởi tạo editor khi component mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // If full_content is already HTML (saved from editor), use directly
      const fc = result.full_content || "";
      const isHtml = fc.trimStart().startsWith("<");

      let html: string;
      if (isHtml && currentSavedId) {
        // Loaded from saved KHBD with HTML content — use directly (preserves table formatting)
        html = fc;
      } else {
        const fullMd = getFullMarkdown();
        html = marked.parse(fullMd) as string;
      }
      // Auto-format quiz answer keys into tables
      html = formatQuizAnswersToTable(html);
      // Apply syntax highlighting to code blocks
      html = highlightCodeBlocks(html);
      // Split answer parts (a, b, c, d) on the same line onto separate lines
      html = formatSanPhamAnswers(html);
      // Replace long dot sequences with CSS dotted lines
      html = formatWorksheetDotLines(html);
      // Remove leaked list marker characters from li text (e.g. "+ + ...")
      html = dedupeListItemLeadingMarkers(html);

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
        setSavedContentSnapshot(html);
        setHasPendingEdits(false);
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

  const commentThreads = useMemo(() => {
    const rootComments = lessonComments
      .filter((comment) => !comment.parent_comment_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return rootComments.map((root) => ({
      root,
      replies: lessonComments
        .filter((comment) => comment.parent_comment_id === root.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));
  }, [lessonComments]);

  const activeThread = useMemo(() => {
    if (!activeThreadPopup) return null;
    return commentThreads.find((thread) => thread.root.id === activeThreadPopup.threadId) || null;
  }, [commentThreads, activeThreadPopup]);

  const getFloatingPanelPosition = useCallback((rect: DOMRect, panelWidth = 360, panelHeight = 360) => {
    const viewportPadding = 12;
    const topSafeArea = 72;

    let left = rect.right + 14;
    if (left + panelWidth > window.innerWidth - viewportPadding) {
      left = rect.left - panelWidth - 14;
    }
    if (left < viewportPadding) {
      left = Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding);
    }

    let top = rect.top - 6;
    if (top + panelHeight > window.innerHeight - viewportPadding) {
      top = window.innerHeight - panelHeight - viewportPadding;
    }
    if (top < topSafeArea) {
      top = topSafeArea;
    }

    return { top, left };
  }, []);

  const getEditorElement = useCallback((): HTMLElement | null => {
    return document.querySelector('[contenteditable="true"]') as HTMLElement | null;
  }, []);

  const captureEditorSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const editor = getEditorElement();
    if (!editor) return null;
    if (!editor.contains(range.commonAncestorContainer)) return null;

    const selectedText = selection.toString().replace(/\s+/g, " ").trim();
    if (!selectedText) return null;

    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(editor);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    const afterRange = range.cloneRange();
    afterRange.selectNodeContents(editor);
    afterRange.setStart(range.endContainer, range.endOffset);

    const contextBefore = beforeRange.toString().replace(/\s+/g, " ").trim().slice(-180);
    const contextAfter = afterRange.toString().replace(/\s+/g, " ").trim().slice(0, 180);
    const selectionRect = range.getBoundingClientRect();

    commentSelectionRangeRef.current = range.cloneRange();

    return {
      selectedText,
      contextBefore,
      contextAfter,
      selectionRect,
    };
  }, [getEditorElement]);

  const wrapRangeAsCommentAnchor = useCallback((range: Range, attrs: Record<string, string>) => {
    const makeAnchor = () => {
      const anchor = document.createElement("span");
      anchor.className = "teacher-comment-anchor";
      Object.entries(attrs).forEach(([key, value]) => {
        anchor.setAttribute(key, value);
      });
      return anchor;
    };

    // Fast path: toàn bộ range nằm trong 1 text node
    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      try {
        range.surroundContents(makeAnchor());
        return true;
      } catch {
        return false;
      }
    }

    // Multi-node path: tìm tất cả text node giao với range, wrap từng segment riêng.
    // Cho phép bình luận bôi nhiều đoạn / nhiều <li>.
    const ancestor = range.commonAncestorContainer;
    const walkRoot =
      ancestor.nodeType === Node.TEXT_NODE ? (ancestor.parentNode as Node | null) : ancestor;
    if (!walkRoot) return false;

    const walker = document.createTreeWalker(walkRoot, NodeFilter.SHOW_TEXT);
    const segments: { node: Text; start: number; end: number }[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!range.intersectsNode(node)) continue;
      const text = node.nodeValue || "";
      const startOffset = node === range.startContainer ? range.startOffset : 0;
      const endOffset = node === range.endContainer ? range.endOffset : text.length;
      if (endOffset <= startOffset) continue;
      if (!text.substring(startOffset, endOffset).trim()) continue;
      segments.push({ node, start: startOffset, end: endOffset });
    }

    if (segments.length === 0) return false;

    // Wrap theo thứ tự ngược để việc split text node ở segment sau không làm invalid
    // tham chiếu node ở segment trước.
    let wrappedAny = false;
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const segRange = document.createRange();
      try {
        segRange.setStart(seg.node, seg.start);
        segRange.setEnd(seg.node, seg.end);
        segRange.surroundContents(makeAnchor());
        wrappedAny = true;
      } catch {
        // bỏ qua segment lỗi, tiếp tục các segment khác
      }
    }
    return wrappedAny;
  }, []);

  const wrapCapturedSelectionAsAnchor = useCallback((tempAnchorId: string) => {
    const editor = getEditorElement();
    const storedRange = commentSelectionRangeRef.current;
    if (!editor || !storedRange) return false;
    if (!editor.contains(storedRange.commonAncestorContainer)) return false;

    const selectedText = storedRange.toString().replace(/\s+/g, " ").trim();
    if (!selectedText) return false;

    const wrapped = wrapRangeAsCommentAnchor(storedRange.cloneRange(), {
      "data-temp-comment-id": tempAnchorId,
    });

    commentSelectionRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
    return wrapped;
  }, [getEditorElement, wrapRangeAsCommentAnchor]);

  const ensureAnchorForComment = useCallback((comment: LessonPlanComment) => {
    const editor = getEditorElement();
    if (!editor) return;
    if (comment.parent_comment_id) return;
    if (editor.querySelector(`[data-comment-id="${comment.id}"]`)) return;
    if (!comment.selected_text?.trim()) return;

    const rawTarget = comment.selected_text.trim();
    const normalizedTarget = rawTarget.replace(/\s+/g, " ");
    const attrs = { "data-comment-id": String(comment.id) };

    // Fast path: khớp trong 1 text node (chiếm đa số comment thực tế).
    const simpleWalker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    while (simpleWalker.nextNode()) {
      const current = simpleWalker.currentNode as Text;
      const value = current.nodeValue || "";
      const idx = value.indexOf(rawTarget);
      if (idx === -1) continue;

      const range = document.createRange();
      range.setStart(current, idx);
      range.setEnd(current, idx + rawTarget.length);
      if (wrapRangeAsCommentAnchor(range, attrs)) return;
    }

    // Slow path: đoạn bôi trải qua nhiều text node (ví dụ nhiều <li>).
    // Build flat-text map: mỗi ký tự của chuỗi phẳng ↔ (textNode, offset trong node).
    const textNodes: Text[] = [];
    const flatWalker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    while (flatWalker.nextNode()) {
      textNodes.push(flatWalker.currentNode as Text);
    }

    const positions: { node: Text; offset: number }[] = [];
    const flatChars: string[] = [];
    let lastWasSpace = true;
    for (const node of textNodes) {
      const raw = node.nodeValue || "";
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (/\s/.test(ch)) {
          if (!lastWasSpace) {
            flatChars.push(" ");
            positions.push({ node, offset: i });
            lastWasSpace = true;
          }
        } else {
          flatChars.push(ch);
          positions.push({ node, offset: i });
          lastWasSpace = false;
        }
      }
      // Khoảng trắng ngầm giữa 2 text node (do block element xen giữa)
      if (!lastWasSpace) {
        flatChars.push(" ");
        positions.push({ node, offset: raw.length });
        lastWasSpace = true;
      }
    }
    const flat = flatChars.join("");

    const idx = flat.indexOf(normalizedTarget);
    if (idx === -1) return;

    const startPos = positions[idx];
    const endPos = positions[idx + normalizedTarget.length - 1];
    if (!startPos || !endPos) return;

    const range = document.createRange();
    try {
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, Math.min((endPos.node.nodeValue || "").length, endPos.offset + 1));
    } catch {
      return;
    }
    wrapRangeAsCommentAnchor(range, attrs);
  }, [getEditorElement, wrapRangeAsCommentAnchor]);

  const scrollToCommentAnchor = useCallback((commentId: number) => {
    const editor = getEditorElement();
    if (!editor) return;

    editor.querySelectorAll(".teacher-comment-anchor.is-active").forEach((el) => {
      el.classList.remove("is-active");
    });

    const anchor = editor.querySelector(`[data-comment-id="${commentId}"]`) as HTMLElement | null;
    if (!anchor) return;

    anchor.classList.add("is-active");
    anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => anchor.classList.remove("is-active"), 1600);
  }, [getEditorElement]);

  const removeCommentAnchors = useCallback((commentId: number) => {
    const editor = getEditorElement();
    if (!editor) return;
    const anchors = Array.from(editor.querySelectorAll(`[data-comment-id="${commentId}"]`));
    anchors.forEach((anchor) => {
      const parent = anchor.parentNode;
      if (!parent) return;
      while (anchor.firstChild) {
        parent.insertBefore(anchor.firstChild, anchor);
      }
      parent.removeChild(anchor);
    });
  }, [getEditorElement]);

  const loadLessonComments = useCallback(async () => {
    if (!currentSavedId) {
      setLessonComments([]);
      return;
    }

    const planId = Number(currentSavedId);
    if (Number.isNaN(planId)) {
      setCommentError("ID KHBD không hợp lệ để tải bình luận.");
      return;
    }

    setIsLoadingComments(true);
    try {
      const data = await getLessonPlanComments(planId);
      setLessonComments(data);
      data.forEach(ensureAnchorForComment);
    } catch (error: any) {
      setCommentError(error.response?.data?.detail || "Không thể tải bình luận giáo viên.");
    } finally {
      setIsLoadingComments(false);
    }
  }, [currentSavedId, ensureAnchorForComment]);

  const handleToggleCommentSidebar = () => {
    if (!currentSavedId) {
      setCommentError("Cần lưu KHBD trước khi thêm bình luận giáo viên.");
      return;
    }
    if (hasPendingEdits) {
      setCommentError("Bạn đang có thay đổi chưa lưu. Hãy bấm Lưu trước khi bình luận.");
      return;
    }

    const selectionData = captureEditorSelection();
    if (!selectionData) {
      setCommentError("Hãy bôi đen đoạn văn cần bình luận trước.");
      return;
    }

    setCommentError(null);
    setSelectedTextForComment(selectionData.selectedText);
    setSelectedContextBefore(selectionData.contextBefore);
    setSelectedContextAfter(selectionData.contextAfter);
    setCommentComposerPosition(getFloatingPanelPosition(selectionData.selectionRect, 360, 340));
    setShowCommentSidebar(true);
    setActiveThreadPopup(null);

    void loadLessonComments();
  };

  const handleOpenAIEditPanel = () => {
    if (hasPendingEdits) {
      setSaveMessage({ type: "error", text: "Bạn đang có thay đổi chưa lưu. Hãy bấm Lưu trước khi sửa theo hoạt động." });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (editableActivityTargets.length === 0) {
      setSaveMessage({ type: "error", text: "Không tìm thấy hoạt động để chỉnh sửa." });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setShowActivityEditPicker(true);
  };

  const handleSelectActivityForAIEdit = (target: { id: string; label: string; sectionId: string; originalText: string; }) => {
    setSelectedActivityTarget(target);
    setSelectedTextForAIEdit(target.originalText);
    setFullLessonForAIEdit(getFullMarkdown());
    setShowActivityEditPicker(false);
    setShowAIEditPanel(true);
  };

  const handleApplyAIEdit = async (
    editedText: string,
    relatedChanges: EditRelatedChange[],
    selectedSuggestion: {
      suggestionType: string;
      suggestionTitle: string;
      suggestionDescription: string;
    },
  ) => {
    if (!selectedActivityTarget) {
      setSaveMessage({ type: "error", text: "Không xác định được hoạt động cần áp dụng chỉnh sửa." });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    const normalizeLooseText = (value: string): string =>
      value
        .toLowerCase()
        .replace(/<[^>]*>/g, " ")
        .replace(/\*{1,3}|_{1,3}|`|~~/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/[.:;,!?()\[\]{}"']/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const cleanupMarkdown = (value: string): string => value.replace(/\n{3,}/g, "\n\n").trim();

    const applyChangeToContent = (
      content: string,
      change: EditRelatedChange,
    ): { nextContent: string; changed: boolean } => {
      const oldText = (change.old_text || "").trim();
      const newText = (change.new_text || "").trim();
      const oldNorm = normalizeLooseText(oldText);

      let nextContent = content;
      let changed = false;

      if (change.action === "add") {
        if (!newText) return { nextContent: content, changed: false };
        const alreadyExists = normalizeLooseText(nextContent).includes(normalizeLooseText(newText));
        if (alreadyExists) return { nextContent: content, changed: false };
        nextContent = `${nextContent.trimEnd()}\n${newText}`;
        changed = true;
      } else if (change.action === "remove") {
        if (!oldText) return { nextContent: content, changed: false };

        if (nextContent.includes(oldText)) {
          nextContent = nextContent.replace(oldText, "");
          changed = true;
        } else if (oldNorm) {
          const lines = nextContent.split("\n");
          const filtered = lines.filter((line) => !normalizeLooseText(line).includes(oldNorm));
          if (filtered.length !== lines.length) {
            nextContent = filtered.join("\n");
            changed = true;
          }
        }
      } else {
        if (oldText && nextContent.includes(oldText)) {
          nextContent = nextContent.replace(oldText, newText);
          changed = true;
        } else if (oldNorm && newText) {
          const lines = nextContent.split("\n");
          let replaced = false;
          const updatedLines = lines.map((line) => {
            if (replaced) return line;
            if (normalizeLooseText(line).includes(oldNorm)) {
              replaced = true;
              return newText;
            }
            return line;
          });
          if (replaced) {
            nextContent = updatedLines.join("\n");
            changed = true;
          }
        } else if (!oldText && newText) {
          const alreadyExists = normalizeLooseText(nextContent).includes(normalizeLooseText(newText));
          if (!alreadyExists) {
            nextContent = `${nextContent.trimEnd()}\n${newText}`;
            changed = true;
          }
        }
      }

      return {
        nextContent: changed ? cleanupMarkdown(nextContent) : content,
        changed,
      };
    };

    const resolveSectionTypesForChange = (sectionKey: string): string[] => {
      const key = sectionKey.toLowerCase().trim();
      if (key === "thiet_bi_gv" || key === "thiet_bi_hs") return ["thiet_bi", "full"];
      if (key === "nang_luc_tin_hoc" || key === "nang_luc_chung" || key === "pham_chat") return ["muc_tieu", "full"];
      if (key === "phieu_hoc_tap") return ["phieu_hoc_tap", "full"];
      if (key === "trac_nghiem") return ["trac_nghiem", "full"];
      return ["full"];
    };

    const isMindmapSuggestion = (() => {
      const bucket = `${selectedSuggestion?.suggestionType || ""} ${selectedSuggestion?.suggestionTitle || ""} ${selectedSuggestion?.suggestionDescription || ""}`
        .toLowerCase();
      return (
        bucket.includes("sơ đồ tư duy") ||
        bucket.includes("so do tu duy") ||
        bucket.includes("mindmap")
      );
    })();

    const ensureMindmapProductLine = (text: string): string => {
      const hasMindmapMention = /sơ\s*đồ\s*tư\s*duy|so\s*do\s*tu\s*duy|mindmap/i.test(text);
      if (hasMindmapMention) return text;

      const lines = text.split("\n");
      const cMarkerRegex = /^\s*(?:[-+*]\s*)?(?:\*{0,3}\s*)?c\s*(?:\\?[\).])\s*/i;
      const dMarkerRegex = /^\s*(?:[-+*]\s*)?(?:\*{0,3}\s*)?d\s*(?:\\?[\).])\s*/i;
      const cIdx = lines.findIndex((line) => cMarkerRegex.test(line));

      const defaultLine = "- Sơ đồ tư duy thể hiện nội dung trọng tâm của hoạt động.";
      if (cIdx === -1) {
        return cleanupMarkdown(`${text.trimEnd()}\n${defaultLine}`);
      }

      let dIdx = lines.length;
      for (let i = cIdx + 1; i < lines.length; i++) {
        if (dMarkerRegex.test(lines[i])) {
          dIdx = i;
          break;
        }
      }

      const indent = (lines[cIdx].match(/^(\s*)/)?.[1] || "");
      lines.splice(dIdx, 0, `${indent}${defaultLine}`);
      return cleanupMarkdown(lines.join("\n"));
    };

    const normalizeActivitySubsectionFormatting = (text: string): string => {
      const forceMarkerNewLine = (input: string, marker: "b" | "c" | "d") =>
        input.replace(
          new RegExp(`([^\\n])\\s+(${marker}\\s*(?:\\\\?[\\).]))\\s*`, "gi"),
          "$1\n$2 ",
        );

      let normalized = text;
      normalized = forceMarkerNewLine(normalized, "b");
      normalized = forceMarkerNewLine(normalized, "c");
      normalized = forceMarkerNewLine(normalized, "d");

      const labelByMarker: Record<string, string> = {
        b: "Nội dung",
        c: "Sản phẩm",
        d: "Tổ chức thực hiện",
      };

      const stripLeadingLabel = (marker: string, value: string): string => {
        if (marker === "b") {
          return value.replace(/^\*{0,2}\s*Nội\s*dung\s*:?\s*\*{0,2}\s*/i, "").trimStart();
        }
        if (marker === "c") {
          return value.replace(/^\*{0,2}\s*Sản\s*phẩm\s*:?\s*\*{0,2}\s*/i, "").trimStart();
        }
        return value.replace(/^\*{0,2}\s*Tổ\s*chức\s*thực\s*hiện\s*:?\s*\*{0,2}\s*/i, "").trimStart();
      };

      const lines = normalized.split("\n").map((line) => {
        const markerMatch = line.match(/^\s*(?:[-+*]\s*)?(?:\*{0,3}\s*)?([bcd])\s*(?:\\?[\).])\s*(.*)$/i);
        if (!markerMatch) return line;

        const marker = markerMatch[1].toLowerCase();
        const markerPrefix = line.slice(0, markerMatch[0].length - markerMatch[2].length).replace(/\s+$/, "");
        const rawTail = markerMatch[2] || "";
        const tailWithoutLabel = stripLeadingLabel(marker, rawTail);
        const sectionLabel = labelByMarker[marker] || "Nội dung";

        return `${markerPrefix} **${sectionLabel}:**${tailWithoutLabel ? ` ${tailWithoutLabel}` : ""}`;
      });

      return cleanupMarkdown(lines.join("\n"));
    };

    // AI only returns b) + c) + d). Preserve activity heading + a) Mục tiêu from original text.
    const originalText = selectedActivityTarget.originalText;
    const trimmedEditedText = editedText.trim();
    const bMarkerRegex = /(?:^|\n)\s*(?:[-+*]\s*)?(?:\*{0,3}\s*)?b\s*(?:\\?[\).])\s*/i;
    const bMatch = bMarkerRegex.exec(originalText);

    let preservedPrefix = "";
    if (bMatch && bMatch.index !== undefined) {
      const startsWithNewline = bMatch[0].startsWith("\n");
      const bStart = bMatch.index + (startsWithNewline ? 1 : 0);
      preservedPrefix = originalText.slice(0, bStart).trimEnd();
    } else {
      // Fallback: keep everything before the first b)/c)/d) marker line.
      const lines = originalText.split("\n");
      const cutoff = lines.findIndex((line) =>
        /^\s*(?:[-+*]\s*)?(?:\*{0,3}\s*)?[bcd]\s*(?:\\?[\).])\s*/i.test(line),
      );
      if (cutoff > 0) {
        preservedPrefix = lines.slice(0, cutoff).join("\n").trimEnd();
      }
    }

    const editedAlreadyContainsPrefix = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*{0,3}\s*)?(?:Hoạt\s*động\b|a\s*(?:\\?[\).]))/i.test(trimmedEditedText);
    let fullEditedText = preservedPrefix && !editedAlreadyContainsPrefix
      ? `${preservedPrefix}\n${trimmedEditedText}`
      : trimmedEditedText;

    fullEditedText = normalizeActivitySubsectionFormatting(fullEditedText);

    if (isMindmapSuggestion) {
      fullEditedText = ensureMindmapProductLine(fullEditedText);
      fullEditedText = normalizeActivitySubsectionFormatting(fullEditedText);
    }

    const updatedSectionsAfterActivity = sections.map((section) => {
      if (section.section_id !== selectedActivityTarget.sectionId) return section;

      if (section.content.includes(originalText)) {
        const newContent = section.content.replace(originalText, fullEditedText);
        onSectionUpdate(section.section_id, newContent);
        return { ...section, content: newContent };
      }

      const targetHeader = originalText
        .split("\n")
        .find((line) => line.trim())
        ?.replace(/^\s*#{1,6}\s*/, "")
        .replace(/^\s*\d+\s*(?:\\?\.|\))\s*/, "")
        .replace(/\*/g, "")
        .trim();

      if (!targetHeader) return section;

      const lines = section.content.split("\n");
      const startIndex = lines.findIndex((line) =>
        line
          .replace(/^\s*#{1,6}\s*/, "")
          .replace(/^\s*\d+\s*(?:\\?\.|\))\s*/, "")
          .replace(/\*/g, "")
          .trim()
          .includes(targetHeader)
      );
      if (startIndex === -1) return section;

      let endIndex = lines.length;
      for (let i = startIndex + 1; i < lines.length; i++) {
        const plainLine = lines[i].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (/^\s*(?:#{1,6}\s*)?(?:\*{0,2})?(?:\d+\s*(?:\\?\.|\))\s*)?(?:Hoạt\s*động\s*(?:1|2\.\d+|3|4)\b|(?:Hoạt\s*động\s*)?khởi\s*động\b|(?:Hoạt\s*động\s*)?hình\s*thành\s*kiến\s*thức\b|(?:Hoạt\s*động\s*)?luyện\s*tập\b|(?:Hoạt\s*động\s*)?vận\s*dụng\b)/i.test(plainLine)) {
          endIndex = i;
          break;
        }
      }

      const merged = [
        lines.slice(0, startIndex).join("\n"),
        fullEditedText,
        lines.slice(endIndex).join("\n"),
      ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");

      onSectionUpdate(section.section_id, merged);
      return { ...section, content: merged };
    });

    let nextSections = updatedSectionsAfterActivity;
    let mindmapGenerated = false;
    let mindmapGenerationFailed = false;

    if (isMindmapSuggestion) {
      try {
        const lessonId = (result.lesson_info.lesson_id || result.lesson_info.lesson_name || "khbd")
          .toString()
          .trim();
        const lessonName = (result.lesson_info.lesson_name || "Bài học").toString().trim();
        const activityName = selectedActivityTarget.label || "Hoạt động";
        const mindmapData = await generateMindmap(
          lessonId,
          lessonName,
          fullEditedText,
          activityName,
        );

        if (mindmapData?.trim()) {
          nextSections = nextSections.map((section) =>
            section.section_id === selectedActivityTarget.sectionId
              ? {
                  ...section,
                  mindmap_data: mindmapData,
                  mindmap_activity_name: activityName,
                }
              : section,
          );
          mindmapGenerated = true;
        }
      } catch {
        mindmapGenerationFailed = true;
      }
    }

    const touchedSectionIds = new Set<string>();
    let appliedRelatedCount = 0;

    for (const change of relatedChanges) {
      const sectionKey = (change.section || "").trim().toLowerCase();
      if (!sectionKey) continue;

      let changedThisItem = false;

      if ((sectionKey === "phieu_hoc_tap" || sectionKey === "trac_nghiem") && change.action === "remove") {
        const oldNorm = normalizeLooseText(change.old_text || "");
        if (oldNorm) {
          const beforeLength = nextSections.length;
          nextSections = nextSections.filter((section) => {
            if (section.section_type !== sectionKey) return true;
            const titleNorm = normalizeLooseText(section.title || "");
            const contentNorm = normalizeLooseText(section.content || "");
            const shouldRemove = titleNorm.includes(oldNorm) || contentNorm.includes(oldNorm);
            if (shouldRemove) {
              changedThisItem = true;
            }
            return !shouldRemove;
          });
          if (beforeLength !== nextSections.length) {
            appliedRelatedCount += 1;
            continue;
          }
        }
      }

      const preferredTypes = resolveSectionTypesForChange(sectionKey);
      const existingPreferredTypes = preferredTypes.filter((type) => nextSections.some((s) => s.section_type === type));
      const scopedTypes = existingPreferredTypes.length > 0 ? existingPreferredTypes : ["full"];

      nextSections = nextSections.map((section) => {
        if (!scopedTypes.includes(section.section_type)) return section;

        const { nextContent, changed } = applyChangeToContent(section.content, change);
        if (!changed) return section;

        touchedSectionIds.add(section.section_id);
        changedThisItem = true;
        return { ...section, content: nextContent };
      });

      if (!changedThisItem) {
        nextSections = nextSections.map((section) => {
          const { nextContent, changed } = applyChangeToContent(section.content, change);
          if (!changed) return section;

          touchedSectionIds.add(section.section_id);
          changedThisItem = true;
          return { ...section, content: nextContent };
        });
      }

      if (changedThisItem) {
        appliedRelatedCount += 1;
      }
    }

    nextSections.forEach((section) => {
      if (touchedSectionIds.has(section.section_id)) {
        onSectionUpdate(section.section_id, section.content);
      }
    });

    setSections(nextSections);
    renderEditorFromSections(nextSections);
    setShowAIEditPanel(false);
    setSelectedActivityTarget(null);
    const relatedText = appliedRelatedCount > 0
      ? ` và ${appliedRelatedCount} thay đổi liên quan`
      : "";
    const mindmapText = mindmapGenerated
      ? " Đã tạo sơ đồ tư duy cho hoạt động này."
      : mindmapGenerationFailed
        ? " Đã chèn nội dung nhưng chưa tạo được sơ đồ tư duy tự động."
        : "";
    setSaveMessage({
      type: "success",
      text: `Đã áp dụng chỉnh sửa cho ${selectedActivityTarget.label}${relatedText}.${mindmapText}`,
    });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleFocusComment = (comment: LessonPlanComment) => {
    const targetId = comment.parent_comment_id ?? comment.id;
    setActiveCommentId(targetId);
    scrollToCommentAnchor(targetId);

    const editor = getEditorElement();
    const anchor = editor?.querySelector(`[data-comment-id="${targetId}"]`) as HTMLElement | null;
    if (anchor) {
      const position = getFloatingPanelPosition(anchor.getBoundingClientRect(), 390, 470);
      setActiveThreadPopup({ threadId: targetId, ...position });
      setShowCommentSidebar(false);
    }
  };

  const handleCreateComment = async () => {
    const commentText = newCommentText.trim();
    if (!currentSavedId) {
      setCommentError("Cần lưu KHBD trước khi thêm bình luận giáo viên.");
      return;
    }
    if (hasPendingEdits) {
      setCommentError("Bạn đang có thay đổi chưa lưu. Hãy bấm Lưu trước khi bình luận.");
      return;
    }
    if (!selectedTextForComment.trim()) {
      setCommentError("Hãy chọn đoạn nội dung trong KHBD để gắn bình luận.");
      return;
    }
    if (commentText.length < 10) {
      setCommentError("Nội dung bình luận tối thiểu 10 ký tự.");
      return;
    }

    const planId = Number(currentSavedId);
    if (Number.isNaN(planId)) {
      setCommentError("ID KHBD không hợp lệ để lưu bình luận.");
      return;
    }

    setIsSavingComment(true);
    setCommentError(null);
    const tempAnchorId = `pending-${Date.now()}`;
    const hasSelectionAnchor = wrapCapturedSelectionAsAnchor(tempAnchorId);

    try {
      const created = await createLessonPlanComment(planId, {
        selected_text: selectedTextForComment,
        context_before: selectedContextBefore || undefined,
        context_after: selectedContextAfter || undefined,
        section_type: "full",
        comment_text: commentText,
      });

      if (hasSelectionAnchor) {
        const editor = getEditorElement();
        editor?.querySelectorAll(`[data-temp-comment-id="${tempAnchorId}"]`).forEach((el) => {
          el.setAttribute("data-comment-id", String(created.id));
          el.removeAttribute("data-temp-comment-id");
        });
      }

      setNewCommentText("");
      setSelectedTextForComment("");
      setSelectedContextBefore("");
      setSelectedContextAfter("");
      setReplyingThreadId(null);
      setShowCommentSidebar(false);
      await loadLessonComments();
      setActiveCommentId(created.id);
      scrollToCommentAnchor(created.id);
    } catch (error: any) {
      const editor = getEditorElement();
      editor?.querySelectorAll(`[data-temp-comment-id="${tempAnchorId}"]`).forEach((el) => {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      });
      setCommentError(error.response?.data?.detail || "Không thể lưu bình luận giáo viên.");
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleCreateReply = async (threadRoot: LessonPlanComment) => {
    if (!currentSavedId) {
      setCommentError("Cần lưu KHBD trước khi trả lời bình luận.");
      return;
    }
    if (hasPendingEdits) {
      setCommentError("Bạn đang có thay đổi chưa lưu. Hãy bấm Lưu trước khi trả lời bình luận.");
      return;
    }

    const replyText = (replyDraftByThread[threadRoot.id] || "").trim();
    if (!replyText) {
      setCommentError("Nội dung trả lời không được để trống.");
      return;
    }

    const planId = Number(currentSavedId);
    if (Number.isNaN(planId)) {
      setCommentError("ID KHBD không hợp lệ để lưu trả lời.");
      return;
    }

    setIsSavingComment(true);
    setCommentError(null);
    try {
      await createLessonPlanComment(planId, {
        parent_comment_id: threadRoot.id,
        comment_text: replyText,
      });

      setReplyDraftByThread((prev) => ({ ...prev, [threadRoot.id]: "" }));
      setReplyingThreadId(null);
      await loadLessonComments();
      setActiveCommentId(threadRoot.id);
      scrollToCommentAnchor(threadRoot.id);

      const editor = getEditorElement();
      const anchor = editor?.querySelector(`[data-comment-id="${threadRoot.id}"]`) as HTMLElement | null;
      if (anchor) {
        const position = getFloatingPanelPosition(anchor.getBoundingClientRect(), 390, 470);
        setActiveThreadPopup({ threadId: threadRoot.id, ...position });
      }
    } catch (error: any) {
      setCommentError(error.response?.data?.detail || "Không thể lưu trả lời bình luận.");
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleResolveThread = async (threadRoot: LessonPlanComment, resolved: boolean) => {
    if (!currentSavedId) return;
    const planId = Number(currentSavedId);
    if (Number.isNaN(planId)) return;

    try {
      await resolveLessonPlanCommentThread(planId, threadRoot.id, resolved);
      await loadLessonComments();
      setActiveCommentId(threadRoot.id);
    } catch (error: any) {
      setCommentError(error.response?.data?.detail || "Không thể cập nhật trạng thái bình luận.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentSavedId) return;
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    const planId = Number(currentSavedId);
    if (Number.isNaN(planId)) return;

    try {
      await deleteLessonPlanComment(planId, commentId);
      const deleted = lessonComments.find((comment) => comment.id === commentId);
      if (deleted && !deleted.parent_comment_id) {
        removeCommentAnchors(commentId);
      }
      await loadLessonComments();
      if (activeCommentId === commentId) {
        setActiveCommentId(null);
      }
    } catch (error: any) {
      setCommentError(error.response?.data?.detail || "Không thể xóa bình luận.");
    }
  };

  useEffect(() => {
    if (!currentSavedId) return;
    void loadLessonComments();
  }, [currentSavedId, loadLessonComments]);

  useEffect(() => {
    const editor = getEditorElement();
    if (!editor) return;

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest(".teacher-comment-anchor") as HTMLElement | null;
      if (!anchor) return;

      const id = Number(anchor.getAttribute("data-comment-id"));
      if (Number.isNaN(id)) return;

      const position = getFloatingPanelPosition(anchor.getBoundingClientRect(), 390, 470);
      setActiveCommentId(id);
      setActiveThreadPopup({ threadId: id, ...position });
      setShowCommentSidebar(false);
    };

    editor.addEventListener("click", handleAnchorClick);
    return () => {
      editor.removeEventListener("click", handleAnchorClick);
    };
  }, [getEditorElement, getFloatingPanelPosition, editContent]);

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
    const origSvg = document.querySelector('.mindmap-modal-preview svg') as SVGSVGElement | null;
    if (!origSvg) return;

    try {
      const clone = origSvg.cloneNode(true) as SVGSVGElement;

      // 1) Inline all computed styles on every element so the standalone SVG looks identical
      const inlineStyles = (orig: Element, copy: Element) => {
        const cs = window.getComputedStyle(orig);
        (copy as HTMLElement).style.cssText = cs.cssText;
        const origChildren = orig.children;
        const copyChildren = copy.children;
        for (let i = 0; i < origChildren.length; i++) {
          if (copyChildren[i]) inlineStyles(origChildren[i], copyChildren[i]);
        }
      };
      inlineStyles(origSvg, clone);

      // 2) Replace <foreignObject> (HTML text) with native SVG <text>
      const origFOs = Array.from(origSvg.querySelectorAll('foreignObject'));
      const cloneFOs = Array.from(clone.querySelectorAll('foreignObject'));
      cloneFOs.forEach((fo, idx) => {
        const text = (fo.textContent || '').trim();
        if (!text) { fo.remove(); return; }

        const x = parseFloat(fo.getAttribute('x') || '0');
        const y = parseFloat(fo.getAttribute('y') || '0');
        const h = parseFloat(fo.getAttribute('height') || '20');

        let fontSize = '14px', color = '#333';
        const origDiv = origFOs[idx]?.querySelector('div, span');
        if (origDiv) {
          const cs = window.getComputedStyle(origDiv);
          if (cs.fontSize) fontSize = cs.fontSize;
          if (cs.color) color = cs.color;
        }

        const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        svgText.setAttribute('x', String(x + 4));
        svgText.setAttribute('y', String(y + h / 2));
        svgText.setAttribute('font-size', fontSize);
        svgText.setAttribute('font-family', 'Arial, sans-serif');
        svgText.setAttribute('fill', color);
        svgText.setAttribute('dominant-baseline', 'central');
        svgText.textContent = text;
        // Clear inherited cssText so it doesn't break SVG text rendering
        svgText.removeAttribute('style');

        fo.parentNode?.replaceChild(svgText, fo);
      });

      // 3) Set fixed pixel dimensions from the live SVG's bounding box
      const bbox = origSvg.getBBox();
      const pad = 30;
      const vbW = bbox.width + pad * 2;
      const vbH = bbox.height + pad * 2;
      const exportW = 2400;
      const exportH = Math.round(exportW * vbH / vbW);

      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('viewBox', `${bbox.x - pad} ${bbox.y - pad} ${vbW} ${vbH}`);
      clone.setAttribute('width', String(exportW));
      clone.setAttribute('height', String(exportH));
      clone.removeAttribute('style');

      // 4) Serialize → Blob → Image → Canvas → PNG download
      const svgStr = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = exportW * scale;
        canvas.height = exportH * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, exportW, exportH);
        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const lessonName = result.lesson_info.lesson_name || "so-do-tu-duy";
          const safeName = lessonName.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').trim().replace(/\s+/g, '_');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(pngBlob);
          a.download = `SoDoTuDuy_${safeName}.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert('Không thể tạo hình ảnh sơ đồ tư duy. Vui lòng thử lại.');
      };
      img.src = url;
    } catch {
      alert('Không thể tạo hình ảnh sơ đồ tư duy. Vui lòng thử lại.');
    }
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

    renderEditorFromSections(updatedSections);
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
    const currentUser = getStoredAuthUser();
    const teacherIdentity = {
      school_name: currentUser?.settings?.school_name || undefined,
      department_name: currentUser?.settings?.department_name || undefined,
      teacher_name: currentUser?.settings?.teacher_name || undefined,
    };

    exportToPDF(
      mdContent,
      `KHBD_${result.lesson_info.lesson_name}`,
      result.lesson_info,
      teacherIdentity,
      cleanDiv.innerHTML,
    );
  };



  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const td = createTurndownService();

      // Strip mindmap SVG containers before Turndown so CSS text doesn't leak into markdown
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = editContent;
      tempDiv.querySelectorAll(".mindmap-inline-container").forEach(el => el.remove());
      const markdown = td.turndown(tempDiv.innerHTML);

      // Keep structured sections when available (for activity-based edit on saved plans).
      // Fallback to single `full` section only when no structure exists.
      const mindmapSection = sections.find(s => s.mindmap_data?.trim());
      const saveSections: LessonPlanSection[] = sections.length > 0
        ? sections.map((s) => {
            if (s.section_type === "full") {
              return {
                ...s,
                content: markdown,
                editable: true,
                mindmap_data: s.mindmap_data ?? mindmapSection?.mindmap_data ?? undefined,
                mindmap_activity_name: s.mindmap_activity_name ?? mindmapSection?.mindmap_activity_name ?? undefined,
              };
            }
            return s;
          })
        : [{
            section_id: "full_content",
            section_type: "full",
            title: "Kế hoạch bài dạy",
            content: markdown,
            editable: true,
            mindmap_data: mindmapSection?.mindmap_data || undefined,
            mindmap_activity_name: mindmapSection?.mindmap_activity_name || undefined,
          }];

      // Save raw HTML as full_content for lossless round-trip (preserves table formatting)
      const htmlContent = tempDiv.innerHTML;

      let successText: string;

      if (currentSavedId) {
        // Update existing saved lesson plan
        await updateSavedLessonPlan(currentSavedId, {
          title: `KHBD - ${result.lesson_info.lesson_name}`,
          sections: saveSections,
          full_content: htmlContent,
        });
        successText = "Đã cập nhật KHBD thành công!";
      } else {
        // Create new saved lesson plan
        const response = await saveLessonPlan({
          title: `KHBD - ${result.lesson_info.lesson_name}`,
          lesson_info: result.lesson_info,
          sections: saveSections,
          full_content: htmlContent,
          activities: activities,
          is_printed: false,
        });
        // Store the ID so subsequent saves update instead of creating new
        setCurrentSavedId(String(response.id));
        successText = response.message;

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
      }

      setSavedContentSnapshot(editContent);
      setHasPendingEdits(false);

      setSaveMessage({ type: "success", text: successText });
      setTimeout(() => setSaveMessage(null), 3000);

      // Sau khi lưu xong, gửi comments đi phân tích AI hoàn toàn ngầm (fire-and-forget)
      const planIdForAnalyze = currentSavedId ? Number(currentSavedId) : null;
      if (planIdForAnalyze && !Number.isNaN(planIdForAnalyze)) {
        void analyzeLessonPlanComments(planIdForAnalyze)
          .then(() => loadLessonComments())
          .catch(() => {
            // Silent: GV có thể lưu lại để retry.
          });
      }
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

    // Detect standalone dotted lines (for student writing)
    const isDottedLine = (el: HTMLElement): boolean => {
      if (el.closest('table')) return false; // don't flatten table internals
      if (el.classList?.contains("worksheet-line")) return true;
      const style = el.getAttribute('style') || '';
      const text = (el.textContent || '').trim();
      // renderDottedLines output: div with border-bottom dotted, no text
      if (el.tagName === 'DIV' && !text && /border-bottom.*dotted/.test(style)) return true;
      // formatWorksheetDotLines output: div with dotted span, no text
      if (el.tagName === 'DIV' && !text && el.querySelector('span[style*="border-bottom"]')) return true;
      return false;
    };

    // Recursively process elements, flattening containers that mix content and dotted lines
    const processElement = (el: HTMLElement) => {
      // Tables / pre blocks are always single content blocks
      if (el.tagName === 'TABLE' || el.tagName === 'PRE') {
        blocks.push({ id: newBlockId(), type: 'content', html: el.outerHTML });
        return;
      }
      if (isDottedLine(el)) {
        blocks.push({ id: newBlockId(), type: 'dotted-line' });
        return;
      }
      // Check if any descendant is a dotted line (isDottedLine already excludes table internals)
      const hasDottedDescendant = Array.from(el.querySelectorAll('div')).some(d => isDottedLine(d as HTMLElement));
      if (!hasDottedDescendant) {
        // Leaf content block - no dotted lines inside
        blocks.push({ id: newBlockId(), type: 'content', html: el.outerHTML });
        return;
      }
      // Container with dotted lines inside → flatten by processing children
      for (const child of Array.from(el.children)) {
        processElement(child as HTMLElement);
      }
    };

    for (const child of Array.from(tempDiv.children)) {
      processElement(child as HTMLElement);
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
          <span className="hidden sm:inline">In PHT</span>
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
        <span className="hidden sm:inline">{isExtractingCode ? "Đang trích xuất..." : "Bài tập code"}</span>
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
        <span className="hidden sm:inline">Sơ đồ tư duy</span>
      </button>

      {/* AI edit selected snippet button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleOpenAIEditPanel}
        disabled={isSaving}
        className="px-2.5 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded flex items-center gap-1 transition-colors border border-indigo-200 dark:border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Chọn hoạt động rồi để AI chỉnh sửa từng phần"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sửa từng phần</span>
      </button>

      {/* Teacher comments button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleToggleCommentSidebar}
        disabled={!canComment || isSaving}
        className="px-2.5 py-1 text-xs bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded flex items-center gap-1 transition-colors border border-sky-200 dark:border-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          !currentSavedId
            ? "Cần lưu KHBD trước khi bình luận"
            : hasPendingEdits
              ? "Bạn đang có thay đổi chưa lưu. Hãy bấm Lưu trước khi bình luận"
              : "Bôi đen đoạn văn rồi bấm để bình luận cạnh đoạn"
        }
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Bình luận GV</span>
        {commentThreads.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-sky-200 dark:bg-sky-800 text-[10px] leading-none font-semibold">
            {commentThreads.length}
          </span>
        )}
      </button>

      {/* Comments list button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShowCommentsList((v) => !v)}
        disabled={commentThreads.length === 0}
        className="px-2.5 py-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded flex items-center gap-1 transition-colors border border-amber-200 dark:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Xem danh sách bình luận GV"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">DS bình luận GV</span>
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
        <span className="hidden sm:inline">{isSaving ? "Đang lưu..." : "Lưu"}</span>
      </button>

      {/* Export PDF button */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleExportPDF}
        className="px-2.5 py-1 text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded flex items-center gap-1 transition-colors border border-orange-200 dark:border-orange-700"
        title="Xuất PDF"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Xuất PDF</span>
      </button>



    </>
  );

  return (
    <div className="lesson-plan-output">
      {/* Save Message - fixed top so it's visible even in fullscreen */}
      {saveMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[110] px-4 py-3 flex items-center gap-3 rounded-lg shadow-lg max-w-md ${
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

      {/* Code Extraction Result - toast notification */}
      {codeExtractionResult && (
        <div ref={codeExtractionRef} className="fixed top-4 right-4 z-[110] w-80 animate-in slide-in-from-right fade-in duration-200">
          <div className={`rounded-xl shadow-xl border overflow-hidden ${
            codeExtractionResult.found
              ? "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
          }`}>
            {/* Header */}
            <div className={`px-4 py-2.5 flex items-center justify-between ${
              codeExtractionResult.found
                ? "bg-emerald-500 text-white"
                : "bg-stone-500 text-white"
            }`}>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span className="text-sm font-medium">Bài tập lập trình</span>
              </div>
              <button
                onClick={() => setCodeExtractionResult(null)}
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
              >
                <span className="text-base leading-none">&times;</span>
              </button>
            </div>
            {/* Body */}
            <div className="px-4 py-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">{codeExtractionResult.message}</p>
              {codeExtractionResult.exercises && codeExtractionResult.exercises.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {codeExtractionResult.exercises.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(ex.url, '_blank')}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-medium bg-stone-50 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-brand/10 hover:text-brand dark:hover:bg-brand/20 dark:hover:text-sky-400 transition-colors border border-stone-100 dark:border-stone-600"
                    >
                      <Code2 className="w-3.5 h-3.5 flex-shrink-0 text-brand" />
                      <span className="flex-1 truncate">{ex.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor with toolbar + A4 content */}
      <RichTextEditor
        value={editContent}
        onChange={(nextHtml) => {
          setEditContent(nextHtml);
          setHasPendingEdits(nextHtml !== savedContentSnapshot);
        }}
        placeholder="Nhập nội dung kế hoạch bài dạy..."
        minHeight="1400px"
        toolbarActions={toolbarActions}
        lessonTitle={result.lesson_info.lesson_name}
        lessonSubtitle={`Lớp ${result.lesson_info.grade} - ${result.lesson_info.book_type}`}
        hideFullscreen={hideFullscreen}
      />

      <style>{`
        .teacher-comment-anchor {
          background: #fff3bf;
          border-bottom: 1px solid #f59e0b;
          border-radius: 2px;
          padding: 0 1px;
        }
        .teacher-comment-anchor.is-active {
          background: #fde68a;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.55);
        }
        .lesson-plan-output [contenteditable="true"] ul {
          list-style: none;
          padding-left: 1.5em;
        }
        .lesson-plan-output [contenteditable="true"] ul li {
          list-style: none;
          position: relative;
          padding-left: 1.1em;
        }
        .lesson-plan-output [contenteditable="true"] ul li::before {
          content: "";
          position: absolute;
          left: 0.05em;
          top: 0.72em;
          width: 0.55em;
          border-top: 1px solid currentColor;
        }
        .lesson-plan-output [contenteditable="true"] ul ul li::before {
          content: "+";
          left: 0;
          top: 0;
          width: auto;
          border-top: none;
          font-weight: 600;
        }
        .lesson-plan-output [contenteditable="true"] ul ul ul li::before {
          content: "•";
          left: 0;
          top: 0;
          width: auto;
          border-top: none;
          font-weight: 400;
        }
        @media print {
          .teacher-comment-anchor,
          .teacher-comment-anchor.is-active {
            background: transparent !important;
            border-bottom: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Inline composer cạnh đoạn bôi đen */}
      {showCommentSidebar && (
        <div
          className="fixed z-[108] w-[340px] sm:w-[360px] rounded-xl border border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur shadow-2xl"
          style={{ top: commentComposerPosition.top, left: commentComposerPosition.left }}
        >
          <div className="px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Bình luận</p>
            </div>
            <button
              onClick={() => setShowCommentSidebar(false)}
              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          <div className="p-3.5 space-y-2.5">
            {(!currentSavedId || hasPendingEdits) && (
              <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded px-2 py-1.5 leading-snug">
                {!currentSavedId
                  ? "Cần bấm nút Lưu trên thanh công cụ để lưu KHBD trước, sau đó mới bình luận được."
                  : "Bạn đang có thay đổi chưa lưu. Hãy bấm nút Lưu trước khi bình luận."}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300">Đoạn đang chọn</span>
            </div>

            <blockquote className="text-xs text-stone-700 dark:text-stone-200 border-l-2 border-sky-400 pl-2 break-words max-h-20 overflow-y-auto">
              {selectedTextForComment || "Chưa có vùng bôi đen"}
            </blockquote>

            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Nhập nhận xét..."
              className="w-full min-h-[86px] rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 px-2.5 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleCreateComment}
                disabled={isSavingComment || !canComment}
                className="ml-auto px-3 py-1.5 text-xs font-medium rounded bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                {isSavingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                Thêm bình luận
              </button>
            </div>

            {commentError && (
              <p className="text-xs text-red-600 dark:text-red-400">{commentError}</p>
            )}
          </div>
        </div>
      )}

      {showAIEditPanel && (
        <AIEditPanel
          selectedText={selectedTextForAIEdit}
          fullLessonPlan={fullLessonForAIEdit}
          onApply={handleApplyAIEdit}
          onClose={() => {
            setShowAIEditPanel(false);
            setSelectedActivityTarget(null);
          }}
        />
      )}

      {showActivityEditPicker && (
        <div className="fixed inset-0 z-[109] flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-2xl rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Chọn hoạt động cần chỉnh sửa</p>
              </div>
              <button
                onClick={() => setShowActivityEditPicker(false)}
                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2">
              {editableActivityTargets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => handleSelectActivityForAIEdit(target)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{target.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Danh sách các đoạn đã ghi chú — drawer bên phải */}
      {showCommentsList && (
        <>
          <div
            className="fixed inset-0 z-[107] bg-black/20 dark:bg-black/40"
            onClick={() => setShowCommentsList(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-[360px] z-[108] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-700 shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Danh sách bình luận GV ({commentThreads.length})
                </p>
              </div>
              <button
                onClick={() => setShowCommentsList(false)}
                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {commentThreads.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  Chưa có bình luận nào
                </div>
              ) : (
                commentThreads.map((thread, idx) => {
                  const root = thread.root;
                  return (
                    <button
                      key={root.id}
                      onClick={() => {
                        setActiveCommentId(root.id);
                        scrollToCommentAnchor(root.id);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        root.is_resolved
                          ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 hover:bg-amber-100/60 dark:hover:bg-amber-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                          #{idx + 1} · {new Date(root.created_at).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {thread.replies.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                              {thread.replies.length} trả lời
                            </span>
                          )}
                          {root.is_resolved && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                              Đã xử lý
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] italic text-stone-600 dark:text-stone-300 border-l-2 border-sky-400 pl-2 line-clamp-2 mb-1.5">
                        "{root.selected_text}"
                      </p>

                      <p className="text-xs text-stone-800 dark:text-stone-100 line-clamp-2">
                        {root.comment_text}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Thread popup cạnh đoạn highlight */}
      {activeThreadPopup && activeThread && (
        <div
          className="fixed z-[108] w-[380px] rounded-xl border border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur shadow-2xl"
          style={{ top: activeThreadPopup.top, left: activeThreadPopup.left }}
        >
          <div className="px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Luồng #{activeThread.root.id}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => void handleResolveThread(activeThread.root, !activeThread.root.is_resolved)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${activeThread.root.is_resolved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'}`}
              >
                {activeThread.root.is_resolved ? "Mở lại" : "Giải quyết"}
              </button>
              <button
                onClick={() => setActiveThreadPopup(null)}
                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          </div>

          <div className="p-3.5 space-y-2.5 max-h-[62vh] overflow-y-auto">
            <blockquote className="text-[11px] text-stone-600 dark:text-stone-300 border-l-2 border-sky-400 pl-2 break-words">
              {activeThread.root.selected_text}
            </blockquote>

            <div className="rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Bình luận gốc</span>
                <button
                  onClick={() => void handleDeleteComment(activeThread.root.id)}
                  className="p-0.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Xóa luồng bình luận"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-stone-800 dark:text-stone-100">{activeThread.root.comment_text}</p>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  {new Date(activeThread.root.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {activeThread.replies.map((reply) => (
              <div key={reply.id} className="rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                    <CornerDownRight className="w-3 h-3" /> Trả lời #{reply.id}
                  </div>
                  <button
                    onClick={() => void handleDeleteComment(reply.id)}
                    className="p-0.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Xóa trả lời"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-stone-700 dark:text-stone-100">{reply.comment_text}</p>
              </div>
            ))}

            <div className="pt-1">
              {replyingThreadId === activeThread.root.id ? (
                <div className="space-y-1.5">
                  <textarea
                    value={replyDraftByThread[activeThread.root.id] || ""}
                    onChange={(e) => setReplyDraftByThread((prev) => ({ ...prev, [activeThread.root.id]: e.target.value }))}
                    placeholder="Nhập trả lời..."
                    className="w-full min-h-[64px] rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 px-2 py-1.5 text-[11px] text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setReplyingThreadId(null)}
                      className="px-2 py-1 text-[11px] rounded border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => void handleCreateReply(activeThread.root)}
                      disabled={isSavingComment}
                      className="px-2.5 py-1 text-[11px] rounded bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors"
                    >
                      Trả lời
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingThreadId(activeThread.root.id)}
                  className="text-[11px] px-2 py-1 rounded border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Trả lời
                </button>
              )}
            </div>

            {commentError && (
              <p className="text-xs text-red-600 dark:text-red-400">{commentError}</p>
            )}
          </div>
        </div>
      )}

      {/* Mindmap Modal */}
      {showMindmapModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-3">
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
                  title="Tải về PNG"
                >
                  <Download className="w-4 h-4" />
                  Tải sơ đồ tư duy
                </button>
                <button
                  onClick={handleInsertMindmap}
                  disabled={!mindmapEditorData.trim()}
                  className="px-3 py-1.5 text-sm font-medium bg-brand hover:bg-brand-dark text-white rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-3">
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
                  <div key={block.id} className="group/block relative">
                    {block.type === 'dotted-line' ? (
                      <div className="relative">
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
                          className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none opacity-0 group-hover/block:opacity-100 hover:bg-red-600 transition-opacity shadow-sm"
                          title="Xóa dòng"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(block.html || '') }} />
                        <div className="flex justify-center opacity-0 group-hover/block:opacity-100 transition-opacity -mt-1 mb-1">
                          <button
                            onClick={() => handleAddDottedLine(activePHTIndex, blockIdx)}
                            className="px-2.5 py-0.5 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-full transition-colors"
                          >
                            + Thêm dòng
                          </button>
                        </div>
                      </div>
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
