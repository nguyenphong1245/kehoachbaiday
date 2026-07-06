"""Bước 4 — Sửa & kiểm lại (`repairer.py`) → `SectionDiff` (§7 Bước 4, §6.3).

`repair(db, job, findings) -> list[SectionDiff]`:

- Chỉ finding `status="open"` VÀ `evidence` khác rỗng mới được sửa (bất biến §6.2/§7
  — "quyết định thiếu bằng chứng hợp lệ không chuyển sang bộ sửa chữa"). Finding khác
  (`unjudged`, `dismissed`, hoặc `open` nhưng evidence rỗng — không nên xảy ra do
  `Finding` đã enforce ở tầng Pydantic, nhưng `KgLpvFinding` ORM không có ràng buộc
  này nên vẫn kiểm lại ở đây) bị BỎ QUA hoàn toàn, không gọi LLM.
- Nhiều finding trên CÙNG 1 section được gộp sửa TUẦN TỰ thành 1 `SectionDiff` duy
  nhất (`before` = nội dung gốc, `after` = kết quả sửa TÍCH LŨY qua từng finding).
- Sau khi có `after`, KIỂM LẠI (re-verify) theo "map phụ thuộc" tĩnh (§7 Bước 4):
  sửa mục tiêu (section thuộc `objective_clauses`) -> kiểm lại trục 1 (nhất quán dọc)
  + trục 3 (căn chỉnh) của các HOẠT ĐỘNG NEO VÀO mục tiêu đó (khớp mờ từ vựng, cùng
  ngưỡng `n3_pedagogy.truc1_nhat_quan_doc`) + M1/M2 (N2) của chính mục tiêu đó; sửa
  hoạt động (section thuộc `activity_components`) -> kiểm lại trục 2/5/6 của CHÍNH
  hoạt động đó + trục 1 + M6 (N2, kiểm lại chính finding gốc nếu hoạt động đó có
  thành phần `noi_dung`). Việc kiểm lại chạy trên 1 `SegmentedPlan` DỰNG LẠI trong bộ
  nhớ (`_rebuild_segmented_plan`): section chỉ có ĐÚNG 1 segment con -> gán thẳng
  TOÀN VĂN đoạn sau khi sửa (không có gì để tách nhầm, giữ tractable §9); section có
  NHIỀU segment con (VD nhiều mệnh đề mục tiêu, hoặc đủ 4 thành phần hoạt động) ->
  TÁCH LẠI RIÊNG đoạn đó qua `segmenter.segment` (scoped đúng 1 section, KHÔNG tách
  lại toàn bộ KHBD) để mỗi segment con dùng đúng văn bản của nó khi kiểm lại — tránh
  gán nhầm toàn văn section cho MỌI segment con (che lấp lỗi còn sót ở segment khác,
  Task 8 review). Lỗi tách đoạn lại (LLM hỏng/validator fail) không crash batch — rơi
  về gán thẳng toàn văn (hành vi cũ) cho các segment của section đó. Segment ở section
  không đổi giữ nguyên. Pass (không có finding MỚI trong phạm vi liên quan) -> finding
  `status="repaired"`; fail -> `status="reverified_fail"`, KHBD KHÔNG bị thay đổi cho
  finding đó (chỉ `POST /apply`, giáo viên duyệt trên UI diff, mới ghi vào
  `SavedLessonPlan` — repairer.py không bao giờ chạm `SavedLessonPlan`).
- 1 lượt LLM hỏng khi sửa 1 finding (timeout/JSON hỏng/lỗi API) KHÔNG được crash batch
  — bắt riêng, bỏ qua finding đó (không tính vào `findings_addressed`), tiếp tục các
  finding còn lại (§9 "an toàn khi hỏng"). Token dùng (sửa + kiểm lại) cộng dồn vào
  `job.stats["tokens"]` và trừ theo thực dùng (cùng cơ chế `token_service` như Task 3/5/6).
"""
import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import AsyncSessionLocal
from app.models.saved_lesson_plan import SavedLessonPlan
from app.modules.kg_lpv.config import N3_OBJECTIVE_ACTIVITY_MATCH_THRESHOLD
from app.modules.kg_lpv.error_codes import ErrorCode
from app.modules.kg_lpv.graph_client import graph_client
from app.modules.kg_lpv.llm import generate_json
from app.modules.kg_lpv.models import KgLpvFinding, KgLpvJob
from app.modules.kg_lpv.pipeline.n2_curriculum import n2_verify
from app.modules.kg_lpv.pipeline.n3_pedagogy import (
    truc1_nhat_quan_doc,
    truc2_noi_bo_hoat_dong,
    truc3_can_chinh,
    truc5_thuc_chat_phuong_phap,
    truc6_tien_trinh_dieu_kien,
)
from app.modules.kg_lpv.pipeline.segmenter import segment
from app.modules.kg_lpv.prompts.repair import build_repair_prompt
from app.modules.kg_lpv.schemas import ActivityComponentType, LessonContext, SectionDiff, SegmentedPlan
from app.services.admin_ai_model_registry import FEATURE_KG_LPV_REPAIR
from app.services.token_service import deduct_tokens


async def repair(
    db: AsyncSession,
    job: KgLpvJob,
    findings: list[KgLpvFinding],
    overrides: dict[int, str] | None = None,
) -> list[SectionDiff]:
    """Sửa cục bộ + kiểm lại các finding hợp lệ. Không bao giờ raise cho lỗi 1 lượt
    LLM (bắt riêng từng finding); exception hạ tầng (không tìm thấy KHBD nguồn...)
    thoát lên `run_repair_job`, nơi có try/except bao ngoài đánh dấu job `failed`.

    `overrides`: map `finding.id -> explanation` tuỳ chỉnh (giáo viên) — dùng thay
    `finding.explanation` gốc khi dựng prompt sửa, nếu có mặt và không rỗng."""
    overrides = overrides or {}
    repairable = [f for f in findings if f.status == "open" and f.evidence]
    skipped = len(findings) - len(repairable)
    if skipped:
        logger.info("kg_lpv.repair.skipped_non_repairable job_id=%s skipped=%d", job.id, skipped)

    if not repairable:
        return []

    plan = await db.get(SavedLessonPlan, job.saved_lesson_plan_id)
    if plan is None:
        raise RuntimeError("Không tìm thấy KHBD nguồn cho job sửa lỗi")

    sections_by_id = {s.get("section_id"): s for s in (plan.sections or [])}
    segmented = SegmentedPlan.model_validate(job.segments or {})

    by_section: dict[str, list[KgLpvFinding]] = {}
    for f in repairable:
        by_section.setdefault(f.section_id, []).append(f)

    total_tokens = 0
    diffs: list[SectionDiff] = []
    edited_texts: dict[str, str] = {}
    touched: dict[str, list[KgLpvFinding]] = {}

    for section_id, section_findings in by_section.items():
        original_section = sections_by_id.get(section_id)
        if original_section is None:
            logger.warning("kg_lpv.repair.section_not_found job_id=%s section_id=%s", job.id, section_id)
            continue

        original_text = original_section.get("content") or ""
        current_text = original_text
        applied: list[KgLpvFinding] = []

        for finding in section_findings:
            explanation = overrides.get(finding.id) or finding.explanation
            prompt = build_repair_prompt(current_text, finding.code, explanation, finding.evidence)
            try:
                data, tokens = await generate_json(db, FEATURE_KG_LPV_REPAIR, prompt)
            except Exception as exc:  # noqa: BLE001 - 1 lượt LLM hỏng không được crash batch (§9)
                logger.warning(
                    "kg_lpv.repair.finding_failed job_id=%s finding_id=%s err=%s",
                    job.id, finding.id, type(exc).__name__,
                )
                continue

            total_tokens += tokens
            new_text = (data or {}).get("after")
            if not new_text:
                logger.warning("kg_lpv.repair.empty_after job_id=%s finding_id=%s", job.id, finding.id)
                continue

            current_text = new_text
            applied.append(finding)

        if not applied:
            continue

        diff = SectionDiff(
            section_id=section_id, before=original_text, after=current_text,
            findings_addressed=[f.id for f in applied],
        )
        diffs.append(diff)
        edited_texts[section_id] = current_text
        touched[section_id] = applied
        for f in applied:
            f.repair_diff = diff.model_dump(mode="json")

    stats = dict(job.stats or {})
    stats["tokens"] = int(stats.get("tokens", 0)) + total_tokens
    job.stats = stats
    await db.commit()
    if total_tokens > 0:
        await deduct_tokens(db, job.user_id, total_tokens)
        await db.commit()

    if not diffs:
        logger.info("kg_lpv.repair.no_diffs job_id=%s", job.id)
        return []

    job.status = "re_verifying"
    await db.commit()

    reverify_tokens = await _reverify(db, job, plan, segmented, edited_texts, touched, sections_by_id)

    stats = dict(job.stats or {})
    stats["tokens"] = int(stats.get("tokens", 0)) + reverify_tokens
    job.stats = stats
    await db.commit()
    if reverify_tokens > 0:
        await deduct_tokens(db, job.user_id, reverify_tokens)
        await db.commit()

    logger.info("kg_lpv.repair.done job_id=%s sections=%d", job.id, len(diffs))
    return diffs


async def _reverify(
    db: AsyncSession,
    job: KgLpvJob,
    plan: SavedLessonPlan,
    segmented: SegmentedPlan,
    edited_texts: dict[str, str],
    touched: dict[str, list[KgLpvFinding]],
    sections_by_id: dict[str, dict],
) -> int:
    """Kiểm lại đoạn đã đổi + đoạn phụ thuộc theo map phụ thuộc tĩnh (§7 Bước 4).
    Đặt `status` cuối cùng ("repaired" | "reverified_fail") lên các finding đã sửa
    của MỖI section trong `touched`. Trả tổng token đã dùng để kiểm lại."""
    rebuilt, resegment_tokens = await _rebuild_segmented_plan(db, segmented, edited_texts, sections_by_id)

    lesson_ctx: LessonContext = graph_client.get_lesson_context(plan.lesson_id, plan.grade)

    total_tokens = resegment_tokens

    n2_usage: dict[str, int] = {}
    n2_findings, hoat_dong_loi_m = await n2_verify(db, rebuilt, lesson_ctx, graph_client, usage=n2_usage)
    total_tokens += n2_usage.get("tokens_used", 0)

    truc1_findings = truc1_nhat_quan_doc(rebuilt, hoat_dong_loi_m)

    u: dict[str, int] = {}
    truc2_findings = await truc2_noi_bo_hoat_dong(db, rebuilt, usage=u)
    total_tokens += u.get("tokens_used", 0)

    u = {}
    truc3_findings = await truc3_can_chinh(db, rebuilt, hoat_dong_loi_m, usage=u)
    total_tokens += u.get("tokens_used", 0)

    u = {}
    truc5_findings = await truc5_thuc_chat_phuong_phap(db, rebuilt, graph_client, usage=u)
    total_tokens += u.get("tokens_used", 0)

    u = {}
    truc6_findings = await truc6_tien_trinh_dieu_kien(db, rebuilt, lesson_ctx, usage=u)
    total_tokens += u.get("tokens_used", 0)

    for section_id, applied in touched.items():
        is_objective_section = any(c.section_id == section_id for c in rebuilt.objective_clauses)

        if is_objective_section:
            dependents = _dependent_activity_sections(rebuilt, section_id)
            scope = dependents | {section_id}
            relevant = (
                [f for f in n2_findings if f.code in (ErrorCode.M1, ErrorCode.M2) and f.section_id == section_id]
                + [f for f in truc1_findings if f.section_id in scope]
                + [f for f in truc3_findings if f.section_id in scope]
            )
        else:
            relevant = (
                [f for f in n2_findings if f.code == ErrorCode.M6 and f.section_id == section_id]
                + [f for f in truc1_findings if f.section_id == section_id]
                + [f for f in truc2_findings if f.section_id == section_id]
                + [f for f in truc5_findings if f.section_id == section_id]
                + [f for f in truc6_findings if f.section_id == section_id]
            )
        # "unjudged" (phán xử LLM lỗi khi kiểm lại, §9) KHÔNG phải lỗi nội dung đã
        # xác nhận — chỉ finding "open" (thật sự xác nhận) mới được tính là kiểm
        # lại fail, tránh 1 lượt LLM hỏng khi re-verify chặn oan bản sửa đã đúng.
        relevant = [f for f in relevant if f.status != "unjudged"]

        passed = not relevant
        new_status = "repaired" if passed else "reverified_fail"
        for f in applied:
            f.status = new_status

        logger.info(
            "kg_lpv.repair.reverify_done job_id=%s section_id=%s passed=%s findings_checked=%d",
            job.id, section_id, passed, len(relevant),
        )

    return total_tokens


async def _rebuild_segmented_plan(
    db: AsyncSession,
    segmented: SegmentedPlan,
    edited_texts: dict[str, str],
    sections_by_id: dict[str, dict],
) -> tuple[SegmentedPlan, int]:
    """Dựng lại `SegmentedPlan` để kiểm lại. Section KHÔNG đổi giữ nguyên nguyên
    trạng. Với MỖI section đã sửa:

    - Chỉ có ĐÚNG 1 segment con (clause/component) map tới section đó -> không có
      gì để tách nhầm, gán THẲNG toàn văn đoạn đã sửa cho segment đó (giữ tractable,
      §9 — không cần LLM).
    - Có NHIỀU segment con (VD nhiều mệnh đề mục tiêu cùng 1 section `muc_tieu`,
      hoặc đủ 4 thành phần của 1 hoạt động) -> gán thẳng toàn văn cho MỌI segment
      như cũ SẼ làm re-verify phán xử mỗi segment trên 1 khối văn bản trộn lẫn nội
      dung của các segment khác -> có thể che lấp lỗi còn sót ở segment KHÔNG được
      sửa (false pass) hoặc báo sai lỗi (false fail). Thay vào đó, TÁCH LẠI RIÊNG
      đoạn này qua `segmenter.segment` (scoped đúng 1 section, KHÔNG tách lại toàn
      bộ KHBD) để mỗi segment con dùng đúng văn bản của chính nó khi kiểm lại. Lỗi
      tách đoạn lại (LLM hỏng/timeout/validator fail) không được crash batch — rơi
      về gán thẳng toàn văn (hành vi cũ) cho các segment của section đó (§9 "an toàn
      khi hỏng").

    Trả `(SegmentedPlan đã dựng lại, tổng token đã dùng để tách đoạn lại)`.
    """
    total_tokens = 0
    new_clauses = [c for c in segmented.objective_clauses if c.section_id not in edited_texts]
    new_components = [c for c in segmented.activity_components if c.section_id not in edited_texts]

    for section_id, edited_text in edited_texts.items():
        old_clauses = [c for c in segmented.objective_clauses if c.section_id == section_id]
        old_components = [c for c in segmented.activity_components if c.section_id == section_id]

        if len(old_clauses) + len(old_components) > 1:
            original_section = sections_by_id.get(section_id)
            if original_section is not None:
                section_input = {**original_section, "content": edited_text}
                usage: dict[str, int] = {}
                try:
                    sub_plan = await segment(db, [section_input], usage=usage)
                    total_tokens += usage.get("tokens_used", 0)
                    new_clauses.extend(sub_plan.objective_clauses)
                    new_components.extend(sub_plan.activity_components)
                    continue
                except Exception as exc:  # noqa: BLE001 - tách đoạn lại hỏng không được crash batch (§9)
                    logger.warning(
                        "kg_lpv.repair.resegment_failed section_id=%s err=%s", section_id, type(exc).__name__,
                    )

        # Section chỉ 1 segment con, hoặc không tìm thấy section gốc, hoặc tách lại
        # thất bại -> gán thẳng toàn văn (hành vi dự phòng an toàn).
        new_clauses.extend(c.model_copy(update={"text": edited_text}) for c in old_clauses)
        new_components.extend(c.model_copy(update={"text": edited_text}) for c in old_components)

    return SegmentedPlan(objective_clauses=new_clauses, activity_components=new_components), total_tokens


def _dependent_activity_sections(segmented: SegmentedPlan, objective_section_id: str) -> set[str]:
    """Hoạt động được coi là "neo vào" mục tiêu thuộc `objective_section_id` nếu mục
    tiêu cục bộ của hoạt động (component MUC_TIEU) khớp đủ ngưỡng từ vựng với ÍT NHẤT
    1 mệnh đề mục tiêu của section đó — cùng kỹ thuật/ngưỡng với
    `n3_pedagogy.truc1_nhat_quan_doc` (đồ thị hai phía mục tiêu<->hoạt động)."""
    objective_texts = [c.text for c in segmented.objective_clauses if c.section_id == objective_section_id]
    if not objective_texts:
        return set()

    dependents: set[str] = set()
    for comp in segmented.activity_components:
        if comp.component != ActivityComponentType.MUC_TIEU:
            continue
        if any(
            _text_overlap_ratio(obj_text, comp.text) >= N3_OBJECTIVE_ACTIVITY_MATCH_THRESHOLD
            for obj_text in objective_texts
        ):
            dependents.add(comp.section_id)
    return dependents


def _normalize(text: str | None) -> str:
    return (text or "").strip().lower()


_WORD_PATTERN = re.compile(r"[\wÀ-ỹ]+", re.UNICODE)


def _text_overlap_ratio(a: str | None, b: str | None) -> float:
    """Tỉ lệ giao từ vựng giữa 2 đoạn văn, chuẩn hoá theo văn bản NGẮN HƠN (cùng kĩ
    thuật với `n3_pedagogy._text_overlap_ratio`)."""
    a_words = set(_WORD_PATTERN.findall(_normalize(a)))
    b_words = set(_WORD_PATTERN.findall(_normalize(b)))
    shorter_len = min(len(a_words), len(b_words))
    if shorter_len == 0:
        return 0.0
    return len(a_words & b_words) / shorter_len


async def run_repair_job(job_id: int, finding_ids: list[int], overrides: dict[int, str] | None = None) -> None:
    """Job nền `POST /jobs/{job_id}/repair` — mở session DB riêng (cùng pattern
    `orchestrator.run_job`), tải job + các finding được chọn, chạy `repair(...)`,
    rồi chuyển `job.status` sang `repaired`. Không bao giờ để exception thoát ra
    ngoài — mọi lỗi được ghi vào `job.error_message` và `status='failed'`."""
    async with AsyncSessionLocal() as db:
        job = await db.get(KgLpvJob, job_id)
        if job is None:
            logger.warning("kg_lpv.repair.job_not_found job_id=%s", job_id)
            return

        try:
            result = await db.execute(select(KgLpvFinding).where(KgLpvFinding.id.in_(finding_ids)))
            findings = result.scalars().all()

            await repair(db, job, list(findings), overrides=overrides)

            job.status = "repaired"
            await db.commit()
            logger.info("kg_lpv.repair.job_done job_id=%s", job_id)

        except Exception as exc:  # noqa: BLE001 - job nền: mọi lỗi phải được chặn lại ở đây
            job.status = "failed"
            job.error_message = f"Lỗi khi sửa & kiểm lại: {str(exc)[:400]}"
            await db.commit()
            logger.error("kg_lpv.repair.job_failed job_id=%s error=%s", job_id, exc)
