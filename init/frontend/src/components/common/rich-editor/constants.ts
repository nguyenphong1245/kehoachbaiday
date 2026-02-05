import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Link,
  Undo2,
  Redo2,
  Indent,
  Outdent,
  Type,
  Highlighter,
  Image,
} from "lucide-react";

export type ToolbarItem =
  | { type: "button"; icon: React.ElementType; label: string; command: string; commandArg?: string }
  | { type: "separator" };

export const TOOLBAR: ToolbarItem[] = [
  { type: "button", icon: Undo2, label: "Hoàn tác", command: "undo" },
  { type: "button", icon: Redo2, label: "Làm lại", command: "redo" },
  { type: "separator" },
  { type: "button", icon: Bold, label: "In đậm (Ctrl+B)", command: "bold" },
  { type: "button", icon: Italic, label: "In nghiêng (Ctrl+I)", command: "italic" },
  { type: "button", icon: Underline, label: "Gạch chân (Ctrl+U)", command: "underline" },
  { type: "button", icon: Strikethrough, label: "Gạch ngang", command: "strikeThrough" },
  { type: "separator" },
  { type: "button", icon: List, label: "Danh sách", command: "insertUnorderedList" },
  { type: "button", icon: ListOrdered, label: "Danh sách số", command: "insertOrderedList" },
  { type: "button", icon: Indent, label: "Tăng thụt lề", command: "indent" },
  { type: "button", icon: Outdent, label: "Giảm thụt lề", command: "outdent" },
  { type: "separator" },
  { type: "button", icon: AlignLeft, label: "Căn trái", command: "justifyLeft" },
  { type: "button", icon: AlignCenter, label: "Căn giữa", command: "justifyCenter" },
  { type: "button", icon: AlignRight, label: "Căn phải", command: "justifyRight" },
  { type: "separator" },
  { type: "button", icon: Link, label: "Chèn liên kết", command: "__link" },
  { type: "button", icon: Table, label: "Chèn bảng", command: "__table" },
  { type: "separator" },
  { type: "button", icon: Type, label: "Màu chữ", command: "__textColor" },
  { type: "button", icon: Highlighter, label: "Tô sáng", command: "__highlight" },
  { type: "button", icon: Image, label: "Chèn ảnh", command: "__image" },
];

export const FONT_SIZES = [
  { label: "11", pt: "11pt" },
  { label: "12", pt: "12pt" },
  { label: "13", pt: "13pt" },
  { label: "14", pt: "14pt" },
];

export const TEXT_COLORS = [
  { color: "#000000", label: "Đen" },
  { color: "#dc2626", label: "Đỏ" },
  { color: "#2563eb", label: "Xanh dương" },
  { color: "#16a34a", label: "Xanh lá" },
  { color: "#9333ea", label: "Tím" },
  { color: "#ea580c", label: "Cam" },
  { color: "#ca8a04", label: "Vàng đậm" },
  { color: "#0d9488", label: "Teal" },
  { color: "#be185d", label: "Hồng" },
  { color: "#4b5563", label: "Xám" },
];

export const HIGHLIGHT_COLORS = [
  { color: "transparent", label: "Không tô" },
  { color: "#fef08a", label: "Vàng" },
  { color: "#bbf7d0", label: "Xanh lá nhạt" },
  { color: "#bfdbfe", label: "Xanh dương nhạt" },
  { color: "#fecaca", label: "Đỏ nhạt" },
  { color: "#e9d5ff", label: "Tím nhạt" },
  { color: "#fed7aa", label: "Cam nhạt" },
  { color: "#fce7f3", label: "Hồng nhạt" },
  { color: "#d1fae5", label: "Ngọc nhạt" },
];

export interface OutlineHeading {
  text: string;
  level: number;
  element: HTMLElement;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  toolbarActions?: React.ReactNode;
  lessonTitle?: string;
  lessonSubtitle?: string;
  onBack?: () => void;
}
