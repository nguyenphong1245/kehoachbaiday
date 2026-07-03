"""Bước 2a — N1 Định danh (`n1_identity.py`) → D1.

`n1_verify(identity, graph) -> list[Finding]` — THUẬT TOÁN THUẦN, KHÔNG LLM.

Trích `{grade, book_type, topic, lesson_name, lesson_id, orientation?}` từ
`SavedLessonPlan` rồi so khớp với cây chương trình `KhoiLop -> ChuDe ->
BaiHoc` trong đồ thị: khớp đúng theo `ma_dinh_danh` trước, fulltext + tỉ lệ
Levenshtein (`difflib.SequenceMatcher`) sau (§7 Bước 2a).

- Khớp đúng & nhất quán (lớp/chủ đề đúng đỉnh tìm được) -> `[]` (không lỗi).
- Khớp đúng nhưng lệch lớp/chủ đề, HOẶC không khớp đúng nhưng có ứng viên
  mờ đủ ngưỡng, HOẶC không tìm thấy gì -> đúng 1 finding D1 với `evidence`
  là đỉnh gần nhất tìm được (hoặc bản ghi "không tìm thấy" có cấu trúc) —
  `evidence` luôn khác rỗng (bất biến của `Finding`, §6.2).
"""

from difflib import SequenceMatcher

from app.core.logging import logger
from app.modules.kg_lpv.config import N1_FUZZY_THRESHOLD
from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.graph_client import KgLpvGraphClient
from app.modules.kg_lpv.schemas import Finding

_SECTION_ID_DINH_DANH = "dinh_danh"


def n1_verify(identity: dict, graph: KgLpvGraphClient) -> list[Finding]:
    """Kiểm N1 định danh: so khớp thuật toán, không LLM. Trả `[]` hoặc `[Finding(D1)]`."""
    lesson_id = identity.get("lesson_id")
    grade = identity.get("grade")
    book_type = identity.get("book_type")
    topic = identity.get("topic")
    lesson_name = identity.get("lesson_name")

    node = graph.find_lesson_by_identity(
        lesson_id=lesson_id,
        grade=grade,
        book_type=book_type,
        topic=topic,
        lesson_name=lesson_name,
    )

    if node is not None:
        mismatches = _identity_mismatches(identity, node)
        if not mismatches:
            logger.info("kg_lpv.n1.match_ok lesson_id=%s", lesson_id)
            return []

        logger.warning(
            "kg_lpv.n1.mismatch lesson_id=%s matched=%s reasons=%s",
            lesson_id,
            node.get("ma_dinh_danh"),
            mismatches,
        )
        return [_build_finding(evidence=[node], reasons=mismatches)]

    scored_candidates = _score_fuzzy_candidates(
        graph.search_lessons_fuzzy(ten=lesson_name, grade=grade, limit=5) or [],
        lesson_name,
    )
    close_candidates = [c for c in scored_candidates if c["ty_le_khop"] >= N1_FUZZY_THRESHOLD]

    if close_candidates:
        logger.warning(
            "kg_lpv.n1.fuzzy_ambiguous lesson_id=%s lesson_name=%s candidates=%d",
            lesson_id,
            lesson_name,
            len(close_candidates),
        )
        return [
            _build_finding(
                evidence=close_candidates,
                reasons=[
                    "không khớp đúng theo mã định danh, chỉ tìm được bài học gần đúng theo tên"
                ],
            )
        ]

    logger.warning("kg_lpv.n1.not_found lesson_id=%s lesson_name=%s", lesson_id, lesson_name)
    not_found_evidence = [
        {
            "khong_tim_thay": True,
            "truy_van": {
                "lesson_id": lesson_id,
                "grade": grade,
                "book_type": book_type,
                "topic": topic,
                "lesson_name": lesson_name,
            },
        }
    ]
    return [
        _build_finding(
            evidence=not_found_evidence,
            reasons=["không tìm thấy đỉnh nào khớp định danh KHBD trong đồ thị tri thức chương trình"],
        )
    ]


def _build_finding(evidence: list[dict], reasons: list[str]) -> Finding:
    return Finding(
        code=ErrorCode.D1,
        branch=VerificationBranch.N1,
        section_id=_SECTION_ID_DINH_DANH,
        evidence=evidence,
        explanation="Định danh KHBD không khớp với cây chương trình: " + "; ".join(reasons) + ".",
    )


def _identity_mismatches(identity: dict, node: dict) -> list[str]:
    """So khớp lớp/chủ đề/định hướng của KHBD với đỉnh `BaiHoc` đã tìm được."""
    reasons: list[str] = []

    grade = identity.get("grade")
    khoi_lop = node.get("khoi_lop") or {}
    if grade:
        grade_str = str(grade).strip()
        khoi_lop_ten = khoi_lop.get("ten") or ""
        khoi_lop_ma = khoi_lop.get("ma_dinh_danh") or ""
        if grade_str and grade_str not in khoi_lop_ten and not khoi_lop_ma.endswith(grade_str):
            reasons.append(f"sai khối lớp (KHBD ghi '{grade}', đồ thị là '{khoi_lop_ten or khoi_lop_ma}')")

    topic = identity.get("topic")
    chu_de = node.get("chu_de") or {}
    chu_de_ten = chu_de.get("ten")
    if topic and chu_de_ten is not None and _ratio(topic, chu_de_ten) < N1_FUZZY_THRESHOLD:
        reasons.append(f"sai chủ đề (KHBD ghi '{topic}', đồ thị là '{chu_de_ten}')")

    orientation = identity.get("orientation")
    node_orientation = node.get("dinh_huong")
    if orientation and node_orientation is not None and _ratio(orientation, node_orientation) < N1_FUZZY_THRESHOLD:
        reasons.append(f"sai định hướng (KHBD ghi '{orientation}', đồ thị là '{node_orientation}')")

    return reasons


def _score_fuzzy_candidates(candidates: list[dict], lesson_name: str | None) -> list[dict]:
    return [{**c, "ty_le_khop": _ratio(lesson_name, c.get("ten"))} for c in candidates]


def _ratio(a: str | None, b: str | None) -> float:
    return SequenceMatcher(None, (a or "").strip().lower(), (b or "").strip().lower()).ratio()
