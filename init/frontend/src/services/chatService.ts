import { api } from "./authService";
import type {
  ChatConversation,
  ChatConversationListItem,
  ChatMessage,
  ChatResponse,
  CreateConversationPayload,
  SendMessagePayload,
  UpdateConversationPayload,
} from "@/types/chat";

/**
 * Create a new chat conversation with the first message
 */
export const createConversation = async (
  payload: CreateConversationPayload
): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>("/chat/conversations", payload);
  return data;
};

/**
 * Get list of all conversations
 */
export const listConversations = async (
  includeArchived: boolean = false
): Promise<ChatConversationListItem[]> => {
  const { data } = await api.get<ChatConversationListItem[]>("/chat/conversations", {
    params: { include_archived: includeArchived },
  });
  return data;
};

/**
 * Get a specific conversation with all messages
 */
export const getConversation = async (
  conversationId: string
): Promise<ChatConversation> => {
  const { data } = await api.get<ChatConversation>(
    `/chat/conversations/${conversationId}`
  );
  return data;
};

/**
 * Send a message in an existing conversation
 */
export const sendMessage = async (
  conversationId: string,
  payload: SendMessagePayload
): Promise<ChatMessage> => {
  const { data } = await api.post<ChatMessage>(
    `/chat/conversations/${conversationId}/messages`,
    payload
  );
  return data;
};

/**
 * Update conversation (title, archive status)
 */
export const updateConversation = async (
  conversationId: string,
  payload: UpdateConversationPayload
): Promise<ChatConversation> => {
  const { data } = await api.patch<ChatConversation>(
    `/chat/conversations/${conversationId}`,
    payload
  );
  return data;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  await api.delete(`/chat/conversations/${conversationId}`);
};
