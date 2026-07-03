"""Service dùng chung: trừ token và kiểm tra số dư token người dùng.

Tách từ app/api/routes/lesson_builder.py (giữ nguyên chữ ký + hành vi).
"""
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.user import User


async def deduct_tokens(session: AsyncSession, user_id: int, amount: int) -> bool:
    """Deduct tokens from user balance and track usage. Returns True if successful.
    If amount exceeds balance, deduct all remaining balance instead of failing.
    """
    if amount <= 0:
        return True

    # First, try to deduct the full amount
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
    if row is not None:
        await session.flush()
        logger.info("lesson_builder.token_deducted user_id=%s amount=%s new_balance=%s", user_id, amount, row[0])
        return True

    # Full amount exceeds balance — deduct whatever remains
    result2 = await session.execute(
        select(User.token_balance).where(User.id == user_id)
    )
    current_balance = result2.scalar()
    if current_balance is None or current_balance <= 0:
        return False

    await session.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            token_balance=0,
            tokens_used=User.tokens_used + current_balance,
        )
    )
    await session.flush()
    logger.info(
        "lesson_builder.token_deducted user_id=%s amount=%s (capped from %s) new_balance=0",
        user_id, current_balance, amount,
    )
    return True


async def check_token_balance(session: AsyncSession, user_id: int, required: int) -> bool:
    """Check if user has enough token balance."""
    result = await session.execute(
        select(User.token_balance).where(User.id == user_id)
    )
    balance = result.scalar()
    return balance is not None and balance >= required
