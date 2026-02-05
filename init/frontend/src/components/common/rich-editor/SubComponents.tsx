import React, { useRef, useEffect, useState } from "react";
import { Plus, Trash2, Rows, Columns, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

// ======================== Table Resize Overlay ========================

export type ResizeHandleType =
  | 'nw' | 'ne' | 'sw' | 'se'  // corners
  | 'n' | 's' | 'e' | 'w';     // edges

export type TableAlignType = 'left' | 'center' | 'right';

export interface TableResizeOverlayProps {
  table: HTMLTableElement;
  editorRef: React.RefObject<HTMLDivElement>;
  onResizeStart: (handle: ResizeHandleType, e: React.MouseEvent) => void;
  onDistributeColumns: () => void;
}

export const TableResizeOverlay: React.FC<TableResizeOverlayProps> = ({
  table,
  editorRef,
  onResizeStart,
  onDistributeColumns,
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      if (table && editorRef.current) {
        // Use the parent container (with position: relative) as reference
        const container = editorRef.current.parentElement;
        if (container) {
          setRect(table.getBoundingClientRect());
          setContainerRect(container.getBoundingClientRect());
        }
      }
    };
    updateRect();

    // Update on scroll/resize
    const observer = new ResizeObserver(updateRect);
    observer.observe(table);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [table, editorRef]);

  if (!rect || !containerRect) return null;

  // Calculate position relative to container
  const top = rect.top - containerRect.top;
  const left = rect.left - containerRect.left;
  const width = rect.width;
  const height = rect.height;

  const handleSize = 8;
  const halfHandle = handleSize / 2;

  // Handle styles
  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: handleSize,
    height: handleSize,
    backgroundColor: '#3b82f6',
    border: '1px solid #fff',
    borderRadius: 2,
    zIndex: 100,
  };

  const edgeStyleH: React.CSSProperties = {
    position: 'absolute',
    width: 20,
    height: 6,
    backgroundColor: '#3b82f6',
    border: '1px solid #fff',
    borderRadius: 3,
    zIndex: 100,
  };

  const edgeStyleV: React.CSSProperties = {
    position: 'absolute',
    width: 6,
    height: 20,
    backgroundColor: '#3b82f6',
    border: '1px solid #fff',
    borderRadius: 3,
    zIndex: 100,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Selection border */}
      <div
        style={{
          position: 'absolute',
          inset: -1,
          border: '2px solid #3b82f6',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Corner handles */}
      {/* NW - top left */}
      <div
        style={{
          ...cornerStyle,
          top: -halfHandle,
          left: -halfHandle,
          cursor: 'nwse-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('nw', e); }}
      />
      {/* NE - top right */}
      <div
        style={{
          ...cornerStyle,
          top: -halfHandle,
          right: -halfHandle,
          cursor: 'nesw-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('ne', e); }}
      />
      {/* SW - bottom left */}
      <div
        style={{
          ...cornerStyle,
          bottom: -halfHandle,
          left: -halfHandle,
          cursor: 'nesw-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('sw', e); }}
      />
      {/* SE - bottom right */}
      <div
        style={{
          ...cornerStyle,
          bottom: -halfHandle,
          right: -halfHandle,
          cursor: 'nwse-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('se', e); }}
      />

      {/* Edge handles */}
      {/* N - top center */}
      <div
        style={{
          ...edgeStyleH,
          top: -3,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('n', e); }}
      />
      {/* S - bottom center */}
      <div
        style={{
          ...edgeStyleH,
          bottom: -3,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('s', e); }}
      />
      {/* W - left center */}
      <div
        style={{
          ...edgeStyleV,
          top: '50%',
          left: -3,
          transform: 'translateY(-50%)',
          cursor: 'ew-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('w', e); }}
      />
      {/* E - right center */}
      <div
        style={{
          ...edgeStyleV,
          top: '50%',
          right: -3,
          transform: 'translateY(-50%)',
          cursor: 'ew-resize',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onResizeStart('e', e); }}
      />

      {/* Toolbar: distribute + hint only */}
      <div
        style={{
          position: 'absolute',
          top: -28,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          pointerEvents: 'auto',
        }}
      >
        <button
          style={{
            padding: '3px 8px',
            fontSize: 11,
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDistributeColumns(); }}
          title="Căn đều các cột"
        >
          ⊞ Căn đều
        </button>
        <span
          style={{
            padding: '3px 6px',
            fontSize: 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            borderRadius: 4,
            whiteSpace: 'nowrap',
          }}
        >
          Del xóa
        </span>
      </div>
    </div>
  );
};

// ======================== Table Context Menu ========================

interface TableContextMenuItem {
  label: string;
  icon: React.ElementType;
  action: "addRowAbove" | "addRowBelow" | "addColLeft" | "addColRight" | "deleteRow" | "deleteCol";
}

const TABLE_CONTEXT_ITEMS: TableContextMenuItem[] = [
  { label: "Thêm hàng phía trên", icon: Plus, action: "addRowAbove" },
  { label: "Thêm hàng phía dưới", icon: Plus, action: "addRowBelow" },
  { label: "Thêm cột bên trái", icon: Plus, action: "addColLeft" },
  { label: "Thêm cột bên phải", icon: Plus, action: "addColRight" },
  { label: "Xóa hàng", icon: Trash2, action: "deleteRow" },
  { label: "Xóa cột", icon: Trash2, action: "deleteCol" },
];

export const TableContextMenu: React.FC<{
  x: number;
  y: number;
  cell: HTMLTableCellElement;
  onAction: (action: string, cell: HTMLTableCellElement) => void;
  onClose: () => void;
}> = ({ x, y, cell, onAction, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  const adjustedStyle: React.CSSProperties = {
    position: "fixed",
    left: x,
    top: y,
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-1 min-w-[200px]"
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
        <Rows className="w-3 h-3" /> Hàng
      </div>
      {TABLE_CONTEXT_ITEMS.slice(0, 2).map((item) => (
        <button
          key={item.action}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 transition-colors"
          onClick={() => {
            onAction(item.action, cell);
            onClose();
          }}
        >
          <item.icon className="w-4 h-4 text-blue-500" />
          {item.label}
        </button>
      ))}
      <button
        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
        onClick={() => {
          onAction("deleteRow", cell);
          onClose();
        }}
      >
        <Trash2 className="w-4 h-4" />
        Xóa hàng
      </button>

      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-y border-gray-100 dark:border-gray-700 flex items-center gap-1.5 mt-1">
        <Columns className="w-3 h-3" /> Cột
      </div>
      {TABLE_CONTEXT_ITEMS.slice(2, 4).map((item) => (
        <button
          key={item.action}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 transition-colors"
          onClick={() => {
            onAction(item.action, cell);
            onClose();
          }}
        >
          <item.icon className="w-4 h-4 text-blue-500" />
          {item.label}
        </button>
      ))}
      <button
        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
        onClick={() => {
          onAction("deleteCol", cell);
          onClose();
        }}
      >
        <Trash2 className="w-4 h-4" />
        Xóa cột
      </button>

      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-y border-gray-100 dark:border-gray-700 flex items-center gap-1.5 mt-1">
        <AlignCenter className="w-3 h-3" /> Căn chỉnh
      </div>
      <button
        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 transition-colors"
        onClick={() => {
          onAction("alignLeft", cell);
          onClose();
        }}
      >
        <AlignLeft className="w-4 h-4 text-blue-500" />
        Căn trái
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 transition-colors"
        onClick={() => {
          onAction("alignCenter", cell);
          onClose();
        }}
      >
        <AlignCenter className="w-4 h-4 text-blue-500" />
        Căn giữa
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 transition-colors"
        onClick={() => {
          onAction("alignRight", cell);
          onClose();
        }}
      >
        <AlignRight className="w-4 h-4 text-blue-500" />
        Căn phải
      </button>
    </div>
  );
};

// ======================== Table Grid Picker ========================

export const TableGridPicker: React.FC<{
  onSelect: (rows: number, cols: number) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const maxRows = 8;
  const maxCols = 8;

  return (
    <div
      className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 z-[60]"
      onMouseLeave={onClose}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        {hoverRow > 0 ? `${hoverRow} × ${hoverCol}` : "Chọn kích thước bảng"}
      </p>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }).map((_, idx) => {
          const r = Math.floor(idx / maxCols) + 1;
          const c = (idx % maxCols) + 1;
          const isHighlighted = r <= hoverRow && c <= hoverCol;
          return (
            <div
              key={idx}
              className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${
                isHighlighted
                  ? "bg-blue-500 border-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              }`}
              onMouseEnter={() => {
                setHoverRow(r);
                setHoverCol(c);
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(r, c);
                onClose();
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ======================== Color Picker Popup ========================

export const ColorPickerPopup: React.FC<{
  colors: { color: string; label: string }[];
  onSelect: (color: string) => void;
  onClose: () => void;
  title: string;
}> = ({ colors, onSelect, onClose, title }) => {
  return (
    <div
      className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 z-[60]"
      onMouseLeave={onClose}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center font-medium">{title}</p>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(5, 20px)',
          gridAutoRows: '20px'
        }}
      >
        {colors.map((c) => (
          <button
            key={c.color}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onSelect(c.color);
              onClose();
            }}
            className="w-5 h-5 border border-gray-400 dark:border-gray-500 hover:border-gray-800 dark:hover:border-white hover:border-2 transition-all cursor-pointer"
            style={{
              backgroundColor: c.color === "transparent" ? "#fff" : c.color,
              boxSizing: 'border-box'
            }}
            title={c.label}
          >
            {c.color === "transparent" && (
              <span className="text-red-500 text-xs font-bold leading-none flex items-center justify-center h-full">
                ✕
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ======================== Table Insert Indicators (Word-like + buttons) ========================

export interface TableInsertIndicatorsProps {
  table: HTMLTableElement;
  editorRef: React.RefObject<HTMLDivElement>;
  onInsertRow: (rowIndex: number) => void;
  onInsertCol: (colIndex: number) => void;
}

export const TableInsertIndicators: React.FC<TableInsertIndicatorsProps> = ({
  table,
  editorRef,
  onInsertRow,
  onInsertCol,
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [rowPositions, setRowPositions] = useState<number[]>([]);
  const [colPositions, setColPositions] = useState<number[]>([]);
  const [hoveredRowBtn, setHoveredRowBtn] = useState<number | null>(null);
  const [hoveredColBtn, setHoveredColBtn] = useState<number | null>(null);

  useEffect(() => {
    const updatePositions = () => {
      if (!table || !editorRef.current) return;

      const container = editorRef.current.parentElement;
      if (!container) return;

      const tableRect = table.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();

      setRect(tableRect);
      setContainerRect(contRect);

      // Calculate row positions (top edge of each row)
      const rows: number[] = [];
      for (let r = 0; r < table.rows.length; r++) {
        const rowRect = table.rows[r].getBoundingClientRect();
        rows.push(rowRect.top - contRect.top);
      }
      // Add bottom edge of last row
      if (table.rows.length > 0) {
        const lastRow = table.rows[table.rows.length - 1];
        rows.push(lastRow.getBoundingClientRect().bottom - contRect.top);
      }
      setRowPositions(rows);

      // Calculate column positions (left edge of each column)
      const cols: number[] = [];
      const firstRow = table.rows[0];
      if (firstRow) {
        for (let c = 0; c < firstRow.cells.length; c++) {
          const cellRect = firstRow.cells[c].getBoundingClientRect();
          cols.push(cellRect.left - contRect.left);
        }
        // Add right edge of last column
        const lastCell = firstRow.cells[firstRow.cells.length - 1];
        if (lastCell) {
          cols.push(lastCell.getBoundingClientRect().right - contRect.left);
        }
      }
      setColPositions(cols);
    };

    updatePositions();

    const observer = new ResizeObserver(updatePositions);
    observer.observe(table);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [table, editorRef]);

  if (!rect || !containerRect || rowPositions.length === 0) return null;

  const tableLeft = rect.left - containerRect.left;
  const tableTop = rect.top - containerRect.top;
  const buttonSize = 16;
  const buttonOffset = 12; // Distance from table edge

  return (
    <>
      {/* Row insert buttons (on the left side of the table) - skip first one (idx=0) since corner menu handles it */}
      {rowPositions.map((pos, idx) => {
        // Skip the first position (idx=0) - corner menu already has add row above
        if (idx === 0) return null;

        const btnTop = pos - buttonSize / 2;

        return (
          <button
            key={`row-${idx}`}
            className={`absolute flex items-center justify-center transition-all duration-150 ${
              hoveredRowBtn === idx
                ? 'opacity-100 scale-110'
                : 'opacity-0 hover:opacity-100'
            }`}
            style={{
              left: tableLeft - buttonOffset - buttonSize,
              top: btnTop,
              width: buttonSize,
              height: buttonSize,
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              zIndex: 100,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoveredRowBtn(idx)}
            onMouseLeave={() => setHoveredRowBtn(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInsertRow(idx);
            }}
            title="Thêm hàng tại đây"
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </button>
        );
      })}

      {/* Column insert buttons (on top of the table) - skip first one (idx=0) since corner menu handles it */}
      {colPositions.map((pos, idx) => {
        // Skip the first position (idx=0) - corner menu already has add column left
        if (idx === 0) return null;

        const btnLeft = pos - buttonSize / 2;

        return (
          <button
            key={`col-${idx}`}
            className={`absolute flex items-center justify-center transition-all duration-150 ${
              hoveredColBtn === idx
                ? 'opacity-100 scale-110'
                : 'opacity-0 hover:opacity-100'
            }`}
            style={{
              left: btnLeft,
              top: tableTop - buttonOffset - buttonSize,
              width: buttonSize,
              height: buttonSize,
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              zIndex: 100,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHoveredColBtn(idx)}
            onMouseLeave={() => setHoveredColBtn(null)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInsertCol(idx);
            }}
            title="Thêm cột tại đây"
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </button>
        );
      })}

      {/* Visual line when hovering row button */}
      {hoveredRowBtn !== null && (
        <div
          style={{
            position: 'absolute',
            left: tableLeft,
            top: rowPositions[hoveredRowBtn],
            width: rect.width,
            height: 2,
            backgroundColor: '#3b82f6',
            zIndex: 99,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Visual line when hovering column button */}
      {hoveredColBtn !== null && (
        <div
          style={{
            position: 'absolute',
            left: colPositions[hoveredColBtn],
            top: tableTop,
            width: 2,
            height: rect.height,
            backgroundColor: '#3b82f6',
            zIndex: 99,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
};

// ======================== Table Corner Menu ========================

export interface TableCornerMenuProps {
  table: HTMLTableElement;
  editorRef: React.RefObject<HTMLDivElement>;
  onAction: (action: string) => void;
  onSelectTable: () => void;
}

export const TableCornerMenu: React.FC<TableCornerMenuProps> = ({
  table,
  editorRef,
  onAction,
  onSelectTable,
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateRect = () => {
      if (!table || !editorRef.current) return;
      const container = editorRef.current.parentElement;
      if (!container) return;
      setRect(table.getBoundingClientRect());
      setContainerRect(container.getBoundingClientRect());
    };

    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(table);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [table, editorRef]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleScroll = () => setShowMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [showMenu]);

  if (!rect || !containerRect) return null;

  const tableLeft = rect.left - containerRect.left;
  const tableTop = rect.top - containerRect.top;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectTable();
    setShowMenu(prev => !prev);
  };

  const handleAction = (action: string) => {
    onAction(action);
    setShowMenu(false);
  };

  return (
    <>
      {/* Corner + button - always visible */}
      <button
        ref={buttonRef}
        className="absolute flex items-center justify-center transition-colors duration-150"
        style={{
          left: tableLeft - 28,
          top: tableTop - 28,
          width: 22,
          height: 22,
          backgroundColor: showMenu ? '#2563eb' : '#3b82f6',
          borderRadius: 4,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 101,
          cursor: 'pointer',
        }}
        onClick={handleButtonClick}
        title="Menu bảng"
      >
        <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
      </button>

      {/* Horizontal toolbar menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl px-1 py-1 flex items-center gap-0.5"
          style={{
            left: tableLeft,
            top: tableTop - 44,
            zIndex: 102,
          }}
        >
          {/* Hàng buttons */}
          <div className="flex items-center border-r border-gray-200 dark:border-gray-600 pr-1 mr-0.5">
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('addRowAbove')}
              title="Thêm hàng phía trên"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="10" width="18" height="11" rx="1" />
                <path d="M12 3v4M10 5h4" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('addRowBelow')}
              title="Thêm hàng phía dưới"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="11" rx="1" />
                <path d="M12 17v4M10 19h4" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              onClick={() => handleAction('deleteRow')}
              title="Xóa hàng"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="8" rx="1" />
                <path d="M8 12h8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Cột buttons */}
          <div className="flex items-center border-r border-gray-200 dark:border-gray-600 pr-1 mr-0.5">
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('addColLeft')}
              title="Thêm cột bên trái"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="10" y="3" width="11" height="18" rx="1" />
                <path d="M3 12h4M5 10v4" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('addColRight')}
              title="Thêm cột bên phải"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="11" height="18" rx="1" />
                <path d="M17 12h4M19 10v4" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              onClick={() => handleAction('deleteCol')}
              title="Xóa cột"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="3" width="8" height="18" rx="1" />
                <path d="M12 8v8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Căn chỉnh bảng buttons */}
          <div className="flex items-center border-r border-gray-200 dark:border-gray-600 pr-1 mr-0.5">
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('alignTableLeft')}
              title="Căn trái bảng"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('alignTableCenter')}
              title="Căn giữa bảng"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleAction('alignTableRight')}
              title="Căn phải bảng"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Xóa bảng button */}
          <button
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            onClick={() => handleAction('deleteTable')}
            title="Xóa bảng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
