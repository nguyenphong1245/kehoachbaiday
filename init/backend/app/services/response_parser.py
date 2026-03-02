"""
Response parser for LLM-generated lesson plan content.

Handles JSON parsing, sanitization, repair, and fallback marker-based parsing
of LLM responses into structured LessonPlanSection objects.
"""
import json
import logging
import re
from typing import List, Optional

from app.schemas.lesson_plan_builder import LessonPlanSection

logger = logging.getLogger("app.lesson_builder.parser")


def convert_bullet_points(content: str) -> str:
    """Convert bullet points (•) to dashes (-) for level 1 and plus (+) for level 2.

    LLM often uses • for bullet points. This function converts them based on indentation:
    - Level 1 (no or minimal indentation): • → -
    - Level 2 (more indentation): • → +
    """
    if not content or "•" not in content:
        return content

    lines = content.split("\n")
    result_lines = []

    for line in lines:
        if "•" not in line:
            result_lines.append(line)
            continue

        # Count leading whitespace to determine nesting level
        stripped = line.lstrip()
        leading_spaces = len(line) - len(stripped)

        # Determine bullet type based on indentation
        # Level 1: 0-3 spaces before •
        # Level 2: 4+ spaces before •
        if stripped.startswith("•"):
            if leading_spaces >= 4:
                # Level 2: replace • with +
                new_line = line[:leading_spaces] + "+" + stripped[1:]
            else:
                # Level 1: replace • with -
                new_line = line[:leading_spaces] + "-" + stripped[1:]
            result_lines.append(new_line)
        else:
            # • appears mid-line, replace all with -
            result_lines.append(line.replace("•", "-"))

    return "\n".join(result_lines)


def clean_section_content(content: str, section_type: str) -> str:
    """Post-process section content after JSON parsing.

    Fixes common issues:
    1. Content contains raw JSON objects from other sections (LLM mistake)
    2. Content contains raw JSON boundary markers (}, {)
    3. Literal \\n not decoded to actual newlines
    4. Bullet points (•) converted to - and +
    """
    if not content:
        return content

    # 1. Detect and trim misplaced embedded JSON objects
    json_embed_pattern = re.search(
        r'[,\s]*\{\s*"section_type"\s*:\s*"', content
    )
    if json_embed_pattern:
        clean_part = content[: json_embed_pattern.start()].rstrip(" ,\n\r\t")
        if clean_part.strip():
            logger.debug(
                "Section '%s': trimmed embedded JSON at pos %d",
                section_type,
                json_embed_pattern.start(),
            )
            content = clean_part

    # 2. Detect raw JSON boundary markers — content likely contains
    #    multiple sections concatenated as raw JSON text
    if re.search(r'"\s*}\s*,\s*\{\s*"section_type"', content):
        # Try to extract just the first meaningful part before the JSON boundary
        first_boundary = re.search(r'"\s*}\s*,\s*\{', content)
        if first_boundary:
            clean_part = content[: first_boundary.start()].rstrip(' ",\n\r\t')
            if clean_part.strip():
                logger.warning(
                    "Section '%s': removed raw JSON boundaries at pos %d",
                    section_type,
                    first_boundary.start(),
                )
                content = clean_part

    # 3. Decode literal \n — if there are more than 5, they are almost certainly
    # unprocessed JSON escape sequences, not intentional backslash-n in content.
    literal_count = content.count("\\n")
    if literal_count > 5:
        content = content.replace("\\n", "\n")
        content = content.replace("\\t", "\t")
        logger.debug(
            "Section '%s': decoded %d literal \\n", section_type, literal_count
        )

    # 4. Convert bullet points (•) to - and +
    content = convert_bullet_points(content)

    return content


def fix_newlines_in_json_strings(text: str) -> str:
    """Replace actual newlines/carriage-returns inside JSON string values with \\n.

    LLMs sometimes produce real newlines inside JSON strings (especially in
    mindmap_data or long content fields), which is invalid JSON. This function
    walks through the text character-by-character, tracking whether we are
    inside a double-quoted string, and replaces raw newlines with their
    escaped equivalents.
    """
    result: list[str] = []
    in_string = False
    i = 0
    length = len(text)
    while i < length:
        char = text[i]
        if in_string:
            if char == "\\" and i + 1 < length:
                # Escape sequence — keep as-is and skip next char
                result.append(char)
                result.append(text[i + 1])
                i += 2
                continue
            elif char == '"':
                in_string = False
                result.append(char)
            elif char == "\n":
                result.append("\\n")
            elif char == "\r":
                # skip carriage returns
                pass
            elif char == "\t":
                result.append("\\t")
            else:
                result.append(char)
        else:
            if char == '"':
                in_string = True
            result.append(char)
        i += 1
    return "".join(result)


def sanitize_json_response(raw_response: str) -> str:
    """Fix invalid escape characters in JSON response."""

    def fix_invalid_escape(match):
        char = match.group(1)
        if char in '"\\/bfnrtu':
            return match.group(0)
        return char  # Remove backslash, keep character

    # First fix unescaped newlines inside strings (common with mindmap_data)
    text = fix_newlines_in_json_strings(raw_response)
    return re.sub(r'\\([^"\\/bfnrtu])', fix_invalid_escape, text)


def repair_truncated_json(raw_response: str) -> Optional[str]:
    """Attempt to repair truncated JSON by closing open structures."""
    text = raw_response.strip()
    if not text:
        return None

    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    sections_start = text.find('"sections"')
    if sections_start == -1:
        return None

    array_start = text.find("[", sections_start)
    if array_start == -1:
        return None

    depth = 0
    in_string = False
    escape_next = False
    last_complete_section_end = -1
    section_depth_start = -1

    i = array_start + 1
    while i < len(text):
        char = text[i]

        if escape_next:
            escape_next = False
            i += 1
            continue

        if char == "\\" and in_string:
            escape_next = True
            i += 1
            continue

        if char == '"' and not escape_next:
            in_string = not in_string
            i += 1
            continue

        if in_string:
            i += 1
            continue

        if char == "{":
            if depth == 0:
                section_depth_start = i
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0 and section_depth_start != -1:
                last_complete_section_end = i
        elif char == "]" and depth == 0:
            break

        i += 1

    if last_complete_section_end == -1:
        return None

    repaired = text[: last_complete_section_end + 1] + "]}"

    try:
        data = json.loads(repaired)
        if "sections" in data and len(data["sections"]) > 0:
            logger.info(
                "JSON repair succeeded: kept %d sections", len(data["sections"])
            )
            return repaired
    except json.JSONDecodeError:
        pass

    return None


def _clean_phieu_hoc_tap_bold(content: str) -> str:
    """Strip bold markers from phieu_hoc_tap content except important lines.

    Preserve bold on:
    - PHT title lines ("PHIẾU HỌC TẬP SỐ X")
    - Question lines ("Câu 1:", "Câu 2:") — bold prevents TipTap list detection
    """
    if not content:
        return content

    lines = content.split("\n")
    result_lines = []
    for line in lines:
        # Keep bold for PHT title lines
        if re.search(r"\*\*.*PHIẾU\s*HỌC\s*TẬP", line, re.IGNORECASE):
            result_lines.append(line)
        # Keep bold for "Câu X:" question lines — prevents TipTap ordered list detection
        elif re.search(r"^\*\*Câu\s+\d+", line):
            result_lines.append(line)
        else:
            # Strip bold markers from other lines
            result_lines.append(re.sub(r"\*\*([^*]+)\*\*", r"\1", line))
    return "\n".join(result_lines)


def _format_quiz_content(questions: list) -> str:
    """Format quiz questions into displayable markdown content."""
    content_lines = []
    for q_idx, q in enumerate(questions, 1):
        content_lines.append(f"**Câu {q_idx}:** {q.get('question', '')}")
        content_lines.append("")
        content_lines.append(f"A. {q.get('A', '')}")
        content_lines.append("")
        content_lines.append(f"B. {q.get('B', '')}")
        content_lines.append("")
        content_lines.append(f"C. {q.get('C', '')}")
        content_lines.append("")
        content_lines.append(f"D. {q.get('D', '')}")
        content_lines.append("")
        content_lines.append("---")
        content_lines.append("")
    return "\n".join(content_lines)


def _generate_worksheet_content_from_data(worksheet_data: dict, title: str) -> str:
    """Generate markdown content from worksheet_data."""
    worksheet_number = worksheet_data.get("worksheet_number", 1)
    ws_type = worksheet_data.get("type", "group")
    task = worksheet_data.get("task", "")
    questions = worksheet_data.get("questions", [])

    ws_title = title or f"Phiếu học tập số {worksheet_number}"
    lines = [f"**{ws_title.upper()}**", ""]

    if ws_type == "group":
        lines.append("**NHÓM:** ....................................")
    else:
        lines.append("**HỌ VÀ TÊN:** ....................................")
    lines.append("")

    if task:
        lines.append(f"**Nhiệm vụ:** {task}")
        lines.append("")

    for q_idx, q in enumerate(questions):
        q_id = q_idx + 1  # Auto-renumber sequentially regardless of LLM ids
        q_text = q.get("text", "")
        lines.append(f"**Câu {q_id}:** {q_text}")
        lines.append("")

        # Code block (Dạng 2: câu hỏi → code → dòng kẻ)
        if q.get("code"):
            lines.append("```python")
            lines.append(q["code"])
            lines.append("```")
            lines.append("")

        # Answer lines (dòng kẻ trả lời)
        answer_lines = q.get("answer_lines", 3)
        for _ in range(answer_lines):
            lines.append("....................................................................................................................................................")
            lines.append("")

    return "\n".join(lines)


def _strip_misplaced_phu_luc_heading(content: str, section_type: str) -> str:
    """Remove misplaced 'IV. PHỤ LỤC' heading from sections that shouldn't have it.

    LLMs sometimes place the appendix heading inside thiet_bi or other sections,
    causing wrong section ordering in the rendered output.
    """
    if section_type in ("phieu_hoc_tap", "trac_nghiem"):
        return content  # These sections ARE the appendix

    # Match variations: ## **IV. PHỤ LỤC**, ## IV. PHỤ LỤC, **IV. PHỤ LỤC**, etc.
    pattern = r'\n*#{1,3}\s*\*{0,2}\s*IV\.?\s*PHỤ\s*LỤC\s*\*{0,2}.*'
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    if match:
        cleaned = content[:match.start()].rstrip()
        logger.warning(
            "Stripped misplaced 'IV. PHỤ LỤC' from section '%s' at pos %d",
            section_type, match.start(),
        )
        return cleaned
    return content


def _fix_raw_phieu_numbering(content: str) -> str:
    """Fix broken numbered patterns in raw PHT content from LLM.

    When the LLM provides content directly (no worksheet_data), it often writes
    items like '1. CPU\\n...\\n1. RAM\\n...' — all starting with '1.'.
    TipTap converts each '1.' to an ordered list that restarts at 1.

    This function detects repeated same-number patterns and converts them to
    parenthesized format '(N) text' which TipTap does NOT auto-convert.
    """
    if not content:
        return content

    lines = content.split("\n")
    # Find all lines starting with a number+period pattern (e.g. "1. text")
    num_pattern = re.compile(r"^(\d+)\.\s+(.+)")
    num_lines = [(i, m) for i, line in enumerate(lines)
                 if (m := num_pattern.match(line))]

    if len(num_lines) < 2:
        return content

    # Check if multiple lines share the same number (e.g. all "1.")
    numbers = [m.group(1) for _, m in num_lines]
    if len(set(numbers)) < len(numbers):
        # Repeated numbers detected — renumber with letter format a), b), c)
        for counter, (line_idx, match) in enumerate(num_lines):
            letter = chr(97 + counter)  # a, b, c, d, ...
            text = match.group(2)
            lines[line_idx] = f"{letter}) {text}"

    return "\n".join(lines)


def _build_section_from_item(
    item: dict, existing_sections: List[LessonPlanSection]
) -> LessonPlanSection:
    """Build a LessonPlanSection from a parsed JSON item."""
    section_type = item.get("section_type", "unknown")
    title = item.get("title", "Section")
    content = item.get("content", "")
    questions = item.get("questions", None)
    mindmap_data = item.get("mindmap_data", None)
    worksheet_data = item.get("worksheet_data", None)

    # Decode literal \n in mindmap_data so markmap can parse headings
    if mindmap_data and isinstance(mindmap_data, str):
        if "\\n" in mindmap_data and mindmap_data.count("\n") < mindmap_data.count("\\n"):
            mindmap_data = mindmap_data.replace("\\n", "\n").replace("\\t", "\t")
        mindmap_data = mindmap_data.strip()
        if not mindmap_data:
            mindmap_data = None
        else:
            logger.info("Section '%s' has mindmap_data (%d chars)", section_type, len(mindmap_data))

    if section_type == "phieu_hoc_tap":
        phieu_count = sum(
            1 for s in existing_sections if s.section_type == "phieu_hoc_tap"
        )
        section_id = f"phieu_hoc_tap_{phieu_count + 1}"

        # Normalize worksheet_data: only allow 2 question types
        # Type 1: text + answer_lines
        # Type 2: text + code + answer_lines
        # Strip any sub_items, blanks, fill_blanks, etc.
        if worksheet_data and isinstance(worksheet_data, dict):
            ws_questions = worksheet_data.get("questions", [])
            for ws_q_idx, ws_q in enumerate(ws_questions):
                ws_q["id"] = str(ws_q_idx + 1)
                # Remove unsupported fields — only keep text, code, answer_lines
                for key in list(ws_q.keys()):
                    if key not in ("id", "text", "code", "answer_lines"):
                        del ws_q[key]

        # ALWAYS prefer worksheet_data when available (content may contain garbage)
        if worksheet_data:
            content = _generate_worksheet_content_from_data(worksheet_data, title)
            logger.info("Generated content from worksheet_data for %s", section_id)
        elif content:
            # Safety net: fix repeated "1." patterns in raw LLM content
            # Replace "1. text" at start of lines with "(N) text" to prevent
            # TipTap from creating broken ordered lists
            content = _fix_raw_phieu_numbering(content)
        else:
            content = "Phiếu học tập chưa có nội dung."

        # Auto-prepend "IV. PHỤ LỤC" heading to the FIRST phieu_hoc_tap
        if phieu_count == 0:
            content = "## **IV. PHỤ LỤC**\n\n" + content
    else:
        section_id = section_type

    content = clean_section_content(content, section_type)

    # Strip misplaced "IV. PHỤ LỤC" headings from non-appendix sections
    content = _strip_misplaced_phu_luc_heading(content, section_type)

    # Strip bold from PHT content except the title line
    if section_type == "phieu_hoc_tap":
        content = _clean_phieu_hoc_tap_bold(content)

    if section_type == "trac_nghiem" and questions:
        content = _format_quiz_content(questions)

    return LessonPlanSection(
        section_id=section_id,
        section_type=section_type,
        title=title,
        content=content,
        questions=questions if section_type == "trac_nghiem" else None,
        mindmap_data=mindmap_data,
        worksheet_data=worksheet_data,
        editable=True,
    )


def _aggressive_fix(text: str) -> str:
    """Aggressively fix all invalid backslash escapes in JSON text."""
    result = []
    i = 0
    while i < len(text):
        if text[i] == "\\" and i + 1 < len(text):
            next_char = text[i + 1]
            if next_char in '"\\/bfnrt':
                result.append(text[i : i + 2])
                i += 2
            elif next_char == "u" and i + 5 < len(text):
                unicode_seq = text[i : i + 6]
                if re.match(r"\\u[0-9a-fA-F]{4}", unicode_seq):
                    result.append(unicode_seq)
                    i += 6
                else:
                    result.append(next_char)
                    i += 2
            else:
                result.append(next_char)
                i += 2
        else:
            result.append(text[i])
            i += 1
    return "".join(result)


def parse_response_to_sections(raw_response: str) -> List[LessonPlanSection]:
    """Parse JSON response from LLM into sections.

    Tries multiple strategies:
    1. Standard JSON parse with sanitization
    2. Aggressive sanitization
    3. JSON truncation repair
    4. Marker-based parsing fallback
    5. Single section fallback
    """
    sections: List[LessonPlanSection] = []

    # Strategy 1: Standard JSON parse
    try:
        sanitized = sanitize_json_response(raw_response)
        data = json.loads(sanitized)

        if "sections" in data:
            for item in data["sections"]:
                sections.append(_build_section_from_item(item, sections))
            return sections

    except json.JSONDecodeError as e:
        logger.warning("JSON parse error: %s. Trying aggressive sanitization...", e)

    # Strategy 2: Aggressive sanitization
    try:
        aggressive_sanitized = _aggressive_fix(raw_response)
        data = json.loads(aggressive_sanitized)

        if "sections" in data:
            for item in data["sections"]:
                sections.append(_build_section_from_item(item, sections))
            logger.info(
                "Aggressive sanitization worked: parsed %d sections", len(sections)
            )
            return sections

    except json.JSONDecodeError as e2:
        logger.warning(
            "Aggressive sanitization failed: %s. Trying JSON repair...", e2
        )

    # Strategy 3: Repair truncated JSON
    repaired = repair_truncated_json(sanitize_json_response(raw_response))
    if repaired:
        try:
            data = json.loads(repaired)
            if "sections" in data:
                for item in data["sections"]:
                    sections.append(_build_section_from_item(item, sections))
                logger.info("JSON repair worked: parsed %d sections", len(sections))
                return sections
        except json.JSONDecodeError:
            pass

    # Strategy 4: Marker-based parsing
    logger.warning("JSON repair failed. Falling back to marker parsing.")
    sections = parse_response_with_markers(raw_response)
    if sections:
        return sections

    # Strategy 5: Single section fallback
    cleaned_raw = clean_section_content(raw_response, "full")
    return [
        LessonPlanSection(
            section_id="full_content",
            section_type="full",
            title="Kế hoạch bài dạy",
            content=cleaned_raw,
            editable=True,
        )
    ]


def _extract_section_by_title(content: str, title: str) -> str:
    """Extract section content by title pattern matching."""
    patterns = [
        rf"##\s*{re.escape(title)}",
        rf"###\s*{re.escape(title)}",
        rf"\*\*{re.escape(title)}\*\*",
        rf"{re.escape(title)}:",
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            start = match.start()
            next_section = re.search(
                r"\n##\s|\n###\s|\n\*\*[A-Z]", content[match.end() :]
            )
            if next_section:
                end = match.end() + next_section.start()
            else:
                end = len(content)
            return content[start:end].strip()

    return ""


def parse_response_with_markers(raw_response: str) -> List[LessonPlanSection]:
    """Fallback: Parse response using [SECTION:XXX] markers."""
    sections: List[LessonPlanSection] = []

    section_markers = [
        ("THONG_TIN_CHUNG", "Thông tin chung", "thong_tin_chung"),
        ("MUC_TIEU", "Mục tiêu bài học", "muc_tieu"),
        ("THIET_BI", "Thiết bị dạy học", "thiet_bi"),
        ("KHOI_DONG", "Hoạt động 1: Khởi động", "khoi_dong"),
        (
            "HINH_THANH_KIEN_THUC",
            "Hoạt động 2: Hình thành kiến thức mới",
            "hinh_thanh_kien_thuc",
        ),
        ("LUYEN_TAP", "Hoạt động 3: Luyện tập", "luyen_tap"),
        ("VAN_DUNG", "Hoạt động 4: Vận dụng", "van_dung"),
        ("PHU_LUC", "Phụ lục", "phu_luc"),
        ("TRAC_NGHIEM", "Phụ lục: Trắc nghiệm", "trac_nghiem"),
    ]

    for idx, (marker_id, title, section_type) in enumerate(section_markers):
        marker = f"[SECTION:{marker_id}]"
        start_pos = raw_response.find(marker)

        if start_pos == -1:
            content = _extract_section_by_title(raw_response, title)
        else:
            end_pos = len(raw_response)
            for next_marker_id, _, _ in section_markers[idx + 1 :]:
                next_marker = f"[SECTION:{next_marker_id}]"
                next_pos = raw_response.find(next_marker)
                if next_pos != -1:
                    end_pos = next_pos
                    break

            content = raw_response[start_pos + len(marker) : end_pos].strip()
            content = re.sub(r"\[SECTION:[^\]]+\]", "", content).strip()
            content = content.strip("-").strip()

        if content and marker_id != "PHU_LUC":
            content = clean_section_content(content, section_type)
            sections.append(
                LessonPlanSection(
                    section_id=marker_id.lower(),
                    section_type=section_type,
                    title=title,
                    content=content,
                    editable=True,
                )
            )

    # Parse PHIEU_HOC_TAP_X sections
    phieu_pattern = re.compile(
        r"\[SECTION:PHIEU_HOC_TAP_(\d+)\](.*?)"
        r"(?=\[SECTION:PHIEU_HOC_TAP_\d+\]|\[SECTION:TRAC_NGHIEM\]|---\s*$|$)",
        re.DOTALL,
    )
    for match in phieu_pattern.finditer(raw_response):
        phieu_num = match.group(1)
        phieu_content = match.group(2).strip()

        while phieu_content.startswith("---"):
            phieu_content = phieu_content[3:].strip()
        while phieu_content.endswith("---"):
            phieu_content = phieu_content[:-3].strip()

        if phieu_content:
            sections.append(
                LessonPlanSection(
                    section_id=f"phieu_hoc_tap_{phieu_num}",
                    section_type="phieu_hoc_tap",
                    title=f"Phiếu học tập số {phieu_num}",
                    content=phieu_content,
                    editable=True,
                )
            )

    # Special handling for TRAC_NGHIEM: extract only actual quiz questions
    for i, section in enumerate(sections):
        if section.section_type == "trac_nghiem":
            content = section.content
            quiz_start = re.search(r"(\*\*)?Câu\s*1[:.]\*?\*?", content)
            if quiz_start:
                quiz_content = content[quiz_start.start() :].strip()
                sections[i] = LessonPlanSection(
                    section_id=section.section_id,
                    section_type=section.section_type,
                    title=section.title,
                    content=quiz_content,
                    editable=True,
                )
            break

    # Fallback: parse worksheets without markers
    phieu_exists = any(s.section_type == "phieu_hoc_tap" for s in sections)
    if not phieu_exists:
        phieu_fallback = re.compile(
            r"\*?\*?PHIẾU\s*HỌC\s*TẬP\s*(?:SỐ\s*)?(\d+)\*?\*?"
            r"(.*?)"
            r"(?=\*?\*?PHIẾU\s*HỌC\s*TẬP\s*(?:SỐ\s*)?\d+|\*?\*?Câu\s*1[:.]\*?\*?|$)",
            re.DOTALL | re.IGNORECASE,
        )
        for match in phieu_fallback.finditer(raw_response):
            phieu_num = match.group(1)
            phieu_content = match.group(2).strip()

            while phieu_content.startswith("---"):
                phieu_content = phieu_content[3:].strip()
            while phieu_content.endswith("---"):
                phieu_content = phieu_content[:-3].strip()

            existing_ids = [s.section_id for s in sections]
            if phieu_content and f"phieu_hoc_tap_{phieu_num}" not in existing_ids:
                sections.append(
                    LessonPlanSection(
                        section_id=f"phieu_hoc_tap_{phieu_num}",
                        section_type="phieu_hoc_tap",
                        title=f"Phiếu học tập số {phieu_num}",
                        content=phieu_content,
                        editable=True,
                    )
                )

    return sections
