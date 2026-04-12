"""
Prompt template cho nén/gộp quy tắc dạy học khi vượt budget ký tự.
"""

# Budget ký tự tối đa cho mỗi loại rule
GENERAL_RULES_BUDGET = 2000
LESSON_RULES_BUDGET = 1500

# Trigger nén khi đạt ngưỡng này
GENERAL_RULES_COMPRESS_THRESHOLD = 1800
LESSON_RULES_COMPRESS_THRESHOLD = 1300

# Giới hạn mỗi rule đơn lẻ
SINGLE_RULE_MAX_CHARS = 150


def build_rule_compression_prompt(
    rules: list[dict],
    max_output_chars: int,
) -> str:
    """Xây dựng prompt nén nhiều rules thành ít rules hơn.

    Args:
        rules: [{"index": int, "content": str, "age": str}] — sắp cũ→mới
               age = "cũ" hoặc "mới"
        max_output_chars: Tổng ký tự tối đa cho output

    Returns:
        Prompt string gửi cho Gemini.
    """
    rules_text = "\n".join(
        f'{r["index"]}. [{r["age"]}] {r["content"]}'
        for r in rules
    )

    return f"""Gộp các quy tắc dạy học sau thành danh sách TỐI GIẢN.

QUY TẮC HIỆN TẠI (cũ → mới, quy tắc mới ưu tiên hơn khi mâu thuẫn):
{rules_text}

YÊU CẦU:
- Loại bỏ trùng lặp
- Nếu 2 quy tắc mâu thuẫn → giữ quy tắc MỚI HƠN
- Mỗi quy tắc output ≤ {SINGLE_RULE_MAX_CHARS} ký tự
- Tổng output ≤ {max_output_chars} ký tự

OUTPUT: JSON array, KHÔNG có gì khác.
[
  {{"rule_text": "Quy tắc đã gộp 1"}},
  {{"rule_text": "Quy tắc đã gộp 2"}}
]"""
