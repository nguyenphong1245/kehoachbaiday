"""Truy cập cờ runtime bảng feature_flags (key='kg_lpv') có cache TTL trong tiến trình."""

import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feature_flag import FeatureFlag
from app.modules.kg_lpv.config import FEATURE_FLAG_CACHE_TTL_SECONDS

KG_LPV_FLAG_KEY = "kg_lpv"

_cache_value: bool | None = None
_cache_time: float = 0.0


async def is_kg_lpv_enabled(session: AsyncSession) -> bool:
    """Trả về trạng thái cờ `kg_lpv` (mặc định False nếu chưa có bản ghi). Cache 30s."""
    global _cache_value, _cache_time

    now = time.monotonic()
    if _cache_value is not None and (now - _cache_time) < FEATURE_FLAG_CACHE_TTL_SECONDS:
        return _cache_value

    row = await session.get(FeatureFlag, KG_LPV_FLAG_KEY)
    value = bool(row.enabled) if row is not None else False

    _cache_value = value
    _cache_time = now
    return value


async def set_kg_lpv_enabled(session: AsyncSession, enabled: bool, updated_by: int | None) -> FeatureFlag:
    """Ghi cờ `kg_lpv` vào DB và xóa cache ngay lập tức."""
    row = await session.get(FeatureFlag, KG_LPV_FLAG_KEY)
    if row is None:
        row = FeatureFlag(key=KG_LPV_FLAG_KEY, enabled=enabled, updated_by=updated_by)
        session.add(row)
    else:
        row.enabled = enabled
        row.updated_by = updated_by

    await session.commit()
    await session.refresh(row)
    invalidate_cache()
    return row


def invalidate_cache() -> None:
    global _cache_value, _cache_time
    _cache_value = None
    _cache_time = 0.0
