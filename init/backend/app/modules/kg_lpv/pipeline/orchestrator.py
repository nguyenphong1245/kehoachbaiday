"""Orchestrator job nền: điều phối các bước pipeline kiểm chứng KG-LPV.

`run_job(job_id)` mở session DB riêng (job chạy nền, session của request đã
đóng), tải job + KHBD nguồn, chạy Bước 1 (tách đoạn), lưu kết quả, rồi gọi
`run_verification` (N1‖N2 chạy song song — Task 5 hiện thực; N3 — Task 6 —
hiện chỉ là stub typed qua `run_n3`).
Không bao giờ để exception thoát ra ngoài `run_job` — job nền không được làm
sập tiến trình; mọi lỗi được ghi vào `job.error_message` và `status='failed'`.

`recover_stuck_jobs()` (§9, §13 rủi ro #5) — gọi 1 lần lúc khởi động backend
(`app.main.lifespan`): job kẹt ở trạng thái không kết thúc do backend restart
giữa job (mất asyncio task nền) được đánh `failed` thay vì treo vô hạn.

Mỗi lần chạy `run_job`, thời gian (ms, đo bằng `time.monotonic`) của 3 bước
chính được cộng dồn vào `job.stats["timings"]` (`segment_ms`, `n1n2_ms`,
`n3_ms`, §9 Hiệu năng/chi phí) — phục vụ đo/đối chiếu mục tiêu ≤ 3 phút/job.
"""
import asyncio
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import AsyncSessionLocal
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline.n1_identity import n1_verify
from app.modules.kg_lpv.pipeline.n2_curriculum import n2_verify
from app.modules.kg_lpv.pipeline.n3_pedagogy import n3_verify
from app.modules.kg_lpv.pipeline.segmenter import SegmentationValidationError, segment
from app.modules.kg_lpv.schemas import Finding, LessonContext, SegmentedPlan
from app.services.token_service import deduct_tokens

_PROGRESS_AFTER_SEGMENTING = 10
_PROGRESS_AFTER_N1_N2 = 70
_PROGRESS_DONE = 100

# Job ở 1 trong các trạng thái này CHƯA kết thúc — nếu kẹt quá lâu (backend restart
# giữa job), startup recovery đánh `failed` (§13 rủi ro #5).
_STUCK_JOB_STATUSES = ("pending", "segmenting", "verifying", "verifying_n3", "repairing", "re_verifying")
_STUCK_JOB_THRESHOLD_MINUTES = 15
_STUCK_JOB_MESSAGE = "gián đoạn hệ thống, vui lòng chạy lại"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def recover_stuck_jobs() -> int:
    """Đánh `failed` mọi job KG-LPV kẹt (status chưa kết thúc, `created_at` đã quá
    `_STUCK_JOB_THRESHOLD_MINUTES` phút) — gọi 1 lần lúc khởi động (§9: 1 UPDATE
    duy nhất, rẻ). Trả số job đã được đánh dấu."""
    threshold = _utcnow() - timedelta(minutes=_STUCK_JOB_THRESHOLD_MINUTES)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            update(KgLpvJob)
            .where(KgLpvJob.status.in_(_STUCK_JOB_STATUSES), KgLpvJob.created_at < threshold)
            .values(status="failed", error_message=_STUCK_JOB_MESSAGE, finished_at=_utcnow())
        )
        await db.commit()
        recovered = result.rowcount or 0
        if recovered:
            logger.warning("kg_lpv.orchestrator.recovered_stuck_jobs count=%d", recovered)
        return recovered


async def run_job(job_id: int) -> None:
    """Chạy toàn bộ pipeline cho một job. Không raise ra ngoài (job nền)."""
    async with AsyncSessionLocal() as db:
        job = await db.get(KgLpvJob, job_id)
        if job is None:
            logger.warning("kg_lpv.orchestrator.job_not_found job_id=%s", job_id)
            return

        try:
            plan = await db.get(SavedLessonPlan, job.saved_lesson_plan_id)
            if plan is None:
                raise RuntimeError("Không tìm thấy KHBD nguồn cho job kiểm chứng")

            job.status = "segmenting"
            job.progress = _PROGRESS_AFTER_SEGMENTING
            await db.commit()

            sections = plan.sections or []
            usage: dict[str, int] = {}
            t0 = time.monotonic()
            segmented = await segment(db, sections, usage=usage)
            segment_ms = int((time.monotonic() - t0) * 1000)

            tokens_used = usage.get("tokens_used", 0)
            job.segments = segmented.model_dump(mode="json")
            stats = dict(job.stats or {})
            stats["tokens"] = int(stats.get("tokens", 0)) + tokens_used
            timings = dict(stats.get("timings") or {})
            timings["segment_ms"] = segment_ms
            stats["timings"] = timings
            job.stats = stats
            await db.commit()

            if tokens_used > 0:
                await deduct_tokens(db, job.user_id, tokens_used)
                await db.commit()

            logger.info(
                "kg_lpv.orchestrator.segmented job_id=%s objective_clauses=%d activity_components=%d tokens=%d",
                job_id,
                len(segmented.objective_clauses),
                len(segmented.activity_components),
                tokens_used,
            )

            await run_verification(db, job, segmented)

        except SegmentationValidationError as exc:
            job.status = "failed"
            job.error_message = f"Lỗi cấu trúc khi tách đoạn: {exc}"
            job.finished_at = _utcnow()
            await db.commit()
            logger.warning("kg_lpv.orchestrator.segmentation_failed job_id=%s error=%s", job_id, exc)

        except Exception as exc:  # noqa: BLE001 - job nền: mọi lỗi phải được chặn lại ở đây
            job.status = "failed"
            job.error_message = str(exc)[:500]
            job.finished_at = _utcnow()
            await db.commit()
            logger.error("kg_lpv.orchestrator.job_failed job_id=%s error=%s", job_id, exc)


def _build_identity(plan: SavedLessonPlan) -> dict:
    """Trích {lesson_id, grade, book_type, topic, lesson_name} từ KHBD nguồn cho N1."""
    return {
        "lesson_id": plan.lesson_id,
        "grade": plan.grade,
        "book_type": plan.book_type,
        "topic": plan.topic,
        "lesson_name": plan.lesson_name,
    }


def _persist_findings(db: AsyncSession, job_id: int, findings: list[Finding]) -> int:
    """Ghi mỗi `Finding` thành 1 dòng `KgLpvFinding` — CHỈ khi `evidence` khác rỗng
    (double-guard: `Finding` đã enforce ở tầng Pydantic, nhưng vẫn kiểm lại ở đây
    theo đúng bất biến §6.2 trước khi chạm DB)."""
    persisted = 0
    for finding in findings:
        if not finding.evidence:
            continue
        db.add(KgLpvFinding(**finding.to_kg_lpv_finding_kwargs(job_id)))
        persisted += 1
    return persisted


async def run_verification(db: AsyncSession, job: KgLpvJob, segmented: SegmentedPlan) -> None:
    """N1‖N2 -> N3 (stub) -> sổ lỗi.

    - N1 (D1, thuật toán thuần) chạy trong thread riêng (`asyncio.to_thread`,
      vì các phương thức `graph_client` là lời gọi Neo4j đồng bộ/blocking) song
      song với N2 (M1-M6, RULE + LLM_JUDGE, `await` các lượt gọi LLM) bằng
      `asyncio.gather` — đúng tinh thần "N1 ‖ N2" (§3 điểm 3, §9).
    - Gói ngữ cảnh bài học (`LessonContext`) truy hồi qua `graph.get_lesson_context`
      ĐÚNG 1 LẦN trước khi chạy N1‖N2 — N2 dùng ngay, N3 (Task 6) tái dùng qua
      tham số `lesson_ctx` của `run_n3`, không truy vấn lại đồ thị (§9).
    - Ghi mỗi finding hợp lệ (evidence khác rỗng) thành 1 dòng `KgLpvFinding`;
      cộng dồn token N2 đã dùng vào `job.stats["tokens"]` và trừ theo thực dùng
      (cùng cơ chế `deduct_tokens` như Bước 1 tách đoạn).
    - Lỗi cục bộ 1 phán xử LLM trong N2 (timeout/JSON hỏng/lỗi API) đã được
      `n2_verify` bắt riêng từng lượt và ghi nhận 1 `Finding` `status="unjudged"`
      (không tính là lỗi nội dung xác nhận, không phải false positive) — job
      vẫn tiếp tục và kết thúc `done`. Exception KHÔNG lường trước (vượt khỏi
      phạm vi bắt cục bộ đó) sẽ thoát lên `run_job`, nơi đã có try/except bao
      ngoài đánh dấu job `failed` kèm `error_message`.
    """
    job.status = "verifying"
    await db.commit()

    plan = await db.get(SavedLessonPlan, job.saved_lesson_plan_id)
    if plan is None:
        raise RuntimeError("Không tìm thấy KHBD nguồn cho job kiểm chứng")

    identity = _build_identity(plan)
    lesson_ctx: LessonContext = graph_client.get_lesson_context(identity.get("lesson_id"), identity.get("grade"))

    n2_usage: dict[str, int] = {}
    t0 = time.monotonic()
    n1_findings, (n2_findings, hoat_dong_loi_m) = await asyncio.gather(
        asyncio.to_thread(n1_verify, identity, graph_client),
        n2_verify(db, segmented, lesson_ctx, graph_client, usage=n2_usage),
    )
    n1n2_ms = int((time.monotonic() - t0) * 1000)

    persisted = _persist_findings(db, job.id, [*n1_findings, *n2_findings])

    n2_tokens = n2_usage.get("tokens_used", 0)
    stats = dict(job.stats or {})
    stats["tokens"] = int(stats.get("tokens", 0)) + n2_tokens
    stats["findings_n1"] = len(n1_findings)
    stats["findings_n2"] = len(n2_findings)
    timings = dict(stats.get("timings") or {})
    timings["n1n2_ms"] = n1n2_ms
    stats["timings"] = timings
    job.stats = stats
    job.progress = _PROGRESS_AFTER_N1_N2
    await db.commit()

    if n2_tokens > 0:
        await deduct_tokens(db, job.user_id, n2_tokens)
        await db.commit()

    logger.info(
        "kg_lpv.orchestrator.n1_n2_done job_id=%s n1=%d n2=%d persisted=%d hoat_dong_loi_m=%d",
        job.id, len(n1_findings), len(n2_findings), persisted, len(hoat_dong_loi_m),
    )

    job.status = "verifying_n3"
    await db.commit()

    n3_usage: dict[str, int] = {}
    t0 = time.monotonic()
    n3_findings = await run_n3(db, job, segmented, lesson_ctx, hoat_dong_loi_m, usage=n3_usage)
    n3_ms = int((time.monotonic() - t0) * 1000)
    persisted += _persist_findings(db, job.id, n3_findings)

    n3_tokens = n3_usage.get("tokens_used", 0)
    stats = dict(job.stats or {})
    stats["tokens"] = int(stats.get("tokens", 0)) + n3_tokens
    stats["findings_n3"] = len(n3_findings)
    timings = dict(stats.get("timings") or {})
    timings["n3_ms"] = n3_ms
    stats["timings"] = timings
    job.stats = stats

    job.status = "done"
    job.progress = _PROGRESS_DONE
    job.finished_at = _utcnow()
    await db.commit()

    if n3_tokens > 0:
        await deduct_tokens(db, job.user_id, n3_tokens)
        await db.commit()

    logger.info("kg_lpv.orchestrator.verification_done job_id=%s findings=%d", job.id, persisted)


async def run_n3(
    db: AsyncSession,
    job: KgLpvJob,
    segmented: SegmentedPlan,
    lesson_ctx: LessonContext,
    excluded_sections: set[str],
    *,
    usage: dict[str, int] | None = None,
) -> list[Finding]:
    """Bước 3 — N3 Nhất quán sư phạm (C1-C8, 6 trục, Task 6) — delegate cho
    `n3_pedagogy.n3_verify`.

    - Input: `lesson_ctx` (gói ngữ cảnh bài học ĐÃ truy hồi 1 lần/job ở
      `run_verification` — TÁI DÙNG, KHÔNG truy vấn lại đồ thị); `excluded_sections`
      (= `hoat_dong_loi_M` trả về từ `n2_verify` — tập `section_id` hoạt động
      dính lỗi M6 kiến thức, KHÔNG được dùng làm bằng chứng đạt năng lực ở N3,
      nguyên tắc ưu tiên nhánh §7/§18).
    - Output: `list[Finding]` mã C1-C8, mỗi `Finding` có `evidence` khác rỗng
      (bất biến §6.2 — enforce bởi `Finding` + double-guard ở
      `run_verification._persist_findings`). 6 hàm trục độc lập theo §7 Bước 3.
    - `usage` (tuỳ chọn, cùng quy ước `segment`/`n2_verify`): nếu truyền dict rỗng
      vào, hàm ghi `usage["tokens_used"]` = tổng token các lượt phán xử LLM N3.
    - Lỗi cục bộ 1 phán xử LLM không crash job — `n3_verify` đã bắt riêng từng
      lượt và ghi nhận `Finding` `status="unjudged"` (cùng quy ước `n2_verify`).
    - `job.status` đã là `verifying_n3` khi hàm này được gọi; `run_verification`
      chuyển sang `done` sau khi hàm này trả về — KHÔNG tự đổi `job.status`
      trong `run_n3`.
    """
    findings = await n3_verify(db, segmented, lesson_ctx, excluded_sections, graph_client, usage=usage)
    logger.info(
        "kg_lpv.orchestrator.n3_done job_id=%s excluded_sections=%d findings=%d",
        job.id, len(excluded_sections), len(findings),
    )
    return findings
