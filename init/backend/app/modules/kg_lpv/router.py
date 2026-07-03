"""Router module KG-LPV.

`status_router`: luôn được đăng ký ở app/api/__init__.py (kể cả khi env tắt) để
frontend có một nguồn duy nhất hỏi trạng thái.

`router`: chỉ được đăng ký khi `settings.kg_lpv_enabled` — chứa các endpoint
được bảo vệ bởi `require_kg_lpv()`. Ở Task 1 chỉ có một endpoint probe nội bộ
để kiểm chứng chuỗi guard (env -> cờ DB -> sức khỏe đồ thị); các endpoint
nghiệp vụ thật (verify/jobs/report...) do các task sau bổ sung.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.config import MODULE_VERSION
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.schemas import GraphStatus, KgLpvStatusResponse


async def require_kg_lpv(session: AsyncSession = Depends(get_db)) -> None:
    """Guard 3 tầng: env tắt -> 404; cờ DB tắt -> 403; đồ thị không sẵn sàng -> 503."""
    settings = get_settings()
    if not settings.kg_lpv_enabled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chức năng kiểm chứng KHBD không khả dụng",
        )

    db_flag_enabled = await feature_flag_accessor.is_kg_lpv_enabled(session)
    if not db_flag_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chức năng kiểm chứng KHBD đang tắt",
        )

    if not graph_client.is_healthy():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Đồ thị tri thức kiểm chứng chưa sẵn sàng",
        )


status_router = APIRouter()


@status_router.get("/status", response_model=KgLpvStatusResponse)
async def get_kg_lpv_status(
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
) -> KgLpvStatusResponse:
    settings = get_settings()
    if not settings.kg_lpv_enabled:
        return KgLpvStatusResponse(
            enabled=False,
            availability="disabled",
            graph=GraphStatus(connected=False),
            version=MODULE_VERSION,
        )

    db_flag_enabled = await feature_flag_accessor.is_kg_lpv_enabled(session)
    effective_enabled = db_flag_enabled
    if not effective_enabled:
        return KgLpvStatusResponse(
            enabled=False,
            availability="disabled",
            graph=GraphStatus(connected=False),
            version=MODULE_VERSION,
        )

    graph_connected = graph_client.is_healthy()
    availability = "ok" if graph_connected else "degraded"
    return KgLpvStatusResponse(
        enabled=True,
        availability=availability,
        graph=GraphStatus(connected=graph_connected),
        version=MODULE_VERSION,
    )


router = APIRouter()


@router.get("/_probe", dependencies=[Depends(require_kg_lpv)])
async def kg_lpv_probe() -> dict[str, bool]:
    """Endpoint nội bộ chỉ để xác nhận chuỗi require_kg_lpv hoạt động đúng."""
    return {"ok": True}
