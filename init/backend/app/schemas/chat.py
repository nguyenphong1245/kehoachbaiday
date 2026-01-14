from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


# Chat Message Schemas
class ChatMessageBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=100000)
    role: MessageRole


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=100000)


class ChatMessageRead(ChatMessageBase):
    id: str
    conversation_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Chat Conversation Schemas
class ChatConversationBase(BaseModel):
    title: Optional[str] = None
    is_archived: bool = False


class ChatConversationCreate(BaseModel):
    title: Optional[str] = None
    first_message: str = Field(..., min_length=1, max_length=100000)


class ChatConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None


class ChatConversationRead(ChatConversationBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageRead] = []

    model_config = {"from_attributes": True}


class ChatConversationListItem(BaseModel):
    id: str
    title: Optional[str] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message_preview: Optional[str] = None

    model_config = {"from_attributes": True}


# Response models
class ChatResponse(BaseModel):
    message: ChatMessageRead
    conversation: ChatConversationRead
