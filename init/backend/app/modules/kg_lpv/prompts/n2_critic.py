"""Prompt Bước 2b — N2 phản biện diễn đạt tự do: M2 (động từ biên) và M6 (mệnh đề kiến thức).

Cả hai đều yêu cầu Gemini trả JSON nghiêm ngặt `{verdict, evidence_refs, explanation}`
(temperature 0.0-0.2 đặt sẵn trong `llm.generate_json`). Chỉ gọi cho các trường
hợp BIÊN — RULE/tra bảng động từ đã xử lý phần lớn ở `n2_curriculum.py` (§7,§9).
"""
import json


def build_m2_prompt(objective_text: str, do_duoc: list, khong_do_duoc: list[str]) -> str:
    """M2 — động từ mục tiêu không có trong bảng `DongTuNhanThuc` (trường hợp biên).

    Yêu cầu Gemini phán xử động từ chính của mệnh đề mục tiêu có ĐO LƯỜNG ĐƯỢC
    (quan sát/đánh giá được sản phẩm học tập cụ thể) hay không, dựa trên 2 danh
    sách tham khảo đã có trong đồ thị (không phải toàn bộ, chỉ các trường hợp
    KHÔNG khớp trực tiếp mới cần LLM phân xử).
    """
    do_duoc_verbs = [e.get("dong_tu") if isinstance(e, dict) else e for e in do_duoc]
    tham_khao = json.dumps(
        {"dong_tu_do_duoc_da_biet": do_duoc_verbs, "dong_tu_khong_do_duoc_da_biet": khong_do_duoc},
        ensure_ascii=False,
    )

    return f"""Bạn là chuyên gia thẩm định mục tiêu dạy học môn Tin học theo CV 5512/BGDĐT-GDTrH.

Mệnh đề mục tiêu cần phán xử (nguyên văn):
"{objective_text}"

Danh sách động từ đã biết (tham khảo, KHÔNG đầy đủ):
{tham_khao}

Nhiệm vụ: động từ chính của mệnh đề trên có ĐO LƯỜNG ĐƯỢC không — tức có thể quan
sát/đánh giá được bằng một sản phẩm hoặc hành vi học tập cụ thể của học sinh
(ví dụ: trình bày được, vẽ được, viết được chương trình...), KHÔNG mơ hồ như
biết/hiểu/nắm/cảm nhận.

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "do_duoc" | "khong_do_duoc",
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""


def build_m6_prompt(noi_dung_text: str, menh_de_kien_thuc: list[dict]) -> str:
    """M6 — mệnh đề kiến thức trong nội dung hoạt động có căn cứ chương trình/SGK không.

    `menh_de_kien_thuc`: các `MenhDeKienThuc` chuẩn của bài học lấy từ `LessonContext`
    (đã truy hồi 1 lần/job) — BẮT BUỘC Gemini trả `evidence_refs` trích dẫn đúng
    các mệnh đề này (hoặc để trống nếu không tìm được căn cứ); finding chỉ được
    tạo khi `evidence_refs` khác rỗng (§6.2, thực thi lại ở `n2_curriculum.py`).
    """
    can_cu = json.dumps(
        [
            {"ma_dinh_danh": m.get("ma_dinh_danh"), "ten": m.get("ten"), "ma_nguon": m.get("ma_nguon")}
            for m in menh_de_kien_thuc
        ],
        ensure_ascii=False,
    )

    return f"""Bạn là chuyên gia thẩm định nội dung kiến thức trong Kế hoạch bài dạy môn Tin học.

Nội dung hoạt động cần phán xử (nguyên văn):
"{noi_dung_text}"

Các mệnh đề kiến thức chuẩn của bài học lấy từ chương trình/SGK (căn cứ đối chiếu):
{can_cu}

Nhiệm vụ: nội dung trên có mệnh đề kiến thức nào SAI LỆCH hoặc KHÔNG CÓ CĂN CỨ so với
các mệnh đề kiến thức chuẩn ở trên không? Nếu có, BẮT BUỘC trích dẫn đúng
`ma_dinh_danh` của (các) mệnh đề chuẩn liên quan vào "evidence_refs" — KHÔNG được
kết luận sai lệch mà không có evidence_refs.

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "hop_le" | "khong_can_cu",
  "evidence_refs": [{{"ma_dinh_danh": "string", "trich_dan": "string"}}],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""
