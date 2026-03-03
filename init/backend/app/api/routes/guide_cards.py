"""
Guide Card routes - Public read + Admin management
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.rate_limiter import limiter
from app.db.session import get_db
from app.models.guide_card import GuideCard
from app.schemas.guide_card import (
    GuideCardPublic,
    GuideCardRead,
    GuideCardUpdate,
    GuideCardReorderRequest,
)

router = APIRouter()


# ---------- PUBLIC ----------

@router.get("/", response_model=list[GuideCardPublic])
@limiter.limit("30/minute")
async def get_public_guide_cards(request: Request, session: AsyncSession = Depends(get_db)):
    """Public: return active cards sorted by sort_order"""
    result = await session.execute(
        select(GuideCard)
        .where(GuideCard.is_active == True)  # noqa: E712
        .order_by(GuideCard.sort_order)
    )
    return result.scalars().all()


# ---------- ADMIN ----------

@router.get("/admin/all", response_model=list[GuideCardRead],
            dependencies=[Depends(require_admin)])
@limiter.limit("30/minute")
async def get_all_guide_cards(request: Request, session: AsyncSession = Depends(get_db)):
    """Admin: get ALL cards (including inactive) sorted by sort_order"""
    result = await session.execute(
        select(GuideCard).order_by(GuideCard.sort_order)
    )
    return result.scalars().all()


@router.put("/admin/reorder", response_model=list[GuideCardRead],
            dependencies=[Depends(require_admin)])
@limiter.limit("10/minute")
async def reorder_guide_cards(
    request: Request,
    payload: GuideCardReorderRequest,
    session: AsyncSession = Depends(get_db),
):
    """Admin: reorder cards by setting sort_order from the provided ID list"""
    for idx, card_id in enumerate(payload.card_ids):
        await session.execute(
            update(GuideCard)
            .where(GuideCard.id == card_id)
            .values(sort_order=idx)
        )
    await session.commit()

    result = await session.execute(
        select(GuideCard).order_by(GuideCard.sort_order)
    )
    return result.scalars().all()


@router.put("/admin/{card_id}", response_model=GuideCardRead,
            dependencies=[Depends(require_admin)])
@limiter.limit("10/minute")
async def update_guide_card(
    request: Request,
    card_id: int,
    payload: GuideCardUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Admin: update a guide card's content"""
    card = await session.get(GuideCard, card_id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thẻ hướng dẫn",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)

    await session.commit()
    await session.refresh(card)
    return card
