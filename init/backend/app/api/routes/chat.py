from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List

from app.api.deps import get_current_user
from app.core.logging import logger
from app.db.session import get_db
from app.models.user import User
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage, MessageRole
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationRead,
    ChatConversationListItem,
    ChatConversationUpdate,
    ChatMessageCreate,
    ChatMessageRead,
    ChatResponse,
)
from app.services.chat_ai import get_chat_ai_service
from app.models.document import Document

router = APIRouter()


@router.post("/conversations", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ChatConversationCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """Create a new conversation with the first message"""

    # Create conversation
    conversation = ChatConversation(
        user_id=current_user.id,
        title=payload.title,
    )
    session.add(conversation)
    await session.flush()

    # Add user's first message
    user_message = ChatMessage(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=payload.first_message,
    )
    session.add(user_message)
    await session.flush()

    # Generate AI response
    chat_ai = get_chat_ai_service()

    # Build message history for AI
    message_history = [
        {"role": "user", "content": payload.first_message}
    ]

    # Phân loại câu hỏi bằng pattern matching đơn giản
    is_lesson_plan_request = any(keyword in payload.first_message.lower() 
                                  for keyword in ['giáo án', 'soạn', 'kế hoạch bài dạy', 'khbd'])
    
    if is_lesson_plan_request:
        # FLOW MỚI: Sử dụng semantic integration service
        try:
            # Lấy tất cả tài liệu từ database
            stmt = select(Document)
            result = await session.execute(stmt)
            all_documents = result.scalars().all()
            
            # Format documents thành text
            # Format documents thành text
            documents_text = None
            if all_documents:
                documents_text = "\n\n--- TÀI LIỆU THAM KHẢO ---\n\n"
                for doc in all_documents:
                    documents_text += f"### {doc.title or 'Tài liệu'}\n"
                    if doc.content:
                        documents_text += f"{doc.content}\n\n"
            
            # Dùng chat AI với context từ documents
            ai_response_content = await chat_ai.generate_response(message_history)
            logger.info(f"✅ Generated response via chat AI")
        except Exception as e:
            logger.error(f"❌ Error in chat: {e}")
            # Fallback về chat AI thông thường
            ai_response_content = await chat_ai.generate_response(message_history)
    else:
        # Không phải câu hỏi về lesson plan → dùng chat AI
        ai_response_content = await chat_ai.generate_response(message_history)
        logger.info(f"ℹ️ General chat question, using chat AI")

    # Save AI response
    ai_message = ChatMessage(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=ai_response_content,
    )
    session.add(ai_message)

    # Generate title if not provided
    if not conversation.title:
        conversation.title = await chat_ai.generate_conversation_title(payload.first_message)

    await session.commit()

    # Reload with relationships
    await session.refresh(conversation, ["messages"])

    logger.info(
        "chat.conversation_created user_id=%s conversation_id=%s",
        current_user.id,
        conversation.id,
    )

    return ChatResponse(
        message=ai_message,
        conversation=conversation,
    )


@router.get("/conversations", response_model=List[ChatConversationListItem])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    include_archived: bool = False,
) -> List[ChatConversationListItem]:
    """List all conversations for current user"""

    query = select(ChatConversation).where(ChatConversation.user_id == current_user.id)

    if not include_archived:
        query = query.where(ChatConversation.is_archived == False)

    query = query.order_by(desc(ChatConversation.updated_at))

    result = await session.execute(query)
    conversations = result.scalars().all()

    # Build list items with message counts and previews
    conversation_list = []
    for conv in conversations:
        # Get message count
        count_query = select(func.count(ChatMessage.id)).where(
            ChatMessage.conversation_id == conv.id
        )
        count_result = await session.execute(count_query)
        message_count = count_result.scalar() or 0

        # Get last message preview
        last_msg_query = (
            select(ChatMessage.content)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(desc(ChatMessage.created_at))
            .limit(1)
        )
        last_msg_result = await session.execute(last_msg_query)
        last_msg = last_msg_result.scalar_one_or_none()
        last_msg_preview = last_msg[:100] if last_msg else None

        conversation_list.append(
            ChatConversationListItem(
                id=conv.id,
                title=conv.title,
                is_archived=conv.is_archived,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=message_count,
                last_message_preview=last_msg_preview,
            )
        )

    return conversation_list


@router.get("/conversations/{conversation_id}", response_model=ChatConversationRead)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatConversation:
    """Get a specific conversation with all messages"""

    query = (
        select(ChatConversation)
        .options(selectinload(ChatConversation.messages))
        .where(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
    )

    result = await session.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return conversation


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageRead)
async def send_message(
    conversation_id: str,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatMessage:
    """Send a message in an existing conversation"""

    # Verify conversation exists and belongs to user
    conv_query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    )
    conv_result = await session.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Add user message
    user_message = ChatMessage(
        conversation_id=conversation_id,
        role=MessageRole.user,
        content=payload.content,
    )
    session.add(user_message)
    await session.flush()

    # Get conversation history for context
    history_query = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at)
    )
    history_result = await session.execute(history_query)
    all_messages = history_result.scalars().all()

    # Build message history for AI
    message_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in all_messages
    ]

    # Generate AI response
    chat_ai = get_chat_ai_service()
    
    # Phân loại câu hỏi bằng pattern matching
    is_lesson_plan_request = any(keyword in payload.content.lower() 
                                  for keyword in ['giáo án', 'soạn', 'kế hoạch bài dạy', 'khbd'])
    
    try:
        if is_lesson_plan_request:
            # FLOW: Sử dụng semantic integration service (giống create_conversation)
            # Lấy tất cả tài liệu từ database
            stmt = select(Document)
            result = await session.execute(stmt)
            all_documents = result.scalars().all()
            
            # Format documents thành text
            documents_text = None
            if all_documents:
                documents_text = "\n\n--- TÀI LIỆU THAM KHẢO ---\n\n"
                for doc in all_documents:
                    documents_text += f"### {doc.title or 'Tài liệu'}\n"
                    if doc.content:
                        documents_text += f"{doc.content}\n\n"
            
            # Dùng chat AI với context
            ai_response_content = await chat_ai.generate_response(message_history)
            logger.info(f"✅ Generated response via chat AI")
        else:
            # Không phải câu hỏi về lesson plan → dùng chat AI
            ai_response_content = await chat_ai.generate_response(message_history)
            logger.info(f"ℹ️ Câu hỏi thông thường, dùng chat AI")
    except Exception as e:
        logger.error(f"❌ Lỗi khi xử lý: {e}")
        # Fallback về chat AI thông thường
        ai_response_content = await chat_ai.generate_response(message_history)

    # Save AI response
    ai_message = ChatMessage(
        conversation_id=conversation_id,
        role=MessageRole.assistant,
        content=ai_response_content,
    )
    session.add(ai_message)

    # Update conversation timestamp
    conversation.updated_at = func.now()

    await session.commit()
    await session.refresh(ai_message)

    logger.info(
        "chat.message_sent user_id=%s conversation_id=%s",
        current_user.id,
        conversation_id,
    )

    return ai_message


@router.patch("/conversations/{conversation_id}", response_model=ChatConversationRead)
async def update_conversation(
    conversation_id: str,
    payload: ChatConversationUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatConversation:
    """Update conversation (title, archive status)"""

    query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    )
    result = await session.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Update fields if provided
    if payload.title is not None:
        conversation.title = payload.title
    if payload.is_archived is not None:
        conversation.is_archived = payload.is_archived

    await session.commit()
    await session.refresh(conversation, ["messages"])

    logger.info(
        "chat.conversation_updated user_id=%s conversation_id=%s",
        current_user.id,
        conversation_id,
    )

    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Delete a conversation and all its messages"""

    query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    )
    result = await session.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    await session.delete(conversation)
    await session.commit()

    logger.info(
        "chat.conversation_deleted user_id=%s conversation_id=%s",
        current_user.id,
        conversation_id,
    )
