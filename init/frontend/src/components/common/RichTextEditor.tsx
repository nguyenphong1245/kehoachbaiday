import React, { useRef, useCallback, useEffect, useState } from "react";

import { ArrowLeft, ListTree, ChevronLeft, ChevronRight, AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2, ChevronDown } from "lucide-react";
import {
  TOOLBAR,
  FONT_SIZES,
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
  LIST_STYLES,
  type OutlineHeading,
  type RichTextEditorProps,
} from "./rich-editor/constants";
import {
  insertTableHTML,
  insertLink,
  isValidUrl,
  applyFontSize,
  detectCurrentFontSize,
  saveSelection,
  restoreSelection,
  findClosestCell,
  findClosestTable,
  getCellPosition,
} from "./rich-editor/utils";
import { TableContextMenu, TableGridPicker, ColorPickerPopup, ListStylePicker, TableInsertIndicators, TableCornerMenu, type ResizeHandleType, type TableAlignType } from "./rich-editor/SubComponents";
import { sanitizeHTML } from "@/utils/sanitize";


export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  minHeight = "500px",
  toolbarActions,
  lessonTitle,
  lessonSubtitle,
  onBack,
  hideFullscreen,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLSelectElement>(null);
  const isInternalUpdate = useRef(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);

  // Custom undo/redo stack
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const lastSavedContent = useRef<string>("");
  const isUndoRedoAction = useRef(false);
  const [tableContextMenu, setTableContextMenu] = useState<{
    x: number;
    y: number;
    cell: HTMLTableCellElement;
  } | null>(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showListStylePicker, setShowListStylePicker] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [outlineHeadings, setOutlineHeadings] = useState<OutlineHeading[]>([]);
  const [showOutline, setShowOutline] = useState(() => window.innerWidth >= 768);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(88);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [hoveredTable, setHoveredTable] = useState<HTMLTableElement | null>(null);
  const [isEditingInCell, setIsEditingInCell] = useState(false);
  const [focusedCell, setFocusedCell] = useState<HTMLTableCellElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track active formatting state for toolbar button highlighting
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("transparent");

  // Lock body scroll & Escape key when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsFullscreen(false);
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullscreen]);

  // Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Image resize state
  const imageResizeState = useRef<{
    isResizing: boolean;
    image: HTMLImageElement;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
    corner: 'nw' | 'ne' | 'sw' | 'se';
  } | null>(null);

  // Column/table resize state
  const resizeState = useRef<{
    isResizing: boolean;
    mode: 'column' | 'table-right' | 'table-left' | 'corner' | 'edge-h' | 'edge-v';
    handle?: ResizeHandleType;
    table: HTMLTableElement;
    colIndex: number;
    startX: number;
    startY: number;
    startWidthLeft: number;
    startWidthRight: number;
    startTableWidth: number;
    startTableHeight: number;
    startColWidths: number[];
  } | null>(null);

  // Set initial HTML content
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = sanitizeHTML(value || "");
        // Initialize undo stack with initial content
        if (!lastSavedContent.current) {
          lastSavedContent.current = editorRef.current.innerHTML;
        }
        // Post-process: ensure all tables have table-layout:fixed and cell widths
        const tables = editorRef.current.querySelectorAll('table');
        tables.forEach((table) => {
          table.style.tableLayout = 'fixed';
          const firstRow = table.rows[0];
          if (firstRow && firstRow.cells.length > 0) {
            const hasWidth = firstRow.cells[0].style.width;
            if (!hasWidth) {
              const colWidth = (100 / firstRow.cells.length).toFixed(2) + '%';
              for (let r = 0; r < table.rows.length; r++) {
                for (let c = 0; c < table.rows[r].cells.length; c++) {
                  table.rows[r].cells[c].style.width = colWidth;
                }
              }
            }
          }
        });
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  // Detect font size and active formatting on selection change
  useEffect(() => {
    const updateToolbarState = () => {
      // Update font size display
      if (fontSizeRef.current) {
        const detected = detectCurrentFontSize();
        fontSizeRef.current.value = detected;
      }

      // Update active formatting states
      const commands = ["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight"];
      const states: Record<string, boolean> = {};
      for (const cmd of commands) {
        try { states[cmd] = document.queryCommandState(cmd); } catch { states[cmd] = false; }
      }

      // Manual DOM-walk fallback for list detection (queryCommandState can be unreliable)
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeName === "UL") { states["insertUnorderedList"] = true; break; }
          if (node.nodeName === "OL") { states["insertOrderedList"] = true; break; }
          node = node.parentNode;
        }
      }

      setActiveFormats(states);

      // Detect current text color
      try {
        const fColor = document.queryCommandValue("foreColor");
        if (fColor) setCurrentTextColor(fColor);
      } catch { /* ignore */ }

      // Detect current highlight/background color
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        let bgFound = "transparent";
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const bg = (node as HTMLElement).style?.backgroundColor;
            if (bg && bg !== "transparent" && bg !== "") { bgFound = bg; break; }
          }
          node = node.parentNode;
        }
        setCurrentHighlightColor(bgFound);
      }
    };

    document.addEventListener("selectionchange", updateToolbarState);
    return () => document.removeEventListener("selectionchange", updateToolbarState);
  }, []);

  // Save content to undo stack
  const saveToUndoStack = useCallback(() => {
    if (!editorRef.current || isUndoRedoAction.current) return;
    const currentContent = editorRef.current.innerHTML;
    if (currentContent !== lastSavedContent.current) {
      // Save the previous content to undo stack
      if (lastSavedContent.current) {
        undoStack.current.push(lastSavedContent.current);
        // Limit stack size to prevent memory issues
        if (undoStack.current.length > 50) {
          undoStack.current.shift();
        }
      }
      lastSavedContent.current = currentContent;
      // Clear redo stack when new changes are made
      redoStack.current = [];
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      saveToUndoStack();
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, saveToUndoStack]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0 || !editorRef.current) return;

    // Save current content to redo stack
    redoStack.current.push(editorRef.current.innerHTML);

    // Pop from undo stack
    const previousContent = undoStack.current.pop()!;
    isUndoRedoAction.current = true;
    editorRef.current.innerHTML = previousContent;
    lastSavedContent.current = previousContent;
    isInternalUpdate.current = true;
    onChange(previousContent);
    isUndoRedoAction.current = false;

    // Place cursor at the end
    editorRef.current.focus();
  }, [onChange]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0 || !editorRef.current) return;

    // Save current content to undo stack
    undoStack.current.push(editorRef.current.innerHTML);

    // Pop from redo stack
    const nextContent = redoStack.current.pop()!;
    isUndoRedoAction.current = true;
    editorRef.current.innerHTML = nextContent;
    lastSavedContent.current = nextContent;
    isInternalUpdate.current = true;
    onChange(nextContent);
    isUndoRedoAction.current = false;

    // Place cursor at the end
    editorRef.current.focus();
  }, [onChange]);

  // Đo chiều cao header thực tế để set top cho sticky sidebar
  useEffect(() => {
    if (!headerRef.current) return;
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 88;
      setHeaderHeight(h);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Extract headings from editor for outline navigation
  const updateOutline = useCallback(() => {
    if (!editorRef.current) return;
    const headings: OutlineHeading[] = [];
    const els = editorRef.current.querySelectorAll('h1, h2, h3, h4');
    els.forEach((el) => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      const level = parseInt(el.tagName.substring(1), 10);
      headings.push({ text, level, element: el as HTMLElement });
    });
    setOutlineHeadings(headings);
  }, []);

  // Update outline on mount and content change
  useEffect(() => {
    const timer = setTimeout(updateOutline, 300);
    return () => clearTimeout(timer);
  }, [value, updateOutline]);

  // Handle link modal confirm
  const handleLinkConfirm = useCallback(() => {
    const url = linkUrl.trim();
    if (!url) { setLinkError("Vui lòng nhập URL"); return; }
    if (!isValidUrl(url)) { setLinkError("URL không hợp lệ (http:// hoặc https://)"); return; }
    restoreSelection(savedSelectionRef.current);
    insertLink(url, linkText);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    setLinkError("");
    editorRef.current?.focus();
  }, [linkUrl, linkText]);

  // Handle image file selection
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      restoreSelection(savedSelectionRef.current);
      document.execCommand('insertHTML', false,
        `<img src="${reader.result}" style="max-width:100%;height:auto;margin:8px 0;display:block;" />`
      );
      savedSelectionRef.current = null;
      handleInput();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [handleInput]);

  // Apply text color
  const applyTextColor = useCallback((color: string) => {
    editorRef.current?.focus();
    restoreSelection(savedSelectionRef.current);
    document.execCommand('foreColor', false, color);
    savedSelectionRef.current = null;
    handleInput();
  }, [handleInput]);

  // Apply highlight/background color
  const applyHighlight = useCallback((color: string) => {
    editorRef.current?.focus();
    restoreSelection(savedSelectionRef.current);
    if (color === 'transparent') {
      document.execCommand('removeFormat', false);
    } else {
      document.execCommand('hiliteColor', false, color);
    }
    savedSelectionRef.current = null;
    handleInput();
  }, [handleInput]);

  // Apply list style type
  const applyListStyle = useCallback((styleType: string) => {
    editorRef.current?.focus();
    restoreSelection(savedSelectionRef.current);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Check if cursor is already inside a list
    let node: Node | null = sel.anchorNode;
    let existingList: HTMLOListElement | HTMLUListElement | null = null;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'OL' || node.nodeName === 'UL') {
        existingList = node as HTMLOListElement | HTMLUListElement;
        break;
      }
      node = node.parentNode;
    }

    const isOrderedStyle = ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'].includes(styleType);

    if (existingList) {
      // Change existing list type and style
      if (isOrderedStyle && existingList.nodeName === 'UL') {
        // Convert UL to OL
        const ol = document.createElement('ol');
        ol.style.listStyleType = styleType;
        ol.innerHTML = existingList.innerHTML;
        existingList.parentNode?.replaceChild(ol, existingList);
      } else if (!isOrderedStyle && existingList.nodeName === 'OL') {
        // Convert OL to UL
        const ul = document.createElement('ul');
        // Don't set inline style for disc — let CSS handle "- " / "+ "
        ul.innerHTML = existingList.innerHTML;
        existingList.parentNode?.replaceChild(ul, existingList);
      } else {
        // Same tag type, just change style
        if (!isOrderedStyle && existingList.nodeName === 'UL') {
          // Remove inline style so CSS "- " / "+ " applies
          (existingList as HTMLElement).style.listStyleType = '';
        } else {
          (existingList as HTMLElement).style.listStyleType = styleType;
        }
      }
    } else {
      // Create new list
      if (isOrderedStyle) {
        document.execCommand('insertOrderedList', false);
      } else {
        document.execCommand('insertUnorderedList', false);
      }
      // Find the newly created list and apply style
      const newSel = window.getSelection();
      if (newSel && newSel.rangeCount > 0) {
        let n: Node | null = newSel.anchorNode;
        while (n && n !== editorRef.current) {
          if (n.nodeName === 'OL' || n.nodeName === 'UL') {
            if (isOrderedStyle) {
              (n as HTMLElement).style.listStyleType = styleType;
            }
            break;
          }
          n = n.parentNode;
        }
      }
    }

    savedSelectionRef.current = null;
    handleInput();
  }, [handleInput]);

  // --- Handle click to select/deselect table and images ---
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ctrl+Click on a link opens it in a new tab
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (anchor && editorRef.current?.contains(anchor) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      const href = anchor.getAttribute('href');
      if (href) {
        // Use a real anchor element click to avoid popup blockers
        const tempLink = document.createElement('a');
        tempLink.href = href;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
      return;
    }
    const clickedTable = target.closest('table') as HTMLTableElement | null;
    const clickedCell = target.closest('td, th') as HTMLTableCellElement | null;
    const clickedImage = target.tagName === 'IMG' ? target as HTMLImageElement : null;

    // Handle image selection
    if (clickedImage && editorRef.current?.contains(clickedImage)) {
      e.preventDefault();
      setSelectedImage(clickedImage);
      setSelectedTable(null);
      setIsEditingInCell(false);
      setFocusedCell(null);
      return;
    }

    // If clicked elsewhere, deselect image
    setSelectedImage(null);

    if (clickedTable && editorRef.current?.contains(clickedTable)) {
      // If clicked inside a cell, hide overlay but keep table reference for alignment
      if (clickedCell) {
        setSelectedTable(clickedTable);
        setIsEditingInCell(true);
        setFocusedCell(clickedCell);
      } else {
        // Clicked on table border - show overlay
        setSelectedTable(clickedTable);
        setIsEditingInCell(false);
      }
    } else {
      setSelectedTable(null);
      setIsEditingInCell(false);
      setFocusedCell(null);
    }
  }, []);

  // Deselect table and image when clicking outside editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't deselect when clicking inside the editor or the paper wrapper (resize handles etc.)
      if (editorRef.current?.contains(target) || wrapperRef.current?.contains(target)) {
        return;
      }
      setSelectedTable(null);
      setIsEditingInCell(false);
      setFocusedCell(null);
      setSelectedImage(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Align table (left, center, right) ---
  const handleAlignTable = useCallback((align: TableAlignType) => {
    if (!selectedTable) return;

    const table = selectedTable;

    // If table is 100% width, reduce it to 80% to allow alignment
    if (!table.style.width || table.style.width === '100%') {
      table.style.width = '80%';
    }

    // Reset margins first
    table.style.marginLeft = '';
    table.style.marginRight = '';

    switch (align) {
      case 'left':
        table.style.marginLeft = '0';
        table.style.marginRight = 'auto';
        break;
      case 'center':
        table.style.marginLeft = 'auto';
        table.style.marginRight = 'auto';
        break;
      case 'right':
        table.style.marginLeft = 'auto';
        table.style.marginRight = '0';
        break;
    }

    handleInput();
  }, [selectedTable, handleInput]);

  // --- Column & table edge resize helpers ---
  type BorderHit = {
    table: HTMLTableElement;
    colIndex: number;
    mode: 'column' | 'table-right' | 'table-left';
  };

  const detectBorder = useCallback((e: React.MouseEvent | MouseEvent): BorderHit | null => {
    const target = e.target as HTMLElement;
    const threshold = 6;

    // First try: cursor is on a cell
    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    if (cell) {
      const table = cell.closest('table') as HTMLTableElement | null;
      if (!table) return null;

      const cellRect = cell.getBoundingClientRect();
      const row = cell.parentElement as HTMLTableRowElement;
      const colIdx = Array.from(row.cells).indexOf(cell);
      const totalCols = row.cells.length;

      // Right edge of cell
      if (Math.abs(e.clientX - cellRect.right) <= threshold) {
        if (colIdx < totalCols - 1) {
          // Internal border between two columns
          return { table, colIndex: colIdx, mode: 'column' };
        } else {
          // Right edge of last column = table right edge
          return { table, colIndex: colIdx, mode: 'table-right' };
        }
      }

      // Left edge of cell
      if (Math.abs(e.clientX - cellRect.left) <= threshold) {
        if (colIdx > 0) {
          // Internal border
          return { table, colIndex: colIdx - 1, mode: 'column' };
        } else {
          // Left edge of first column = table left edge
          return { table, colIndex: 0, mode: 'table-left' };
        }
      }
      return null;
    }

    // Second try: cursor may be just outside the table border
    // Check all tables in the editor
    const editor = editorRef.current;
    if (!editor) return null;
    const tables = editor.querySelectorAll('table');
    for (let t = 0; t < tables.length; t++) {
      const table = tables[t] as HTMLTableElement;
      const tableRect = table.getBoundingClientRect();

      // Must be vertically within the table
      if (e.clientY < tableRect.top || e.clientY > tableRect.bottom) continue;

      // Right edge of entire table
      if (Math.abs(e.clientX - tableRect.right) <= threshold) {
        const lastColIdx = (table.rows[0]?.cells.length || 1) - 1;
        return { table, colIndex: lastColIdx, mode: 'table-right' };
      }

      // Left edge of entire table
      if (Math.abs(e.clientX - tableRect.left) <= threshold) {
        return { table, colIndex: 0, mode: 'table-left' };
      }
    }

    return null;
  }, []);

  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    if (resizeState.current?.isResizing) return;
    const editor = editorRef.current;
    if (!editor) return;

    const hit = detectBorder(e);
    editor.style.cursor = hit ? 'col-resize' : '';

    // Track hovered table for insert indicators
    const target = e.target as HTMLElement;
    const table = target.closest('table') as HTMLTableElement | null;

    if (table && editor.contains(table)) {
      setHoveredTable(table);
    } else {
      // Check if mouse is in the extended area around any table (for corner menu)
      const tables = editor.querySelectorAll('table');
      let foundTable: HTMLTableElement | null = null;

      for (let i = 0; i < tables.length; i++) {
        const t = tables[i] as HTMLTableElement;
        const rect = t.getBoundingClientRect();
        // Extend detection area by 40px on top and left for corner button
        const extendedLeft = rect.left - 40;
        const extendedTop = rect.top - 50;

        if (
          e.clientX >= extendedLeft &&
          e.clientX <= rect.right + 20 &&
          e.clientY >= extendedTop &&
          e.clientY <= rect.bottom + 20
        ) {
          foundTable = t;
          break;
        }
      }

      setHoveredTable(foundTable);
    }
  }, [detectBorder]);

  const handleEditorMouseDown = useCallback((e: React.MouseEvent) => {
    // Ctrl+Click on a link opens it in a new tab (handle in mousedown for reliability)
    const target = e.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (anchor && editorRef.current?.contains(anchor) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      const href = anchor.getAttribute('href');
      if (href) {
        const tempLink = document.createElement('a');
        tempLink.href = href;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
      return;
    }

    const hit = detectBorder(e);
    if (!hit) return;

    // Prevent text selection and default contentEditable behavior
    e.preventDefault();
    e.stopPropagation();

    const { table, colIndex, mode } = hit;
    const startTableWidth = table.getBoundingClientRect().width;
    const firstRow = table.rows[0];
    if (!firstRow) return;

    let startWidthLeft = 0;
    let startWidthRight = 0;

    if (mode === 'column') {
      const leftCell = firstRow.cells[colIndex];
      const rightCell = firstRow.cells[colIndex + 1];
      if (!leftCell || !rightCell) return;
      startWidthLeft = leftCell.getBoundingClientRect().width;
      startWidthRight = rightCell.getBoundingClientRect().width;
    } else if (mode === 'table-right') {
      startWidthLeft = firstRow.cells[colIndex]?.getBoundingClientRect().width || 0;
    } else if (mode === 'table-left') {
      startWidthLeft = firstRow.cells[0]?.getBoundingClientRect().width || 0;
    }

    // Collect all column widths
    const startColWidths: number[] = [];
    for (let i = 0; i < firstRow.cells.length; i++) {
      startColWidths.push(firstRow.cells[i].getBoundingClientRect().width);
    }

    resizeState.current = {
      isResizing: true,
      mode,
      table,
      colIndex,
      startX: e.clientX,
      startY: e.clientY,
      startWidthLeft,
      startWidthRight,
      startTableWidth,
      startTableHeight: table.getBoundingClientRect().height,
      startColWidths,
    };

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const state = resizeState.current;
      if (!state?.isResizing) return;

      const delta = moveEvent.clientX - state.startX;
      const minColPx = 30;

      if (state.mode === 'column') {
        // Internal border: redistribute between two adjacent columns
        let newLeft = state.startWidthLeft + delta;
        let newRight = state.startWidthRight - delta;
        const combined = state.startWidthLeft + state.startWidthRight;

        if (newLeft < minColPx) { newLeft = minColPx; newRight = combined - minColPx; }
        if (newRight < minColPx) { newRight = minColPx; newLeft = combined - minColPx; }

        const leftPct = ((newLeft / state.startTableWidth) * 100).toFixed(2) + '%';
        const rightPct = ((newRight / state.startTableWidth) * 100).toFixed(2) + '%';

        for (let r = 0; r < state.table.rows.length; r++) {
          const row = state.table.rows[r];
          if (row.cells[state.colIndex]) row.cells[state.colIndex].style.width = leftPct;
          if (row.cells[state.colIndex + 1]) row.cells[state.colIndex + 1].style.width = rightPct;
        }
      } else if (state.mode === 'table-right') {
        // Dragging right edge: resize last column + change table width
        const newTableWidth = Math.max(state.startTableWidth + delta, state.table.rows[0].cells.length * minColPx);
        const lastColNewWidth = state.startWidthLeft + delta;

        if (lastColNewWidth < minColPx) return;

        state.table.style.width = newTableWidth + 'px';

        // Recalculate all column widths as percentage of new table width
        const lastIdx = state.colIndex;
        for (let r = 0; r < state.table.rows.length; r++) {
          const row = state.table.rows[r];
          if (row.cells[lastIdx]) {
            row.cells[lastIdx].style.width = ((lastColNewWidth / newTableWidth) * 100).toFixed(2) + '%';
          }
        }
      } else if (state.mode === 'table-left') {
        // Dragging left edge: resize first column + change table width
        const newTableWidth = Math.max(state.startTableWidth - delta, state.table.rows[0].cells.length * minColPx);
        const firstColNewWidth = state.startWidthLeft - delta;

        if (firstColNewWidth < minColPx) return;

        state.table.style.width = newTableWidth + 'px';

        // Recalculate first column width as percentage of new table width
        for (let r = 0; r < state.table.rows.length; r++) {
          const row = state.table.rows[r];
          if (row.cells[0]) {
            row.cells[0].style.width = ((firstColNewWidth / newTableWidth) * 100).toFixed(2) + '%';
          }
        }
      }
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (resizeState.current?.isResizing) {
        // After table-right/table-left, convert table width back to percentage
        const st = resizeState.current;
        if (st.mode === 'table-right' || st.mode === 'table-left') {
          const container = st.table.parentElement;
          if (container) {
            const containerWidth = container.getBoundingClientRect().width;
            const tablePxWidth = st.table.getBoundingClientRect().width;
            const tablePct = ((tablePxWidth / containerWidth) * 100).toFixed(2);
            st.table.style.width = tablePct + '%';
          }
        }
        resizeState.current = null;
        // Trigger onChange so the new widths are persisted
        handleInput();
      }
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [detectBorder, handleInput]);

  const execCommand = useCallback(
    (command: string, arg?: string) => {
      editorRef.current?.focus();

      // Handle custom undo/redo
      if (command === "undo") {
        handleUndo();
        return;
      }
      if (command === "redo") {
        handleRedo();
        return;
      }

      if (command === "__link") {
        savedSelectionRef.current = saveSelection();
        const sel = window.getSelection();
        setLinkText(sel && sel.toString() ? sel.toString() : "");
        setLinkUrl("");
        setLinkError("");
        setShowLinkModal(true);
        return;
      } else if (command === "__table") {
        setShowTablePicker(prev => !prev);
        return;
      } else if (command === "__textColor") {
        savedSelectionRef.current = saveSelection();
        setShowTextColorPicker(prev => !prev);
        setShowHighlightPicker(false);
        return;
      } else if (command === "__highlight") {
        savedSelectionRef.current = saveSelection();
        setShowHighlightPicker(prev => !prev);
        setShowTextColorPicker(false);
        return;
      } else if (command === "__image") {
        savedSelectionRef.current = saveSelection();
        imageInputRef.current?.click();
        return;
      } else if (command === "formatBlock") {
        const current = document.queryCommandValue("formatBlock");
        if (current.toLowerCase() === arg?.toLowerCase()) {
          document.execCommand("formatBlock", false, "p");
        } else {
          document.execCommand("formatBlock", false, arg);
        }
      } else if ((command === "justifyLeft" || command === "justifyCenter" || command === "justifyRight") && selectedTable) {
        // Check if cursor/selection is inside a cell - if so, align content in cell (Word-like behavior)
        const selection = window.getSelection();
        const anchorNode = selection?.anchorNode;

        // Check if cursor is inside a cell of this table
        let isInsideCell = false;
        if (anchorNode) {
          let node: Node | null = anchorNode;
          while (node && node !== selectedTable) {
            if (node.nodeName === 'TD' || node.nodeName === 'TH') {
              isInsideCell = true;
              break;
            }
            node = node.parentNode;
          }
        }

        if (isInsideCell) {
          // Cursor is inside a cell - align the content using execCommand
          document.execCommand(command, false);
        } else {
          // Cursor is not inside any cell - align the whole table
          const alignMap: Record<string, 'left' | 'center' | 'right'> = {
            justifyLeft: 'left',
            justifyCenter: 'center',
            justifyRight: 'right',
          };
          handleAlignTable(alignMap[command]);
        }
        handleInput();
        return;
      } else if (command === "outdent") {
        // Prevent outdent from destroying top-level list items
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          let node: Node | null = sel.anchorNode;
          let li: HTMLLIElement | null = null;
          let listParent: HTMLElement | null = null;
          while (node && node !== editorRef.current) {
            if (!li && node instanceof HTMLLIElement) li = node;
            if (node.nodeName === "UL" || node.nodeName === "OL") {
              listParent = node as HTMLElement;
              break;
            }
            node = node.parentNode;
          }
          // Only allow outdent if the list is nested (parent of UL/OL is another LI)
          if (li && listParent) {
            const parentOfList = listParent.parentNode;
            if (parentOfList && parentOfList instanceof HTMLLIElement) {
              // Nested list → safe to outdent
              document.execCommand("outdent", false);
            }
            // Top-level list → don't outdent (would destroy the list)
          } else {
            document.execCommand("outdent", false);
          }
        }
      } else {
        document.execCommand(command, false, arg);
      }
      handleInput();
    },
    [handleInput, selectedTable, handleAlignTable, handleUndo, handleRedo]
  );

  const handleTableSelect = useCallback((rows: number, cols: number) => {
    if (editorRef.current) {
      editorRef.current.focus();
      // Restore the saved selection so the table inserts at cursor position
      restoreSelection(savedSelectionRef.current);
      insertTableHTML(editorRef.current, rows, cols);
      savedSelectionRef.current = null;
      handleInput();
    }
  }, [handleInput]);

  // Handle table context menu actions
  const handleTableAction = useCallback((action: string, cell: HTMLTableCellElement) => {
    const table = findClosestTable(cell);
    if (!table) return;
    const { rowIndex, colIndex } = getCellPosition(cell);
    const totalCols = table.rows[0]?.cells.length || 0;

    const cellStyle = 'border:1px solid #ccc;padding:8px 12px;';

    switch (action) {
      case 'addRowAbove':
      case 'addRowBelow': {
        const newRow = table.insertRow(action === 'addRowAbove' ? rowIndex : rowIndex + 1);
        const refRow = table.rows[0];
        for (let c = 0; c < totalCols; c++) {
          const newCell = newRow.insertCell(c);
          const existingWidth = refRow?.cells[c]?.style.width || '';
          newCell.setAttribute('style', cellStyle + (existingWidth ? `width:${existingWidth};` : ''));
          newCell.innerHTML = '&nbsp;';
        }
        break;
      }
      case 'addColLeft':
      case 'addColRight': {
        const insertIdx = action === 'addColLeft' ? colIndex : colIndex + 1;
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r];
          const newCell = row.insertCell(insertIdx);
          const isHeader = row.parentElement?.tagName === 'THEAD';
          if (isHeader) {
            // Convert td to th
            const th = document.createElement('th');
            th.setAttribute('style', cellStyle + 'background:#f0f4ff;font-weight:bold;text-align:left;');
            th.innerHTML = '&nbsp;';
            newCell.replaceWith(th);
          } else {
            newCell.setAttribute('style', cellStyle);
            newCell.innerHTML = '&nbsp;';
          }
        }
        // Redistribute column widths evenly
        const newTotalCols = table.rows[0]?.cells.length || 1;
        const newColWidth = (100 / newTotalCols).toFixed(2) + '%';
        for (let r = 0; r < table.rows.length; r++) {
          for (let c = 0; c < table.rows[r].cells.length; c++) {
            table.rows[r].cells[c].style.width = newColWidth;
          }
        }
        break;
      }
      case 'deleteRow': {
        if (table.rows.length <= 1) {
          // Last row - remove the entire table
          table.parentElement?.removeChild(table);
        } else {
          table.deleteRow(rowIndex);
        }
        break;
      }
      case 'deleteCol': {
        if (totalCols <= 1) {
          // Last column - remove the entire table
          table.parentElement?.removeChild(table);
        } else {
          for (let r = table.rows.length - 1; r >= 0; r--) {
            table.rows[r].deleteCell(colIndex);
          }
          // Redistribute column widths evenly
          const remainingCols = table.rows[0]?.cells.length || 1;
          const evenWidth = (100 / remainingCols).toFixed(2) + '%';
          for (let r = 0; r < table.rows.length; r++) {
            for (let c = 0; c < table.rows[r].cells.length; c++) {
              table.rows[r].cells[c].style.width = evenWidth;
            }
          }
        }
        break;
      }
      case 'deleteTable': {
        // Insert a <br> to keep cursor position after table removal
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        table.parentElement?.insertBefore(p, table);
        table.parentElement?.removeChild(table);
        break;
      }
      case 'alignLeft':
      case 'alignCenter':
      case 'alignRight': {
        // Align text in the clicked cell
        const alignValue = action === 'alignLeft' ? 'left' : action === 'alignCenter' ? 'center' : 'right';
        cell.style.textAlign = alignValue;
        break;
      }
    }
    handleInput();
  }, [handleInput]);

  // Insert row at specific position (for + button indicators)
  const handleInsertRowAt = useCallback((rowIndex: number) => {
    if (!hoveredTable) return;
    const table = hoveredTable;
    const totalCols = table.rows[0]?.cells.length || 1;
    const cellStyle = 'border:1px solid #ccc;padding:8px 12px;';

    // rowIndex represents the boundary: 0 = before first row, 1 = between row 0 and 1, etc.
    const insertIdx = rowIndex;
    const newRow = table.insertRow(insertIdx);
    const refRow = table.rows[0];
    for (let c = 0; c < totalCols; c++) {
      const newCell = newRow.insertCell(c);
      const existingWidth = refRow?.cells[c]?.style.width || '';
      newCell.setAttribute('style', cellStyle + (existingWidth ? `width:${existingWidth};` : ''));
      newCell.innerHTML = '&nbsp;';
    }
    handleInput();
  }, [hoveredTable, handleInput]);

  // Insert column at specific position (for + button indicators)
  const handleInsertColAt = useCallback((colIndex: number) => {
    if (!hoveredTable) return;
    const table = hoveredTable;
    const cellStyle = 'border:1px solid #ccc;padding:8px 12px;';

    // colIndex represents the boundary: 0 = before first col, 1 = between col 0 and 1, etc.
    const insertIdx = colIndex;
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const newCell = row.insertCell(insertIdx);
      const isHeader = row.parentElement?.tagName === 'THEAD';
      if (isHeader) {
        const th = document.createElement('th');
        th.setAttribute('style', cellStyle + 'background:#f0f4ff;font-weight:bold;text-align:left;');
        th.innerHTML = '&nbsp;';
        newCell.replaceWith(th);
      } else {
        newCell.setAttribute('style', cellStyle);
        newCell.innerHTML = '&nbsp;';
      }
    }
    // Redistribute column widths evenly
    const newTotalCols = table.rows[0]?.cells.length || 1;
    const newColWidth = (100 / newTotalCols).toFixed(2) + '%';
    for (let r = 0; r < table.rows.length; r++) {
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        table.rows[r].cells[c].style.width = newColWidth;
      }
    }
    handleInput();
  }, [hoveredTable, handleInput]);

  // Handle corner menu actions
  const handleCornerMenuAction = useCallback((action: string) => {
    if (!hoveredTable) return;
    const table = hoveredTable;
    const totalCols = table.rows[0]?.cells.length || 1;
    const totalRows = table.rows.length;
    const cellStyle = 'border:1px solid #ccc;padding:8px 12px;';

    switch (action) {
      case 'addRowAbove': {
        // Add row at the beginning (after header if exists)
        const newRow = table.insertRow(table.tHead ? 1 : 0);
        const refRow = table.rows[0];
        for (let c = 0; c < totalCols; c++) {
          const newCell = newRow.insertCell(c);
          const existingWidth = refRow?.cells[c]?.style.width || '';
          newCell.setAttribute('style', cellStyle + (existingWidth ? `width:${existingWidth};` : ''));
          newCell.innerHTML = '&nbsp;';
        }
        break;
      }
      case 'addRowBelow': {
        // Add row at the end
        const newRow = table.insertRow(totalRows);
        const refRow = table.rows[0];
        for (let c = 0; c < totalCols; c++) {
          const newCell = newRow.insertCell(c);
          const existingWidth = refRow?.cells[c]?.style.width || '';
          newCell.setAttribute('style', cellStyle + (existingWidth ? `width:${existingWidth};` : ''));
          newCell.innerHTML = '&nbsp;';
        }
        break;
      }
      case 'addColLeft': {
        // Add column at the beginning
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r];
          const newCell = row.insertCell(0);
          const isHeader = row.parentElement?.tagName === 'THEAD';
          if (isHeader) {
            const th = document.createElement('th');
            th.setAttribute('style', cellStyle + 'background:#f0f4ff;font-weight:bold;text-align:left;');
            th.innerHTML = '&nbsp;';
            newCell.replaceWith(th);
          } else {
            newCell.setAttribute('style', cellStyle);
            newCell.innerHTML = '&nbsp;';
          }
        }
        // Redistribute column widths evenly
        const newTotalCols = table.rows[0]?.cells.length || 1;
        const newColWidth = (100 / newTotalCols).toFixed(2) + '%';
        for (let r = 0; r < table.rows.length; r++) {
          for (let c = 0; c < table.rows[r].cells.length; c++) {
            table.rows[r].cells[c].style.width = newColWidth;
          }
        }
        break;
      }
      case 'addColRight': {
        // Add column at the end
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r];
          const newCell = row.insertCell(-1);
          const isHeader = row.parentElement?.tagName === 'THEAD';
          if (isHeader) {
            const th = document.createElement('th');
            th.setAttribute('style', cellStyle + 'background:#f0f4ff;font-weight:bold;text-align:left;');
            th.innerHTML = '&nbsp;';
            newCell.replaceWith(th);
          } else {
            newCell.setAttribute('style', cellStyle);
            newCell.innerHTML = '&nbsp;';
          }
        }
        // Redistribute column widths evenly
        const newTotalCols = table.rows[0]?.cells.length || 1;
        const newColWidth = (100 / newTotalCols).toFixed(2) + '%';
        for (let r = 0; r < table.rows.length; r++) {
          for (let c = 0; c < table.rows[r].cells.length; c++) {
            table.rows[r].cells[c].style.width = newColWidth;
          }
        }
        break;
      }
      case 'deleteRow': {
        // Get row index from focused cell, or use first data row
        let rowToDelete = table.tHead ? 1 : 0; // Default: first data row
        if (focusedCell && table.contains(focusedCell)) {
          const row = focusedCell.parentElement as HTMLTableRowElement;
          if (row) {
            rowToDelete = row.rowIndex;
          }
        }

        if (totalRows <= 1) {
          table.parentElement?.removeChild(table);
          setFocusedCell(null);
        } else {
          table.deleteRow(rowToDelete);
          setFocusedCell(null);
        }
        break;
      }
      case 'deleteCol': {
        // Get col index from focused cell, or use first column
        let colToDelete = 0; // Default: first column
        if (focusedCell && table.contains(focusedCell)) {
          colToDelete = focusedCell.cellIndex;
        }

        if (totalCols <= 1) {
          table.parentElement?.removeChild(table);
          setFocusedCell(null);
        } else {
          for (let r = table.rows.length - 1; r >= 0; r--) {
            table.rows[r].deleteCell(colToDelete);
          }
          // Redistribute column widths evenly
          const remainingCols = table.rows[0]?.cells.length || 1;
          const evenWidth = (100 / remainingCols).toFixed(2) + '%';
          for (let r = 0; r < table.rows.length; r++) {
            for (let c = 0; c < table.rows[r].cells.length; c++) {
              table.rows[r].cells[c].style.width = evenWidth;
            }
          }
          setFocusedCell(null);
        }
        break;
      }
      case 'alignTableLeft':
        // If table is 100% width, reduce it to 80% to allow alignment
        if (!table.style.width || table.style.width === '100%') {
          table.style.width = '80%';
        }
        table.style.marginLeft = '0';
        table.style.marginRight = 'auto';
        break;
      case 'alignTableCenter':
        // If table is 100% width, reduce it to 80% to allow alignment
        if (!table.style.width || table.style.width === '100%') {
          table.style.width = '80%';
        }
        table.style.marginLeft = 'auto';
        table.style.marginRight = 'auto';
        break;
      case 'alignTableRight':
        // If table is 100% width, reduce it to 80% to allow alignment
        if (!table.style.width || table.style.width === '100%') {
          table.style.width = '80%';
        }
        table.style.marginLeft = 'auto';
        table.style.marginRight = '0';
        break;
      case 'deleteTable': {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        table.parentElement?.insertBefore(p, table);
        table.parentElement?.removeChild(table);
        setHoveredTable(null);
        setSelectedTable(null);
        setFocusedCell(null);
        break;
      }
    }
    handleInput();
  }, [hoveredTable, focusedCell, handleInput]);

  // Handle selecting table from corner menu
  const handleSelectTableFromCorner = useCallback(() => {
    if (hoveredTable) {
      setSelectedTable(hoveredTable);
      setIsEditingInCell(false);
    }
  }, [hoveredTable]);

  // --- Image resize handlers ---
  const handleImageResizeStart = useCallback((e: React.MouseEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!selectedImage) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = selectedImage.getBoundingClientRect();
    imageResizeState.current = {
      isResizing: true,
      image: selectedImage,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      aspectRatio: rect.width / rect.height,
      corner,
    };

    document.addEventListener('mousemove', handleImageResizeMove);
    document.addEventListener('mouseup', handleImageResizeEnd);
  }, [selectedImage]);

  const handleImageResizeMove = useCallback((e: MouseEvent) => {
    const state = imageResizeState.current;
    if (!state || !state.isResizing) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;

    let newWidth = state.startWidth;
    let newHeight = state.startHeight;

    // Calculate new dimensions based on corner being dragged
    switch (state.corner) {
      case 'se':
        newWidth = Math.max(50, state.startWidth + deltaX);
        break;
      case 'sw':
        newWidth = Math.max(50, state.startWidth - deltaX);
        break;
      case 'ne':
        newWidth = Math.max(50, state.startWidth + deltaX);
        break;
      case 'nw':
        newWidth = Math.max(50, state.startWidth - deltaX);
        break;
    }

    // Maintain aspect ratio
    newHeight = newWidth / state.aspectRatio;

    // Apply new size
    state.image.style.width = `${newWidth}px`;
    state.image.style.height = `${newHeight}px`;
    state.image.style.maxWidth = 'none';
  }, []);

  const handleImageResizeEnd = useCallback(() => {
    if (imageResizeState.current) {
      imageResizeState.current.isResizing = false;
      imageResizeState.current = null;
      handleInput();
    }
    document.removeEventListener('mousemove', handleImageResizeMove);
    document.removeEventListener('mouseup', handleImageResizeEnd);
  }, [handleInput, handleImageResizeMove]);

  // Delete selected image
  const handleDeleteImage = useCallback(() => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    handleInput();
  }, [selectedImage, handleInput]);

  // Image alignment handler
  const handleImageAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (!selectedImage) return;
    if (align === 'center') {
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = 'auto';
    } else if (align === 'left') {
      selectedImage.style.marginLeft = '0';
      selectedImage.style.marginRight = 'auto';
    } else {
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = '0';
    }
    selectedImage.style.display = 'block';
    selectedImage.style.float = '';
    handleInput();
    const img = selectedImage;
    setSelectedImage(null);
    setTimeout(() => setSelectedImage(img), 50);
  }, [selectedImage, handleInput]);

  // Cleanup image resize listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleImageResizeMove);
      document.removeEventListener('mouseup', handleImageResizeEnd);
    };
  }, [handleImageResizeMove, handleImageResizeEnd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Custom Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Custom Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Use execCommand handler which protects top-level list items
          execCommand("outdent");
        } else {
          document.execCommand("indent");
          handleInput();
        }
        return;
      }

      // Backspace/Delete ở đầu list item → xóa chỉ mục (giống Word)
      if (e.key === "Backspace" || e.key === "Delete") {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);

        // Tìm LI gần nhất
        let node: Node | null = range.startContainer;
        let li: HTMLLIElement | null = null;
        while (node && node !== editorRef.current) {
          if (node instanceof HTMLLIElement) {
            li = node;
            break;
          }
          node = node.parentNode;
        }
        if (!li) return;

        // Chỉ xử lý khi cursor ở đầu LI (thực sự ở vị trí đầu tiên, không phải sau <br>)
        const isAtStart = (() => {
          if (!range.collapsed) return false;
          // Tạo range từ đầu LI đến vị trí cursor
          const preRange = document.createRange();
          preRange.selectNodeContents(li);
          preRange.setEnd(range.startContainer, range.startOffset);
          // Nếu có text hoặc <br> trước cursor → không phải đầu LI
          const fragment = preRange.cloneContents();
          return preRange.toString().length === 0 && !fragment.querySelector('br, img, hr, table');
        })();
        // Hoặc khi LI trống
        const isEmpty = (li.textContent || '').trim() === '';

        if (!isAtStart && !isEmpty) return;

        e.preventDefault();

        const list = li.parentElement; // UL hoặc OL
        if (!list || (list.tagName !== 'UL' && list.tagName !== 'OL')) return;

        // Tạo đoạn văn thường thay thế LI
        const p = document.createElement('p');
        // Giữ nội dung nếu có
        while (li.firstChild) {
          p.appendChild(li.firstChild);
        }
        if (!p.firstChild) {
          p.appendChild(document.createElement('br'));
        }

        // Nếu LI là item duy nhất → thay thế cả list
        if (list.children.length === 1) {
          list.parentNode?.replaceChild(p, list);
        } else {
          // Tách list: items trước LI giữ nguyên, LI → p, items sau LI → list mới
          const itemsAfter: HTMLLIElement[] = [];
          let foundTarget = false;
          Array.from(list.children).forEach((child) => {
            if (child === li) {
              foundTarget = true;
            } else if (foundTarget) {
              itemsAfter.push(child as HTMLLIElement);
            }
          });

          // Chèn p sau list hiện tại
          list.parentNode?.insertBefore(p, list.nextSibling);

          // Nếu còn items sau, tạo list mới
          if (itemsAfter.length > 0) {
            const newList = document.createElement(list.tagName) as HTMLUListElement | HTMLOListElement;
            itemsAfter.forEach((item) => newList.appendChild(item));
            p.parentNode?.insertBefore(newList, p.nextSibling);
          }

          // Xóa LI khỏi list gốc
          li.remove();

          // Nếu list gốc rỗng, xóa luôn
          if (list.children.length === 0) {
            list.remove();
          }
        }

        // Đặt cursor vào đầu đoạn văn mới
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        handleInput();
      }
    },
    [handleInput, handleUndo, handleRedo, execCommand]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const html = e.clipboardData.getData("text/html");
      if (html) {
        e.preventDefault();
        const cleaned = sanitizeHTML(html);
        document.execCommand("insertHTML", false, cleaned);
        handleInput();
      }
    },
    [handleInput]
  );

  // Right-click context menu for tables
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as Node;
      const cell = findClosestCell(target);
      if (cell) {
        e.preventDefault();
        setTableContextMenu({ x: e.clientX, y: e.clientY, cell });
      } else {
        setTableContextMenu(null);
      }
    },
    []
  );

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-[100] bg-stone-100 dark:bg-stone-900' : ''}`}>
      {/* Sticky header: title + toolbar together, no gap */}
      <div ref={headerRef} className={`sticky top-0 z-40 ${isFullscreen ? '' : 'rounded-t-lg'}`}>
        {/* Title bar */}
        {lessonTitle && (
          <div className={`bg-brand dark:bg-brand-dark px-4 py-2.5 flex items-center gap-3 ${isFullscreen ? '' : 'rounded-t-lg'}`}>
            {onBack && !isFullscreen && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-brand text-white/80 hover:text-white transition-colors flex-shrink-0"
                title="Quay lại cấu hình"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white leading-tight truncate">{lessonTitle}</h2>
              {lessonSubtitle && (
                <p className="text-sky-100 text-xs mt-0.5">{lessonSubtitle}</p>
              )}
            </div>
            {!hideFullscreen && (
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors flex-shrink-0"
                title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        )}

        {/* Toolbar - directly below title, no gap */}
        <div className={`bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 shadow-sm ${isFullscreen ? '' : 'border-x'} ${!lessonTitle ? 'border-t rounded-t-lg' : ''}`}>
          <div className="flex flex-wrap items-center justify-between px-2 sm:px-3 py-1.5 gap-y-1">
            {/* Left: formatting tools */}
            <div className="flex flex-wrap items-center gap-0.5 min-w-0 flex-1">
              {/* Font size selector - shows current size */}
              <select
                ref={fontSizeRef}
                className="h-7 w-16 px-1.5 text-xs border border-stone-200 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 mr-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand"
                defaultValue=""
                onMouseDown={() => {
                  // Save selection before dropdown opens
                  savedSelectionRef.current = saveSelection();
                }}
                onFocus={() => {
                  // Also save on focus (for keyboard navigation)
                  if (!savedSelectionRef.current) {
                    savedSelectionRef.current = saveSelection();
                  }
                }}
                onChange={(e) => {
                  if (e.target.value) {
                    editorRef.current?.focus();
                    // Restore selection before applying font size
                    restoreSelection(savedSelectionRef.current);
                    applyFontSize(e.target.value);
                    savedSelectionRef.current = null;
                    handleInput();
                    // Reset select to placeholder after applying
                    if (fontSizeRef.current) {
                      fontSizeRef.current.value = e.target.value;
                    }
                  }
                }}
                title="Cỡ chữ"
              >
                <option value="">Cỡ chữ</option>
                {FONT_SIZES.map(fs => (
                  <option key={fs.label} value={fs.pt}>{fs.label}</option>
                ))}
              </select>

              {TOOLBAR.map((item, idx) => {
                if (item.type === "separator") {
                  return (
                    <div
                      key={`sep-${idx}`}
                      className="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-0.5"
                    />
                  );
                }
                const Icon = item.icon;

                // List style picker
                if (item.command === "__listStyle") {
                  const isListActive =
                    activeFormats.insertUnorderedList || activeFormats.insertOrderedList;

                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          savedSelectionRef.current = saveSelection();
                          setShowListStylePicker(prev => !prev);
                        }}
                        className={`p-1.5 rounded transition-colors flex items-center gap-0 ${
                          isListActive
                            ? "bg-sky-100 dark:bg-sky-900/50 text-brand dark:text-sky-400"
                            : "hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400"
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                      {showListStylePicker && (
                        <ListStylePicker
                          styles={LIST_STYLES}
                          onSelect={applyListStyle}
                          onClose={() => setShowListStylePicker(false)}
                        />
                      )}
                    </div>
                  );
                }

                // Special handling for table button with grid picker
                if (item.command === "__table") {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          savedSelectionRef.current = saveSelection();
                          setShowTablePicker(prev => !prev);
                        }}
                        className="p-1.5 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400 transition-colors"
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                      {showTablePicker && (
                        <TableGridPicker
                          onSelect={handleTableSelect}
                          onClose={() => setShowTablePicker(false)}
                        />
                      )}
                    </div>
                  );
                }

                // Text color picker
                if (item.command === "__textColor") {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          savedSelectionRef.current = saveSelection();
                          setShowTextColorPicker(prev => !prev);
                          setShowHighlightPicker(false);
                        }}
                        className="p-1.5 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400 transition-colors"
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="h-0.5 w-3 mx-auto mt-0 rounded" style={{ backgroundColor: currentTextColor }} />
                      </button>
                      {showTextColorPicker && (
                        <ColorPickerPopup
                          colors={TEXT_COLORS}
                          onSelect={applyTextColor}
                          onClose={() => setShowTextColorPicker(false)}
                          title="Màu chữ"
                        />
                      )}
                    </div>
                  );
                }

                // Highlight color picker
                if (item.command === "__highlight") {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          savedSelectionRef.current = saveSelection();
                          setShowHighlightPicker(prev => !prev);
                          setShowTextColorPicker(false);
                        }}
                        className="p-1.5 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400 transition-colors"
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="h-0.5 w-3 mx-auto mt-0 rounded" style={{ backgroundColor: currentHighlightColor === "transparent" ? '#e5e7eb' : currentHighlightColor }} />
                      </button>
                      {showHighlightPicker && (
                        <ColorPickerPopup
                          colors={HIGHLIGHT_COLORS}
                          onSelect={applyHighlight}
                          onClose={() => setShowHighlightPicker(false)}
                          title="Tô sáng"
                        />
                      )}
                    </div>
                  );
                }

                // Image button
                if (item.command === "__image") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        savedSelectionRef.current = saveSelection();
                        imageInputRef.current?.click();
                      }}
                      className="p-1.5 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400 transition-colors"
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                }

                const isActive = activeFormats[item.command] || false;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      execCommand(item.command, item.commandArg);
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isActive
                        ? "bg-sky-100 dark:bg-sky-900/50 text-brand dark:text-sky-400"
                        : "hover:bg-sky-50 dark:hover:bg-sky-900/30 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400"
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Right: action buttons (Save, Export, etc.) */}
            {toolbarActions && (
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0 flex-wrap">
                {toolbarActions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* A4 page area with outline sidebar */}
      <div className={`flex ${isFullscreen ? 'flex-1 overflow-y-auto bg-stone-100 dark:bg-stone-800' : 'border-x border-b border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 rounded-b-lg'}`}>
        {/* Sidebar + Toggle: MỘT phần tử sticky duy nhất, self-start để không stretch bằng A4 */}
        <div
          className="flex-shrink-0 self-start sticky z-20 flex"
          style={{ top: isFullscreen ? '0px' : `${headerHeight}px`, maxHeight: `calc(100vh - ${headerHeight + 8}px)` }}
        >
          {showOutline && (
            <div className={`w-48 lg:w-56 overflow-y-auto py-4 pl-3 pr-1 scrollbar-thin ${isFullscreen ? 'bg-stone-100 dark:bg-stone-800' : 'bg-stone-100 dark:bg-stone-800'}`}>
              <div className="flex items-center gap-1.5 mb-3 px-1">
                <ListTree className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Mục lục</span>
              </div>
              {outlineHeadings.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 px-1 italic">Chưa có tiêu đề nào</p>
              ) : (
                <nav className="space-y-0.5">
                  {outlineHeadings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        h.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        h.element.style.transition = 'background-color 0.3s';
                        h.element.style.backgroundColor = '#dbeafe';
                        setTimeout(() => { h.element.style.backgroundColor = ''; }, 1200);
                      }}
                      className="w-full text-left text-xs py-1 px-2 rounded hover:bg-sky-50 dark:hover:bg-sky-900/20 text-stone-600 dark:text-stone-400 hover:text-brand dark:hover:text-sky-400 transition-colors truncate block"
                      style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                      title={h.text}
                    >
                      <span className={h.level <= 2 ? 'font-medium' : ''}>{h.text}</span>
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}
          <button
            onClick={() => setShowOutline(prev => !prev)}
            className="self-start mt-4 p-1 rounded-r bg-white dark:bg-stone-800 border border-l-0 border-stone-200 dark:border-stone-600 text-stone-400 hover:text-brand dark:text-stone-500 dark:hover:text-sky-400 transition-colors shadow-sm"
            title={showOutline ? 'Ẩn mục lục' : 'Hiện mục lục'}
          >
            {showOutline ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Editor area */}
        <div className={`flex-1 ${isFullscreen ? 'flex flex-col items-center min-h-full py-6 px-6 sm:px-10' : 'flex justify-center py-6 px-4'}`}>
          <div
            ref={wrapperRef}
            className={`w-full bg-white dark:bg-stone-900 shadow-lg dark:shadow-stone-950/50 relative px-4 py-6 sm:px-[60px] sm:py-[48px] ${isFullscreen ? 'flex-1 flex flex-col border border-stone-200 dark:border-stone-700' : ''}`}
            style={{ maxWidth: "950px" }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onContextMenu={handleContextMenu}
              onMouseMove={handleEditorMouseMove}
              onMouseDown={handleEditorMouseDown}
              onClick={handleEditorClick}
              data-placeholder={placeholder}
              className={`rich-editor-content outline-none text-stone-800 dark:text-stone-200 ${isFullscreen ? 'flex-1' : ''}`}
              style={{
                minHeight,
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '14pt',
                lineHeight: '1.5',
              }}
            />

            {/* Table insert indicators (Word-like + buttons) */}
            {hoveredTable && (
              <>
                <TableInsertIndicators
                  table={hoveredTable}
                  editorRef={editorRef}
                  onInsertRow={handleInsertRowAt}
                  onInsertCol={handleInsertColAt}
                />
                <TableCornerMenu
                  table={hoveredTable}
                  editorRef={editorRef}
                  onAction={handleCornerMenuAction}
                  onSelectTable={handleSelectTableFromCorner}
                />
              </>
            )}

            {/* Image resize overlay */}
            {selectedImage && wrapperRef.current && (() => {
              const imgRect = selectedImage.getBoundingClientRect();
              const paperRect = wrapperRef.current!.getBoundingClientRect();
              const top = imgRect.top - paperRect.top;
              const left = imgRect.left - paperRect.left;
              return (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${imgRect.width}px`,
                    height: `${imgRect.height}px`,
                    border: '2px solid #3b82f6',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Corner resize handles */}
                  {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                    const positions: Record<string, React.CSSProperties> = {
                      nw: { top: -6, left: -6, cursor: 'nw-resize' },
                      ne: { top: -6, right: -6, cursor: 'ne-resize' },
                      sw: { bottom: -6, left: -6, cursor: 'sw-resize' },
                      se: { bottom: -6, right: -6, cursor: 'se-resize' },
                    };
                    return (
                      <div
                        key={corner}
                        className="absolute w-3 h-3 bg-white border-2 border-brand rounded-sm pointer-events-auto"
                        style={positions[corner]}
                        onMouseDown={(e) => handleImageResizeStart(e, corner)}
                      />
                    );
                  })}
                  {/* Image alignment buttons */}
                  <div className="absolute -top-9 left-0 flex gap-1 pointer-events-auto">
                    <button
                      className="p-1 bg-stone-700 hover:bg-stone-600 text-white rounded shadow"
                      onClick={() => handleImageAlign('left')}
                      title="Căn trái"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 bg-stone-700 hover:bg-stone-600 text-white rounded shadow"
                      onClick={() => handleImageAlign('center')}
                      title="Căn giữa"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 bg-stone-700 hover:bg-stone-600 text-white rounded shadow"
                      onClick={() => handleImageAlign('right')}
                      title="Căn phải"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Delete button */}
                  <button
                    className="absolute -top-9 right-0 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded shadow pointer-events-auto"
                    onClick={handleDeleteImage}
                    title="Xóa ảnh"
                  >
                    Xóa
                  </button>
                  {/* Size indicator */}
                  <div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-stone-800 text-white text-xs rounded whitespace-nowrap"
                  >
                    {Math.round(imgRect.width)} × {Math.round(imgRect.height)}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

      </div>

      {/* Table right-click context menu */}
      {tableContextMenu && (
        <TableContextMenu
          x={tableContextMenu.x}
          y={tableContextMenu.y}
          cell={tableContextMenu.cell}
          onAction={handleTableAction}
          onClose={() => setTableContextMenu(null)}
        />
      )}

      {/* Editor styles */}
      <style>{`
        .rich-editor-content {
          font-family: "Times New Roman", Times, serif;
          font-size: 14pt;
          line-height: 1.5;
          letter-spacing: normal;
          color: inherit;
        }
        .rich-editor-content:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-editor-content h1 {
          font-size: 16pt;
          font-weight: 700;
          margin: 14pt 0 8pt;
          text-align: center;
          color: inherit;
        }
        .rich-editor-content h2 {
          font-size: 15pt;
          font-weight: 700;
          margin: 12pt 0 6pt;
          color: inherit;
        }
        .rich-editor-content h3 {
          font-size: 14pt;
          font-weight: 700;
          margin: 10pt 0 6pt;
          color: inherit;
        }
        .rich-editor-content h4 {
          font-size: 14pt;
          font-weight: 600;
          margin: 8pt 0 5pt;
          color: inherit;
        }
        .rich-editor-content p {
          margin: 0 0 8pt;
          line-height: 1.5;
          text-align: justify;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .rich-editor-content ul {
          list-style-type: "- ";
          padding-left: 1.5rem;
          margin: 6pt 0 8pt;
        }
        .rich-editor-content ul ul {
          list-style-type: "+ ";
        }
        .rich-editor-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 6pt 0 8pt;
        }
        .rich-editor-content li {
          line-height: 1.5;
          margin: 2pt 0;
          text-align: justify;
        }
        .rich-editor-content table {
          border-collapse: collapse;
          margin: 10pt 0;
          border: 1px solid #d1d5db;
          table-layout: fixed;
        }
        .rich-editor-content table:not([style*="width"]) {
          width: 100%;
        }
        .rich-editor-content th,
        .rich-editor-content td {
          border: 1px solid #d1d5db;
          padding: 6pt 8pt;
          font-size: 13pt;
          line-height: 1.5;
          text-align: left;
          vertical-align: top;
        }
        .rich-editor-content th {
          background: #f5f5f5;
          font-weight: 700;
        }
        .rich-editor-content hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 1rem 0;
        }
        .rich-editor-content blockquote {
          border-left: 4px solid #60a5fa;
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .rich-editor-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .rich-editor-content code {
          background: #f3f4f6;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
          font-family: monospace;
        }
        .rich-editor-content pre {
          background: #f8f8f8;
          border: 1px solid #ddd;
          padding: 8px 10px;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0.75rem 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 10pt;
          line-height: 1.4;
          white-space: pre;
          tab-size: 4;
        }
        .rich-editor-content pre code {
          background: none;
          padding: 0;
          border: none;
          font-size: inherit;
          white-space: pre;
          display: block;
        }
        /* Dark mode overrides */
        .dark .rich-editor-content th {
          background: #1e3a5f;
          border-color: #4b5563;
        }
        .dark .rich-editor-content td {
          border-color: #4b5563;
        }
        .dark .rich-editor-content table {
          border-color: #4b5563;
        }
        .dark .rich-editor-content hr {
          border-color: #4b5563;
        }
        .dark .rich-editor-content blockquote {
          color: #9ca3af;
        }
        .dark .rich-editor-content code {
          background: #1f2937;
        }
        .dark .rich-editor-content pre {
          background: #1e1e1e;
          border-color: #444;
        }
        .dark .rich-editor-content pre code {
          background: none;
        }
        .dark .rich-editor-content a {
          color: #60a5fa;
        }
        .rich-editor-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 8px 0;
          border-radius: 4px;
        }
        .rich-editor-content img:hover {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-xl w-[95vw] max-w-[420px] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-white mb-4">Chèn liên kết</h3>
            <div>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => { setLinkUrl(e.target.value); setLinkError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleLinkConfirm(); if (e.key === "Escape") setShowLinkModal(false); }}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none"
              />
              {linkError && (
                <p className="text-xs text-red-500 mt-1">{linkError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleLinkConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
