import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 sm:px-6 py-3 sm:py-6 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                Bắt đầu cuộc trò chuyện
              </h2>
              <p className="text-sm max-w-md mx-auto leading-relaxed">
                Gửi một tin nhắn để bắt đầu trò chuyện với AI trợ lý giáo án Tin Học
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Check if this is the last assistant message and isLoading
              const isLastMessage = index === messages.length - 1;
              const isLoadingMessage = isLastMessage && isLoading && message.role === "assistant";
              
              return (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLoading={isLoadingMessage}
                />
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
