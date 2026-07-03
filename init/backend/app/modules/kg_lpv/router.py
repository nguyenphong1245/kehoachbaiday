"""Router module KG-LPV.

`status_router`: luôn được đăng ký ở app/api/__init__.py (kể cả khi env tắt) để
frontend có một nguồn duy nhất hỏi trạng thái.

`router`: chỉ được đăng ký khi `settings.kg_lpv_enabled` — chứa các endpoint
được bảo vệ bởi `require_kg_lpv()`. Ở Task 1 chỉ có một endpoint probe nội bộ
để kiểm chứng chuỗi guard (env -> cờ DB -> sức khỏe đồ thị); các endpoint
nghiệp vụ thật (verify/jobs/report...) do các task sau bổ sung.
"""

from asyncio import create_task

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.logging import logger
from app.core.rate_limiter import limiter
from app.db.session import get_db
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv import feature_flag as feature_flag_accessor
from app.modules.kg_lpv.config import MODULE_VERSION
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvJob
from app.modules.kg_lpv.pipeline.orchestrator import run_job
from app.modules.kg_lpv.schemas import (
    GraphStatus,
    JobStatusResponse,
    KgLpvStatusResponse,
    VerifyRequest,
    VerifyResponse,
)
from app.services.token_service import check_token_balance


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


# Ước lượng token trước khi tạo job (chưa biết chính xác cho đến khi tách đoạn
# xong — trừ theo thực dùng ở orchestrator). Hằng số nhỏ, đủ dùng cho Bước 1;
# các task sau (N1/N2/N3) sẽ ước lượng lại khi thêm vào pipeline chi phí cao hơn.
_VERIFY_BASE_TOKENS = 800
_VERIFY_TOKENS_PER_SECTION = 200


@router.post(
    "/verify",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=VerifyResponse,
    dependencies=[Depends(require_kg_lpv)],
)
@limiter.limit("5/minute")
async def start_verify(
    request: Request,
    payload: VerifyRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VerifyResponse:
    """Tạo job kiểm chứng KHBD và chạy nền (asyncio.create_task, không hàng đợi ngoài)."""
    result = await db.execute(
        select(SavedLessonPlan).where(
            SavedLessonPlan.id == payload.lesson_plan_id,
            SavedLessonPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy giáo án với ID: {payload.lesson_plan_id}",
        )

    n_sections = len(plan.sections or [])
    estimated_tokens = _VERIFY_BASE_TOKENS + _VERIFY_TOKENS_PER_SECTION * n_sections
    if not await check_token_balance(db, current_user.id, estimated_tokens):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    job = KgLpvJob(
        user_id=current_user.id,
        saved_lesson_plan_id=plan.id,
        status="pending",
        progress=0,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    logger.info(
        "kg_lpv.verify_started user_id=%s lesson_plan_id=%s job_id=%s",
        current_user.id, plan.id, job.id,
    )

    create_task(run_job(job.id))

    return VerifyResponse(job_id=job.id)


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    dependencies=[Depends(require_kg_lpv)],
)
async def get_job_status(
    job_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JobStatusResponse:
    """Trạng thái job kiểm chứng (owner-only) — frontend poll endpoint này."""
    job = await db.get(KgLpvJob, job_id)
    if job is None or job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy job kiểm chứng",
        )

    return JobStatusResponse(status=job.status, progress=job.progress, stats=job.stats)
