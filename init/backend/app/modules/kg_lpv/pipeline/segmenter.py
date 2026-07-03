"""Bước 1 — Tách đoạn (`segmenter.py`).

`async def segment(db, sections: list[dict]) -> SegmentedPlan`

Tận dụng cấu trúc `SavedLessonPlan.sections` sẵn có: với mỗi section hoạt động
(`khoi_dong`, `hinh_thanh_kien_thuc_X`, `luyen_tap`, `van_dung`) bóc 4 thành phần
`{muc_tieu, noi_dung, san_pham, to_chuc_thuc_hien}`; với section `muc_tieu` tách
từng mệnh đề mục tiêu riêng lẻ kèm loại. Sau khi LLM trả JSON, chạy validator
THUẦN THUẬT TOÁN (không LLM): đúng kiểu dữ liệu (Pydantic), `segment_id` duy
nhất, mọi segment ánh xạ về đúng `section_id` gốc, không mất nội dung (tổng độ
dài văn bản khớp ±5%). Fail bất kỳ điều kiện nào -> raise `SegmentationValidationError`
để orchestrator đánh dấu job `failed`.
"""
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.kg_lpv.llm import generate_json
from app.modules.kg_lpv.prompts.segmentation import build_segmentation_prompt
from app.modules.kg_lpv.schemas import SegmentedPlan
from app.services.admin_ai_model_registry import FEATURE_KG_LPV_SEGMENTATION

_ACTIVITY_PREFIXES = ("khoi_dong", "hinh_thanh_kien_thuc", "luyen_tap", "van_dung")
_OBJECTIVE_SECTION_TYPE = "muc_tieu"
_CONTENT_LENGTH_TOLERANCE = 0.05


class SegmentationValidationError(Exception):
    """Lỗi cấu trúc phát hiện bởi validator thuật toán sau khi LLM tách đoạn."""


def _is_activity_section(section: dict) -> bool:
    section_type = section.get("section_type") or ""
    return any(section_type.startswith(prefix) for prefix in _ACTIVITY_PREFIXES)


def _is_segmentable(section: dict) -> bool:
    return section.get("section_type") == _OBJECTIVE_SECTION_TYPE or _is_activity_section(section)


async def segment(
    db: AsyncSession,
    sections: list[dict],
    *,
    usage: dict[str, int] | None = None,
) -> SegmentedPlan:
    """Tách sâu section mục tiêu/hoạt động của KHBD thành segment nguyên tử.

    Nếu `usage` (dict rỗng) được truyền vào, hàm ghi `usage["tokens_used"]` với
    số token đã dùng cho lời gọi LLM — cho phép orchestrator trừ token thực
    dùng mà không đổi chữ ký gọi cơ bản `segment(db, sections)`.
    """
    segmentable_sections = [s for s in sections if _is_segmentable(s)]

    if not segmentable_sections:
        return SegmentedPlan()

    prompt = build_segmentation_prompt(segmentable_sections)
    data, tokens_used = await generate_json(db, FEATURE_KG_LPV_SEGMENTATION, prompt)
    if usage is not None:
        usage["tokens_used"] = tokens_used

    plan = _parse_plan(data)
    _validate(sections, plan)
    return plan


def _parse_plan(data: dict) -> SegmentedPlan:
    try:
        return SegmentedPlan.model_validate(data)
    except ValidationError as exc:
        raise SegmentationValidationError(
            f"AI trả về cấu trúc tách đoạn không đúng schema: {exc}"
        ) from exc


def _validate(sections: list[dict], plan: SegmentedPlan) -> None:
    valid_section_ids = {s.get("section_id") for s in sections}
    all_segments = [*plan.objective_clauses, *plan.activity_components]

    seen_ids: set[str] = set()
    for seg in all_segments:
        if seg.segment_id in seen_ids:
            raise SegmentationValidationError(f"segment_id trùng lặp: {seg.segment_id}")
        seen_ids.add(seg.segment_id)

        if seg.section_id not in valid_section_ids:
            raise SegmentationValidationError(
                f"Segment '{seg.segment_id}' ánh xạ tới section_id không tồn tại trong KHBD: {seg.section_id}"
            )

    input_len = sum(
        len(s.get("content") or "") for s in sections if _is_segmentable(s)
    )
    output_len = sum(len(seg.text) for seg in all_segments)

    if input_len > 0:
        diff_ratio = abs(output_len - input_len) / input_len
        if diff_ratio > _CONTENT_LENGTH_TOLERANCE:
            raise SegmentationValidationError(
                "Tổng độ dài nội dung sau tách đoạn lệch "
                f"{diff_ratio:.1%} so với gốc (gốc={input_len} ký tự, sau tách="
                f"{output_len} ký tự, ngưỡng cho phép=±{_CONTENT_LENGTH_TOLERANCE:.0%}) "
                "— khả năng mất nội dung."
            )
