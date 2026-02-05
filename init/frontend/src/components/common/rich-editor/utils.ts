import { FONT_SIZES } from "./constants";

export const insertTableHTML = (editorEl: HTMLDivElement, rows: number, cols: number) => {
  const colWidth = (100 / cols).toFixed(2);
  let html = '<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin:12px 0;table-layout:fixed;">';
  html += "<thead><tr>";
  for (let c = 0; c < cols; c++) {
    html += `<th style="border:1px solid #ccc;padding:8px 12px;background:#f0f4ff;font-weight:bold;text-align:left;width:${colWidth}%;">&nbsp;</th>`;
  }
  html += "</tr></thead><tbody>";
  for (let r = 0; r < rows - 1; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      html += `<td style="border:1px solid #ccc;padding:8px 12px;width:${colWidth}%;">&nbsp;</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table><p><br></p>";
  document.execCommand("insertHTML", false, html);
  editorEl.focus();
};

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const isValidUrl = (str: string): boolean => {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export const insertLink = () => {
  const raw = prompt("Nhập URL (http:// hoặc https://):");
  if (!raw) return;

  const url = raw.trim();
  if (!isValidUrl(url)) {
    alert("URL không hợp lệ. Chỉ chấp nhận http:// hoặc https://");
    return;
  }

  const selection = window.getSelection();
  const text = selection && selection.toString() ? selection.toString() : url;
  const safeUrl = escapeHtml(url);
  const safeText = escapeHtml(text);
  document.execCommand("insertHTML", false, `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${safeText}</a>`);
};

export const applyFontSize = (ptSize: string) => {
  document.execCommand("fontSize", false, "7");
  const fontElements = document.querySelectorAll('font[size="7"]');
  fontElements.forEach((el) => {
    const span = document.createElement("span");
    span.style.fontSize = ptSize;
    span.innerHTML = el.innerHTML;
    el.parentNode?.replaceChild(span, el);
  });
  const spanElements = document.querySelectorAll('span[style*="-webkit-xxx-large"], span[style*="xxx-large"]');
  spanElements.forEach((el) => {
    (el as HTMLElement).style.fontSize = ptSize;
  });
};

export const detectCurrentFontSize = (): string => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";

  let node: Node | null = selection.anchorNode;
  let checkNode: Node | null = node;
  while (checkNode) {
    if (checkNode.nodeType === Node.ELEMENT_NODE) {
      const el = checkNode as HTMLElement;
      const fs = el.style?.fontSize;
      if (fs) {
        for (const size of FONT_SIZES) {
          if (fs === size.pt) return size.pt;
        }
      }
      if (el.tagName === "FONT" && el.getAttribute("size")) {
        break;
      }
    }
    checkNode = checkNode.parentNode;
  }

  let el: HTMLElement | null = null;
  if (node?.nodeType === Node.TEXT_NODE) {
    el = node.parentElement;
  } else if (node?.nodeType === Node.ELEMENT_NODE) {
    el = node as HTMLElement;
  }

  if (el) {
    try {
      const computed = window.getComputedStyle(el);
      const pxSize = parseFloat(computed.fontSize);
      if (!isNaN(pxSize)) {
        const ptSize = Math.round((pxSize * 72) / 96);
        for (const size of FONT_SIZES) {
          const sizePt = parseInt(size.label, 10);
          if (Math.abs(ptSize - sizePt) <= 0.5) return size.pt;
        }
      }
    } catch {
      // ignore
    }
  }

  return "";
};

export const saveSelection = (): Range | null => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    return sel.getRangeAt(0).cloneRange();
  }
  return null;
};

export const restoreSelection = (range: Range | null) => {
  if (range) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
};

export const findClosestCell = (node: Node | null): HTMLTableCellElement | null => {
  let current: Node | null = node;
  while (current) {
    if (current instanceof HTMLElement && (current.tagName === "TD" || current.tagName === "TH")) {
      return current as HTMLTableCellElement;
    }
    current = current.parentNode;
  }
  return null;
};

export const findClosestTable = (node: Node | null): HTMLTableElement | null => {
  let current: Node | null = node;
  while (current) {
    if (current instanceof HTMLElement && current.tagName === "TABLE") {
      return current as HTMLTableElement;
    }
    current = current.parentNode;
  }
  return null;
};

export const getCellPosition = (cell: HTMLTableCellElement): { rowIndex: number; colIndex: number } => {
  const row = cell.parentElement as HTMLTableRowElement;
  const colIndex = Array.from(row.cells).indexOf(cell);
  const table = findClosestTable(cell);
  if (!table) return { rowIndex: 0, colIndex };
  const allRows = Array.from(table.rows);
  const rowIndex = allRows.indexOf(row);
  return { rowIndex, colIndex };
};
