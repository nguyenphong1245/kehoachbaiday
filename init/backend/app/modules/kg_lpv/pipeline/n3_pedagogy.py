"""Bước 3 — N3 Nhất quán sư phạm (`n3_pedagogy.py`) → C1-C8, 6 trục (§7 Bước 3).

`n3_verify(db, segmented, lesson_ctx, excluded_sections, graph, *, usage=None)
-> list[Finding]` điều phối 6 hàm trục ĐỘC LẬP (mỗi hàm tự trả `list[Finding]`,
gọi trực tiếp được để test riêng — "individually testable"):

- `truc1_nhat_quan_doc`      — C4, thuật toán thuần (đồ thị hai phía mục tiêu<->hoạt động).
- `truc2_noi_bo_hoat_dong`   — C4, phán xử nguyên tử (4 thành phần 1 hoạt động khớp nhau).
- `truc3_can_chinh`          — C4, C5, phán xử nguyên tử "bộ ba bằng chứng".
- `truc4_cu_the_hoa_nang_luc`— C1 (RULE), C2 + C8 (phán xử nguyên tử).
- `truc5_thuc_chat_phuong_phap` — C7, phán xử nguyên tử neo quy trình chuẩn từ đồ thị.
- `truc6_tien_trinh_dieu_kien`  — C3, C6 (thuật toán thuần) + C5 phần bao phủ (phán xử).

Đơn vị kiểm chung (§7): mức nhận thức của mục tiêu ĐÃ HỢP LỆ SAU N2 — N3 không kiểm
lại N1/N2, chỉ dùng `lesson_ctx`/`segmented` như dữ liệu đã qua N2. Nguyên tắc ưu
tiên nhánh (§7/§18): hoạt động trong `excluded_sections` (= `hoat_dong_loi_M` của N2)
KHÔNG được dùng làm BẰNG CHỨNG đạt năng lực — áp dụng ở các trục đánh giá "hiện thực
hoá"/"bằng chứng" (trục 1, 3, 4), KHÔNG áp dụng ở các trục cấu trúc/quy trình thuần
(trục 2 nội bộ 1 hoạt động, trục 5 quy trình, trục 6 tiến trình/thiết bị) vì các trục
đó không dùng hoạt động làm "bằng chứng đạt năng lực" mà kiểm chính hoạt động đó.

`truc` của mỗi `Finding` LUÔN lấy từ `ERROR_META[code].truc` (trục CHÍNH của mã đó,
xem `error_codes.py`) — KHÔNG phải trục đang thực thi hàm (1 mã có thể được phát
hiện từ nhiều trục, xem comment trong `error_codes.ERROR_META`).

Lỗi cục bộ 1 phán xử LLM (`LlmJsonError`, `asyncio.TimeoutError`, lỗi API Gemini bất
kỳ) KHÔNG được crash job — bắt riêng từng lượt gọi, ghi 1 `Finding` `status="unjudged"`
(cùng quy ước Task 5, §9 "an toàn khi hỏng"), tiếp tục các mục còn lại. Các phán xử
LLM chạy qua `gemini_limiter.get_gemini_semaphore()` (giới hạn đồng thời, dùng chung
với luồng sinh KHBD).
"""
import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.modules.kg_lpv.config import (
    N3_C1_GROUNDING_THRESHOLD,
    N3_DEVICE_KEYWORDS,
    N3_OBJECTIVE_ACTIVITY_MATCH_THRESHOLD,
)
from app.modules.kg_lpv.error_codes import ERROR_META, ErrorCode
from app.modules.kg_lpv.graph_client import KgLpvGraphClient
from app.modules.kg_lpv.llm import generate_json
from app.modules.kg_lpv.prompts.n3_judge import (
    build_truc2_coherence_prompt,
    build_truc3_bo_ba_bang_chung_prompt,
    build_truc4_cu_the_hoa_prompt,
    build_truc5_quy_trinh_prompt,
    build_truc6_bao_phu_prompt,
)
from app.modules.kg_lpv.schemas import (
    ActivityComponentSegment,
    ActivityComponentType,
    Finding,
    LessonContext,
    ObjectiveClauseSegment,
    ObjectiveClauseType,
    SegmentedPlan,
)
from app.services.admin_ai_model_registry import FEATURE_KG_LPV_N3_JUDGE
from app.services.gemini_limiter import get_gemini_semaphore

_NL_ABC_PATTERN = re.compile(r"\bNL[a-cA-C]\b")
_NL_DE_PATTERN = re.compile(r"\bNL[d-eD-E]\b")
_CHI_BAO_NLS_PATTERN = re.compile(r"\b\d+\.\d+\.[A-Za-z0-9]+\b")
_METHOD_NAME_PATTERN = re.compile(r"(?:phương pháp|kĩ thuật|kỹ thuật)\s+([^,.;\n]+)", re.IGNORECASE)

# Thứ tự chuẩn tiến trình 1 tiết học (trục 6, §7) — dùng chung với `segmenter._ACTIVITY_PREFIXES`.
_STAGE_ORDER = ("khoi_dong", "hinh_thanh_kien_thuc", "luyen_tap", "van_dung")


# =========================== Điều phối chung ===========================


async def n3_verify(
    db: AsyncSession,
    segmented: SegmentedPlan,
    lesson_ctx: LessonContext,
    excluded_sections: set[str],
    graph: KgLpvGraphClient,
    *,
    usage: dict[str, int] | None = None,
) -> list[Finding]:
    """Kiểm N3 nhất quán sư phạm — gộp kết quả 6 trục độc lập. Không bao giờ raise
    (lỗi cục bộ từng phán xử LLM đã được các hàm trục bắt riêng)."""
    findings: list[Finding] = []
    total_tokens = 0

    findings.extend(truc1_nhat_quan_doc(segmented, excluded_sections))

    u = {}
    findings.extend(await truc2_noi_bo_hoat_dong(db, segmented, usage=u))
    total_tokens += u.get("tokens_used", 0)

    u = {}
    findings.extend(await truc3_can_chinh(db, segmented, excluded_sections, usage=u))
    total_tokens += u.get("tokens_used", 0)

    u = {}
    findings.extend(await truc4_cu_the_hoa_nang_luc(db, segmented, lesson_ctx, excluded_sections, usage=u))
    total_tokens += u.get("tokens_used", 0)

    u = {}
    findings.extend(await truc5_thuc_chat_phuong_phap(db, segmented, graph, usage=u))
    total_tokens += u.get("tokens_used", 0)

    u = {}
    findings.extend(await truc6_tien_trinh_dieu_kien(db, segmented, lesson_ctx, usage=u))
    total_tokens += u.get("tokens_used", 0)

    if usage is not None:
        usage["tokens_used"] = total_tokens

    logger.info("kg_lpv.n3.verify_done findings=%d tokens=%d", len(findings), total_tokens)
    return findings


# =========================== Trục 1 — nhất quán dọc (C4) ===========================


def truc1_nhat_quan_doc(segmented: SegmentedPlan, excluded_sections: set[str]) -> list[Finding]:
    """Đồ thị hai phía mục tiêu <-> hoạt động (dựng trong bộ nhớ, KHÔNG LLM): mỗi mục
    tiêu phải được HIỆN THỰC bởi >=1 thành phần `muc_tieu` cục bộ của 1 hoạt động
    (khớp mờ theo từ vựng); mỗi hoạt động không hiện thực mục tiêu nào = mồ côi.

    Hoạt động thuộc `excluded_sections` (hoat_dong_loi_M, §7) KHÔNG được tính là bằng
    chứng hiện thực hoá mục tiêu (nguyên tắc ưu tiên nhánh) — bị BỎ QUA hoàn toàn khỏi
    đồ thị hai phía (không xét cả 2 chiều hiện thực/mồ côi cho hoạt động đó).
    """
    findings: list[Finding] = []
    activity_muc_tieu = [
        c for c in segmented.activity_components
        if c.component == ActivityComponentType.MUC_TIEU and c.section_id not in excluded_sections
    ]

    realized_objective_ids: set[str] = set()
    orphan_activities: list[ActivityComponentSegment] = []
    for comp in activity_muc_tieu:
        matched = False
        for clause in segmented.objective_clauses:
            if _text_overlap_ratio(clause.text, comp.text) >= N3_OBJECTIVE_ACTIVITY_MATCH_THRESHOLD:
                realized_objective_ids.add(clause.segment_id)
                matched = True
        if not matched and segmented.objective_clauses:
            orphan_activities.append(comp)

    for clause in segmented.objective_clauses:
        if clause.segment_id not in realized_objective_ids:
            findings.append(_build_finding(
                ErrorCode.C4, clause.section_id,
                evidence=[{"muc_tieu": clause.text, "khong_hien_thuc_boi_hoat_dong_nao": True}],
                explanation="Đứt chuỗi mục tiêu - hoạt động: mục tiêu không được hoạt động nào hiện thực hoá.",
            ))

    for comp in orphan_activities:
        findings.append(_build_finding(
            ErrorCode.C4, comp.section_id,
            evidence=[{"hoat_dong_muc_tieu": comp.text, "mo_coi_khong_neo_muc_tieu_nao": True}],
            explanation="Đứt chuỗi mục tiêu - hoạt động: hoạt động không neo vào mục tiêu nào của bài học (mồ côi).",
        ))

    return findings


# =========================== Trục 2 — nhất quán nội bộ hoạt động (C4) ===========================


async def truc2_noi_bo_hoat_dong(
    db: AsyncSession, segmented: SegmentedPlan, *, usage: dict[str, int] | None = None
) -> list[Finding]:
    """Phán xử nguyên tử: 4 thành phần (mục tiêu/nội dung/sản phẩm/tổ chức thực hiện)
    của MỘT hoạt động có khớp mức/loại nhau không. Chỉ xét hoạt động có ĐỦ CẢ 4 thành
    phần (thiếu thành phần nào -> không đủ căn cứ phán xử, bỏ qua, không LLM)."""
    findings: list[Finding] = []
    total_tokens = 0
    for section_id, comps in _group_by_activity(segmented).items():
        required = (
            ActivityComponentType.MUC_TIEU, ActivityComponentType.NOI_DUNG,
            ActivityComponentType.SAN_PHAM, ActivityComponentType.TO_CHUC_THUC_HIEN,
        )
        if not all(k in comps for k in required):
            continue

        prompt = build_truc2_coherence_prompt(
            comps[ActivityComponentType.MUC_TIEU].text,
            comps[ActivityComponentType.NOI_DUNG].text,
            comps[ActivityComponentType.SAN_PHAM].text,
            comps[ActivityComponentType.TO_CHUC_THUC_HIEN].text,
        )
        data, tokens, exc = await _atomic_judge(db, prompt)
        total_tokens += tokens
        if exc is not None:
            findings.append(_unjudged_finding(
                ErrorCode.C4, section_id, {"hoat_dong": section_id}, exc, "kiểm tra nhất quán nội bộ hoạt động",
            ))
            continue

        if (data or {}).get("verdict") != "khong_khop":
            continue
        evidence_refs = (data or {}).get("evidence_refs") or []
        evidence = evidence_refs if evidence_refs else [{"hoat_dong": section_id}]
        explanation = (data or {}).get("explanation") or "4 thành phần của hoạt động không nhất quán về mức."
        findings.append(_build_finding(ErrorCode.C4, section_id, evidence=evidence, explanation=explanation))

    if usage is not None:
        usage["tokens_used"] = total_tokens
    return findings


# =========================== Trục 3 — bộ ba bằng chứng (C4, C5) ===========================


async def truc3_can_chinh(
    db: AsyncSession, segmented: SegmentedPlan, excluded_sections: set[str], *, usage: dict[str, int] | None = None
) -> list[Finding]:
    """Phán xử nguyên tử "bộ ba bằng chứng" (§7): hành động đúng mức + sản phẩm thể
    hiện năng lực + tiêu chí đánh giá quan sát được TRÊN sản phẩm. Thiếu/lệch đúng 1
    thành phần -> finding: thiếu "hành động"/"sản phẩm" -> C4 (đứt chuỗi mục tiêu-hoạt
    động-sản phẩm); thiếu "tiêu chí" quan sát được -> C5 (đánh giá không bao phủ/không
    quan sát được). Hoạt động trong `excluded_sections` KHÔNG được dùng làm bằng chứng
    (nguyên tắc ưu tiên nhánh) -> bị bỏ qua hoàn toàn."""
    findings: list[Finding] = []
    total_tokens = 0
    for section_id, comps in _group_by_activity(segmented).items():
        if section_id in excluded_sections:
            continue
        required = (ActivityComponentType.MUC_TIEU, ActivityComponentType.SAN_PHAM, ActivityComponentType.TO_CHUC_THUC_HIEN)
        if not all(k in comps for k in required):
            continue

        objective_text = comps[ActivityComponentType.MUC_TIEU].text
        hanh_dong_text = comps[ActivityComponentType.TO_CHUC_THUC_HIEN].text
        san_pham_text = comps[ActivityComponentType.SAN_PHAM].text

        prompt = build_truc3_bo_ba_bang_chung_prompt(objective_text, hanh_dong_text, san_pham_text)
        data, tokens, exc = await _atomic_judge(db, prompt)
        total_tokens += tokens
        if exc is not None:
            findings.append(_unjudged_finding(
                ErrorCode.C4, section_id, {"hoat_dong": section_id}, exc, "kiểm tra bộ ba bằng chứng",
            ))
            continue

        if (data or {}).get("verdict") != "khong_dat":
            continue

        thieu = (data or {}).get("thanh_phan_thieu")
        code = ErrorCode.C5 if thieu == "tieu_chi" else ErrorCode.C4
        evidence_refs = (data or {}).get("evidence_refs") or []
        evidence = evidence_refs if evidence_refs else [{"hoat_dong": section_id, "thanh_phan_thieu": thieu}]
        explanation = (data or {}).get("explanation") or "Thiếu bằng chứng căn chỉnh mục tiêu - hoạt động - sản phẩm - đánh giá."
        findings.append(_build_finding(code, section_id, evidence=evidence, explanation=explanation))

    if usage is not None:
        usage["tokens_used"] = total_tokens
    return findings


# =========================== Trục 4 — cụ thể hóa năng lực (C1, C2, C8) ===========================


async def truc4_cu_the_hoa_nang_luc(
    db: AsyncSession,
    segmented: SegmentedPlan,
    lesson_ctx: LessonContext,
    excluded_sections: set[str],
    *,
    usage: dict[str, int] | None = None,
) -> list[Finding]:
    """C1 (RULE, không LLM): NLa-NLc khai báo phải có nội dung/sản phẩm hoạt động
    minh hoạ cụ thể trong đồ thị bài học. C2/C8 (LLM_JUDGE): NLd-NLe/NL chung/phẩm
    chất (C2) và năng lực số (C8) phải được CỤ THỂ HOÁ bằng hoạt động thật, không chỉ
    nêu tên — phán xử nguyên tử so khớp với hoạt động liên quan gần nhất."""
    findings: list[Finding] = []
    total_tokens = 0

    findings.extend(_check_c1(segmented, lesson_ctx, excluded_sections))

    activity_texts = [
        c for c in segmented.activity_components
        if c.component == ActivityComponentType.TO_CHUC_THUC_HIEN and c.section_id not in excluded_sections
    ]

    for clause in segmented.objective_clauses:
        if not _is_c2_target(clause):
            continue
        finding, tokens = await _judge_cu_the_hoa(db, ErrorCode.C2, clause, activity_texts, ngu_canh="")
        total_tokens += tokens
        if finding is not None:
            findings.append(finding)

    for clause in segmented.objective_clauses:
        if clause.loai != ObjectiveClauseType.NANG_LUC_SO:
            continue
        chi_bao = _match_chi_bao_nls(clause.text, lesson_ctx.chi_bao_nls)
        ngu_canh = chi_bao.get("ten", "") if chi_bao else ""
        finding, tokens = await _judge_cu_the_hoa(db, ErrorCode.C8, clause, activity_texts, ngu_canh=ngu_canh)
        total_tokens += tokens
        if finding is not None:
            findings.append(finding)

    if usage is not None:
        usage["tokens_used"] = total_tokens
    return findings


def _check_c1(segmented: SegmentedPlan, lesson_ctx: LessonContext, excluded_sections: set[str]) -> list[Finding]:
    nl_catalog = {n.get("ma_nang_luc"): n for n in lesson_ctx.nang_luc_tin_hoc if n.get("ma_nang_luc") in {"NLa", "NLb", "NLc"}}
    if not nl_catalog:
        return []

    declared: dict[str, ObjectiveClauseSegment] = {}
    for clause in segmented.objective_clauses:
        if clause.loai != ObjectiveClauseType.NANG_LUC_TIN_HOC:
            continue
        for match in _NL_ABC_PATTERN.findall(clause.text):
            ma = "NL" + match[-1].lower()
            if ma in nl_catalog:
                declared.setdefault(ma, clause)
    if not declared:
        return []

    content_texts = [
        c.text for c in segmented.activity_components
        if c.component in (ActivityComponentType.NOI_DUNG, ActivityComponentType.SAN_PHAM)
        and c.section_id not in excluded_sections
    ]

    findings: list[Finding] = []
    for ma, clause in declared.items():
        catalog_entry = nl_catalog[ma]
        grounded = any(
            _word_coverage(catalog_entry.get("ten"), text) >= N3_C1_GROUNDING_THRESHOLD for text in content_texts
        )
        if not grounded:
            findings.append(_build_finding(
                ErrorCode.C1, clause.section_id,
                evidence=[catalog_entry, {"khong_tim_thay_noi_dung_minh_hoa": True}],
                explanation=f"{ma} thiếu cơ sở nội dung: không có hoạt động nào trong KHBD minh hoạ cụ thể năng lực này.",
            ))
    return findings


def _is_c2_target(clause: ObjectiveClauseSegment) -> bool:
    if clause.loai in (ObjectiveClauseType.NANG_LUC_CHUNG, ObjectiveClauseType.PHAM_CHAT):
        return True
    return clause.loai == ObjectiveClauseType.NANG_LUC_TIN_HOC and bool(_NL_DE_PATTERN.search(clause.text))


def _match_chi_bao_nls(text: str, chi_bao_nls: list[dict]) -> dict | None:
    match = _CHI_BAO_NLS_PATTERN.search(text)
    if not match:
        return None
    ma = match.group(0)
    return next((c for c in chi_bao_nls if c.get("ma_chi_bao") == ma), None)


async def _judge_cu_the_hoa(
    db: AsyncSession,
    code: ErrorCode,
    clause: ObjectiveClauseSegment,
    activity_texts: list[ActivityComponentSegment],
    *,
    ngu_canh: str,
) -> tuple[Finding | None, int]:
    if not activity_texts:
        finding = _build_finding(
            code, clause.section_id,
            evidence=[{"muc_tieu": clause.text, "khong_co_hoat_dong_de_doi_chieu": True}],
            explanation="Không có hoạt động nào (ngoài các hoạt động đã loại trừ) để đối chiếu cụ thể hoá.",
        )
        return finding, 0

    best = max(activity_texts, key=lambda c: _text_overlap_ratio(clause.text, c.text))
    prompt = build_truc4_cu_the_hoa_prompt(clause.text, best.text, ngu_canh=ngu_canh)
    data, tokens, exc = await _atomic_judge(db, prompt)
    if exc is not None:
        return _unjudged_finding(code, clause.section_id, {"muc_tieu": clause.text}, exc, "kiểm tra cụ thể hoá năng lực"), tokens

    if (data or {}).get("verdict") != "khong_cu_the_hoa":
        return None, tokens

    evidence_refs = (data or {}).get("evidence_refs") or []
    evidence = evidence_refs if evidence_refs else [{"muc_tieu": clause.text, "hoat_dong": best.text}]
    explanation = (data or {}).get("explanation") or "Năng lực/phẩm chất khai báo không được cụ thể hoá bằng hoạt động thật."
    return _build_finding(code, clause.section_id, evidence=evidence, explanation=explanation), tokens


# =========================== Trục 5 — thực chất phương pháp/kĩ thuật (C7) ===========================


async def truc5_thuc_chat_phuong_phap(
    db: AsyncSession, segmented: SegmentedPlan, graph: KgLpvGraphClient, *, usage: dict[str, int] | None = None
) -> list[Finding]:
    """Trích tên phương pháp/kĩ thuật khai báo trong `to_chuc_thuc_hien`, lấy quy trình
    chuẩn (`BuocQuyTrinh`) từ đồ thị qua `graph.get_method_procedures`, rồi phán xử
    nguyên tử: các bước tổ chức thực tế có phản ánh đúng quy trình chuẩn không. CHỈ
    đánh giá việc THỰC THI đúng quy trình đã khai báo — không đánh giá phương pháp có
    tối ưu hay không (quyền tự chủ giáo viên, §7). Không tìm thấy quy trình chuẩn
    trong đồ thị -> không đủ căn cứ phán xử -> bỏ qua (không tạo finding vô căn cứ)."""
    findings: list[Finding] = []
    total_tokens = 0

    to_chuc_by_section = {
        c.section_id: c for c in segmented.activity_components if c.component == ActivityComponentType.TO_CHUC_THUC_HIEN
    }
    method_names_by_section = {sid: _extract_method_names(c.text) for sid, c in to_chuc_by_section.items()}
    all_names = sorted({name for names in method_names_by_section.values() for name in names})
    if not all_names:
        if usage is not None:
            usage["tokens_used"] = 0
        return findings

    procedures = graph.get_method_procedures(all_names)

    for section_id, names in method_names_by_section.items():
        comp = to_chuc_by_section[section_id]
        for name in names:
            steps = procedures.get(name)
            if not steps:
                continue

            prompt = build_truc5_quy_trinh_prompt(name, steps, comp.text)
            data, tokens, exc = await _atomic_judge(db, prompt)
            total_tokens += tokens
            if exc is not None:
                findings.append(_unjudged_finding(
                    ErrorCode.C7, section_id, {"phuong_phap": name}, exc, "kiểm tra quy trình phương pháp/kĩ thuật",
                ))
                continue

            if (data or {}).get("verdict") != "khong_dung_quy_trinh":
                continue
            evidence_refs = (data or {}).get("evidence_refs") or []
            evidence = evidence_refs if evidence_refs else [{"phuong_phap": name, "quy_trinh_chuan": steps}]
            explanation = (data or {}).get("explanation") or f"Tổ chức thực hiện không phản ánh đúng quy trình chuẩn của '{name}'."
            findings.append(_build_finding(ErrorCode.C7, section_id, evidence=evidence, explanation=explanation))

    if usage is not None:
        usage["tokens_used"] = total_tokens
    return findings


def _extract_method_names(text: str) -> list[str]:
    return [m.strip() for m in _METHOD_NAME_PATTERN.findall(text) if m.strip()]


# =========================== Trục 6 — tiến trình & điều kiện triển khai (C3, C5, C6) ===========================


async def truc6_tien_trinh_dieu_kien(
    db: AsyncSession, segmented: SegmentedPlan, lesson_ctx: LessonContext, *, usage: dict[str, int] | None = None
) -> list[Finding]:
    """C3 (ALGORITHMIC): thiết bị dùng trong nội dung/sản phẩm của 1 hoạt động phải
    được khai báo trong tổ chức thực hiện của CHÍNH hoạt động đó. C6 (ALGORITHMIC):
    thứ tự tiến trình khởi động->hình thành->luyện tập->vận dụng hợp lệ VÀ mức nhận
    thức không thụt lùi giữa các hoạt động (theo thứ tự xuất hiện trong KHBD). C5
    (LLM_JUDGE, phần bao phủ): các hoạt động luyện tập/vận dụng có bao phủ đủ mục
    tiêu kiến thức của bài học không — nếu KHÔNG có hoạt động luyện tập/vận dụng nào,
    kết luận ngay không bao phủ (không cần LLM, không đủ dữ liệu để hỏi)."""
    findings: list[Finding] = []
    total_tokens = 0

    findings.extend(_check_c3_thiet_bi(segmented))
    findings.extend(_check_c6_tien_trinh(segmented, lesson_ctx))

    c5_finding, tokens = await _check_c5_bao_phu(db, segmented)
    total_tokens += tokens
    if c5_finding is not None:
        findings.append(c5_finding)

    if usage is not None:
        usage["tokens_used"] = total_tokens
    return findings


def _check_c3_thiet_bi(segmented: SegmentedPlan) -> list[Finding]:
    findings: list[Finding] = []
    for section_id, comps in _group_by_activity(segmented).items():
        to_chuc = comps.get(ActivityComponentType.TO_CHUC_THUC_HIEN)
        if to_chuc is None:
            continue
        declared = _extract_devices(to_chuc.text)
        used_text = " ".join(
            comps[k].text for k in (ActivityComponentType.NOI_DUNG, ActivityComponentType.SAN_PHAM) if k in comps
        )
        used = _extract_devices(used_text)
        missing = used - declared
        if missing:
            findings.append(_build_finding(
                ErrorCode.C3, section_id,
                evidence=[{"thiet_bi_dung_nhung_khong_khai_bao": sorted(missing), "to_chuc_thuc_hien": to_chuc.text}],
                explanation=(
                    "Thiết bị/phụ lục không khớp hoạt động: "
                    f"{', '.join(sorted(missing))} được dùng trong nội dung/sản phẩm nhưng không khai báo ở tổ chức thực hiện."
                ),
            ))
    return findings


def _extract_devices(text: str) -> set[str]:
    normalized = _normalize(text)
    return {kw for kw in N3_DEVICE_KEYWORDS if kw in normalized}


def _stage_rank(section_id: str) -> int | None:
    for rank, prefix in enumerate(_STAGE_ORDER):
        if section_id.startswith(prefix):
            return rank
    return None


def _infer_bac(text: str, lesson_ctx: LessonContext) -> int | None:
    normalized = _normalize(text)
    for entry in lesson_ctx.dong_tu_nhan_thuc.get("do_duoc") or []:
        verb = entry.get("dong_tu")
        if verb and normalized.startswith(_normalize(verb)):
            return entry.get("bac")
    return None


def _check_c6_tien_trinh(segmented: SegmentedPlan, lesson_ctx: LessonContext) -> list[Finding]:
    groups = _group_by_activity(segmented)
    stage_info = []
    for section_id in groups:  # thứ tự xuất hiện trong KHBD (dict giữ thứ tự chèn)
        rank = _stage_rank(section_id)
        if rank is None:
            continue
        muc_tieu_comp = groups[section_id].get(ActivityComponentType.MUC_TIEU)
        bac = _infer_bac(muc_tieu_comp.text, lesson_ctx) if muc_tieu_comp else None
        stage_info.append({"section_id": section_id, "rank": rank, "bac": bac})

    violations = []
    for i in range(len(stage_info) - 1):
        cur, nxt = stage_info[i], stage_info[i + 1]
        if nxt["rank"] < cur["rank"]:
            violations.append({"tu": cur["section_id"], "den": nxt["section_id"], "loai": "sai_thu_tu_tien_trinh"})
        elif cur["bac"] is not None and nxt["bac"] is not None and nxt["bac"] < cur["bac"]:
            violations.append({
                "tu": cur["section_id"], "den": nxt["section_id"], "loai": "muc_nhan_thuc_thut_lui",
                "bac_truoc": cur["bac"], "bac_sau": nxt["bac"],
            })

    if not violations:
        return []
    return [_build_finding(
        ErrorCode.C6, violations[0]["tu"],
        evidence=violations,
        explanation="Mâu thuẫn nội bộ trong tiến trình: " + "; ".join(
            f"{v['tu']} -> {v['den']} ({v['loai']})" for v in violations
        ) + ".",
    )]


async def _check_c5_bao_phu(db: AsyncSession, segmented: SegmentedPlan) -> tuple[Finding | None, int]:
    kien_thuc_objectives = [c for c in segmented.objective_clauses if c.loai == ObjectiveClauseType.KIEN_THUC]
    if not kien_thuc_objectives:
        return None, 0

    groups = _group_by_activity(segmented)
    luyen_van_sections = [sid for sid in groups if _stage_rank(sid) in (2, 3)]
    if not luyen_van_sections:
        finding = _build_finding(
            ErrorCode.C5, kien_thuc_objectives[0].section_id,
            evidence=[{"khong_co_hoat_dong_luyen_tap_van_dung": True, "so_muc_tieu_kien_thuc": len(kien_thuc_objectives)}],
            explanation="Câu hỏi/luyện tập/vận dụng không bao phủ kiến thức: KHBD không có hoạt động luyện tập/vận dụng nào.",
        )
        return finding, 0

    coverage_texts = [
        groups[sid][k].text
        for sid in luyen_van_sections
        for k in (ActivityComponentType.NOI_DUNG, ActivityComponentType.SAN_PHAM)
        if k in groups[sid]
    ]
    prompt = build_truc6_bao_phu_prompt([c.text for c in kien_thuc_objectives], coverage_texts)
    data, tokens, exc = await _atomic_judge(db, prompt)
    if exc is not None:
        return _unjudged_finding(
            ErrorCode.C5, kien_thuc_objectives[0].section_id,
            {"so_muc_tieu_kien_thuc": len(kien_thuc_objectives)}, exc, "kiểm tra bao phủ luyện tập/vận dụng",
        ), tokens

    if (data or {}).get("verdict") != "khong_bao_phu":
        return None, tokens

    evidence_refs = (data or {}).get("evidence_refs") or []
    evidence = evidence_refs if evidence_refs else [{"muc_tieu_kien_thuc": [c.text for c in kien_thuc_objectives]}]
    explanation = (data or {}).get("explanation") or "Câu hỏi/luyện tập/vận dụng không bao phủ kiến thức."
    return _build_finding(ErrorCode.C5, kien_thuc_objectives[0].section_id, evidence=evidence, explanation=explanation), tokens


# =========================== Tiện ích chung ===========================


def _group_by_activity(segmented: SegmentedPlan) -> dict[str, dict]:
    """Nhóm `activity_components` theo `section_id` (1 hoạt động), giữ THỨ TỰ XUẤT
    HIỆN đầu tiên (dict Python giữ thứ tự chèn) — dùng làm proxy cho thứ tự tiến
    trình của KHBD (trục 6) khi không có trường thứ tự tường minh."""
    groups: dict[str, dict] = {}
    for comp in segmented.activity_components:
        groups.setdefault(comp.section_id, {})[comp.component] = comp
    return groups


async def _atomic_judge(db: AsyncSession, prompt: str) -> tuple[dict | None, int, Exception | None]:
    """Gọi `generate_json` (feature `kg_lpv_n3_judge`) qua semaphore giới hạn đồng
    thời dùng chung (`gemini_limiter`). Bắt MỌI exception — hàm gọi quyết định cách
    ghi nhận (finding `unjudged`)."""
    try:
        async with get_gemini_semaphore():
            data, tokens = await generate_json(db, FEATURE_KG_LPV_N3_JUDGE, prompt)
        return data, tokens, None
    except Exception as exc:  # noqa: BLE001 - 1 lượt LLM hỏng không được crash job (§9)
        logger.warning("kg_lpv.n3.judge_failed err=%s", type(exc).__name__)
        return None, 0, exc


def _build_finding(code: ErrorCode, section_id: str, *, evidence: list[dict], explanation: str, status: str = "open") -> Finding:
    meta = ERROR_META[code]
    return Finding(
        code=code, branch=meta.branch, truc=meta.truc, section_id=section_id,
        evidence=evidence, explanation=explanation, status=status,
    )


def _unjudged_finding(code: ErrorCode, section_id: str, context: dict, exc: Exception, viec: str) -> Finding:
    return _build_finding(
        code, section_id,
        evidence=[{"khong_phan_xu_duoc": True, **context}],
        explanation=f"không phán xử được: lỗi khi gọi AI {viec} ({type(exc).__name__}).",
        status="unjudged",
    )


def _normalize(text: str | None) -> str:
    return (text or "").strip().lower()


_WORD_PATTERN = re.compile(r"[\wÀ-ỹ]+", re.UNICODE)


def _word_coverage(short_text: str | None, long_text: str | None) -> float:
    """Tỉ lệ từ vựng của `short_text` xuất hiện trong `long_text` (cùng kĩ thuật với
    `n2_curriculum._word_coverage`)."""
    short_words = set(_WORD_PATTERN.findall(_normalize(short_text)))
    if not short_words:
        return 0.0
    long_words = set(_WORD_PATTERN.findall(_normalize(long_text)))
    return len(short_words & long_words) / len(short_words)


def _text_overlap_ratio(a: str | None, b: str | None) -> float:
    """Tỉ lệ giao từ vựng giữa 2 đoạn văn, chuẩn hoá theo văn bản NGẮN HƠN (đối xứng
    hơn `_word_coverage` cho trường hợp không biết trước bên nào dài hơn — trục 1
    so khớp mục tiêu <-> mục tiêu cục bộ của hoạt động, độ dài tương đương nhau)."""
    a_words = set(_WORD_PATTERN.findall(_normalize(a)))
    b_words = set(_WORD_PATTERN.findall(_normalize(b)))
    shorter_len = min(len(a_words), len(b_words))
    if shorter_len == 0:
        return 0.0
    return len(a_words & b_words) / shorter_len
