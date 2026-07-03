"""Prompt Bước 4 — Sửa cục bộ 1 đoạn (section) theo ĐÚNG 1 finding (§7 Bước 4).

`build_repair_prompt` nhận TOÀN VĂN section hiện tại (đã có thể đã qua 1 lượt sửa
trước đó trong cùng batch, khi 1 section có nhiều finding — repairer.py gọi hàm
này TUẦN TỰ, mỗi lần lấy `after` của lượt trước làm `section_text` của lượt sau)
+ đúng 1 finding, yêu cầu Gemini chỉ sửa TỐI THIỂU phần liên quan tới finding đó.
"""
import json


def build_repair_prompt(section_text: str, code: str, explanation: str, evidence: list[dict]) -> str:
    evidence_json = json.dumps(evidence, ensure_ascii=False)

    return f"""Bạn là chuyên gia biên tập Kế hoạch bài dạy (KHBD) môn Tin học.

Đoạn nội dung KHBD hiện tại (nguyên văn, giữ nguyên định dạng):
\"\"\"
{section_text}
\"\"\"

Lỗi kiểm chứng cần sửa (mã {code}):
{explanation}

Bằng chứng đối chiếu (căn cứ chương trình/SGK):
{evidence_json}

Nhiệm vụ: SỬA TỐI THIỂU đoạn trên để khắc phục ĐÚNG lỗi này — chỉ thay đổi phần
liên quan trực tiếp đến lỗi, giữ NGUYÊN VẸN toàn bộ phần còn lại (văn phong, cấu
trúc, các nội dung khác không liên quan tới lỗi). KHÔNG thêm nội dung không liên
quan, KHÔNG rút gọn/diễn giải lại những phần không có lỗi.

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "after": "toàn bộ nội dung đoạn SAU khi sửa (nguyên văn, thay thế hoàn toàn đoạn hiện tại)"
}}
"""
