"""Test N2 đối chiếu chương trình (M1-M6): RULE (M1,M3,M4,M5) + LLM_JUDGE (M2,M6).

Đồ thị FAKE (không Neo4j thật) qua `lesson_ctx` (LessonContext) canned trực tiếp;
`llm.generate_json` bị monkeypatch — không gọi Gemini thật.
"""
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError

from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.pipeline import n2_curriculum
from app.modules.kg_lpv.pipeline.n2_curriculum import n2_verify
from app.modules.kg_lpv.schemas import (
    ActivityComponentSegment,
    Finding,
    LessonContext,
    ObjectiveClauseSegment,
    SegmentedPlan,
)

pytestmark = pytest.mark.asyncio


# ---------------- Gói ngữ cảnh bài học (LessonContext) dùng chung ----------------

YCCD_NHAN_BIET = {
    "ma_dinh_danh": "YCCD-1",
    "ten": "Trình bày được khái niệm mạng máy tính và vai trò của mạng trong đời sống",
    "muc_nhan_thuc": {"ma_dinh_danh": "MNT-NHAN-BIET", "ten": "Nhận biết", "bac": 1},
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.15",
}

YCCD_VAN_DUNG = {
    "ma_dinh_danh": "YCCD-2",
    "ten": "Vận dụng được kiến thức mạng máy tính để giải quyết vấn đề thực tế phức tạp trong học tập",
    "muc_nhan_thuc": {"ma_dinh_danh": "MNT-VAN-DUNG", "ten": "Vận dụng", "bac": 3},
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.16",
}

NL_TIN_A = {
    "ma_dinh_danh": "NL-TIN-A",
    "ten": "NLa: Sử dụng và quản lí các phương tiện công nghệ thông tin và truyền thông",
    "ma_nang_luc": "NLa",
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.8",
}

NLC_TU_CHU = {
    "ma_dinh_danh": "NLC-TU-CHU",
    "ten": "Tự chủ và tự học",
    "ma_nguon": "CT-TONGT-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.5",
}

PC_CHAM_CHI = {
    "ma_dinh_danh": "PC-CHAM-CHI",
    "ten": "Chăm chỉ",
    "ma_nguon": "CT-TONGT-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.6",
}

CHI_BAO_NLS = {
    "ma_dinh_danh": "NLS-CB-5.1.NC1a",
    "ten": "Đánh giá được các vấn đề kĩ thuật khi sử dụng môi trường số và vận hành các thiết bị số",
    "ma_chi_bao": "5.1.NC1a",
    "muc_do": [
        {
            "ma_dinh_danh": "NLS-MD-5.1.NC1a-KL10-M1",
            "muc": 1,
            "ma_nguon": "CV-3456-PHULUC",
            "so_ky_hieu": "3456/BGDĐT-GDPT",
            "ngay_hieu_luc": "2021-08-20",
            "vi_tri_trang": "tr.12",
        }
    ],
    "ma_nguon": "CV-3456-PHULUC",
    "so_ky_hieu": "3456/BGDĐT-GDPT",
    "ngay_hieu_luc": "2021-08-20",
    "vi_tri_trang": "tr.12",
}

MENH_DE_KIEN_THUC = {
    "ma_dinh_danh": "MDKT-TIN10-C1-B1-01",
    "ten": "Thông tin là sự phản ánh các hiện tượng, sự vật; dữ liệu là thông tin đã được mã hoá",
    "ma_nguon": "SGK-TIN10-KNTT",
    "so_ky_hieu": "SGK-TIN10-2022",
    "ngay_hieu_luc": "2022-06-01",
    "vi_tri_trang": "tr.10",
}

DONG_TU_NHAN_THUC = {
    "do_duoc": [
        {"dong_tu": "trình bày được", "bac": 1},
        {"dong_tu": "vận dụng được", "bac": 3},
        {"dong_tu": "sử dụng được", "bac": 2},
    ],
    "khong_do_duoc": ["biết", "hiểu", "nắm được", "nắm vững"],
}


def _lesson_ctx(**overrides) -> LessonContext:
    base = dict(
        lesson={"ma_dinh_danh": "BH-TIN10-C1-B1", "ten": "Bài 1: Thông tin và xử lý thông tin"},
        yccd=[YCCD_NHAN_BIET, YCCD_VAN_DUNG],
        nang_luc_tin_hoc=[NL_TIN_A],
        nang_luc_chung=[NLC_TU_CHU],
        pham_chat=[PC_CHAM_CHI],
        chi_bao_nls=[CHI_BAO_NLS],
        menh_de_kien_thuc=[MENH_DE_KIEN_THUC],
        dong_tu_nhan_thuc=DONG_TU_NHAN_THUC,
    )
    base.update(overrides)
    return LessonContext(**base)


def _obj(segment_id, loai, text) -> ObjectiveClauseSegment:
    return ObjectiveClauseSegment(segment_id=segment_id, section_id="muc_tieu", loai=loai, text=text)


def _act(segment_id, component, text, section_id="hinh_thanh_kien_thuc_1") -> ActivityComponentSegment:
    return ActivityComponentSegment(segment_id=segment_id, section_id=section_id, component=component, text=text)


class _FakeGraph:
    """Graph không được N2 truy vấn lại (lesson_ctx đã truy hồi 1 lần) — chỉ để khớp chữ ký."""


async def _n2(segmented: SegmentedPlan, lesson_ctx: LessonContext, db=None) -> tuple[list[Finding], set[str]]:
    return await n2_verify(db, segmented, lesson_ctx, _FakeGraph())


# =========================== M1 — mục tiêu kiến thức lệch YCCĐ ===========================


async def test_m1_clean_objective_matches_yccd_at_required_level():
    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", YCCD_NHAN_BIET["ten"])])
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M1] == []


async def test_m1_objective_not_grounded_in_any_yccd_produces_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được lịch sử hình thành ngôn ngữ lập trình Python")]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    m1 = [f for f in findings if f.code == ErrorCode.M1]
    assert len(m1) == 1
    assert m1[0].branch == VerificationBranch.N2
    assert m1[0].evidence


async def test_m1_objective_below_required_muc_nhan_thuc_produces_finding():
    # Khớp YCCD-2 (bậc 3 - Vận dụng) nhưng dùng động từ chỉ đạt bậc 1 (Trình bày được)
    plan = SegmentedPlan(
        objective_clauses=[
            _obj(
                "o1",
                "kien_thuc",
                "Trình bày được kiến thức mạng máy tính để giải quyết vấn đề thực tế phức tạp trong học tập",
            )
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    m1 = [f for f in findings if f.code == ErrorCode.M1]
    assert len(m1) == 1
    assert m1[0].evidence


# =========================== M2 — động từ không đo lường được ===========================


async def test_m2_measurable_verb_from_table_passes_without_llm(monkeypatch):
    mock_llm = AsyncMock()
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", YCCD_NHAN_BIET["ten"])])
    findings, _ = await _n2(plan, _lesson_ctx())

    assert [f for f in findings if f.code == ErrorCode.M2] == []
    mock_llm.assert_not_called()


async def test_m2_non_measurable_verb_from_table_produces_finding_without_llm(monkeypatch):
    mock_llm = AsyncMock()
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", "Biết khái niệm mạng máy tính cơ bản")])
    findings, _ = await _n2(plan, _lesson_ctx())

    m2 = [f for f in findings if f.code == ErrorCode.M2]
    assert len(m2) == 1
    assert m2[0].evidence
    mock_llm.assert_not_called()


async def test_m2_verb_not_in_table_falls_back_to_llm_and_flags_non_measurable(monkeypatch):
    mock_llm = AsyncMock(
        return_value=(
            {"verdict": "khong_do_duoc", "evidence_refs": [], "explanation": "Động từ mơ hồ, không quan sát được."},
            10,
        )
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", "Cảm nhận được vẻ đẹp của mạng máy tính")])
    findings, _ = await _n2(plan, _lesson_ctx())

    m2 = [f for f in findings if f.code == ErrorCode.M2]
    assert len(m2) == 1
    assert m2[0].evidence
    mock_llm.assert_called_once()


async def test_m2_verb_not_in_table_llm_says_measurable_produces_no_finding(monkeypatch):
    mock_llm = AsyncMock(
        return_value=({"verdict": "do_duoc", "evidence_refs": [], "explanation": "Quan sát được."}, 10)
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", "Phân tích được cấu trúc mạng máy tính")])
    findings, _ = await _n2(plan, _lesson_ctx())

    assert [f for f in findings if f.code == ErrorCode.M2] == []
    mock_llm.assert_called_once()


async def test_m2_llm_failure_does_not_crash_and_yields_no_finding(monkeypatch):
    from app.modules.kg_lpv.llm import LlmJsonError

    mock_llm = AsyncMock(side_effect=LlmJsonError("JSON hỏng"))
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(objective_clauses=[_obj("o1", "kien_thuc", "Cảm nhận được vẻ đẹp của mạng máy tính")])
    findings, _ = await _n2(plan, _lesson_ctx())

    assert [f for f in findings if f.code == ErrorCode.M2] == []


# =========================== M3 — năng lực tin học không khớp chương trình ===========================


async def test_m3_declared_code_exists_in_catalog_passes():
    plan = SegmentedPlan(
        objective_clauses=[
            _obj("o1", "nang_luc_tin_hoc", "NLa: Sử dụng được trình duyệt web để tìm kiếm thông tin")
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M3] == []


async def test_m3_declared_code_missing_from_catalog_produces_finding():
    plan = SegmentedPlan(
        objective_clauses=[
            _obj("o1", "nang_luc_tin_hoc", "NLd: Giải quyết vấn đề với sự hỗ trợ của công nghệ thông tin")
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    m3 = [f for f in findings if f.code == ErrorCode.M3]
    assert len(m3) == 1
    assert m3[0].evidence


async def test_m3_no_declared_code_at_all_is_not_checked():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_tin_hoc", "Sử dụng thành thạo công cụ tìm kiếm thông tin")]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M3] == []


# =========================== M4 — NL chung/phẩm chất không khớp CT tổng thể ===========================


async def test_m4_nang_luc_chung_matches_catalog_passes():
    plan = SegmentedPlan(
        objective_clauses=[
            _obj("o1", "nang_luc_chung", "Tự chủ và tự học: chủ động tìm hiểu nội dung bài học trước khi đến lớp")
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M4] == []


async def test_m4_pham_chat_matches_catalog_passes():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "pham_chat", "Chăm chỉ: tích cực hoàn thành nhiệm vụ học tập được giao")]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M4] == []


async def test_m4_nang_luc_chung_not_in_catalog_produces_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_chung", "Yêu nước và tự hào truyền thống dân tộc Việt Nam")]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    m4 = [f for f in findings if f.code == ErrorCode.M4]
    assert len(m4) == 1
    assert m4[0].evidence


# =========================== M5 — năng lực số không khớp khung quy định ===========================


async def test_m5_declared_chi_bao_with_muc_do_passes():
    plan = SegmentedPlan(
        objective_clauses=[
            _obj(
                "o1",
                "nang_luc_so",
                "5.1.NC1a: Đánh giá được vấn đề kĩ thuật khi sử dụng thiết bị số trong lớp học",
            )
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M5] == []


async def test_m5_declared_chi_bao_not_found_produces_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_so", "9.9.XX1a: Một chỉ báo năng lực số không tồn tại")]
    )
    findings, _ = await _n2(plan, _lesson_ctx())
    m5 = [f for f in findings if f.code == ErrorCode.M5]
    assert len(m5) == 1
    assert m5[0].evidence


async def test_m5_declared_chi_bao_without_muc_do_for_grade_produces_finding():
    chi_bao_no_muc_do = {**CHI_BAO_NLS, "muc_do": []}
    plan = SegmentedPlan(
        objective_clauses=[
            _obj(
                "o1",
                "nang_luc_so",
                "5.1.NC1a: Đánh giá được vấn đề kĩ thuật khi sử dụng thiết bị số trong lớp học",
            )
        ]
    )
    findings, _ = await _n2(plan, _lesson_ctx(chi_bao_nls=[chi_bao_no_muc_do]))
    m5 = [f for f in findings if f.code == ErrorCode.M5]
    assert len(m5) == 1
    assert m5[0].evidence


# =========================== M6 — kiến thức thiếu căn cứ ===========================


async def test_m6_llm_says_grounded_produces_no_finding_and_no_excluded_section(monkeypatch):
    mock_llm = AsyncMock(
        return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "Có căn cứ."}, 15)
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "noi_dung", "Mạng máy tính là tập hợp các máy tính kết nối với nhau để chia sẻ tài nguyên.")
        ]
    )
    findings, hoat_dong_loi_m = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M6] == []
    assert hoat_dong_loi_m == set()


async def test_m6_llm_flags_unsupported_with_evidence_produces_finding_and_excluded_section(monkeypatch):
    mock_llm = AsyncMock(
        return_value=(
            {
                "verdict": "khong_can_cu",
                "evidence_refs": [{"kg_node_id": "MDKT-TIN10-C1-B1-01", "trich_dan": MENH_DE_KIEN_THUC["ten"]}],
                "explanation": "Mệnh đề trong hoạt động mâu thuẫn với SGK.",
            },
            20,
        )
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "noi_dung", "Mạng máy tính chỉ tồn tại trên các thiết bị di động hiện đại nhất.")
        ]
    )
    findings, hoat_dong_loi_m = await _n2(plan, _lesson_ctx())
    m6 = [f for f in findings if f.code == ErrorCode.M6]
    assert len(m6) == 1
    assert m6[0].evidence
    assert m6[0].section_id == "hinh_thanh_kien_thuc_1"
    assert hoat_dong_loi_m == {"hinh_thanh_kien_thuc_1"}


async def test_m6_llm_flags_unsupported_but_no_evidence_produces_no_finding(monkeypatch):
    mock_llm = AsyncMock(
        return_value=(
            {"verdict": "khong_can_cu", "evidence_refs": [], "explanation": "Nghi ngờ nhưng không trích dẫn được."},
            5,
        )
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(
        activity_components=[_act("a1", "noi_dung", "Một mệnh đề kiến thức khó xác định căn cứ.")]
    )
    findings, hoat_dong_loi_m = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M6] == []
    assert hoat_dong_loi_m == set()


async def test_m6_llm_failure_does_not_crash_and_yields_no_finding(monkeypatch):
    from app.modules.kg_lpv.llm import LlmJsonError

    mock_llm = AsyncMock(side_effect=LlmJsonError("timeout"))
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(activity_components=[_act("a1", "noi_dung", "Nội dung bất kỳ.")])
    findings, hoat_dong_loi_m = await _n2(plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.M6] == []
    assert hoat_dong_loi_m == set()


# =========================== Bất biến evidence không rỗng ===========================


def test_finding_rejects_empty_evidence_for_m_codes():
    with pytest.raises(ValidationError):
        Finding(
            code=ErrorCode.M1,
            branch=VerificationBranch.N2,
            section_id="muc_tieu",
            evidence=[],
            explanation="không có bằng chứng",
        )


# =========================== Tích hợp: nhiều mã cùng lúc, không gọi LLM thừa ===========================


async def test_clean_full_plan_produces_zero_findings(monkeypatch):
    mock_llm = AsyncMock(
        return_value=({"verdict": "hop_le", "evidence_refs": [], "explanation": "OK"}, 0)
    )
    monkeypatch.setattr(n2_curriculum, "generate_json", mock_llm)

    plan = SegmentedPlan(
        objective_clauses=[
            _obj("o1", "kien_thuc", YCCD_NHAN_BIET["ten"]),
            _obj("o2", "nang_luc_tin_hoc", "NLa: Sử dụng được trình duyệt web để tìm kiếm thông tin"),
            _obj("o3", "nang_luc_chung", "Tự chủ và tự học: chủ động tìm hiểu bài trước khi đến lớp"),
            _obj("o4", "pham_chat", "Chăm chỉ: tích cực hoàn thành nhiệm vụ học tập được giao"),
            _obj(
                "o5",
                "nang_luc_so",
                "5.1.NC1a: Đánh giá được vấn đề kĩ thuật khi sử dụng thiết bị số trong lớp học",
            ),
        ],
        activity_components=[
            _act(
                "a1",
                "noi_dung",
                "Mạng máy tính là tập hợp các máy tính kết nối với nhau để chia sẻ tài nguyên.",
            )
        ],
    )
    findings, hoat_dong_loi_m = await _n2(plan, _lesson_ctx())
    assert findings == []
    assert hoat_dong_loi_m == set()
