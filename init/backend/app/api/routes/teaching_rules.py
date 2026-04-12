"""
API Routes cho quản lý Teaching Rules (trang Settings GV).
"""
import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.teaching_rule import TeachingRule
from app.prompts.rule_compression import SINGLE_RULE_MAX_CHARS

router = APIRouter(prefix="/teaching-rules", tags=["teaching-rules"])

_TRAILING_PUNCT_RE = re.compile(r"[\s\.,;:!?…]+$")


def _normalize_rule_text(text: str) -> str:
    normalized = (text or "").replace("**", "").strip().lower()
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = _TRAILING_PUNCT_RE.sub("", normalized)
    return normalized


# --- Schemas ---

class RuleUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=SINGLE_RULE_MAX_CHARS)


class RuleResponse(BaseModel):
    id: int
    rule_type: str
    lesson_id: str | None
    content: str
    is_active: bool
    merged_from: list[int] | None
    created_at: str

    class Config:
        from_attributes = True


# --- Routes ---

@router.get("/my")
async def get_my_rules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lấy rules active của GV hiện tại (cho trang Settings). Rule inactive
    (do merge/supersede ngầm) không trả về — UI chỉ hiển thị rule đang áp dụng."""
    result = await db.execute(
        select(TeachingRule)
        .where(
            TeachingRule.teacher_id == current_user.id,
            TeachingRule.is_active == True,  # noqa: E712
        )
        .order_by(TeachingRule.created_at.desc())
    )
    rules = result.scalars().all()
    seen_keys: set[tuple[str, str | None, str]] = set()
    deduped = []
    for r in rules:
        key = (r.rule_type, r.lesson_id, _normalize_rule_text(r.content))
        if not key[2] or key in seen_keys:
            continue
        seen_keys.add(key)
        deduped.append(
            {
                "id": r.id,
                "rule_type": r.rule_type,
                "lesson_id": r.lesson_id,
                "content": r.content,
                "is_active": r.is_active,
                "merged_from": r.merged_from,
                "created_at": str(r.created_at),
            }
        )
    return deduped


@router.put("/{rule_id}")
async def update_rule(
    rule_id: int,
    body: RuleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sửa nội dung rule (GV sửa tay)."""
    rule = await db.get(TeachingRule, rule_id)
    if not rule or rule.teacher_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rule không tồn tại")

    rule.content = body.content
    await db.commit()
    return {"status": "updated"}


@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Hard delete rule. Comment.rule_id có FK ondelete=SET NULL nên an toàn."""
    rule = await db.get(TeachingRule, rule_id)
    if not rule or rule.teacher_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rule không tồn tại")

    await db.delete(rule)
    await db.commit()
    return {"status": "deleted"}
