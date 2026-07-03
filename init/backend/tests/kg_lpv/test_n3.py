"""Test N3 nhất quán sư phạm (C1-C8, 6 trục): mỗi trục 1 hàm độc lập
(`truc1_nhat_quan_doc` .. `truc6_tien_trinh_dieu_kien`) + `n3_verify` (điều phối
chung). Đồ thị FAKE (không Neo4j thật) qua `lesson_ctx` (LessonContext) canned +
`FakeGraph.get_method_procedures`; `llm.generate_json` bị monkeypatch trên module
`n3_pedagogy` — không gọi Gemini thật.

Mỗi test trục gọi TRỰC TIẾP hàm trục cần kiểm (không qua `n3_verify`) với fixture
tối thiểu CHỈ chứa segment liên quan tới mã đang kiểm — tránh trùng lặp phát hiện
từ các trục khác (mỗi trục độc lập, "individually testable" theo yêu cầu Task 6).
"""
import asyncio

import pytest
from unittest.mock import AsyncMock

from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.llm import LlmJsonError
from app.modules.kg_lpv.pipeline import n3_pedagogy
from app.modules.kg_lpv.pipeline.n3_pedagogy import (
    n3_verify,
    truc1_nhat_quan_doc,
    truc2_noi_bo_hoat_dong,
    truc3_can_chinh,
    truc4_cu_the_hoa_nang_luc,
    truc5_thuc_chat_phuong_phap,
    truc6_tien_trinh_dieu_kien,
)
from app.modules.kg_lpv.schemas import (
    ActivityComponentSegment,
    LessonContext,
    ObjectiveClauseSegment,
    SegmentedPlan,
)

pytestmark = pytest.mark.asyncio


# ---------------- Helpers dựng segment ----------------


def _obj(segment_id, loai, text, section_id="muc_tieu") -> ObjectiveClauseSegment:
    return ObjectiveClauseSegment(segment_id=segment_id, section_id=section_id, loai=loai, text=text)


def _act(segment_id, component, text, section_id) -> ActivityComponentSegment:
    return ActivityComponentSegment(segment_id=segment_id, section_id=section_id, component=component, text=text)


NL_TIN_A = {
    "ma_dinh_danh": "NL-TIN-A",
    "ten": "Sử dụng và quản lí các phương tiện công nghệ thông tin và truyền thông",
    "ma_nang_luc": "NLa",
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.8",
}

CHI_BAO_NLS = {
    "ma_dinh_danh": "NLS-CB-5.1.NC1a",
    "ten": "Đánh giá được các vấn đề kĩ thuật khi sử dụng thiết bị số",
    "ma_chi_bao": "5.1.NC1a",
    "muc_do": [{"ma_dinh_danh": "NLS-MD-5.1.NC1a-KL10-M1", "muc": 1}],
    "ma_nguon": "CV-3456-PHULUC",
    "so_ky_hieu": "3456/BGDĐT-GDPT",
    "ngay_hieu_luc": "2021-08-20",
    "vi_tri_trang": "tr.12",
}

DONG_TU_NHAN_THUC = {
    "do_duoc": [
        {"dong_tu": "trình bày được", "bac": 1},
        {"dong_tu": "sử dụng được", "bac": 2},
        {"dong_tu": "vận dụng được", "bac": 3},
    ],
    "khong_do_duoc": ["biết", "hiểu"],
}


def _lesson_ctx(**overrides) -> LessonContext:
    base = dict(
        lesson={"ma_dinh_danh": "BH-TIN10-C1-B1", "ten": "Bài 1: Mạng máy tính"},
        yccd=[],
        nang_luc_tin_hoc=[NL_TIN_A],
        nang_luc_chung=[],
        pham_chat=[],
        chi_bao_nls=[CHI_BAO_NLS],
        menh_de_kien_thuc=[],
        dong_tu_nhan_thuc=DONG_TU_NHAN_THUC,
    )
    base.update(overrides)
    return LessonContext(**base)


class _FakeGraph:
    def __init__(self, procedures: dict | None = None):
        self._procedures = procedures or {}

    def get_method_procedures(self, method_names: list[str]) -> dict[str, list[dict]]:
        return {k: v for k, v in self._procedures.items() if k in method_names}


def _llm(response: dict, tokens: int = 10) -> AsyncMock:
    return AsyncMock(return_value=(response, tokens))


# =========================== Trục 1 — nhất quán dọc (C4) ===========================


async def test_truc1_objective_realized_by_matching_activity_produces_no_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được khái niệm mạng máy tính")],
        activity_components=[
            _act("a1", "muc_tieu", "Học sinh trình bày được khái niệm mạng máy tính", "hinh_thanh_1")
        ],
    )
    findings = truc1_nhat_quan_doc(plan, excluded_sections=set())
    assert findings == []


async def test_truc1_unrealized_objective_produces_c4_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được khái niệm an toàn thông tin")],
        activity_components=[],
    )
    findings = truc1_nhat_quan_doc(plan, excluded_sections=set())
    c4 = [f for f in findings if f.code == ErrorCode.C4]
    assert len(c4) == 1
    assert c4[0].truc == 1
    assert c4[0].branch == VerificationBranch.N3
    assert c4[0].section_id == "muc_tieu"
    assert c4[0].evidence


async def test_truc1_orphan_activity_produces_c4_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được khái niệm mạng máy tính")],
        activity_components=[_act("a1", "muc_tieu", "Học sinh vẽ tranh cổ động bảo vệ môi trường", "hinh_thanh_1")],
    )
    findings = truc1_nhat_quan_doc(plan, excluded_sections=set())
    c4 = [f for f in findings if f.code == ErrorCode.C4]
    # Cả mục tiêu (không hiện thực) lẫn hoạt động (mồ côi) đều bị gắn cờ
    assert len(c4) == 2
    section_ids = {f.section_id for f in c4}
    assert section_ids == {"muc_tieu", "hinh_thanh_1"}


async def test_branch_priority_excluded_activity_not_used_as_realization_evidence():
    """Nguyên tắc ưu tiên nhánh: hoạt động dính lỗi M* (excluded_sections) KHÔNG
    được dùng làm bằng chứng đạt mục tiêu ở N3 -> mục tiêu vẫn bị coi là chưa hiện thực."""
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được khái niệm mạng máy tính")],
        activity_components=[
            _act("a1", "muc_tieu", "Học sinh trình bày được khái niệm mạng máy tính", "hinh_thanh_1")
        ],
    )
    findings = truc1_nhat_quan_doc(plan, excluded_sections={"hinh_thanh_1"})
    c4 = [f for f in findings if f.code == ErrorCode.C4]
    assert len(c4) == 1
    assert c4[0].section_id == "muc_tieu"


# =========================== Trục 2 — nhất quán nội bộ hoạt động (C4) ===========================


_TRUC2_ACTIVITY = [
    _act("a-mt", "muc_tieu", "Vận dụng được kiến thức mạng máy tính để đề xuất giải pháp.", "hinh_thanh_1"),
    _act("a-nd", "noi_dung", "Khái niệm mạng máy tính và các thiết bị kết nối.", "hinh_thanh_1"),
    _act("a-sp", "san_pham", "Sơ đồ giải pháp kết nối mạng do học sinh thiết kế.", "hinh_thanh_1"),
    _act("a-tc", "to_chuc_thuc_hien", "Học sinh làm việc nhóm, thiết kế sơ đồ trên giấy A0.", "hinh_thanh_1"),
]


async def test_truc2_coherent_activity_produces_no_finding(monkeypatch):
    monkeypatch.setattr(n3_pedagogy, "generate_json", _llm({"verdict": "khop", "evidence_refs": [], "explanation": "OK"}))
    plan = SegmentedPlan(activity_components=_TRUC2_ACTIVITY)
    findings = await truc2_noi_bo_hoat_dong(None, plan)
    assert findings == []


async def test_truc2_incoherent_activity_produces_c4_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "khong_khop", "evidence_refs": [{"text": "lệch mức"}], "explanation": "Sản phẩm không đạt mức vận dụng."}),
    )
    plan = SegmentedPlan(activity_components=_TRUC2_ACTIVITY)
    findings = await truc2_noi_bo_hoat_dong(None, plan)
    assert len(findings) == 1
    assert findings[0].code == ErrorCode.C4
    assert findings[0].truc == 1
    assert findings[0].section_id == "hinh_thanh_1"
    assert findings[0].evidence


async def test_truc2_llm_failure_records_unjudged_finding_not_open(monkeypatch):
    monkeypatch.setattr(n3_pedagogy, "generate_json", AsyncMock(side_effect=asyncio.TimeoutError("hết giờ")))
    plan = SegmentedPlan(activity_components=_TRUC2_ACTIVITY)
    findings = await truc2_noi_bo_hoat_dong(None, plan)
    assert len(findings) == 1
    assert findings[0].status == "unjudged"
    assert findings[0].explanation.startswith("không phán xử được")
    assert findings[0].evidence


async def test_truc2_activity_missing_component_is_skipped_without_llm(monkeypatch):
    mock_llm = AsyncMock()
    monkeypatch.setattr(n3_pedagogy, "generate_json", mock_llm)
    plan = SegmentedPlan(activity_components=_TRUC2_ACTIVITY[:3])  # thiếu to_chuc_thuc_hien
    findings = await truc2_noi_bo_hoat_dong(None, plan)
    assert findings == []
    mock_llm.assert_not_called()


# =========================== Trục 3 — bộ ba bằng chứng (C4, C5) ===========================


def _truc3_activity(section_id="hinh_thanh_1"):
    return [
        _act("a-mt", "muc_tieu", "Vận dụng được kiến thức mạng máy tính để đề xuất giải pháp kết nối.", section_id),
        _act("a-sp", "san_pham", "Sơ đồ kết nối mạng do học sinh tự vẽ.", section_id),
        _act("a-tc", "to_chuc_thuc_hien", "Học sinh làm việc nhóm, vẽ sơ đồ kết nối mạng trên giấy A0.", section_id),
    ]


async def test_truc3_full_bo_ba_bang_chung_produces_no_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "dat", "thanh_phan_thieu": None, "evidence_refs": [], "explanation": "Đủ 3 bằng chứng."}),
    )
    plan = SegmentedPlan(activity_components=_truc3_activity())
    findings = await truc3_can_chinh(None, plan, excluded_sections=set())
    assert findings == []


@pytest.mark.parametrize(
    "thanh_phan_thieu,expected_code",
    [("hanh_dong", ErrorCode.C4), ("san_pham", ErrorCode.C4), ("tieu_chi", ErrorCode.C5)],
)
async def test_truc3_missing_one_evidence_component_produces_finding(monkeypatch, thanh_phan_thieu, expected_code):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({
            "verdict": "khong_dat",
            "thanh_phan_thieu": thanh_phan_thieu,
            "evidence_refs": [{"thieu": thanh_phan_thieu}],
            "explanation": f"Thiếu {thanh_phan_thieu}.",
        }),
    )
    plan = SegmentedPlan(activity_components=_truc3_activity())
    findings = await truc3_can_chinh(None, plan, excluded_sections=set())
    assert len(findings) == 1
    assert findings[0].code == expected_code
    assert findings[0].evidence


async def test_truc3_excluded_section_is_skipped():
    plan = SegmentedPlan(activity_components=_truc3_activity(section_id="hinh_thanh_1"))
    findings = await truc3_can_chinh(None, plan, excluded_sections={"hinh_thanh_1"})
    assert findings == []


# =========================== Trục 4 — C1 (NLa-NLc thiếu cơ sở nội dung, RULE) ===========================


async def test_c1_grounded_in_activity_content_produces_no_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_tin_hoc", "NLa: " + NL_TIN_A["ten"])],
        activity_components=[
            _act("a1", "noi_dung", f"Học sinh {NL_TIN_A['ten'].lower()} trong phòng máy.", "hinh_thanh_1")
        ],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    assert [f for f in findings if f.code == ErrorCode.C1] == []


async def test_c1_not_grounded_in_any_content_produces_finding():
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_tin_hoc", "NLa: " + NL_TIN_A["ten"])],
        activity_components=[],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    c1 = [f for f in findings if f.code == ErrorCode.C1]
    assert len(c1) == 1
    assert c1[0].truc == 4
    assert c1[0].branch == VerificationBranch.N3
    assert c1[0].evidence


# =========================== Trục 4 — C2 (NLd/NLe, NLC, phẩm chất, LLM_JUDGE) ===========================


async def test_c2_llm_says_concretized_produces_no_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "cu_the_hoa", "evidence_refs": [], "explanation": "Đã cụ thể hóa."}),
    )
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_chung", "Tự chủ và tự học: chủ động tìm hiểu bài trước ở nhà")],
        activity_components=[
            _act("a1", "to_chuc_thuc_hien", "Giáo viên giao nhiệm vụ tự đọc SGK, học sinh tự tìm hiểu trước.", "khoi_dong")
        ],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    assert [f for f in findings if f.code == ErrorCode.C2] == []


async def test_c2_llm_says_not_concretized_produces_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "khong_cu_the_hoa", "evidence_refs": [{"text": "chỉ nêu tên"}], "explanation": "Chỉ nêu tên năng lực."}),
    )
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_chung", "Tự chủ và tự học")],
        activity_components=[_act("a1", "to_chuc_thuc_hien", "Giáo viên giảng bài.", "khoi_dong")],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    c2 = [f for f in findings if f.code == ErrorCode.C2]
    assert len(c2) == 1
    assert c2[0].truc == 4
    assert c2[0].evidence


# =========================== Trục 4 — C8 (Khung năng lực số, LLM_JUDGE) ===========================


async def test_c8_llm_says_concretized_produces_no_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "cu_the_hoa", "evidence_refs": [], "explanation": "Đã cụ thể hóa."}),
    )
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_so", "5.1.NC1a: " + CHI_BAO_NLS["ten"])],
        activity_components=[_act("a1", "to_chuc_thuc_hien", "Học sinh đánh giá sự cố kĩ thuật của máy tính lớp học.", "khoi_dong")],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    assert [f for f in findings if f.code == ErrorCode.C8] == []


async def test_c8_llm_says_not_concretized_produces_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "khong_cu_the_hoa", "evidence_refs": [{"text": "không có hoạt động"}], "explanation": "Không có hoạt động tương ứng."}),
    )
    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "nang_luc_so", "5.1.NC1a: " + CHI_BAO_NLS["ten"])],
        activity_components=[_act("a1", "to_chuc_thuc_hien", "Giáo viên giảng lý thuyết.", "khoi_dong")],
    )
    findings = await truc4_cu_the_hoa_nang_luc(None, plan, _lesson_ctx(), excluded_sections=set())
    c8 = [f for f in findings if f.code == ErrorCode.C8]
    assert len(c8) == 1
    assert c8[0].truc == 4
    assert c8[0].evidence


# =========================== Trục 5 — C7 (thực chất phương pháp/kĩ thuật, LLM_JUDGE) ===========================


_METHOD_STEPS = [
    {"thu_tu": 1, "ten": "Chia nhóm", "ma_nguon": "TL-PPDH"},
    {"thu_tu": 2, "ten": "Giao nhiệm vụ", "ma_nguon": "TL-PPDH"},
]


async def test_c7_llm_says_correct_procedure_produces_no_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "dung_quy_trinh", "evidence_refs": [], "explanation": "Đúng quy trình."}),
    )
    plan = SegmentedPlan(
        activity_components=[
            _act(
                "a1", "to_chuc_thuc_hien",
                "Giáo viên tổ chức theo phương pháp dạy học hợp tác. Bước 1: chia nhóm. Bước 2: giao nhiệm vụ.",
                "hinh_thanh_1",
            )
        ]
    )
    graph = _FakeGraph({"dạy học hợp tác": _METHOD_STEPS})
    findings = await truc5_thuc_chat_phuong_phap(None, plan, graph)
    assert [f for f in findings if f.code == ErrorCode.C7] == []


async def test_c7_llm_says_wrong_procedure_produces_finding(monkeypatch):
    monkeypatch.setattr(
        n3_pedagogy, "generate_json",
        _llm({"verdict": "khong_dung_quy_trinh", "evidence_refs": [{"buoc_thieu": "Giao nhiệm vụ"}], "explanation": "Thiếu bước giao nhiệm vụ."}),
    )
    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "to_chuc_thuc_hien", "Giáo viên tổ chức theo phương pháp dạy học hợp tác. Bước 1: chia nhóm.", "hinh_thanh_1")
        ]
    )
    graph = _FakeGraph({"dạy học hợp tác": _METHOD_STEPS})
    findings = await truc5_thuc_chat_phuong_phap(None, plan, graph)
    c7 = [f for f in findings if f.code == ErrorCode.C7]
    assert len(c7) == 1
    assert c7[0].truc == 5
    assert c7[0].evidence


async def test_c7_method_not_found_in_graph_is_skipped_without_llm(monkeypatch):
    mock_llm = AsyncMock()
    monkeypatch.setattr(n3_pedagogy, "generate_json", mock_llm)
    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "to_chuc_thuc_hien", "Giáo viên tổ chức theo phương pháp dạy học hợp tác.", "hinh_thanh_1")
        ]
    )
    findings = await truc5_thuc_chat_phuong_phap(None, plan, _FakeGraph())  # không có quy trình chuẩn nào
    assert findings == []
    mock_llm.assert_not_called()


# =========================== Trục 6 — C3 (thiết bị declared vs used, ALGORITHMIC) ===========================


async def test_c3_devices_consistent_produces_no_finding():
    plan = SegmentedPlan(
        activity_components=[
            _act("a-tc", "to_chuc_thuc_hien", "Sử dụng máy chiếu và máy tính để trình chiếu bài giảng.", "hinh_thanh_1"),
            _act("a-nd", "noi_dung", "Học sinh quan sát máy chiếu.", "hinh_thanh_1"),
            _act("a-sp", "san_pham", "Vở ghi chép của học sinh.", "hinh_thanh_1"),
        ]
    )
    findings = await truc6_tien_trinh_dieu_kien(None, plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.C3] == []


async def test_c3_device_used_but_not_declared_produces_finding():
    plan = SegmentedPlan(
        activity_components=[
            _act("a-tc", "to_chuc_thuc_hien", "Sử dụng máy chiếu để trình chiếu bài giảng.", "hinh_thanh_1"),
            _act("a-nd", "noi_dung", "Học sinh thực hành trên điện thoại cá nhân.", "hinh_thanh_1"),
        ]
    )
    findings = await truc6_tien_trinh_dieu_kien(None, plan, _lesson_ctx())
    c3 = [f for f in findings if f.code == ErrorCode.C3]
    assert len(c3) == 1
    assert c3[0].truc == 6
    assert c3[0].evidence


# =========================== Trục 6 — C6 (mâu thuẫn nội bộ tiến trình, ALGORITHMIC) ===========================


async def test_c6_correct_order_and_non_decreasing_level_produces_no_finding():
    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "muc_tieu", "Trình bày được khái niệm mạng máy tính.", "khoi_dong"),
            _act("a2", "muc_tieu", "Vận dụng được kiến thức mạng máy tính vào thực tế.", "van_dung"),
        ]
    )
    findings = await truc6_tien_trinh_dieu_kien(None, plan, _lesson_ctx())
    assert [f for f in findings if f.code == ErrorCode.C6] == []


async def test_c6_out_of_order_stages_produce_finding():
    plan = SegmentedPlan(
        activity_components=[
            _act("a1", "muc_tieu", "Vận dụng được kiến thức mạng máy tính vào thực tế.", "van_dung"),
            _act("a2", "muc_tieu", "Trình bày được khái niệm mạng máy tính.", "khoi_dong"),
        ]
    )
    findings = await truc6_tien_trinh_dieu_kien(None, plan, _lesson_ctx())
    c6 = [f for f in findings if f.code == ErrorCode.C6]
    assert len(c6) == 1
    assert c6[0].truc == 6
    assert c6[0].evidence


# =========================== n3_verify — điều phối chung ===========================


async def test_n3_verify_empty_plan_produces_no_findings_and_no_llm_calls(monkeypatch):
    mock_llm = AsyncMock()
    monkeypatch.setattr(n3_pedagogy, "generate_json", mock_llm)
    findings = await n3_verify(None, SegmentedPlan(), _lesson_ctx(), excluded_sections=set(), graph=_FakeGraph())
    assert findings == []
    mock_llm.assert_not_called()


async def test_n3_verify_aggregates_findings_from_multiple_axes(monkeypatch):
    """n3_verify gọi đủ các trục và gộp kết quả — dùng 1 trục thuật toán thuần
    (trục 1, không cần LLM) để tránh phụ thuộc vào việc định tuyến mock LLM."""
    mock_llm = AsyncMock(return_value=({"verdict": "dat", "thanh_phan_thieu": None, "evidence_refs": [], "explanation": "OK"}, 0))
    monkeypatch.setattr(n3_pedagogy, "generate_json", mock_llm)

    plan = SegmentedPlan(
        objective_clauses=[_obj("o1", "kien_thuc", "Trình bày được khái niệm an toàn thông tin")],
        activity_components=[],
    )
    findings = await n3_verify(None, plan, _lesson_ctx(), excluded_sections=set(), graph=_FakeGraph())
    c4 = [f for f in findings if f.code == ErrorCode.C4]
    assert len(c4) == 1
    assert c4[0].section_id == "muc_tieu"


async def test_atomic_judge_bounds_concurrency_to_n3_judge_concurrency(monkeypatch):
    """Task 9 §9: `_atomic_judge` giới hạn số phán xử N3 chạy đồng thời tối đa
    `N3_JUDGE_CONCURRENCY` — kể cả khi bị fan-out (gather) không giới hạn từ caller.
    Loại bỏ `get_gemini_semaphore` (giới hạn dùng chung toàn app, size 4) khỏi phép
    thử để cô lập đúng semaphore riêng của N3 vừa thêm."""
    monkeypatch.setattr(n3_pedagogy, "get_gemini_semaphore", lambda: asyncio.Semaphore(1000))

    current = 0
    max_seen = 0
    lock = asyncio.Lock()

    async def fake_generate_json(db, feature_key, prompt):
        nonlocal current, max_seen
        async with lock:
            current += 1
            max_seen = max(max_seen, current)
        await asyncio.sleep(0.05)
        async with lock:
            current -= 1
        return {"verdict": "dat"}, 1

    monkeypatch.setattr(n3_pedagogy, "generate_json", fake_generate_json)

    await asyncio.gather(*[n3_pedagogy._atomic_judge(None, f"prompt-{i}") for i in range(20)])

    assert max_seen == n3_pedagogy.N3_JUDGE_CONCURRENCY


async def test_llm_json_error_does_not_propagate_and_records_unjudged(monkeypatch):
    """Finding 1+2 (quy ước Task 5): lỗi phán xử LLM (LlmJsonError/TimeoutError/lỗi API)
    KHÔNG được crash n3_verify — phải ghi nhận finding status="unjudged". Hoạt động đủ
    4 thành phần thoả cả điều kiện trục 2 (nội bộ) VÀ trục 3 (bộ ba bằng chứng) nên
    CẢ HAI lượt phán xử đều hỏng -> >=1 finding "unjudged", không có exception thoát ra."""
    monkeypatch.setattr(n3_pedagogy, "generate_json", AsyncMock(side_effect=LlmJsonError("JSON hỏng")))
    findings = await n3_verify(
        None, SegmentedPlan(activity_components=_TRUC2_ACTIVITY), _lesson_ctx(),
        excluded_sections=set(), graph=_FakeGraph(),
    )
    unjudged = [f for f in findings if f.status == "unjudged"]
    assert len(unjudged) >= 1
    assert all(f.code == ErrorCode.C4 for f in unjudged)
    assert all(f.explanation.startswith("không phán xử được") for f in unjudged)
    assert all(f.evidence for f in unjudged)
