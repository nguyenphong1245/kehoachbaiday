/**
 * LessonPlanOutput - Hiển thị kết quả kế hoạch bài dạy với các ô có thể chỉnh sửa
 */
import React, { useState, useCallback, useRef } from "react";
import {
  Edit2,
  Check,
  X,
  Download,
  FileText,
  Target,
  Wrench,
  Lightbulb,
  BookOpen,
  PenTool,
  Rocket,
  ClipboardList,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Info,
  Save,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Sparkles,
  MessageSquare,
  Share2,
  Link,
  ExternalLink,
  Code,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LessonPlanSection, GenerateLessonPlanResponse, ActivityConfig } from "@/types/lessonBuilder";
import { exportToPDF, saveLessonPlan, improveWithAI, type RelatedAppendix } from "@/services/lessonBuilderService";
import { createSharedWorksheet } from "@/services/worksheetService";
import { createSharedQuiz } from "@/services/sharedQuizService";
import { AI_PROMPTS } from "./aiPrompts";
import { ShareCodeExerciseModal } from "./ShareCodeExerciseModal";

interface LessonPlanOutputProps {
  result: GenerateLessonPlanResponse;
  onSectionUpdate: (sectionId: string, newContent: string) => void;
  onExportPDF: () => void;
  activities?: ActivityConfig[];
}

// Icon mapping for section types
const SECTION_ICONS: Record<string, React.ElementType> = {
  thong_tin_chung: Info,
  muc_tieu: Target,
  thiet_bi: Wrench,
  khoi_dong: Lightbulb,
  hinh_thanh_kien_thuc: BookOpen,
  luyen_tap: PenTool,
  van_dung: Rocket,
  phieu_hoc_tap: ClipboardList,
  trac_nghiem: HelpCircle,
  full: FileText,
};

// Màu chủ đạo: Xanh dương (Blue) - đồng bộ với nút Kết quả
const SECTION_COLORS: Record<string, { border: string; bg: string; icon: string }> = {
  thong_tin_chung: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  muc_tieu: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  thiet_bi: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  khoi_dong: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  hinh_thanh_kien_thuc: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  luyen_tap: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  van_dung: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  phieu_hoc_tap: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  trac_nghiem: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  full: { 
    border: "border-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
};

// ============== HELPER FUNCTION: Tách Hình thành kiến thức thành các hoạt động con ==============
interface SubActivity {
  id: string;
  title: string;
  content: string;
}

const splitHinhThanhKienThuc = (content: string): SubActivity[] => {
  // Pattern để tìm các hoạt động con: "Hoạt động 2.1:", "Hoạt động 2.2:", etc.
  // Hoặc "#### Hoạt động 2.1:", "**Hoạt động 2.1:**"
  const activityPattern = /(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?Hoạt động\s*2\.(\d+)[:\s]*([^\n*]+?)(?:\*\*)?\s*(?:\([\d\s]+phút\))?\s*\n/gi;
  
  const activities: SubActivity[] = [];
  let lastIndex = 0;
  let match;
  
  // Reset regex lastIndex
  activityPattern.lastIndex = 0;
  
  // Collect all matches first
  const matches: Array<{ index: number; fullMatch: string; number: string; name: string }> = [];
  
  while ((match = activityPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      number: match[1],
      name: match[2].trim()
    });
  }
  
  // If no sub-activities found, return empty (will render as single section)
  if (matches.length === 0) {
    return [];
  }
  
  // Extract content for each activity
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.fullMatch.length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index : content.length;
    
    const activityContent = content.slice(startIndex, endIndex).trim();
    
    activities.push({
      id: `hinh_thanh_kien_thuc_${current.number}`,
      title: `Hoạt động 2.${current.number}: ${current.name}`,
      content: activityContent
    });
  }
  
  return activities;
};

// ============== RICH TEXT EDITOR COMPONENT ==============
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onSave, onCancel }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Convert markdown to HTML for editing
  const markdownToHtml = (md: string): string => {
    let html = md
      // Headers - xử lý từ nhiều # đến ít #
      .replace(/^#{4,}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic (nhưng không match ** đã xử lý)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // Underline (custom)
      .replace(/__(.+?)__/g, '<u>$1</u>')
      // Ordered lists (1. 2. 3. etc) - có thể có khoảng trắng đầu dòng
      .replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1<oli>$2</oli>')
      // Unordered lists - có thể có khoảng trắng đầu dòng
      .replace(/^(\s*)[-•]\s*(.+)$/gm, '$1<uli>$2</uli>');
    
    // Xử lý nested lists trước khi wrap
    // Convert indented oli/uli thành nested structure
    const processNestedLists = (text: string): string => {
      const lines = text.split('\n');
      const result: string[] = [];
      
      for (const line of lines) {
        // Check indent level
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        
        if (line.includes('<oli>') || line.includes('<uli>')) {
          // Remove leading spaces from the tag
          const cleanLine = line.trim();
          if (indent >= 2) {
            // Nested item - thêm marker để xử lý sau
            result.push(`{{INDENT${Math.floor(indent/2)}}}${cleanLine}`);
          } else {
            result.push(cleanLine);
          }
        } else {
          result.push(line);
        }
      }
      
      return result.join('\n');
    };
    
    html = processNestedLists(html);
    
    // Line breaks
    html = html
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<') && !html.startsWith('{{')) {
      html = `<p>${html}</p>`;
    }
    
    // Wrap consecutive oli elements in ol
    html = html.replace(/(<oli>.*?<\/oli>(?:<br>)?)+/gs, (match) => {
      const items = match.replace(/<br>/g, '').replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');
      return `<ol>${items}</ol>`;
    });
    
    // Wrap consecutive uli elements in ul
    html = html.replace(/(<uli>.*?<\/uli>(?:<br>)?)+/gs, (match) => {
      const items = match.replace(/<br>/g, '').replace(/<uli>/g, '<li>').replace(/<\/uli>/g, '</li>');
      return `<ul>${items}</ul>`;
    });
    
    // Handle nested items with indent markers
    html = html.replace(/\{\{INDENT(\d+)\}\}<li>/g, '<li class="ml-$1">');
    
    // Clean up any remaining markers
    html = html.replace(/\{\{INDENT\d+\}\}/g, '');
    
    return html;
  };

  // Convert HTML back to markdown
  const htmlToMarkdown = (html: string): string => {
    // Đánh dấu ol và ul trước khi xử lý
    let md = html
      // Đánh dấu ordered list items
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `{{OL${counter++}}}$1{{/OL}}`);
      })
      // Đánh dấu unordered list items  
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '{{UL}}$1{{/UL}}');
      });
    
    md = md
      // Headers - từ nhỏ đến lớn
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      // Bold
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Italic
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      // Underline
      .replace(/<u>(.*?)<\/u>/gi, '__$1__')
      // Convert markers back to markdown
      .replace(/\{\{OL(\d+)\}\}(.*?)\{\{\/OL\}\}/gi, '$1. $2\n')
      .replace(/\{\{UL\}\}(.*?)\{\{\/UL\}\}/gi, '- $1\n')
      // Fallback for any remaining list items
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      // Paragraphs and line breaks
      .replace(/<\/p><p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      // Remove other HTML tags
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      // Clean up whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return md;
  };

  // Initialize editor content only once
  React.useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = markdownToHtml(content);
      initializedRef.current = true;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Get current content from editor
  const getCurrentContent = (): string => {
    if (editorRef.current) {
      return htmlToMarkdown(editorRef.current.innerHTML);
    }
    return content;
  };

  // Handle save - get content from DOM directly
  const handleSave = () => {
    const newContent = getCurrentContent();
    onChange(newContent);
    onSave();
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ElementType;
    title: string;
  }> = ({ onClick, icon: Icon, title }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar - Giống Word */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Hoàn tác (Ctrl+Z)" />
        <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Làm lại (Ctrl+Y)" />
        
        <ToolbarDivider />
        
        {/* Text formatting */}
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="In đậm (Ctrl+B)" />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="In nghiêng (Ctrl+I)" />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Gạch chân (Ctrl+U)" />
        
        <ToolbarDivider />
        
        {/* Headers */}
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h1')} icon={Heading1} title="Tiêu đề 1" />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')} icon={Heading2} title="Tiêu đề 2" />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')} icon={Heading3} title="Tiêu đề 3" />
        
        <ToolbarDivider />
        
        {/* Lists */}
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Danh sách" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Danh sách đánh số" />
        
        <ToolbarDivider />
        
        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Căn trái" />
        <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Căn giữa" />
        <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Căn phải" />
      </div>
      
      {/* Editor content - Uncontrolled để tránh lag */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 focus:outline-none text-gray-900 dark:text-gray-100
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
          [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-blue-700 [&_h4]:dark:text-blue-400
          [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2
          [&_ul_ul]:list-[circle] [&_ul_ul]:ml-5
          [&_ul_ul_ul]:list-square [&_ul_ul_ul]:ml-5
          [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2
          [&_ol_ol]:list-[lower-alpha] [&_ol_ol]:ml-5
          [&_ol_ol_ol]:list-[lower-roman] [&_ol_ol_ol]:ml-5
          [&_li]:my-1 [&_li.ml-1]:ml-4 [&_li.ml-2]:ml-8 [&_li.ml-3]:ml-12
          [&_p]:my-2
          [&_strong]:font-bold
          [&_em]:italic
          [&_u]:underline
        "
        style={{ minHeight: '300px' }}
      />
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 border border-gray-300 dark:border-gray-500"
        >
          <X className="w-4 h-4" />
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 shadow-sm"
        >
          <Check className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

// ============== HELPER: Tìm phụ lục liên quan ==============
const findRelatedAppendices = (
  content: string,
  allSections: LessonPlanSection[]
): RelatedAppendix[] => {
  const appendices: RelatedAppendix[] = [];
  
  // Tìm các phiếu học tập được đề cập
  const phtMatches = content.match(/Phiếu\s*học\s*tập\s*(số)?\s*(\d+)/gi);
  if (phtMatches) {
    const phtSection = allSections.find(s => s.section_type === "phieu_hoc_tap");
    if (phtSection) {
      appendices.push({
        section_id: phtSection.section_id,
        section_type: phtSection.section_type,
        title: phtSection.title,
        content: phtSection.content
      });
    }
  }
  
  // Tìm các câu hỏi trắc nghiệm được đề cập
  const tnMatches = content.match(/trắc\s*nghiệm|câu\s*hỏi\s*kiểm\s*tra/gi);
  if (tnMatches) {
    const tnSection = allSections.find(s => s.section_type === "trac_nghiem");
    if (tnSection) {
      appendices.push({
        section_id: tnSection.section_id,
        section_type: tnSection.section_type,
        title: tnSection.title,
        content: tnSection.content
      });
    }
  }
  
  return appendices;
};

// ============== SECTION CARD COMPONENT ==============
interface SectionCardProps {
  section: LessonPlanSection;
  onUpdate: (newContent: string) => void;
  defaultExpanded?: boolean;
  lessonInfo?: { book_type?: string; grade?: string; topic?: string; lesson_name?: string };
  allSections?: LessonPlanSection[];
  onUpdateMultiple?: (updates: { sectionId: string; content: string }[]) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  onUpdate, 
  defaultExpanded = true, 
  lessonInfo,
  allSections = [],
  onUpdateMultiple
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  
  // AI enhancement states
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiRequest, setAiRequest] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  
  // Share worksheet states
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ url: string; code: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  
  // Share code exercise states
  const [showCodeExerciseModal, setShowCodeExerciseModal] = useState(false);

  const Icon = SECTION_ICONS[section.section_type] || FileText;
  const colors = SECTION_COLORS[section.section_type] || SECTION_COLORS.full;
  const aiPrompts = AI_PROMPTS[section.section_type];
  
  // Chỉ hiển thị nút AI cho các section từ khởi động trở xuống
  const showAIButton = ['khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung', 'muc_tieu', 'thiet_bi'].includes(section.section_type);
  
  // Hiển thị nút chia sẻ cho phiếu học tập và trắc nghiệm
  const showShareButton = section.section_type === 'phieu_hoc_tap' || section.section_type === 'trac_nghiem';
  const isQuizShare = section.section_type === 'trac_nghiem';
  
  // Hiển thị nút chia sẻ bài tập code nếu section có code_exercises (được sinh tự động từ LLM)
  const hasCodeExercises = section.code_exercises && section.code_exercises.length > 0;
  
  // Tìm phụ lục liên quan dựa trên nội dung
  const relatedAppendices = findRelatedAppendices(section.content, allSections);
  const hasRelatedAppendices = relatedAppendices.length > 0;

  const handleSave = () => {
    onUpdate(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(section.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Xử lý chia sẻ phiếu học tập hoặc trắc nghiệm
  const handleShare = async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      if (isQuizShare) {
        // Share trắc nghiệm - gửi questions array nếu có
        const result = await createSharedQuiz({
          title: lessonInfo?.lesson_name ? `Trắc nghiệm: ${lessonInfo.lesson_name}` : section.title || "Bài trắc nghiệm",
          description: `${lessonInfo?.topic || ''} - ${lessonInfo?.grade || ''} - ${lessonInfo?.book_type || ''}`.trim(),
          content: section.content,
          questions: section.questions, // Gửi questions array trực tiếp
          show_correct_answers: true,
          allow_multiple_attempts: true,
        });
        setShareResult({
          url: result.share_url,
          code: result.share_code,
        });
      } else {
        // Share phiếu học tập
        const result = await createSharedWorksheet({
          title: section.title || "Phiếu học tập",
          content: section.content,
          lesson_info: lessonInfo,
        });
        setShareResult({
          url: result.share_url,
          code: result.share_code,
        });
      }
    } catch (error: any) {
      console.error("Share failed:", error);
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
  
  const handleAIImprove = async (request: string) => {
    if (!request.trim()) return;
    
    setIsAILoading(true);
    try {
      // Gửi kèm phụ lục liên quan nếu có
      const result = await improveWithAI(
        section.section_type,
        section.title,
        section.content,
        request,
        lessonInfo,
        hasRelatedAppendices ? relatedAppendices : undefined
      );
      
      // Cập nhật nội dung section chính
      setEditContent(result.improved_content);
      onUpdate(result.improved_content);
      
      // Cập nhật các phụ lục liên quan nếu có
      if (result.updated_appendices && result.updated_appendices.length > 0 && onUpdateMultiple) {
        const updates = result.updated_appendices.map(ua => ({
          sectionId: ua.section_id,
          content: ua.improved_content
        }));
        onUpdateMultiple(updates);
      }
      
      setShowAIDialog(false);
      setAiRequest("");
    } catch (error) {
      console.error("AI improvement failed:", error);
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div
      className={`border-l-4 ${colors.border} ${colors.bg} border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative`}
    >
      {/* AI Dialog Overlay */}
      {showAIDialog && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {aiPrompts?.title || "Cải thiện với AI"}
              </h3>
            </div>
            
            {/* Thông báo phụ lục liên quan */}
            {hasRelatedAppendices && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Phụ lục liên quan sẽ được cập nhật:</p>
                    <ul className="mt-1 list-disc list-inside">
                      {relatedAppendices.map((ap) => (
                        <li key={ap.section_id}>{ap.title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Gợi ý nhanh */}
            {aiPrompts?.suggestions && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Gợi ý nhanh:</p>
                <div className="flex flex-wrap gap-2">
                  {aiPrompts.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiRequest(suggestion)}
                      className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <textarea
              value={aiRequest}
              onChange={(e) => setAiRequest(e.target.value)}
              placeholder="Nhập yêu cầu cải thiện của bạn..."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500"
            />
            
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAIDialog(false);
                  setAiRequest("");
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isAILoading}
              >
                Hủy
              </button>
              <button
                onClick={() => handleAIImprove(aiRequest)}
                disabled={!aiRequest.trim() || isAILoading}
                className="px-4 py-2 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Cải thiện
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-white dark:bg-gray-800 shadow-sm`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {section.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Nút Chia sẻ bài tập Code - hiển thị khi có code_exercises từ LLM */}
          {hasCodeExercises && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCodeExerciseModal(true);
              }}
              className="p-2 transition-colors shadow-sm text-emerald-500 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              title={`Chia sẻ ${section.code_exercises!.length} bài tập code cho học sinh`}
            >
              <Code className="w-4 h-4" />
            </button>
          )}
          {/* Nút Chia sẻ - cho phiếu học tập và trắc nghiệm */}
          {showShareButton && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareDialog(true);
              }}
              className={`p-2 transition-colors shadow-sm ${
                isQuizShare 
                  ? 'text-purple-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30' 
                  : 'text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
              }`}
              title={isQuizShare ? "Chia sẻ bài trắc nghiệm" : "Chia sẻ cho học sinh"}
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          {/* Nút AI */}
          {showAIButton && section.editable && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAIDialog(true);
                setIsExpanded(true);
              }}
              className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors shadow-sm"
              title="Cải thiện với AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          {section.editable && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsExpanded(true);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Sao chép"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2">
          {isEditing ? (
            <RichTextEditor
              content={editContent}
              onChange={setEditContent}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
              <div className="lesson-plan-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom table component for Công văn 5512 format
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="w-full border-collapse border border-gray-400 dark:border-gray-500 text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-blue-100 dark:bg-blue-900/40">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-400 dark:border-gray-500 px-3 py-2 text-left font-bold text-gray-900 dark:text-white">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-400 dark:border-gray-500 px-3 py-2 text-gray-700 dark:text-gray-300 align-top">
                        {children}
                      </td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">{children}</tr>
                    ),
                    // Headers
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b-2 border-blue-500">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-base font-semibold text-blue-700 dark:text-blue-400 mt-4 mb-2">{children}</h4>
                    ),
                    // Paragraphs & text
                    p: ({ children }) => (
                      <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
                    ),
                    // Lists - CSS sẽ xử lý nested list styles
                    ul: ({ children }) => (
                      <ul className="list-disc space-y-1 text-gray-700 dark:text-gray-300 mb-3 ml-5 [&_ul]:list-[circle] [&_ul]:ml-5 [&_ul_ul]:list-square">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal space-y-1 text-gray-700 dark:text-gray-300 mb-3 ml-5 [&_ol]:list-[lower-alpha] [&_ol]:ml-5 [&_ol_ol]:list-[lower-roman]">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    // Horizontal rule
                    hr: () => (
                      <hr className="my-4 border-gray-300 dark:border-gray-600" />
                    ),
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Share Dialog */}
      {showShareDialog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={() => {
            setShowShareDialog(false);
            setShareResult(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 text-white bg-blue-600 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6" />
                <h3 className="text-lg font-semibold">
                  {isQuizShare ? 'Chia sẻ Bài trắc nghiệm' : 'Chia sẻ Phiếu học tập'}
                </h3>
              </div>
              <p className="text-sm mt-1 text-blue-100">
                {isQuizShare ? 'Tạo link để học sinh làm bài trắc nghiệm online' : 'Tạo link để học sinh làm bài trực tuyến'}
              </p>
            </div>
            
            <div className="p-5">
              {shareError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{shareError}</p>
                </div>
              )}
              
              {!shareResult ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isQuizShare ? 'Khi chia sẻ, học sinh có thể:' : 'Khi chia sẻ, học sinh có thể:'}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                      {isQuizShare ? (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Làm bài trắc nghiệm trực tuyến
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Xem điểm ngay sau khi nộp bài
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Xem đáp án đúng (nếu được phép)
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Xem nội dung phiếu học tập
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Điền câu trả lời trực tuyến
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Nộp bài cho giáo viên
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowShareDialog(false);
                        setShareError(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      disabled={isSharing}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="px-4 py-2 text-sm text-white flex items-center gap-2 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      {isSharing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tạo link...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Tạo link chia sẻ
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-3 text-blue-600 dark:text-blue-400">
                      ✓ Link chia sẻ đã được tạo!
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Link chia sẻ:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={shareResult.url}
                          readOnly
                          className="flex-1 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200"
                        />
                        <button
                          onClick={handleCopyShareLink}
                          className="p-2 text-white rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
                          title="Sao chép link"
                        >
                          {shareCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mã chia sẻ:</label>
                      <p className="text-lg font-mono font-bold text-gray-800 dark:text-gray-100">{shareResult.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <a
                      href={shareResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isQuizShare ? 'Mở trang trắc nghiệm' : 'Mở trang chia sẻ'}
                    </a>
                    <button
                      onClick={() => {
                        setShowShareDialog(false);
                        setShareResult(null);
                        setShareError(null);
                      }}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Code Exercise Share Modal */}
      {hasCodeExercises && (
        <ShareCodeExerciseModal
          isOpen={showCodeExerciseModal}
          onClose={() => setShowCodeExerciseModal(false)}
          exercises={section.code_exercises!}
          lessonTitle={lessonInfo?.lesson_name}
        />
      )}
    </div>
  );
};

export const LessonPlanOutput: React.FC<LessonPlanOutputProps> = ({
  result,
  onSectionUpdate,
  onExportPDF,
  activities,
}) => {
  const [sections, setSections] = useState<LessonPlanSection[]>(result.sections);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSectionUpdate = (sectionId: string, newContent: string) => {
    const updatedSections = sections.map((s) =>
      s.section_id === sectionId ? { ...s, content: newContent } : s
    );
    setSections(updatedSections);
    onSectionUpdate(sectionId, newContent);
  };

  // Cập nhật nhiều sections cùng lúc (cho phụ lục liên quan)
  const handleMultipleSectionUpdate = (updates: { sectionId: string; content: string }[]) => {
    const updatedSections = sections.map((s) => {
      const update = updates.find(u => u.sectionId === s.section_id);
      if (update) {
        return { ...s, content: update.content };
      }
      return s;
    });
    setSections(updatedSections);
    updates.forEach(update => {
      onSectionUpdate(update.sectionId, update.content);
    });
  };

  const handleExportPDF = () => {
    // Combine all sections markdown content
    const fullContent = sections
      .map((s) => {
        // Chỉ truyền markdown content, không wrap HTML
        return `## ${s.title}\n\n${s.content}\n\n`;
      })
      .join("\n---\n\n");
    
    exportToPDF(fullContent, `KHBD_${result.lesson_info.lesson_name}`, result.lesson_info);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const fullContent = sections
        .map((s) => `## ${s.title}\n\n${s.content}\n\n`)
        .join("\n---\n\n");
      
      const response = await saveLessonPlan({
        title: `KHBD - ${result.lesson_info.lesson_name}`,
        lesson_info: result.lesson_info,
        sections: sections,
        full_content: fullContent,
        activities: activities,
        is_printed: false,
      });
      
      setSaveMessage({ type: "success", text: response.message });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({ 
        type: "error", 
        text: error.response?.data?.detail || "Lỗi khi lưu giáo án" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Group sections for better display
  const getDefaultExpanded = (sectionType: string) => {
    // Mặc định mở rộng các section chính, thu gọn phụ lục
    return !["phieu_hoc_tap", "trac_nghiem"].includes(sectionType);
  };

  return (
    <div className="space-y-6">
      {/* Header - Đơn giản với màu xanh dương đồng bộ */}
      <div className="bg-blue-600 dark:bg-blue-700 p-4 shadow-md rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Kế hoạch bài dạy
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              {result.lesson_info.lesson_name} • Lớp {result.lesson_info.grade} •{" "}
              {result.lesson_info.book_type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md flex items-center gap-1.5 transition-colors text-sm font-medium disabled:opacity-50 border border-white/30"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Đang lưu..." : "Lưu giáo án"}
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-1.5 transition-colors text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Xuất PDF
            </button>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 flex items-center gap-3 ${
          saveMessage.type === "success" 
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}>
          {saveMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <X className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">Hướng dẫn chỉnh sửa:</p>
          <p className="mt-1">Nhấn vào nút <Edit2 className="w-3.5 h-3.5 inline mx-1" /> ở mỗi ô để chỉnh sửa nội dung. Sau khi chỉnh sửa xong, nhấn "Lưu giáo án" để lưu lại và "Xuất PDF" để tải về.</p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-4">
        {(() => {
          // Tách các sections thành nhóm
          const mainSections = sections.filter(
            (s) => !["thong_tin_chung", "phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
          );
          const appendixSections = sections.filter(
            (s) => ["phieu_hoc_tap", "trac_nghiem"].includes(s.section_type)
          );

          return (
            <>
              {/* Render các sections chính */}
              {mainSections.map((section) => {
                // Hình thành kiến thức: Box lớn bao bọc các hoạt động con
                if (section.section_type === "hinh_thanh_kien_thuc") {
                  const subActivities = splitHinhThanhKienThuc(section.content);
                  const Icon = SECTION_ICONS[section.section_type] || FileText;
                  const colors = SECTION_COLORS[section.section_type] || SECTION_COLORS.full;
                  
                  if (subActivities.length > 0) {
                    return (
                      <div 
                        key={section.section_id}
                        className={`bg-white dark:bg-gray-800 border-l-4 ${colors.border} border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden`}
                      >
                        {/* Header của box lớn */}
                        <div className={`${colors.bg} px-4 py-3 border-b border-gray-200 dark:border-gray-700`}>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${colors.icon}`} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Hoạt động 2: Hình thành kiến thức mới
                            </h3>
                          </div>
                        </div>
                        
                        {/* Các hoạt động con bên trong */}
                        <div className="p-4 space-y-4">
                          {subActivities.map((subActivity) => (
                            <SectionCard
                              key={subActivity.id}
                              section={{
                                section_id: subActivity.id,
                                section_type: "hinh_thanh_kien_thuc",
                                title: subActivity.title,
                                content: subActivity.content,
                                editable: true,
                              }}
                              onUpdate={(content) => {
                                const allSubActivities = splitHinhThanhKienThuc(section.content);
                                const updatedSubActivities = allSubActivities.map((sa) =>
                                  sa.id === subActivity.id ? { ...sa, content } : sa
                                );
                                const newFullContent = updatedSubActivities
                                  .map((sa) => `**${sa.title}**\n\n${sa.content}`)
                                  .join("\n\n");
                                handleSectionUpdate(section.section_id, newFullContent);
                              }}
                              defaultExpanded={true}
                              allSections={sections}
                              onUpdateMultiple={handleMultipleSectionUpdate}
                              lessonInfo={result.lesson_info}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Các section khác render bình thường
                return (
                  <SectionCard
                    key={section.section_id}
                    section={section}
                    onUpdate={(content) => handleSectionUpdate(section.section_id, content)}
                    defaultExpanded={getDefaultExpanded(section.section_type)}
                    allSections={sections}
                    onUpdateMultiple={handleMultipleSectionUpdate}
                    lessonInfo={result.lesson_info}
                  />
                );
              })}

              {/* Box Phụ lục bao bọc Phiếu học tập và Trắc nghiệm */}
              {appendixSections.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  {/* Header của box Phụ lục */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Phụ lục
                      </h3>
                    </div>
                  </div>
                  
                  {/* Các phụ lục bên trong */}
                  <div className="p-4 space-y-4">
                    {appendixSections.map((section) => {
                      // Bỏ "Phụ lục: " khỏi tiêu đề để tránh lặp
                      const cleanTitle = section.title.replace(/^Phụ lục:\s*/i, "");
                      return (
                        <SectionCard
                          key={section.section_id}
                          section={{
                            ...section,
                            title: cleanTitle
                          }}
                          onUpdate={(content) => handleSectionUpdate(section.section_id, content)}
                          defaultExpanded={false}
                          allSections={sections}
                          onUpdateMultiple={handleMultipleSectionUpdate}
                          lessonInfo={result.lesson_info}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default LessonPlanOutput;
