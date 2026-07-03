"""Test N1 định danh (D1): thuật toán thuần, KHÔNG LLM. Graph client giả (fake), không Neo4j thật."""
import pytest
from pydantic import ValidationError

from app.modules.kg_lpv.error_codes import ERROR_META, ErrorCode, VerificationBranch
from app.modules.kg_lpv.pipeline.n1_identity import n1_verify
from app.modules.kg_lpv.schemas import Finding

BAI_HOC_NODE = {
    "ma_dinh_danh": "BH-TIN10-C1-B1",
    "ten": "Bài 1: Thông tin và xử lý thông tin",
    "khoi_lop": {"ma_dinh_danh": "KL10", "ten": "Lớp 10"},
    "chu_de": {"ma_dinh_danh": "CD-TIN10-C1", "ten": "Chủ đề A: Máy tính và xã hội tri thức"},
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.15",
}

CONSISTENT_IDENTITY = {
    "lesson_id": "BH-TIN10-C1-B1",
    "grade": "10",
    "book_type": "Cánh diều",
    "topic": "Chủ đề A: Máy tính và xã hội tri thức",
    "lesson_name": "Bài 1: Thông tin và xử lý thông tin",
}


class _FakeGraphClient:
    """Stub graph client — không kết nối Neo4j thật, trả dict đóng gói sẵn."""

    def __init__(self, exact_result=None, fuzzy_results=None):
        self._exact_result = exact_result
        self._fuzzy_results = fuzzy_results if fuzzy_results is not None else []
        self.exact_calls: list[dict] = []
        self.fuzzy_calls: list[dict] = []

    def find_lesson_by_identity(self, lesson_id, grade, book_type, topic, lesson_name):
        self.exact_calls.append(
            {
                "lesson_id": lesson_id,
                "grade": grade,
                "book_type": book_type,
                "topic": topic,
                "lesson_name": lesson_name,
            }
        )
        return self._exact_result

    def search_lessons_fuzzy(self, ten, grade=None, limit=5):
        self.fuzzy_calls.append({"ten": ten, "grade": grade, "limit": limit})
        return self._fuzzy_results


def test_exact_match_found_and_consistent_returns_no_finding():
    graph = _FakeGraphClient(exact_result=BAI_HOC_NODE)

    findings = n1_verify(CONSISTENT_IDENTITY, graph)

    assert findings == []
    assert graph.exact_calls[0]["lesson_id"] == "BH-TIN10-C1-B1"


def test_grade_mismatch_produces_single_d1_finding_with_evidence():
    graph = _FakeGraphClient(exact_result=BAI_HOC_NODE)
    identity = {**CONSISTENT_IDENTITY, "grade": "11"}  # đồ thị nói KL10, KHBD ghi 11

    findings = n1_verify(identity, graph)

    assert len(findings) == 1
    finding = findings[0]
    assert finding.code == ErrorCode.D1
    assert finding.branch == VerificationBranch.N1
    assert finding.evidence  # non-empty
    assert finding.evidence[0]["ma_dinh_danh"] == "BH-TIN10-C1-B1"


def test_topic_mismatch_produces_single_d1_finding():
    graph = _FakeGraphClient(exact_result=BAI_HOC_NODE)
    identity = {**CONSISTENT_IDENTITY, "topic": "Chủ đề hoàn toàn khác không liên quan gì cả"}

    findings = n1_verify(identity, graph)

    assert len(findings) == 1
    assert findings[0].code == ErrorCode.D1
    assert findings[0].evidence


def test_not_found_but_close_fuzzy_candidate_produces_d1_with_fuzzy_evidence():
    fuzzy_candidate = {
        "ma_dinh_danh": "BH-TIN10-C1-B2",
        "ten": "Bài 1: Thông tin và xử lý thông tin (bản mới)",
        "score": 1.9,
        "ma_nguon": "CT-TIN-2018",
        "so_ky_hieu": "32/2018/TT-BGDĐT",
        "ngay_hieu_luc": "2018-12-26",
        "vi_tri_trang": "tr.16",
    }
    graph = _FakeGraphClient(exact_result=None, fuzzy_results=[fuzzy_candidate])

    findings = n1_verify(CONSISTENT_IDENTITY, graph)

    assert len(findings) == 1
    finding = findings[0]
    assert finding.code == ErrorCode.D1
    assert finding.evidence
    assert finding.evidence[0]["ma_dinh_danh"] == "BH-TIN10-C1-B2"
    assert "ty_le_khop" in finding.evidence[0]
    assert graph.fuzzy_calls[0]["ten"] == CONSISTENT_IDENTITY["lesson_name"]


def test_fuzzy_candidate_below_threshold_is_excluded_still_results_in_not_found_finding():
    weak_candidate = {
        "ma_dinh_danh": "BH-TIN10-C9-B9",
        "ten": "Bài 9: Một nội dung hoàn toàn không liên quan",
        "score": 0.1,
        "ma_nguon": "CT-TIN-2018",
        "so_ky_hieu": "32/2018/TT-BGDĐT",
        "ngay_hieu_luc": "2018-12-26",
        "vi_tri_trang": "tr.99",
    }
    graph = _FakeGraphClient(exact_result=None, fuzzy_results=[weak_candidate])

    findings = n1_verify(CONSISTENT_IDENTITY, graph)

    assert len(findings) == 1
    finding = findings[0]
    assert finding.code == ErrorCode.D1
    assert finding.evidence
    # Ứng viên yếu bị loại khỏi bằng chứng khớp mờ -> rơi về nhánh "không tìm thấy"
    assert finding.evidence[0].get("khong_tim_thay") is True


def test_nothing_found_at_all_produces_d1_with_structured_not_found_evidence():
    graph = _FakeGraphClient(exact_result=None, fuzzy_results=[])

    findings = n1_verify(CONSISTENT_IDENTITY, graph)

    assert len(findings) == 1
    finding = findings[0]
    assert finding.code == ErrorCode.D1
    assert finding.branch == VerificationBranch.N1
    assert finding.evidence  # vẫn phải non-empty dù không tìm thấy gì
    assert finding.evidence[0]["khong_tim_thay"] is True
    assert finding.evidence[0]["truy_van"]["lesson_id"] == CONSISTENT_IDENTITY["lesson_id"]


def test_finding_rejects_empty_evidence():
    with pytest.raises(ValidationError):
        Finding(
            code=ErrorCode.D1,
            branch=VerificationBranch.N1,
            section_id="dinh_danh",
            evidence=[],
            explanation="không có bằng chứng",
        )


def test_error_meta_d1_is_n1_algorithmic():
    meta = ERROR_META[ErrorCode.D1]
    assert meta.branch == VerificationBranch.N1
    assert meta.check_type == "ALGORITHMIC"
    assert meta.truc is None


def test_error_meta_has_all_15_codes():
    assert len(ERROR_META) == 15
    for code in ErrorCode:
        meta = ERROR_META[code]
        assert meta.branch in (VerificationBranch.N1, VerificationBranch.N2, VerificationBranch.N3)
        assert meta.check_type in ("ALGORITHMIC", "RULE", "LLM_JUDGE")
        assert meta.nhom_loi
