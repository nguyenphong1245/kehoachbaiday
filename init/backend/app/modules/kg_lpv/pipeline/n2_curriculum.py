"""Bước 2b — N2 Đối chiếu chương trình (`n2_curriculum.py`) → M1-M6.

`n2_verify(db, segmented, lesson_ctx, graph) -> (list[Finding], set[section_id])`
chạy song song với N1 (`asyncio.gather` ở orchestrator, Task 5). Theo §3 điểm 3
và §7 Bước 2b:

- `RULE` (không LLM, so khớp cấu trúc thuần với `lesson_ctx`): M1 (mục tiêu kiến
  thức phải khớp YCCĐ và không thấp hơn mức nhận thức yêu cầu), M3 (mã NLa-NLe
  khai báo phải tồn tại trong danh mục), M4 (NL chung/phẩm chất khai báo phải
  khớp danh mục chương trình tổng thể), M5 (chỉ báo NLS khai báo phải tồn tại
  VÀ có mức áp dụng cho khối lớp — `lesson_ctx.chi_bao_nls` đã được lọc theo
  khối lớp khi truy vấn, nên "không tìm thấy trong danh sách" bao hàm cả 2
  trường hợp sai mã lẫn sai khối lớp).
- `LLM_JUDGE` (`llm.generate_json` với feature `kg_lpv_n2_critic`, CHỈ gọi cho
  trường hợp biên): M2 tra bảng `dong_tu_nhan_thuc` trước — khớp `do_duoc` thì
  qua, khớp `khong_do_duoc` thì lỗi ngay, KHÔNG gọi LLM trong cả 2 trường hợp;
  chỉ động từ không có trong bảng nào mới hỏi LLM. M6 luôn hỏi LLM cho từng
  thành phần `noi_dung` của hoạt động (không có luật thuần để đối chiếu mệnh đề
  kiến thức tự do với `MenhDeKienThuc`), nhưng CHỈ tạo finding khi model trả
  `evidence_refs` khác rỗng (§6.2 — quyết định thiếu bằng chứng không được tạo).

Lỗi cục bộ 1 lượt LLM (`LlmJsonError`, `asyncio.TimeoutError`, lỗi API Gemini
bất kỳ) KHÔNG được làm crash job: bắt riêng từng lượt gọi (biên phán xử từng
mục tiêu/hoạt động), KHÔNG bỏ qua lặng lẽ mà ghi nhận 1 `Finding` trạng thái
`status="unjudged"` (khác `"open"` — KHÔNG tính là lỗi nội dung xác nhận, chỉ
để giữ vết kiểm toán §9), ghi log cảnh báo, tiếp tục các mục còn lại (§9 "an
toàn khi hỏng"). M6 `unjudged` KHÔNG được đưa vào `hoat_dong_loi_M` — chỉ M6
`status="open"` (đã xác nhận) mới loại hoạt động khỏi vai trò bằng chứng N3.
"""
import asyncio
import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.modules.kg_lpv.config import N2_NLC_PC_MATCH_THRESHOLD, N2_YCCD_MATCH_THRESHOLD
from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch
from app.modules.kg_lpv.graph_client import KgLpvGraphClient
from app.modules.kg_lpv.llm import generate_json
from app.modules.kg_lpv.prompts.n2_critic import build_m2_prompt, build_m6_prompt
from app.modules.kg_lpv.schemas import (
    ActivityComponentSegment,
    ActivityComponentType,
    Finding,
    LessonContext,
    ObjectiveClauseSegment,
    ObjectiveClauseType,
    SegmentedPlan,
)
from app.services.admin_ai_model_registry import FEATURE_KG_LPV_N2_CRITIC

_NL_TIN_HOC_PATTERN = re.compile(r"\bNL[a-eA-E]\b")
_CHI_BAO_NLS_PATTERN = re.compile(r"\b\d+\.\d+\.[A-Za-z0-9]+\b")


async def n2_verify(
    db: AsyncSession,
    segmented: SegmentedPlan,
    lesson_ctx: LessonContext,
    graph: KgLpvGraphClient,
    *,
    usage: dict[str, int] | None = None,
) -> tuple[list[Finding], set[str]]:
    """Kiểm N2 đối chiếu chương trình. Trả `(findings, hoat_dong_loi_M)`.

    `graph` KHÔNG được truy vấn lại — `lesson_ctx` đã được orchestrator truy hồi
    đúng 1 lần/job (§9); tham số chỉ giữ để khớp đối xứng với `n1_verify(identity,
    graph)` và cho phần mở rộng sau nếu N2 cần tra cứu ngoài gói ngữ cảnh.

    `usage` (tuỳ chọn, cùng quy ước với `segmenter.segment`): nếu truyền dict
    rỗng vào, hàm ghi `usage["tokens_used"]` = tổng token các lượt gọi LLM (M2
    biên + M6) để orchestrator trừ token thực dùng.

    `hoat_dong_loi_M` = tập `section_id` của hoạt động dính lỗi M6 — N3 (Task 6)
    loại các hoạt động này khỏi vai trò bằng chứng (nguyên tắc ưu tiên nhánh, §7).
    """
    findings: list[Finding] = []
    hoat_dong_loi_m: set[str] = set()
    total_tokens = 0

    for clause in segmented.objective_clauses:
        rule_finding = _check_rule_for_clause(clause, lesson_ctx)
        if rule_finding is not None:
            findings.append(rule_finding)

        # M2 ("động từ mục tiêu không đo lường được") chỉ có ý nghĩa với mục
        # tiêu KIẾN THỨC diễn đạt theo động từ thang Bloom (CV 5512) — mục
        # tiêu năng lực/phẩm chất/năng lực số khai báo theo mẫu "tên biểu
        # hiện: diễn giải", không đối chiếu bằng bảng động từ.
        if clause.loai == ObjectiveClauseType.KIEN_THUC:
            m2_finding, tokens = await _check_m2(db, clause, lesson_ctx)
            total_tokens += tokens
            if m2_finding is not None:
                findings.append(m2_finding)

    for comp in segmented.activity_components:
        if comp.component != ActivityComponentType.NOI_DUNG:
            continue
        m6_finding, tokens = await _check_m6(db, comp, lesson_ctx)
        total_tokens += tokens
        if m6_finding is not None:
            findings.append(m6_finding)
            # Chỉ M6 status="open" (đã XÁC NHẬN thiếu căn cứ) mới loại hoạt động
            # khỏi vai trò bằng chứng N3 — "unjudged" (không phán xử được) không
            # được coi là lỗi, không được phép loại trừ oan bằng chứng (Finding 2).
            if m6_finding.status == "open":
                hoat_dong_loi_m.add(comp.section_id)

    if usage is not None:
        usage["tokens_used"] = total_tokens

    logger.info(
        "kg_lpv.n2.verify_done findings=%d hoat_dong_loi_m=%d tokens=%d",
        len(findings), len(hoat_dong_loi_m), total_tokens,
    )
    return findings, hoat_dong_loi_m


# =========================== RULE: M1, M3, M4, M5 (dispatch theo loai) ===========================


def _check_rule_for_clause(clause: ObjectiveClauseSegment, lesson_ctx: LessonContext) -> Finding | None:
    if clause.loai == ObjectiveClauseType.KIEN_THUC:
        return _check_m1(clause, lesson_ctx)
    if clause.loai == ObjectiveClauseType.NANG_LUC_TIN_HOC:
        return _check_m3(clause, lesson_ctx)
    if clause.loai in (ObjectiveClauseType.NANG_LUC_CHUNG, ObjectiveClauseType.PHAM_CHAT):
        return _check_m4(clause, lesson_ctx)
    if clause.loai == ObjectiveClauseType.NANG_LUC_SO:
        return _check_m5(clause, lesson_ctx)
    return None


def _check_m1(clause: ObjectiveClauseSegment, lesson_ctx: LessonContext) -> Finding | None:
    """M1: mục tiêu kiến thức phải khớp 1 YCCĐ và không thấp hơn mức nhận thức yêu cầu."""
    yccd_list = lesson_ctx.yccd
    if not yccd_list:
        return _build_finding(
            ErrorCode.M1, clause.section_id,
            evidence=[{"khong_co_yccd": True}],
            explanation="Mục tiêu kiến thức lệch yêu cầu cần đạt: bài học không có YCCĐ nào trong đồ thị để đối chiếu.",
        )

    best = max(yccd_list, key=lambda y: _word_coverage(y.get("ten"), clause.text))
    best_ratio = _word_coverage(best.get("ten"), clause.text)

    if best_ratio < N2_YCCD_MATCH_THRESHOLD:
        evidence = [{**best, "ty_le_khop": round(best_ratio, 3)}]
        return _build_finding(
            ErrorCode.M1, clause.section_id, evidence=evidence,
            explanation="Mục tiêu kiến thức lệch yêu cầu cần đạt: không thuộc YCCĐ nào của bài học.",
        )

    yccd_bac = (best.get("muc_nhan_thuc") or {}).get("bac")
    verb_entry = _match_verb(clause.text, lesson_ctx.dong_tu_nhan_thuc.get("do_duoc") or [])
    if yccd_bac is not None and isinstance(verb_entry, dict):
        obj_bac = verb_entry.get("bac")
        if obj_bac is not None and obj_bac < yccd_bac:
            evidence = [{**best, "dong_tu_muc_tieu": verb_entry}]
            return _build_finding(
                ErrorCode.M1, clause.section_id, evidence=evidence,
                explanation=(
                    "Mục tiêu kiến thức lệch yêu cầu cần đạt: mức nhận thức "
                    f"(bậc {obj_bac}) thấp hơn yêu cầu cần đạt tương ứng (bậc {yccd_bac})."
                ),
            )

    return None


def _check_m3(clause: ObjectiveClauseSegment, lesson_ctx: LessonContext) -> Finding | None:
    """M3: mã NLa-NLe khai báo phải tồn tại trong danh mục Năng lực Tin học."""
    matches = _NL_TIN_HOC_PATTERN.findall(clause.text)
    if not matches:
        return None  # không khai báo mã cụ thể -> không có gì để đối chiếu bằng RULE

    declared_codes = {"NL" + m[-1].lower() for m in matches}
    catalog_codes = {n.get("ma_nang_luc") for n in lesson_ctx.nang_luc_tin_hoc if n.get("ma_nang_luc")}
    missing = declared_codes - catalog_codes
    if not missing:
        return None

    evidence = [{"ma_khai_bao": sorted(missing), "danh_muc_hop_le": lesson_ctx.nang_luc_tin_hoc}]
    return _build_finding(
        ErrorCode.M3, clause.section_id, evidence=evidence,
        explanation=(
            f"Năng lực tin học không khớp chương trình: mã {', '.join(sorted(missing))} "
            "không có trong danh mục NLa-NLe."
        ),
    )


def _check_m4(clause: ObjectiveClauseSegment, lesson_ctx: LessonContext) -> Finding | None:
    """M4: NL chung/phẩm chất khai báo phải khớp danh mục chương trình tổng thể."""
    is_nang_luc_chung = clause.loai == ObjectiveClauseType.NANG_LUC_CHUNG
    catalog = lesson_ctx.nang_luc_chung if is_nang_luc_chung else lesson_ctx.pham_chat
    loai_ten = "năng lực chung" if is_nang_luc_chung else "phẩm chất"

    if not catalog:
        return _build_finding(
            ErrorCode.M4, clause.section_id, evidence=[{"khong_co_danh_muc": True}],
            explanation=f"Năng lực chung/phẩm chất không khớp chương trình tổng thể: không có danh mục {loai_ten} để đối chiếu.",
        )

    best = max(catalog, key=lambda n: _word_coverage(n.get("ten"), clause.text))
    best_ratio = _word_coverage(best.get("ten"), clause.text)
    if best_ratio < N2_NLC_PC_MATCH_THRESHOLD:
        evidence = [{**best, "ty_le_khop": round(best_ratio, 3)}]
        return _build_finding(
            ErrorCode.M4, clause.section_id, evidence=evidence,
            explanation=f"Năng lực chung/phẩm chất không khớp chương trình tổng thể: {loai_ten} khai báo không khớp danh mục.",
        )
    return None


def _check_m5(clause: ObjectiveClauseSegment, lesson_ctx: LessonContext) -> Finding | None:
    """M5: chỉ báo NLS khai báo phải tồn tại VÀ có mức áp dụng cho khối lớp.

    `lesson_ctx.chi_bao_nls` đã được lọc theo khối lớp khi truy vấn đồ thị
    (`AP_DUNG_CHO` -> `KhoiLop`) — không tìm thấy mã trong danh sách này bao
    hàm cả 2 trường hợp: mã không tồn tại, HOẶC mã tồn tại nhưng sai khối lớp.
    """
    matches = _CHI_BAO_NLS_PATTERN.findall(clause.text)
    if not matches:
        return None

    declared_code = matches[0]
    entry = next((c for c in lesson_ctx.chi_bao_nls if c.get("ma_chi_bao") == declared_code), None)

    if entry is None:
        evidence = [
            {
                "ma_khai_bao": declared_code,
                "danh_muc_hop_le": lesson_ctx.chi_bao_nls,
            }
        ]
        return _build_finding(
            ErrorCode.M5, clause.section_id, evidence=evidence,
            explanation=(
                f"Năng lực số không khớp khung quy định: chỉ báo '{declared_code}' không tồn tại "
                "hoặc không áp dụng cho khối lớp của bài học."
            ),
        )

    if not entry.get("muc_do"):
        return _build_finding(
            ErrorCode.M5, clause.section_id, evidence=[entry],
            explanation=f"Năng lực số không khớp khung quy định: chỉ báo '{declared_code}' chưa có mức độ quy định cho khối lớp trong đồ thị.",
        )

    return None


# =========================== LLM_JUDGE: M2 (tra bảng trước), M6 ===========================


async def _check_m2(
    db: AsyncSession, clause: ObjectiveClauseSegment, lesson_ctx: LessonContext
) -> tuple[Finding | None, int]:
    """M2: tra bảng `dong_tu_nhan_thuc` trước; chỉ hỏi LLM khi động từ không có trong cả 2 danh sách."""
    dong_tu = lesson_ctx.dong_tu_nhan_thuc or {}
    do_duoc = dong_tu.get("do_duoc") or []
    khong_do_duoc = dong_tu.get("khong_do_duoc") or []

    non_measurable_match = _match_verb(clause.text, khong_do_duoc)
    if non_measurable_match is not None:
        finding = _build_finding(
            ErrorCode.M2, clause.section_id,
            evidence=[{"text_span": clause.text, "dong_tu_khong_do_duoc": non_measurable_match}],
            explanation=f"Động từ mục tiêu không đo lường được: '{non_measurable_match}'.",
        )
        return finding, 0

    if _match_verb(clause.text, do_duoc) is not None:
        return None, 0  # động từ đo được, có trong bảng -> không gọi LLM

    prompt = build_m2_prompt(clause.text, do_duoc, khong_do_duoc)
    try:
        data, tokens = await generate_json(db, FEATURE_KG_LPV_N2_CRITIC, prompt)
    except Exception as exc:  # noqa: BLE001 - 1 lượt LLM hỏng (JSON/timeout/lỗi API) không được crash job (§9)
        logger.warning(
            "kg_lpv.n2.judge_failed code=M2 section_id=%s err=%s", clause.section_id, type(exc).__name__
        )
        finding = _build_finding(
            ErrorCode.M2, clause.section_id,
            evidence=[{"khong_phan_xu_duoc": True, "muc_tieu": clause.text}],
            explanation=(
                f"không phán xử được: lỗi khi gọi AI kiểm tra động từ mục tiêu ({type(exc).__name__})."
            ),
            status="unjudged",
        )
        return finding, 0

    verdict = (data or {}).get("verdict")
    if verdict != "khong_do_duoc":
        return None, tokens

    explanation = (data or {}).get("explanation") or "Động từ mục tiêu không đo lường được (phán xử AI)."
    evidence_refs = (data or {}).get("evidence_refs") or []
    evidence = evidence_refs if evidence_refs else [{"text_span": clause.text, "explanation": explanation}]
    finding = _build_finding(ErrorCode.M2, clause.section_id, evidence=evidence, explanation=explanation)
    return finding, tokens


async def _check_m6(
    db: AsyncSession, comp: ActivityComponentSegment, lesson_ctx: LessonContext
) -> tuple[Finding | None, int]:
    """M6: mệnh đề kiến thức trong nội dung hoạt động có căn cứ `MenhDeKienThuc` không.

    Finding CHỈ được tạo khi model trả `evidence_refs` khác rỗng (§6.2).
    """
    prompt = build_m6_prompt(comp.text, lesson_ctx.menh_de_kien_thuc)
    try:
        data, tokens = await generate_json(db, FEATURE_KG_LPV_N2_CRITIC, prompt)
    except Exception as exc:  # noqa: BLE001 - 1 lượt LLM hỏng (JSON/timeout/lỗi API) không được crash job (§9)
        logger.warning(
            "kg_lpv.n2.judge_failed code=M6 section_id=%s err=%s", comp.section_id, type(exc).__name__
        )
        finding = _build_finding(
            ErrorCode.M6, comp.section_id,
            evidence=[{"khong_phan_xu_duoc": True, "menh_de": comp.text}],
            explanation=(
                f"không phán xử được: lỗi khi gọi AI kiểm tra căn cứ kiến thức ({type(exc).__name__})."
            ),
            status="unjudged",
        )
        return finding, 0

    verdict = (data or {}).get("verdict")
    evidence_refs = (data or {}).get("evidence_refs") or []
    if verdict != "khong_can_cu" or not evidence_refs:
        return None, tokens

    explanation = (data or {}).get("explanation") or "Kiến thức thiếu căn cứ đối chiếu chương trình/SGK."
    finding = _build_finding(ErrorCode.M6, comp.section_id, evidence=evidence_refs, explanation=explanation)
    return finding, tokens


# =========================== Tiện ích chung ===========================


def _build_finding(
    code: ErrorCode, section_id: str, *, evidence: list[dict], explanation: str, status: str = "open"
) -> Finding:
    return Finding(
        code=code, branch=VerificationBranch.N2, section_id=section_id,
        evidence=evidence, explanation=explanation, status=status,
    )


def _match_verb(text: str, verb_entries: list) -> dict | str | None:
    """Tra bảng động từ: mệnh đề bắt đầu bằng động từ nào trong danh sách (không phân biệt hoa/thường)."""
    normalized = _normalize(text)
    for entry in verb_entries:
        verb = entry.get("dong_tu") if isinstance(entry, dict) else str(entry)
        if verb and normalized.startswith(_normalize(verb)):
            return entry
    return None


def _normalize(text: str | None) -> str:
    return (text or "").strip().lower()


_WORD_PATTERN = re.compile(r"[\wÀ-ỹ]+", re.UNICODE)


def _word_coverage(short_text: str | None, long_text: str | None) -> float:
    """Tỉ lệ từ vựng của `short_text` (tên YCCĐ/danh mục) xuất hiện trong `long_text`
    (mệnh đề mục tiêu KHBD, thường diễn giải dài hơn) — dùng thay cho
    `SequenceMatcher.ratio()` thô vì ratio() chuẩn hoá theo TỔNG độ dài 2 chuỗi
    nên bị "phạt" nặng khi `long_text` dài hơn nhiều, dù `short_text` xuất hiện
    trọn vẹn bên trong. Trả 0.0 nếu `short_text` rỗng/không có từ nào."""
    short_words = set(_WORD_PATTERN.findall(_normalize(short_text)))
    if not short_words:
        return 0.0
    long_words = set(_WORD_PATTERN.findall(_normalize(long_text)))
    return len(short_words & long_words) / len(short_words)
