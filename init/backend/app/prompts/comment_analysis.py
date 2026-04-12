"""
Prompt template cho phân tích nhận xét GV trên KHBD → sinh teaching rules.
Chạy ngầm qua FastAPI BackgroundTasks.
"""
import re


_HTML_HEADING_RE = re.compile(r"<h[1-6][^>]*>(.*?)</h[1-6]>", re.IGNORECASE | re.DOTALL)
_MD_HEADING_RE = re.compile(r"(?m)^\s{0,3}(#{1,6})\s+(.+?)\s*$")
_STRIP_TAGS_RE = re.compile(r"<[^>]+>")
_HOAT_DONG_RE = re.compile(
    r"(?i)HO[ẠA]T\s*Đ[ỘO]NG\s*\d+[^\n<]{0,120}"
)
# Các từ khoá phase phổ biến nếu KHBD không có header chính quy
_PHASE_RE = re.compile(
    r"(?i)(khởi\s*động|hình\s*thành\s*kiến\s*thức|luyện\s*tập|vận\s*dụng|"
    r"củng\s*cố|mở\s*đầu|tìm\s*tòi|mở\s*rộng)"
)


def _extract_headings(khbd: str) -> list[tuple[int, str]]:
    """Trích tất cả heading/marker hoạt động với vị trí trong KHBD.

    Returns: list (position, heading_text) đã sort tăng dần theo position.
    """
    items: list[tuple[int, str]] = []

    # HTML headings <h1>-<h6>
    for m in _HTML_HEADING_RE.finditer(khbd):
        text = _STRIP_TAGS_RE.sub("", m.group(1)).strip()
        if text:
            items.append((m.start(), text[:120]))

    # Markdown headings
    for m in _MD_HEADING_RE.finditer(khbd):
        text = m.group(2).strip()
        if text:
            items.append((m.start(), text[:120]))

    # "Hoạt động N: ..." trực tiếp (kể cả khi không phải heading)
    for m in _HOAT_DONG_RE.finditer(khbd):
        text = _STRIP_TAGS_RE.sub("", m.group(0)).strip()
        if text:
            items.append((m.start(), text[:120]))

    items.sort(key=lambda x: x[0])

    # Dedupe trùng vị trí
    deduped: list[tuple[int, str]] = []
    last_pos = -1
    for pos, text in items:
        if pos == last_pos:
            continue
        deduped.append((pos, text))
        last_pos = pos
    return deduped


def _find_section_name(headings: list[tuple[int, str]], pos: int) -> str:
    """Heading gần nhất trước (hoặc tại) vị trí pos."""
    section = ""
    for hpos, htext in headings:
        if hpos <= pos:
            section = htext
        else:
            break
    return section


def _detect_phase_from_context(context_before: str, selected_text: str) -> str:
    """Fallback: dò keyword phase trong context_before + selected_text."""
    blob = f"{context_before} {selected_text}"
    m = _PHASE_RE.search(blob)
    if not m:
        return ""
    kw = m.group(1).strip()
    # Chuẩn hoá spacing
    kw = re.sub(r"\s+", " ", kw)
    return kw.title()


def _annotate_khbd_with_comments(
    khbd_content: str,
    comments: list[dict],
) -> tuple[str, list[dict]]:
    """Chèn marker ⟦C#N⟧...⟦/C#N⟧ vào vị trí đoạn GV bôi đen, và nhận diện
    hoạt động/section chứa comment đó.

    Returns:
        (annotated_khbd, info_list) trong đó info_list mỗi phần tử có:
        {"index": int, "located": bool, "section": str}
    """
    annotated = khbd_content
    info: list[dict] = []

    headings = _extract_headings(khbd_content)

    # Tính vị trí từng comment TRÊN KHBD GỐC (trước khi chèn marker)
    positions: list[tuple[int, int, int]] = []  # (start, end, index)
    for i, c in enumerate(comments):
        selected = (c.get("selected_text") or "").strip()
        ctx_before = (c.get("context_before") or "")[-30:]
        ctx_after = (c.get("context_after") or "")[:30]
        if not selected:
            positions.append((-1, -1, i))
            continue

        anchor = ctx_before + selected if ctx_before else selected
        start = khbd_content.find(anchor)
        if start >= 0 and ctx_before:
            start = start + len(ctx_before)
        elif start < 0:
            anchor2 = selected + ctx_after if ctx_after else selected
            start = khbd_content.find(anchor2)
            if start < 0:
                start = khbd_content.find(selected)

        if start >= 0:
            positions.append((start, start + len(selected), i))
        else:
            positions.append((-1, -1, i))

    # Xác định section cho mỗi comment
    section_map: dict[int, str] = {}
    for start, _end, idx in positions:
        name = ""
        if start >= 0:
            name = _find_section_name(headings, start)
        if not name:
            # Fallback: dò keyword phase trong context_before + selected
            name = _detect_phase_from_context(
                comments[idx].get("context_before") or "",
                comments[idx].get("selected_text") or "",
            )
        section_map[idx] = name

    # Chèn marker từ cuối lên đầu để giữ nguyên offset
    sorted_positions = sorted(
        [p for p in positions if p[0] >= 0], key=lambda x: x[0], reverse=True
    )
    located_set: set[int] = set()
    for start, end, idx in sorted_positions:
        if "⟦C#" in annotated[start:end]:
            continue
        marker_start = f"⟦C#{idx + 1}⟧"
        marker_end = f"⟦/C#{idx + 1}⟧"
        annotated = (
            annotated[:start]
            + marker_start
            + annotated[start:end]
            + marker_end
            + annotated[end:]
        )
        located_set.add(idx)

    for i, _ in enumerate(comments):
        info.append(
            {
                "index": i + 1,
                "located": i in located_set,
                "section": section_map.get(i, ""),
            }
        )

    return annotated, info


def build_comment_analysis_prompt(
    khbd_content: str,
    comments: list[dict],
    existing_general_rules: list[dict] | None = None,
) -> str:
    """Xây dựng prompt để Gemini phân tích comments và sinh rules.

    Args:
        khbd_content: Nội dung KHBD (markdown/text)
        comments: List of {"index", "selected_text", "context_before",
                  "context_after", "comment_text"}
        existing_general_rules: List hiện tại của teacher, mỗi phần tử
                  {"id": int, "content": str}. Dùng để LLM phát hiện
                  rule mới có thay thế rule cũ cùng chủ đề hay không.

    Returns:
        Prompt string gửi cho Gemini.
    """
    annotated_khbd, located_flags = _annotate_khbd_with_comments(khbd_content, comments)
    located_map = {f["index"]: f["located"] for f in located_flags}

    comment_lines = []
    for c in comments:
        idx = c["index"]
        loc_note = (
            f"(Đã đánh dấu inline trong KHBD bằng ⟦C#{idx}⟧...⟦/C#{idx}⟧)"
            if located_map.get(idx)
            else "(KHÔNG xác định được vị trí inline — dùng đoạn trích bên dưới)"
        )
        comment_lines.append(
            f'{idx}. {loc_note}\n'
            f'   Đoạn GV bôi đen: "{c["selected_text"][:200]}"\n'
            f'   Nhận xét của GV: "{c["comment_text"]}"'
        )
    comments_text = "\n".join(comment_lines)

    if existing_general_rules:
        rule_lines = [
            f'  - id={r["id"]}: {r["content"]}' for r in existing_general_rules
        ]
        existing_rules_block = (
            "<quy_tac_chung_hien_tai>\n"
            "Các quy tắc chung GV đã có từ trước (có id, đang áp dụng):\n"
            + "\n".join(rule_lines)
            + "\n</quy_tac_chung_hien_tai>\n\n"
        )
        supersedes_instruction = (
            "\n5. SUPERSESSION (chỉ cho classification = \"general\"):\n"
            "   - Đối chiếu rule_text bạn vừa sinh với <quy_tac_chung_hien_tai>.\n"
            "   - Nếu rule mới RÕ RÀNG thay thế/override rule cũ trên CÙNG MỘT\n"
            "     chủ đề cụ thể (ví dụ: cùng nói về số HS/nhóm, cùng về phần\n"
            "     thưởng khen thưởng, cùng về cách sắp xếp bàn, cùng về độ dài\n"
            "     hoạt động...) — điền id của các rule cũ đó vào\n"
            "     supersedes_rule_ids.\n"
            "   - Bảo thủ: chỉ đánh dấu supersede khi cả 2 rule nói về cùng MỘT\n"
            "     chi tiết và rule mới khác/mâu thuẫn với rule cũ. Nếu chỉ cùng\n"
            "     chủ đề lớn nhưng bổ sung cho nhau (complementary) thì ĐỂ RỖNG.\n"
            "   - Với classification = \"lesson_specific\" hoặc \"skip\":\n"
            "     supersedes_rule_ids PHẢI là [].\n"
        )
        supersedes_field = (
            '    comment_index (int), classification (string), rule_text '
            '(string|null),\n'
            '    supersedes_rule_ids (array of int, mặc định []).'
        )
        supersedes_format_extra = ', "supersedes_rule_ids": []'
    else:
        existing_rules_block = ""
        supersedes_instruction = ""
        supersedes_field = (
            "    comment_index (int), classification (string), rule_text (string|null)."
        )
        supersedes_format_extra = ""

    return f"""Bạn là chuyên gia phân tích nhận xét sư phạm.

MỤC TIÊU:
Phân tích TỪNG nhận xét của giáo viên trên KHBD và chuyển thành quy tắc ngắn gọn,
rõ hành động, để dùng cho lần soạn sau.

CÁCH ĐỌC KHBD:
- KHBD bên dưới đã được đánh dấu các đoạn GV bôi đen bằng cặp marker
  ⟦C#N⟧...⟦/C#N⟧, trong đó N là chỉ số comment tương ứng.
- Khi phân tích comment N, BẮT BUỘC đọc kỹ đoạn nằm giữa ⟦C#N⟧...⟦/C#N⟧
  VÀ ngữ cảnh xung quanh (đoạn trước + đoạn sau) để hiểu GV đang nhận xét gì.
- Tập trung phân tích lỗi ở đúng chỗ GV đã bôi đen, không suy diễn sang phần khác.

<khbd_da_danh_dau>
{annotated_khbd}
</khbd_da_danh_dau>

<nhan_xet_giao_vien>
{comments_text}
</nhan_xet_giao_vien>

{existing_rules_block}NHIỆM VỤ BẮT BUỘC:
1. Xử lý TỪNG nhận xét theo đúng comment_index.
2. Với mỗi comment N: định vị ⟦C#N⟧ trong KHBD, đọc kỹ đoạn bị bôi đen,
   đối chiếu với nhận xét của GV để xác định lỗi thật sự là gì.
3. Gán 1 trong 3 nhãn: "general" | "lesson_specific" | "skip".
4. Nếu nhãn != "skip" thì sinh rule_text dạng mệnh lệnh, có thể thực thi cho lần soạn sau.{supersedes_instruction}

TIÊU CHÍ PHÂN LOẠI:

1) "general"
- Nhận xét về phong cách dạy học, thói quen tổ chức lớp, mức độ hoạt động,
  cách đặt câu hỏi, cách giao nhiệm vụ... có thể áp dụng cho nhiều bài.
- Không phụ thuộc vào kiến thức cụ thể của riêng bài hiện tại.
- Các yêu cầu về cách trình bày/cách viết dùng lặp lại nhiều bài cũng là
    "general" (ví dụ: in đậm tên trò chơi, chuẩn hóa mẫu câu, rút gọn câu lệnh).
- Là lỗi sai chung khi AI soạn KHBD.
- Ví dụ: "Giảm hoạt động nhóm", "Tăng câu hỏi gợi mở", "Mở đầu bằng tình huống thực tế".

2) "lesson_specific"
- Nhận xét gắn trực tiếp với nội dung/chi_muc/cấu trúc của bài hiện tại.
- Có nhắc đến khái niệm, ví dụ, bài tập, hoạt động cụ thể của bài.
- Nếu chỉ nói dạng hoạt động chung (ví dụ: trò chơi khởi động) mà KHÔNG gắn
    khái niệm/nội dung đặc thù của bài thì KHÔNG chọn "lesson_specific".
- Là lỗi sai riêng gắn với nội dung bài học đó.
- Ví dụ: "Trò chơi khởi động chưa hợp với phần Vòng lặp",
  "Bài tập trắc nghiệm chưa phù hợp với phần câu lệnh if-else".

3) "skip"
- Nhận xét quá ngắn, mơ hồ, thiếu hành động, không đủ thông tin để chuyển thành rule.
- Ví dụ: "Chưa ổn", "Sửa lại", "Không thích".

QUY TẮC RA QUYẾT ĐỊNH KHI MƠ HỒ:
- Nếu nhận xét vừa có ý chung vừa có chi tiết bài cụ thể, ưu tiên "lesson_specific".
- Nếu chỉ có cảm tính, không có hành động rõ ràng, chọn "skip".
- Không được bịa thêm thông tin ngoài nhận xét và KHBD.

YÊU CẦU VIẾT rule_text (chỉ khi classification != "skip"):
- Tối đa 150 ký tự.
- Viết dạng mệnh lệnh rõ ràng, bắt đầu bằng động từ hành động.
- Nêu điều cần làm, tránh diễn giải dài dòng.
- Không sao chép nguyên văn nhận xét; phải khái quát thành chỉ dẫn cụ thể.
- Không dùng dấu ngoặc kép thừa, không thêm giải thích meta.

RÀNG BUỘC OUTPUT:
- Trả về DUY NHẤT JSON array, không có markdown, không có văn bản ngoài JSON.
- Mỗi phần tử bắt buộc có các trường:
{supersedes_field}
- Nếu classification = "skip" thì rule_text PHẢI là null.
- Số phần tử output phải bằng số nhận xét input.

FORMAT MẪU:
[
    {{"comment_index": 1, "classification": "general", "rule_text": "..."{supersedes_format_extra}}},
    {{"comment_index": 2, "classification": "lesson_specific", "rule_text": "..."{supersedes_format_extra}}},
    {{"comment_index": 3, "classification": "skip", "rule_text": null{supersedes_format_extra}}}
]"""
