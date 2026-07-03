"""Test Bước 1 tách đoạn (segmenter): mock LLM (generate_json), validator thuần thuật toán."""
from unittest.mock import AsyncMock, patch

import pytest

from app.modules.kg_lpv.pipeline.segmenter import SegmentationValidationError, segment
from app.modules.kg_lpv.schemas import SegmentedPlan

_PATCH_TARGET = "app.modules.kg_lpv.pipeline.segmenter.generate_json"

SECTIONS = [
    {
        "section_id": "muc_tieu",
        "section_type": "muc_tieu",
        "title": "Mục tiêu",
        "content": "Trình bày được khái niệm mạng máy tính. Rèn luyện năng lực hợp tác.",
    },
    {
        "section_id": "khoi_dong",
        "section_type": "khoi_dong",
        "title": "Khởi động",
        "content": (
            "Mục tiêu: dẫn nhập. Nội dung: xem video."
            " Sản phẩm: câu trả lời. Tổ chức: GV chiếu video, HS trả lời."
        ),
    },
    {
        "section_id": "thiet_bi",
        "section_type": "thiet_bi",
        "title": "Thiết bị",
        "content": "Máy chiếu, máy tính.",
    },
]


def _valid_llm_response() -> dict:
    return {
        "objective_clauses": [
            {
                "segment_id": "muc_tieu__1",
                "section_id": "muc_tieu",
                "loai": "kien_thuc",
                "text": "Trình bày được khái niệm mạng máy tính.",
            },
            {
                "segment_id": "muc_tieu__2",
                "section_id": "muc_tieu",
                "loai": "nang_luc_chung",
                "text": " Rèn luyện năng lực hợp tác.",
            },
        ],
        "activity_components": [
            {
                "segment_id": "khoi_dong__muc_tieu",
                "section_id": "khoi_dong",
                "component": "muc_tieu",
                "text": "Mục tiêu: dẫn nhập.",
            },
            {
                "segment_id": "khoi_dong__noi_dung",
                "section_id": "khoi_dong",
                "component": "noi_dung",
                "text": " Nội dung: xem video.",
            },
            {
                "segment_id": "khoi_dong__san_pham",
                "section_id": "khoi_dong",
                "component": "san_pham",
                "text": " Sản phẩm: câu trả lời.",
            },
            {
                "segment_id": "khoi_dong__to_chuc",
                "section_id": "khoi_dong",
                "component": "to_chuc_thuc_hien",
                "text": " Tổ chức: GV chiếu video, HS trả lời.",
            },
        ],
    }


@pytest.mark.asyncio
async def test_segment_splits_activity_into_4_components_and_tags_objectives():
    with patch(_PATCH_TARGET, new=AsyncMock(return_value=(_valid_llm_response(), 123))):
        usage: dict = {}
        plan = await segment(db=object(), sections=SECTIONS, usage=usage)

    assert isinstance(plan, SegmentedPlan)
    assert usage["tokens_used"] == 123

    assert len(plan.objective_clauses) == 2
    assert {c.loai.value for c in plan.objective_clauses} == {"kien_thuc", "nang_luc_chung"}
    assert all(c.section_id == "muc_tieu" for c in plan.objective_clauses)

    assert len(plan.activity_components) == 4
    assert {c.component.value for c in plan.activity_components} == {
        "muc_tieu",
        "noi_dung",
        "san_pham",
        "to_chuc_thuc_hien",
    }
    assert all(c.section_id == "khoi_dong" for c in plan.activity_components)


@pytest.mark.asyncio
async def test_segment_with_no_segmentable_sections_returns_empty_plan_without_calling_llm():
    only_thiet_bi = [SECTIONS[2]]
    mock_llm = AsyncMock(return_value=(_valid_llm_response(), 999))
    with patch(_PATCH_TARGET, new=mock_llm):
        plan = await segment(db=object(), sections=only_thiet_bi)

    assert plan.objective_clauses == []
    assert plan.activity_components == []
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_segment_raises_on_duplicate_segment_id():
    bad = _valid_llm_response()
    bad["activity_components"][1]["segment_id"] = bad["activity_components"][0]["segment_id"]
    with patch(_PATCH_TARGET, new=AsyncMock(return_value=(bad, 10))):
        with pytest.raises(SegmentationValidationError):
            await segment(db=object(), sections=SECTIONS)


@pytest.mark.asyncio
async def test_segment_raises_on_unknown_section_id():
    bad = _valid_llm_response()
    bad["activity_components"][0]["section_id"] = "khong_ton_tai"
    with patch(_PATCH_TARGET, new=AsyncMock(return_value=(bad, 10))):
        with pytest.raises(SegmentationValidationError):
            await segment(db=object(), sections=SECTIONS)


@pytest.mark.asyncio
async def test_segment_raises_when_content_lost():
    bad = _valid_llm_response()
    # Drop 3 of 4 activity components -> total extracted length far below original (>5% off)
    bad["activity_components"] = bad["activity_components"][:1]
    with patch(_PATCH_TARGET, new=AsyncMock(return_value=(bad, 10))):
        with pytest.raises(SegmentationValidationError):
            await segment(db=object(), sections=SECTIONS)


@pytest.mark.asyncio
async def test_segment_raises_on_invalid_type_from_llm():
    bad = _valid_llm_response()
    bad["objective_clauses"][0]["loai"] = "khong_hop_le"
    with patch(_PATCH_TARGET, new=AsyncMock(return_value=(bad, 10))):
        with pytest.raises(SegmentationValidationError):
            await segment(db=object(), sections=SECTIONS)
