"""Router module KG-LPV.

`status_router`: luôn được đăng ký ở app/api/__init__.py (kể cả khi env tắt) để
frontend có một nguồn duy nhất hỏi trạng thái.

`router`: chỉ được đăng ký khi `settings.kg_lpv_enabled` — chứa các endpoint
được bảo vệ bởi `require_kg_lpv()`. Ở Task 1 chỉ có một endpoint probe nội bộ
để kiểm chứng chuỗi guard (env -> cờ DB -> sức khỏe đồ thị); các endpoint
nghiệp vụ thật (verify/jobs/report...) do các task sau bổ sung.
"""

import csv
import io
import json
from asyncio import create_task

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
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
from app.modules.kg_lpv.error_codes import VerificationBranch
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline.orchestrator import run_job
from app.modules.kg_lpv.pipeline.repairer import run_repair_job
from app.modules.kg_lpv.schemas import (
    ApplyRequest,
    ApplyResponse,
    BranchReport,
    FindingOut,
    GraphStatus,
    JobStatusResponse,
    KgLpvStatusResponse,
    RepairRequest,
    RepairResponse,
    ReportResponse,
    SectionDiff,
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


@router.get(
    "/jobs/{job_id}/report",
    response_model=ReportResponse,
    dependencies=[Depends(require_kg_lpv)],
)
async def get_job_report(
    job_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReportResponse:
    """Sổ lỗi đầy đủ của job (owner-only, §6.3) — findings nhóm theo nhánh N1/N2/N3
    kèm đếm theo mã. Findings `status="unjudged"` (phán xử LLM lỗi, §9) liệt kê
    RIÊNG trong `unjudged` — KHÔNG tính vào `summary` (chỉ mang tính kiểm toán, không
    phải lỗi nội dung đã xác nhận). Findings `status="dismissed"` (giáo viên đã bác
    bỏ, §8) cũng KHÔNG tính vào `summary` — không còn là lỗi đang hoạt động."""
    job = await db.get(KgLpvJob, job_id)
    if job is None or job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy job kiểm chứng",
        )

    result = await db.execute(select(KgLpvFinding).where(KgLpvFinding.job_id == job_id))
    all_findings = result.scalars().all()

    unjudged = [FindingOut.model_validate(f) for f in all_findings if f.status == "unjudged"]
    # "dismissed" = giáo viên đã bác bỏ (§8) -> không còn là lỗi đang hoạt động,
    # không được tính vào tổng lỗi xác nhận cùng "unjudged" (chỉ mang tính kiểm toán).
    confirmed = [f for f in all_findings if f.status not in ("unjudged", "dismissed")]

    branches: list[BranchReport] = []
    summary: dict[str, int] = {}
    for branch in (VerificationBranch.N1.value, VerificationBranch.N2.value, VerificationBranch.N3.value):
        branch_findings = [f for f in confirmed if f.branch == branch]
        counts_by_code: dict[str, int] = {}
        for f in branch_findings:
            counts_by_code[f.code] = counts_by_code.get(f.code, 0) + 1
            summary[f.code] = summary.get(f.code, 0) + 1
        branches.append(
            BranchReport(
                branch=branch,
                counts_by_code=counts_by_code,
                findings=[FindingOut.model_validate(f) for f in branch_findings],
            )
        )

    return ReportResponse(
        job_id=job_id,
        status=job.status,
        branches=branches,
        unjudged=unjudged,
        summary={**summary, "total_confirmed": len(confirmed), "total_unjudged": len(unjudged)},
    )


@router.post(
    "/findings/{finding_id}/dismiss",
    response_model=FindingOut,
    dependencies=[Depends(require_kg_lpv)],
)
async def dismiss_finding(
    finding_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FindingOut:
    """Giáo viên bác bỏ 1 phát hiện (quyền tự chủ, §8) — owner-only qua job.user_id."""
    finding = await db.get(KgLpvFinding, finding_id)
    if finding is not None:
        job = await db.get(KgLpvJob, finding.job_id)
    if finding is None or job is None or job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phát hiện",
        )

    finding.status = "dismissed"
    await db.commit()
    await db.refresh(finding)

    return FindingOut.model_validate(finding)


# Ước lượng token cho bước 4 (sửa & kiểm lại) — mỗi finding sửa tốn ít nhất 1 lượt
# LLM sửa + có thể kéo theo các lượt kiểm lại (N2 rule/LLM biên + N3 nhiều trục).
_REPAIR_BASE_TOKENS = 500
_REPAIR_TOKENS_PER_FINDING = 400


async def _load_owned_job(db: AsyncSession, job_id: int, user_id: int) -> KgLpvJob:
    job = await db.get(KgLpvJob, job_id)
    if job is None or job.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy job kiểm chứng",
        )
    return job


@router.post(
    "/jobs/{job_id}/repair",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=RepairResponse,
    dependencies=[Depends(require_kg_lpv)],
)
@limiter.limit("5/minute")
async def start_repair(
    request: Request,
    job_id: int,
    payload: RepairRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RepairResponse:
    """Bước 4 — Sửa & kiểm lại (§7 Bước 4, §6.3). Body rỗng (`finding_ids=[]`) = sửa
    tất cả finding `status="open"` của job. Chạy nền, chuyển job `repairing ->
    re_verifying -> repaired` (do `repairer.run_repair_job` cập nhật)."""
    job = await _load_owned_job(db, job_id, current_user.id)

    query = select(KgLpvFinding).where(KgLpvFinding.job_id == job_id, KgLpvFinding.status == "open")
    if payload.finding_ids:
        query = query.where(KgLpvFinding.id.in_(payload.finding_ids))
    result = await db.execute(query)
    findings = result.scalars().all()

    if not findings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không có phát hiện nào để sửa",
        )

    estimated_tokens = _REPAIR_BASE_TOKENS + _REPAIR_TOKENS_PER_FINDING * len(findings)
    if not await check_token_balance(db, current_user.id, estimated_tokens):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.",
        )

    finding_ids = [f.id for f in findings]

    job.status = "repairing"
    await db.commit()

    logger.info("kg_lpv.repair.requested job_id=%s findings=%d", job_id, len(finding_ids))

    create_task(run_repair_job(job.id, finding_ids))

    return RepairResponse(job_id=job.id)


@router.get(
    "/jobs/{job_id}/diff",
    response_model=list[SectionDiff],
    dependencies=[Depends(require_kg_lpv)],
)
async def get_job_diff(
    job_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SectionDiff]:
    """Các đoạn đã sửa của job (owner-only, §6.3) — 1 dòng / section (dedup theo
    `section_id`, nhiều finding cùng section đã được gộp thành 1 `repair_diff` giống
    nhau khi sửa — xem `repairer.repair`)."""
    await _load_owned_job(db, job_id, current_user.id)

    result = await db.execute(
        select(KgLpvFinding).where(KgLpvFinding.job_id == job_id, KgLpvFinding.repair_diff.isnot(None))
    )
    findings = result.scalars().all()

    diffs_by_section: dict[str, SectionDiff] = {}
    for f in findings:
        if f.section_id not in diffs_by_section:
            diffs_by_section[f.section_id] = SectionDiff.model_validate(f.repair_diff)

    return list(diffs_by_section.values())


@router.post(
    "/jobs/{job_id}/apply",
    response_model=ApplyResponse,
    dependencies=[Depends(require_kg_lpv)],
)
async def apply_repair(
    job_id: int,
    payload: ApplyRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplyResponse:
    """Ghi các đoạn đã sửa (được giáo viên duyệt) ngược vào `SavedLessonPlan.sections`
    (§6.3) — bước DUY NHẤT chạm dữ liệu KHBD trong toàn pipeline. Mặc định
    (`section_ids=None`) áp dụng mọi section đang `status="repaired"`; các section
    khác giữ NGUYÊN VẸN (byte-identical)."""
    job = await _load_owned_job(db, job_id, current_user.id)

    plan = await db.get(SavedLessonPlan, job.saved_lesson_plan_id)
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy KHBD nguồn",
        )

    result = await db.execute(
        select(KgLpvFinding).where(
            KgLpvFinding.job_id == job_id,
            KgLpvFinding.status == "repaired",
            KgLpvFinding.repair_diff.isnot(None),
        )
    )
    findings = result.scalars().all()

    diffs_by_section: dict[str, dict] = {}
    for f in findings:
        diffs_by_section.setdefault(f.section_id, f.repair_diff)

    approved_ids = set(payload.section_ids) if payload.section_ids else set(diffs_by_section.keys())
    to_apply = {sid: diff for sid, diff in diffs_by_section.items() if sid in approved_ids}

    if not to_apply:
        return ApplyResponse(section_ids=[])

    new_sections = []
    updated_ids: list[str] = []
    for section in plan.sections or []:
        sid = section.get("section_id")
        if sid in to_apply:
            new_sections.append({**section, "content": to_apply[sid]["after"]})
            updated_ids.append(sid)
        else:
            new_sections.append(section)
    plan.sections = new_sections
    await db.commit()

    logger.info("kg_lpv.repair.applied job_id=%s sections=%s", job_id, updated_ids)

    return ApplyResponse(section_ids=updated_ids)


_EXPORT_CSV_FIELDNAMES = ["code", "branch", "truc", "section_id", "status", "explanation", "evidence", "created_at"]


@router.get(
    "/jobs/{job_id}/export",
    dependencies=[Depends(require_kg_lpv)],
)
async def export_job_findings(
    job_id: int,
    format: str = Query("json", pattern="^(json|csv)$"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Xuất findings phục vụ gán nhãn chuyên gia bên ngoài (§6.3, §14) — owner-only.
    `format=json` (mặc định) trả `list[dict]`; `format=csv` trả file CSV (BOM UTF-8
    để Excel mở tiếng Việt đúng), 1 dòng / finding. `created_at` lấy từ
    `job.created_at` (`KgLpvFinding` không có cột thời gian riêng của chính nó)."""
    job = await _load_owned_job(db, job_id, current_user.id)

    result = await db.execute(select(KgLpvFinding).where(KgLpvFinding.job_id == job_id))
    findings = result.scalars().all()

    created_at = job.created_at.isoformat() if job.created_at else None
    rows = [
        {
            "code": f.code,
            "branch": f.branch,
            "truc": f.truc,
            "section_id": f.section_id,
            "status": f.status,
            "explanation": f.explanation,
            "evidence": json.dumps(f.evidence, ensure_ascii=False),
            "created_at": created_at,
        }
        for f in findings
    ]

    if format == "csv":
        buffer = io.StringIO()
        buffer.write("﻿")  # BOM UTF-8 để Excel mở tiếng Việt đúng
        writer = csv.DictWriter(buffer, fieldnames=_EXPORT_CSV_FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=kg_lpv_job_{job_id}_findings.csv"},
        )

    return rows
