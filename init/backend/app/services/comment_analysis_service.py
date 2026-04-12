"""
CommentAnalysisService — Phân tích nhận xét GV trên KHBD, sinh teaching rules.
Chạy ngầm qua FastAPI BackgroundTasks, tự cập nhật DB khi xong.
"""
import json
import logging
import os
import re

import google.generativeai as genai
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.teaching_rule import TeachingRule
from app.models.lesson_plan_comment import LessonPlanComment
from app.models.saved_lesson_plan import SavedLessonPlan
from app.prompts.comment_analysis import build_comment_analysis_prompt
from app.prompts.rule_compression import (
    build_rule_compression_prompt,
    GENERAL_RULES_BUDGET,
    LESSON_RULES_BUDGET,
    GENERAL_RULES_COMPRESS_THRESHOLD,
    LESSON_RULES_COMPRESS_THRESHOLD,
    SINGLE_RULE_MAX_CHARS,
)
from app.services.admin_ai_model_registry import (
    FEATURE_COMMENT_ANALYSIS,
    get_effective_model_for_feature,
)

logger = logging.getLogger(__name__)

_TRAILING_PUNCT_RE = re.compile(r"[\s\.,;:!?…]+$")


def _normalize_rule_text(text: str) -> str:
    """Normalize rule text for duplicate detection.

    Keep semantic text, ignore trivial case/spacing/punctuation variations.
    """
    normalized = (text or "").replace("**", "").strip().lower()
    normalized = re.sub(r"\s+", " ", normalized)
    normalized = _TRAILING_PUNCT_RE.sub("", normalized)
    return normalized


def _dedupe_rule_contents(contents: list[str]) -> list[str]:
    """Dedupe rules by normalized content while preserving original order."""
    seen: set[str] = set()
    deduped: list[str] = []
    for content in contents:
        key = _normalize_rule_text(content)
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(content.strip())
    return deduped


def _get_gemini_model(model_name: str):
    """Tạo Gemini model instance cho phân tích comment (JSON output)."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config={
            "temperature": 0.1,
            "max_output_tokens": 4096,
            "response_mime_type": "application/json",
        },
    )


async def run_background_analysis(lesson_plan_id: int, teacher_id: int) -> None:
    """Entry point chạy ngầm — tự mở session, phân tích, tạo rules, đóng session.

    Được gọi từ BackgroundTasks.add_task(). Không raise exception ra ngoài.
    """
    try:
        async with AsyncSessionLocal() as db:
            await _analyze_and_create_rules(db, lesson_plan_id, teacher_id)
    except Exception:
        logger.exception(
            "Background analysis failed: plan_id=%s teacher_id=%s",
            lesson_plan_id, teacher_id,
        )
        # Đánh dấu comments thất bại
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(LessonPlanComment)
                    .where(
                        LessonPlanComment.lesson_plan_id == lesson_plan_id,
                        LessonPlanComment.teacher_id == teacher_id,
                        LessonPlanComment.analysis_status == "processing",
                        LessonPlanComment.parent_comment_id.is_(None),
                    )
                    .values(analysis_status="failed")
                )
                await db.commit()
        except Exception:
            logger.exception("Failed to mark comments as failed")


async def _analyze_and_create_rules(
    db: AsyncSession, lesson_plan_id: int, teacher_id: int
) -> None:
    """Core logic: lấy comments pending → gọi Gemini → tạo rules → nén nếu cần."""

    # 1. Lấy KHBD content
    plan = await db.get(SavedLessonPlan, lesson_plan_id)
    if not plan:
        logger.warning("Plan %s not found, skipping analysis", lesson_plan_id)
        return

    khbd_content = plan.content or ""

    # 2. Lấy comments đang processing
    result = await db.execute(
        select(LessonPlanComment)
        .where(
            LessonPlanComment.lesson_plan_id == lesson_plan_id,
            LessonPlanComment.teacher_id == teacher_id,
            LessonPlanComment.analysis_status == "processing",
            LessonPlanComment.parent_comment_id.is_(None),
            LessonPlanComment.is_resolved == False,  # noqa: E712
        )
        .order_by(LessonPlanComment.created_at)
    )
    comments = list(result.scalars().all())

    if not comments:
        logger.info("No processing comments for plan %s", lesson_plan_id)
        return

    # 3. Build prompt — kèm list general rules hiện tại để LLM dedup theo chủ đề
    comments_for_prompt = [
        {
            "index": i + 1,
            "selected_text": c.selected_text,
            "context_before": c.context_before or "",
            "context_after": c.context_after or "",
            "comment_text": c.comment_text,
        }
        for i, c in enumerate(comments)
    ]

    existing_rules_result = await db.execute(
        select(TeachingRule.id, TeachingRule.content)
        .where(
            TeachingRule.teacher_id == teacher_id,
            TeachingRule.rule_type == "TEACHER_GENERAL",
            TeachingRule.is_active == True,  # noqa: E712
        )
        .order_by(TeachingRule.created_at)
    )
    existing_general_rules = [
        {"id": row[0], "content": row[1]} for row in existing_rules_result.all()
    ]
    existing_rule_ids = {r["id"] for r in existing_general_rules}

    active_rules_result = await db.execute(
        select(
            TeachingRule.id,
            TeachingRule.rule_type,
            TeachingRule.lesson_id,
            TeachingRule.content,
        ).where(
            TeachingRule.teacher_id == teacher_id,
            TeachingRule.is_active == True,  # noqa: E712
        )
    )
    active_rule_key_to_id: dict[tuple[str, str | None, str], int] = {}
    for rid, rtype, rlesson_id, rcontent in active_rules_result.all():
        normalized = _normalize_rule_text(rcontent or "")
        if not normalized:
            continue
        key = (rtype, rlesson_id, normalized)
        if key not in active_rule_key_to_id:
            active_rule_key_to_id[key] = rid

    prompt = build_comment_analysis_prompt(
        khbd_content, comments_for_prompt, existing_general_rules
    )

    # 4. Gọi Gemini
    model_name = await get_effective_model_for_feature(db, FEATURE_COMMENT_ANALYSIS)
    model = _get_gemini_model(model_name)
    response = model.generate_content(prompt)
    raw = (response.text or "").strip()

    if not raw:
        logger.warning("Empty response from Gemini for plan %s", lesson_plan_id)
        for c in comments:
            c.analysis_status = "failed"
        await db.commit()
        return

    # 5. Parse response
    try:
        analysis_results = json.loads(raw)
    except json.JSONDecodeError:
        logger.error("Invalid JSON from Gemini: %s...", raw[:200])
        for c in comments:
            c.analysis_status = "failed"
        await db.commit()
        return

    # 6. Lấy lesson_id từ plan
    lesson_id = plan.lesson_id

    # 7. Deactivate rules TEACHER_LESSON cũ cùng lesson_id (nếu có) — chỉ giữ bản mới nhất
    if lesson_id:
        has_lesson_specific = any(
            r.get("classification") == "lesson_specific"
            for r in analysis_results
            if isinstance(r, dict)
        )
        if has_lesson_specific:
            await db.execute(
                update(TeachingRule)
                .where(
                    TeachingRule.teacher_id == teacher_id,
                    TeachingRule.rule_type == "TEACHER_LESSON",
                    TeachingRule.lesson_id == lesson_id,
                    TeachingRule.is_active == True,  # noqa: E712
                )
                .values(is_active=False)
            )

    # 8. Tạo rules từ kết quả phân tích + gom supersession ids
    supersede_ids: set[int] = set()
    for item in analysis_results:
        if not isinstance(item, dict):
            continue
        idx = item.get("comment_index")
        classification = item.get("classification")
        rule_text = item.get("rule_text")

        # Tìm comment tương ứng
        if not idx or idx < 1 or idx > len(comments):
            continue
        comment = comments[idx - 1]

        if classification == "skip" or not rule_text:
            comment.analysis_status = "skipped"
            continue

        # Truncate rule nếu quá dài
        if len(rule_text) > SINGLE_RULE_MAX_CHARS:
            rule_text = rule_text[:SINGLE_RULE_MAX_CHARS].rsplit(" ", 1)[0]

        # Xác định rule_type
        if classification == "general":
            rule_type = "TEACHER_GENERAL"
            rule_lesson_id = None
        elif classification == "lesson_specific":
            rule_type = "TEACHER_LESSON"
            rule_lesson_id = lesson_id
        else:
            comment.analysis_status = "skipped"
            continue

        normalized_rule_text = _normalize_rule_text(rule_text)
        if not normalized_rule_text:
            comment.analysis_status = "skipped"
            continue

        dedupe_key = (rule_type, rule_lesson_id, normalized_rule_text)
        duplicate_rule_id = active_rule_key_to_id.get(dedupe_key)
        if duplicate_rule_id:
            comment.rule_id = duplicate_rule_id
            comment.analysis_status = "completed"
            continue

        # Tạo rule
        new_rule = TeachingRule(
            teacher_id=teacher_id,
            rule_type=rule_type,
            lesson_id=rule_lesson_id,
            source_plan_id=lesson_plan_id,
            content=rule_text,
        )
        db.add(new_rule)
        await db.flush()  # lấy id

        active_rule_key_to_id[dedupe_key] = new_rule.id

        comment.rule_id = new_rule.id
        comment.analysis_status = "completed"

        # Gom supersede ids (chỉ nhận cho TEACHER_GENERAL, chỉ nhận id hợp lệ
        # thuộc về teacher này và không trùng rule vừa tạo).
        if rule_type == "TEACHER_GENERAL":
            raw_supersedes = item.get("supersedes_rule_ids") or []
            if isinstance(raw_supersedes, list):
                for rid in raw_supersedes:
                    if isinstance(rid, int) and rid in existing_rule_ids:
                        supersede_ids.add(rid)

    # Deactivate các rule bị thay thế — rule mới đã có trong session, flush
    # đã xong nên id không trùng.
    if supersede_ids:
        await db.execute(
            update(TeachingRule)
            .where(
                TeachingRule.id.in_(supersede_ids),
                TeachingRule.teacher_id == teacher_id,
            )
            .values(is_active=False)
        )
        logger.info(
            "Superseded %d general rules for teacher %s: %s",
            len(supersede_ids), teacher_id, sorted(supersede_ids),
        )

    await db.commit()
    logger.info(
        "Analysis completed for plan %s: %d comments processed",
        lesson_plan_id, len(comments),
    )

    # 9. Check & nén rules nếu vượt budget
    await _compress_if_needed(db, teacher_id, "TEACHER_GENERAL", None)
    if lesson_id:
        await _compress_if_needed(db, teacher_id, "TEACHER_LESSON", lesson_id)


async def _compress_if_needed(
    db: AsyncSession,
    teacher_id: int,
    rule_type: str,
    lesson_id: str | None,
) -> None:
    """Kiểm tra tổng ký tự rules active, nén nếu vượt threshold."""
    # Xác định threshold & budget
    if rule_type == "TEACHER_GENERAL":
        threshold = GENERAL_RULES_COMPRESS_THRESHOLD
        budget = GENERAL_RULES_BUDGET
    else:
        threshold = LESSON_RULES_COMPRESS_THRESHOLD
        budget = LESSON_RULES_BUDGET

    # Query tất cả active rules cùng loại
    query = (
        select(TeachingRule)
        .where(
            TeachingRule.teacher_id == teacher_id,
            TeachingRule.rule_type == rule_type,
            TeachingRule.is_active == True,  # noqa: E712
        )
        .order_by(TeachingRule.created_at)
    )
    if lesson_id:
        query = query.where(TeachingRule.lesson_id == lesson_id)

    result = await db.execute(query)
    rules = list(result.scalars().all())

    total_chars = sum(len(r.content) for r in rules)
    if total_chars < threshold or len(rules) <= 1:
        return

    logger.info(
        "Compressing %s rules for teacher %s (lesson=%s): %d chars > %d threshold",
        rule_type, teacher_id, lesson_id, total_chars, threshold,
    )

    # Build prompt nén
    rules_for_prompt = [
        {
            "index": i + 1,
            "content": r.content,
            "age": "mới" if i == len(rules) - 1 else "cũ",
        }
        for i, r in enumerate(rules)
    ]
    max_output = int(budget * 0.75)  # output ≤ 75% budget để có room
    prompt = build_rule_compression_prompt(rules_for_prompt, max_output)

    try:
        model_name = await get_effective_model_for_feature(db, FEATURE_COMMENT_ANALYSIS)
        model = _get_gemini_model(model_name)
        response = model.generate_content(prompt)
        raw = (response.text or "").strip()
        compressed = json.loads(raw)
    except Exception:
        logger.exception("Compression failed, fallback: deactivate oldest rules")
        # Fallback: deactivate rules cũ nhất cho đến khi ≤ budget
        for r in rules:
            if total_chars <= budget:
                break
            r.is_active = False
            total_chars -= len(r.content)
        await db.commit()
        return

    # Deactivate tất cả rules cũ
    old_ids = [r.id for r in rules]
    await db.execute(
        update(TeachingRule)
        .where(TeachingRule.id.in_(old_ids))
        .values(is_active=False)
    )

    # Tạo rules mới từ kết quả nén
    for item in compressed:
        if not isinstance(item, dict):
            continue
        rule_text = item.get("rule_text", "")
        if not rule_text:
            continue
        if len(rule_text) > SINGLE_RULE_MAX_CHARS:
            rule_text = rule_text[:SINGLE_RULE_MAX_CHARS].rsplit(" ", 1)[0]

        new_rule = TeachingRule(
            teacher_id=teacher_id,
            rule_type=rule_type,
            lesson_id=lesson_id,
            content=rule_text,
            merged_from=old_ids,
        )
        db.add(new_rule)

    await db.commit()
    logger.info("Compression done: %d rules → %d rules", len(rules), len(compressed))


async def get_rules_for_prompt(
    db: AsyncSession,
    teacher_id: int,
    lesson_id: str | None,
) -> tuple[list[str], list[str]]:
    """Query active rules cho GV, trả về (general_rules, lesson_rules).

    Dùng khi sinh KHBD — inject vào prompt.
    """
    # TEACHER_GENERAL
    result = await db.execute(
        select(TeachingRule.content)
        .where(
            TeachingRule.teacher_id == teacher_id,
            TeachingRule.rule_type == "TEACHER_GENERAL",
            TeachingRule.is_active == True,  # noqa: E712
        )
        .order_by(TeachingRule.created_at)
    )
    general_rules = [row[0] for row in result.all()]
    general_rules = _dedupe_rule_contents(general_rules)

    # TEACHER_LESSON — chỉ lấy nếu có lesson_id
    lesson_rules: list[str] = []
    if lesson_id:
        result = await db.execute(
            select(TeachingRule.content)
            .where(
                TeachingRule.teacher_id == teacher_id,
                TeachingRule.rule_type == "TEACHER_LESSON",
                TeachingRule.lesson_id == lesson_id,
                TeachingRule.is_active == True,  # noqa: E712
            )
            .order_by(TeachingRule.created_at)
        )
        lesson_rules = [row[0] for row in result.all()]
        lesson_rules = _dedupe_rule_contents(lesson_rules)

    return general_rules, lesson_rules


async def deactivate_lesson_rules_on_delete(
    db: AsyncSession,
    teacher_id: int,
    lesson_plan_id: int,
) -> None:
    """Khi xóa KHBD: deactivate rules TEACHER_LESSON gắn với bản này."""
    # Lấy lesson_id trước khi xóa
    plan = await db.get(SavedLessonPlan, lesson_plan_id)
    if not plan or not plan.lesson_id:
        return

    # Deactivate rules gắn source_plan_id = bản bị xóa
    await db.execute(
        update(TeachingRule)
        .where(
            TeachingRule.source_plan_id == lesson_plan_id,
            TeachingRule.rule_type == "TEACHER_LESSON",
            TeachingRule.is_active == True,  # noqa: E712
        )
        .values(is_active=False)
    )
