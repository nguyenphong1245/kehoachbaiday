"""Prompt Bước 1 — Tách đoạn: KHBD (section JSON) -> JSON segment nguyên tử."""
import json

_OBJECTIVE_TYPES = "kien_thuc | nang_luc_tin_hoc | nang_luc_chung | pham_chat | nang_luc_so"
_COMPONENT_TYPES = "muc_tieu | noi_dung | san_pham | to_chuc_thuc_hien"


def build_segmentation_prompt(segmentable_sections: list[dict]) -> str:
    """Sinh prompt tách sâu các section mục tiêu/hoạt động thành segment nguyên tử.

    `segmentable_sections`: các section đã lọc sẵn (section_type == 'muc_tieu'
    hoặc thuộc nhóm hoạt động khoi_dong/hinh_thanh_kien_thuc/luyen_tap/van_dung).
    """
    sections_json = json.dumps(
        [
            {
                "section_id": s.get("section_id"),
                "section_type": s.get("section_type"),
                "title": s.get("title"),
                "content": s.get("content", ""),
            }
            for s in segmentable_sections
        ],
        ensure_ascii=False,
    )

    return f"""Bạn là chuyên gia phân tích cấu trúc Kế hoạch bài dạy (KHBD) môn Tin học.

Nhiệm vụ: tách sâu nội dung các section dưới đây thành các đoạn (segment) nguyên tử.
BẮT BUỘC trích NGUYÊN VĂN từ trường "content" gốc — không diễn giải lại, không tóm tắt,
không bịa thêm, không bỏ sót bất kỳ ký tự nào của content gốc (mỗi content phải được
phủ đầy đủ bởi các segment con của nó).

Quy tắc:
1. Với section có section_type = "muc_tieu": tách từng mệnh đề mục tiêu riêng lẻ,
   gắn loại (trường "loai") thuộc một trong: {_OBJECTIVE_TYPES}.
2. Với section có section_type bắt đầu bằng "khoi_dong", "hinh_thanh_kien_thuc",
   "luyen_tap", hoặc "van_dung": bóc tách 4 thành phần (trường "component") trong:
   {_COMPONENT_TYPES}.
3. Mỗi segment PHẢI có: "segment_id" (chuỗi duy nhất toàn cục, gợi ý dạng
   "{{section_id}}__{{index}}"), "section_id" (đúng section_id gốc trong dữ liệu đầu
   vào), "text" (trích nguyên văn liên tục từ content, ghép các "text" theo đúng thứ
   tự xuất hiện phải tái tạo lại đúng content gốc của section đó).
4. Chỉ trả JSON theo đúng schema bên dưới, không thêm giải thích, không thêm markdown.

Dữ liệu section đầu vào (JSON):
{sections_json}

Schema JSON output bắt buộc:
{{
  "objective_clauses": [
    {{"segment_id": "string", "section_id": "string", "loai": "kien_thuc|nang_luc_tin_hoc|nang_luc_chung|pham_chat|nang_luc_so", "text": "string"}}
  ],
  "activity_components": [
    {{"segment_id": "string", "section_id": "string", "component": "muc_tieu|noi_dung|san_pham|to_chuc_thuc_hien", "text": "string"}}
  ]
}}
"""
