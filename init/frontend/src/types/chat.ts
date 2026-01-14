export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: number;
  title: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatConversationListItem {
  id: string;
  title: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
}

export interface CreateConversationPayload {
  title?: string;
  first_message: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface UpdateConversationPayload {
  title?: string;
  is_archived?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  conversation: ChatConversation;
}
