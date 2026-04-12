"""
Xây dựng section dynamic rules (từ nhận xét GV) inject vào prompt sinh KHBD.
"""


def build_dynamic_rules_section(
    general_rules: list[str],
    lesson_rules: list[str],
) -> str:
    """Tạo section rules từ nhận xét GV để inject vào prompt.

    Nếu không có rules → trả empty string (prompt không thay đổi).

    Args:
        general_rules: Danh sách rule chung (áp dụng mọi bài)
        lesson_rules: Danh sách rule riêng bài đang soạn

    Returns:
        Prompt string hoặc rỗng.
    """
    parts: list[str] = []

    if general_rules:
        rules_text = "\n".join(f"- {r}" for r in general_rules)
        parts.append(
            "<quy_tac_chung_giao_vien>\n"
            "Giáo viên yêu cầu tuân thủ các quy tắc sau cho TẤT CẢ bài soạn:\n"
            f"{rules_text}\n"
            "</quy_tac_chung_giao_vien>"
        )

    if lesson_rules:
        rules_text = "\n".join(f"- {r}" for r in lesson_rules)
        parts.append(
            "<quy_tac_rieng_bai_nay>\n"
            "GV đã nhận xét các vấn đề sau ở lần soạn trước CỦA BÀI NÀY. "
            "Khắc phục trong bản mới:\n"
            f"{rules_text}\n"
            "</quy_tac_rieng_bai_nay>"
        )

    if not parts:
        return ""

    return "\n\n".join(parts)
