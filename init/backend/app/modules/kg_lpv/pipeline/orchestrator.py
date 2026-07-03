"""Orchestrator job nền: điều phối các bước pipeline kiểm chứng KG-LPV.

`run_job(job_id)` mở session DB riêng (job chạy nền, session của request đã
đóng), tải job + KHBD nguồn, chạy Bước 1 (tách đoạn), lưu kết quả, rồi gọi
`run_verification` (N1‖N2‖N3 — Task 4-6 hiện thực; ở Task 3 chỉ là stub).
Không bao giờ để exception thoát ra ngoài `run_job` — job nền không được làm
sập tiến trình; mọi lỗi được ghi vào `job.error_message` và `status='failed'`.
"""
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import AsyncSessionLocal
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv.models import KgLpvJob
from app.modules.kg_lpv.pipeline.segmenter import SegmentationValidationError, segment
from app.modules.kg_lpv.schemas import SegmentedPlan
from app.services.token_service import deduct_tokens

_PROGRESS_AFTER_SEGMENTING = 10


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


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
            segmented = await segment(db, sections, usage=usage)

            tokens_used = usage.get("tokens_used", 0)
            job.segments = segmented.model_dump(mode="json")
            stats = dict(job.stats or {})
            stats["tokens"] = int(stats.get("tokens", 0)) + tokens_used
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


async def run_verification(db: AsyncSession, job: KgLpvJob, segmented: SegmentedPlan) -> None:
    """N1‖N2 -> N3 -> sổ lỗi. Ở Task 3 đây CHỈ LÀ STUB tài liệu hóa hợp đồng.

    Hợp đồng cho các task sau (Task 4: N1, Task 5: N2, Task 6: N3):
    - Input: `db` (AsyncSession đang mở, dùng lại — KHÔNG mở session mới),
      `job` (đã có `job.segments` = segmented.model_dump()), `segmented`
      (SegmentedPlan đã qua validator Bước 1).
    - Trách nhiệm: chạy N1 (D1, thuật toán thuần) song song N2 (M1-M6, RULE +
      LLM_JUDGE) bằng `asyncio.gather`; sau đó N3 (C1-C8, 6 trục) loại trừ các
      hoạt động dính lỗi M* khỏi vai trò bằng chứng; ghi mỗi finding thành một
      dòng `KgLpvFinding` — CHỈ tạo finding khi có `evidence` hợp lệ (mảng
      không rỗng), đây là bất biến bắt buộc enforce ở tầng service (mục 6.2).
    - Cập nhật `job.status` qua các giá trị `verifying` -> `verifying_n3` ->
      `done`; cập nhật `job.progress` tăng dần; cộng dồn token đã dùng vào
      `job.stats["tokens"]`; set `job.finished_at` khi xong; luôn `await
      db.commit()` sau mỗi lần đổi trạng thái đáng kể (để polling thấy được).
    - Lỗi cục bộ một phán xử (LLM timeout/hỏng) không được làm crash job:
      ghi finding dạng `explanation="không phán xử được"` và KHÔNG tính là
      lỗi nội dung (tránh false positive) — job vẫn tiếp tục và kết thúc `done`.

    # TODO(Task 4-6): N1‖N2, N3 plug in here — thay thế toàn bộ thân hàm này.
    """
    job.status = "done"
    job.progress = 100
    job.finished_at = _utcnow()
    await db.commit()
    logger.info("kg_lpv.orchestrator.verification_stub job_id=%s findings=0", job.id)
