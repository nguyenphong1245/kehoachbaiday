import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { User, Bot, Copy, Check, Loader2 } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const [isCopied, setIsCopied] = useState(false);

  // Xử lý nội dung markdown để loại bỏ trùng lặp CHỦ ĐỀ/BÀI
  const cleanMarkdownContent = (content: string): string => {
    let cleaned = content;
    // "**CHỦ ĐỀ:** Chủ đề 1. ABC" -> "**CHỦ ĐỀ 1:** ABC"
    cleaned = cleaned.replace(/\*\*CHỦ ĐỀ:\*\*\s*Chủ đề\s*(\d+)[\.\:]\s*/gi, '**CHỦ ĐỀ $1:** ');
    cleaned = cleaned.replace(/\*\*BÀI:\*\*\s*Bài\s*(\d+)[\.\:]\s*/gi, '**BÀI $1:** ');
    // Xử lý trường hợp không có dấu **
    cleaned = cleaned.replace(/CHỦ ĐỀ:\s*Chủ đề\s*(\d+)[\.\:]\s*/gi, '**CHỦ ĐỀ $1:** ');
    cleaned = cleaned.replace(/BÀI:\s*Bài\s*(\d+)[\.\:]\s*/gi, '**BÀI $1:** ');
    
    // Chuyển các dòng chấm thành đường kẻ CSS đều nhau
    // Match lines that are mostly dots (10+ dots)
    cleaned = cleaned.replace(/^(\.{10,})$/gm, '<div class="worksheet-line"></div>');
    cleaned = cleaned.replace(/\n(\.{10,})\n/g, '\n<div class="worksheet-line"></div>\n');
    
    return cleaned;
  };

  // Format time in Vietnamese style
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffHours > 0) {
      return `${diffHours}h trước`;
    } else {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="mb-6 animate-fade-in group">
      {/* User Message */}
      {isUser ? (
        <div className="flex justify-end mb-2">
          <div className="max-w-[85%] sm:max-w-[70%] px-4 py-3 bg-sky-100 dark:bg-sky-900/40 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tr-sm">
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className="mt-1.5 text-right">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatTime(message.created_at)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Assistant Message - Gemini style */
        <div className="flex flex-col">
          {/* Avatar + Icon row */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isLoading ? 'bg-sky-500 animate-pulse' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="pl-0 sm:pl-9 overflow-x-auto">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200
                prose-p:my-2 prose-p:leading-relaxed prose-p:text-[15px]
                prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                prose-h1:text-lg prose-h2:text-base prose-h3:text-[15px]
                prose-li:my-1 prose-li:text-[15px]
                prose-ul:my-2 prose-ol:my-2
                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 prose-pre:my-3 prose-pre:text-sm prose-pre:rounded-lg
                prose-code:text-sky-600 dark:prose-code:text-sky-400 prose-code:text-[13px] prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-table:text-sm prose-table:my-3
                prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-2 prose-th:py-1.5 prose-th:text-xs prose-th:whitespace-nowrap
                prose-td:px-2 prose-td:py-1.5 prose-td:text-xs prose-td:whitespace-nowrap prose-td:border-gray-200 dark:prose-td:border-gray-700
                [&_table]:border [&_table]:border-gray-200 dark:[&_table]:border-gray-700 [&_table]:rounded-lg [&_table]:overflow-x-auto [&_table]:block [&_table]:w-max [&_table]:max-w-full
                [&_pre]:overflow-x-auto [&_pre]:max-w-full
                [&_p]:whitespace-pre-wrap"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-2">
                  <span className="text-sm">Đang soạn...</span>
                </div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                >
                  {cleanMarkdownContent(message.content)}
                </ReactMarkdown>
              )}
            </div>
            
            {/* Timestamp and Actions */}
            {!isLoading && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {formatTime(message.created_at)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Sao chép"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
