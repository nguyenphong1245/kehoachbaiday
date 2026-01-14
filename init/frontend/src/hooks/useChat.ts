import { useState, useEffect, useCallback } from "react";
import {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  updateConversation,
  deleteConversation,
} from "@/services/chatService";
import type {
  ChatConversation,
  ChatConversationListItem,
  ChatMessage,
  CreateConversationPayload,
  SendMessagePayload,
  UpdateConversationPayload,
} from "@/types/chat";

interface UseChatReturn {
  // State
  conversations: ChatConversationListItem[];
  currentConversation: ChatConversation | null;
  isLoading: boolean;
  error: string | null;
  isSending: boolean;

  // Actions
  loadConversations: (includeArchived?: boolean) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  startNewConversation: (firstMessage: string, title?: string) => Promise<string>;
  sendNewMessage: (conversationId: string, content: string) => Promise<void>;
  updateConversationDetails: (
    conversationId: string,
    updates: UpdateConversationPayload
  ) => Promise<void>;
  removeConversation: (conversationId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentConversation: () => void;
}

export const useChat = (): UseChatReturn => {
  const [conversations, setConversations] = useState<ChatConversationListItem[]>(
    []
  );
  const [currentConversation, setCurrentConversation] =
    useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all conversations
  const loadConversations = useCallback(
    async (includeArchived: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listConversations(includeArchived);
        setConversations(data);
      } catch (err: any) {
        // Không hiện lỗi nếu là 401 vì đã được xử lý bởi interceptor
        if (err.response?.status !== 401) {
          setError(
            err.response?.data?.detail || "Không thể tải danh sách cuộc trò chuyện"
          );
        }
        console.error("Error loading conversations:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load a specific conversation
  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversation(conversationId);
      setCurrentConversation(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load conversation");
      console.error("Error loading conversation:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a new conversation
  const startNewConversation = useCallback(
    async (firstMessage: string, title?: string): Promise<string> => {
      setIsSending(true);
      setError(null);

      // Create a temporary conversation with the user's message (Optimistic UI)
      const tempUserId = `temp-user-${Date.now()}`;
      const tempAiId = `temp-ai-${Date.now()}`;
      const tempConversation: ChatConversation = {
        id: `temp-conv-${Date.now()}`,
        user_id: "",
        title: title || "Cuộc trò chuyện mới",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
        messages: [
          {
            id: tempUserId,
            conversation_id: "",
            role: "user" as const,
            content: firstMessage,
            created_at: new Date().toISOString(),
          },
          {
            id: tempAiId,
            conversation_id: "",
            role: "assistant" as const,
            content: "⏳ Đang soạn giáo án...",
            created_at: new Date().toISOString(),
          },
        ],
      };

      // Immediately show the user's message and loading indicator
      setCurrentConversation(tempConversation);

      try {
        const payload: CreateConversationPayload = {
          first_message: firstMessage,
          title,
        };
        const response = await createConversation(payload);
        setCurrentConversation(response.conversation);

        // Refresh conversation list
        await loadConversations();

        return response.conversation.id;
      } catch (err: any) {
        // Xử lý lỗi cụ thể hơn
        let errorMsg = "Không thể tạo cuộc trò chuyện";
        
        if (err.response?.status === 401) {
          errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (err.response?.status === 500) {
          errorMsg = "Lỗi máy chủ. Vui lòng thử lại sau.";
        } else if (err.response?.data?.detail) {
          errorMsg = err.response.data.detail;
        }
        
        setError(errorMsg);
        console.error("Error creating conversation:", err);

        // Clear temporary conversation on error (Optimistic UI rollback)
        setCurrentConversation(null);

        throw new Error(errorMsg);
      } finally {
        setIsSending(false);
      }
    },
    [loadConversations]
  );

  // Send a message in existing conversation
  const sendNewMessage = useCallback(
    async (conversationId: string, content: string) => {
      setIsSending(true);
      setError(null);

      // Immediately add user message to UI (Optimistic UI)
      const tempUserId = `temp-user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: tempUserId,
        conversation_id: conversationId,
        role: "user" as const,
        content,
        created_at: new Date().toISOString(),
      };

      // Add AI loading message
      const tempAiId = `temp-ai-${Date.now()}`;
      const loadingAiMessage: ChatMessage = {
        id: tempAiId,
        conversation_id: conversationId,
        role: "assistant" as const,
        content: "⏳ Đang soạn giáo án...",
        created_at: new Date().toISOString(),
      };

      if (currentConversation?.id === conversationId) {
        setCurrentConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, userMessage, loadingAiMessage],
          };
        });
      }

      try {
        const payload: SendMessagePayload = { content };
        const aiMessage = await sendMessage(conversationId, payload);

        // Update current conversation with AI response
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) => {
            if (!prev) return prev;
            // Replace temp messages with real ones
            const messagesWithoutTemp = prev.messages.filter(
              (msg) => msg.id !== tempUserId && msg.id !== tempAiId
            );
            return {
              ...prev,
              messages: [
                ...messagesWithoutTemp,
                // Add user message (confirmed from server)
                {
                  ...userMessage,
                  id: `user-${Date.now()}`,
                },
                // Add AI response
                aiMessage,
              ],
            };
          });
        }

        // Refresh conversation list to update timestamps
        await loadConversations();
      } catch (err: any) {
        const errorMsg = err.response?.data?.detail || "Failed to send message";
        setError(errorMsg);
        console.error("Error sending message:", err);

        // Remove temporary messages on error (Optimistic UI rollback)
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.filter(
                (msg) => !msg.id.startsWith('temp-')
              ),
            };
          });
        }

        throw new Error(errorMsg);
      } finally {
        setIsSending(false);
      }
    },
    [currentConversation, loadConversations]
  );

  // Update conversation details
  const updateConversationDetails = useCallback(
    async (conversationId: string, updates: UpdateConversationPayload) => {
      setError(null);
      try {
        const updated = await updateConversation(conversationId, updates);

        // Update current conversation if it's the one being updated
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(updated);
        }

        // Refresh conversation list
        await loadConversations();
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail || "Failed to update conversation";
        setError(errorMsg);
        console.error("Error updating conversation:", err);
        throw new Error(errorMsg);
      }
    },
    [currentConversation, loadConversations]
  );

  // Delete conversation
  const removeConversation = useCallback(
    async (conversationId: string) => {
      setError(null);
      try {
        await deleteConversation(conversationId);

        // Clear current conversation if it was deleted
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }

        // Refresh conversation list
        await loadConversations();
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.detail || "Failed to delete conversation";
        setError(errorMsg);
        console.error("Error deleting conversation:", err);
        throw new Error(errorMsg);
      }
    },
    [currentConversation, loadConversations]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    isSending,
    loadConversations,
    loadConversation,
    startNewConversation,
    sendNewMessage,
    updateConversationDetails,
    removeConversation,
    clearError,
    clearCurrentConversation,
  };
};
