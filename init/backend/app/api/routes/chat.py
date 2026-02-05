from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func, desc, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List

from app.api.deps import get_current_user
from app.core.logging import logger
from app.core.rate_limiter import limiter
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

router = APIRouter()

# Số token tạm giữ trước khi gọi AI (hoàn lại phần thừa sau)
_RESERVE_TOKENS = 500


async def _reserve_tokens(session: AsyncSession, user_id: int, amount: int) -> int:
    """Atomic: trừ trước amount token bằng UPDATE ... WHERE balance >= amount.
    Trả về số token thực sự trừ được (0 nếu không đủ).
    Cũng tăng tokens_used tương ứng."""
    result = await session.execute(
        update(User)
        .where(User.id == user_id, User.token_balance >= amount)
        .values(
            token_balance=User.token_balance - amount,
            tokens_used=User.tokens_used + amount,
        )
        .returning(User.token_balance)
    )
    row = result.first()
    if row is None:
        return 0
    await session.flush()
    logger.info("token.reserved user_id=%s reserved=%s new_balance=%s", user_id, amount, row[0])
    return amount


async def _refund_tokens(session: AsyncSession, user_id: int, amount: int) -> None:
    """Hoàn lại token thừa sau khi biết số thực tế dùng.
    Cũng giảm tokens_used tương ứng."""
    if amount <= 0:
        return
    await session.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            token_balance=User.token_balance + amount,
            tokens_used=User.tokens_used - amount,
        )
    )
    await session.flush()
    logger.info("token.refunded user_id=%s refunded=%s", user_id, amount)


@router.post("/conversations", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def create_conversation(
    request: Request,
    payload: ChatConversationCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """Create a new conversation with the first message"""

    # Atomic: trừ trước token, tránh race condition
    reserved = await _reserve_tokens(session, current_user.id, _RESERVE_TOKENS)
    if reserved == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

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

    total_tokens = 0

    try:
        ai_response_content, tokens_used = await chat_ai.generate_response(message_history)
        total_tokens += tokens_used
        logger.info(f"[OK] Generated response via chat AI, tokens={tokens_used}")
    except Exception as e:
        # AI lỗi → hoàn lại toàn bộ token đã giữ
        await _refund_tokens(session, current_user.id, reserved)
        await session.commit()
        logger.error(f"[ERROR] Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Lỗi khi sinh phản hồi")

    # Save AI response
    ai_message = ChatMessage(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=ai_response_content,
    )
    session.add(ai_message)

    # Generate title if not provided
    if not conversation.title:
        title, title_tokens = await chat_ai.generate_conversation_title(payload.first_message)
        conversation.title = title
        total_tokens += title_tokens

    # Hoàn lại phần token thừa (reserved - actual)
    refund = reserved - min(total_tokens, reserved)
    await _refund_tokens(session, current_user.id, refund)

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
@limiter.limit("30/minute")
async def list_conversations(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    include_archived: bool = False,
) -> List[ChatConversationListItem]:
    """List all conversations for current user"""

    # Subquery: message count per conversation
    count_sub = (
        select(
            ChatMessage.conversation_id,
            func.count(ChatMessage.id).label("message_count"),
        )
        .group_by(ChatMessage.conversation_id)
        .subquery()
    )

    # Correlated subquery: last message content
    last_msg_scalar = (
        select(ChatMessage.content)
        .where(ChatMessage.conversation_id == ChatConversation.id)
        .order_by(desc(ChatMessage.created_at))
        .limit(1)
        .correlate(ChatConversation)
        .scalar_subquery()
    )

    # Single query with left join + correlated subquery
    query = (
        select(
            ChatConversation,
            func.coalesce(count_sub.c.message_count, 0).label("message_count"),
            last_msg_scalar.label("last_content"),
        )
        .outerjoin(count_sub, ChatConversation.id == count_sub.c.conversation_id)
        .where(ChatConversation.user_id == current_user.id)
    )

    if not include_archived:
        query = query.where(ChatConversation.is_archived == False)

    query = query.order_by(desc(ChatConversation.updated_at))

    result = await session.execute(query)
    rows = result.all()

    return [
        ChatConversationListItem(
            id=conv.id,
            title=conv.title,
            is_archived=conv.is_archived,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=msg_count,
            last_message_preview=last_content[:100] if last_content else None,
        )
        for conv, msg_count, last_content in rows
    ]


@router.get("/conversations/{conversation_id}", response_model=ChatConversationRead)
@limiter.limit("30/minute")
async def get_conversation(
    request: Request,
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
@limiter.limit("10/minute")
async def send_message(
    request: Request,
    conversation_id: str,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ChatMessage:
    """Send a message in an existing conversation"""

    # Atomic: trừ trước token
    reserved = await _reserve_tokens(session, current_user.id, _RESERVE_TOKENS)
    if reserved == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    # Verify conversation exists and belongs to user
    conv_query = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    )
    conv_result = await session.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        await _refund_tokens(session, current_user.id, reserved)
        await session.commit()
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

    try:
        ai_response_content, tokens_used = await chat_ai.generate_response(message_history)
        logger.info(f"[OK] Generated response via chat AI, tokens={tokens_used}")
    except Exception as e:
        await _refund_tokens(session, current_user.id, reserved)
        await session.commit()
        logger.error(f"[ERROR] Loi khi xu ly: {e}")
        raise HTTPException(status_code=500, detail="Lỗi khi sinh phản hồi")

    # Save AI response
    ai_message = ChatMessage(
        conversation_id=conversation_id,
        role=MessageRole.assistant,
        content=ai_response_content,
    )
    session.add(ai_message)

    # Update conversation timestamp
    conversation.updated_at = func.now()

    # Hoàn lại phần token thừa
    refund = reserved - min(tokens_used, reserved)
    await _refund_tokens(session, current_user.id, refund)

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


@router.get("/token-balance")
@limiter.limit("60/minute")
async def get_token_balance(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Get current user's token balance and usage"""
    return {
        "token_balance": current_user.token_balance,
        "tokens_used": current_user.tokens_used,
    }
