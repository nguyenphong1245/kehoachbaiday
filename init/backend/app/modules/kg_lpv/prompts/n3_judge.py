"""Prompt Bước 3 — N3 phán xử nguyên tử theo trục (§7 Bước 3, §3 điểm 3).

Mỗi hàm dựng ĐÚNG MỘT câu hỏi đúng/sai neo vào ngữ cảnh trích từ đồ thị/KHBD —
KHÔNG có phán xử "tổng thể" cho cả hoạt động. Tất cả yêu cầu Gemini trả JSON
nghiêm ngặt `{verdict, evidence_refs, explanation}` (hoặc biến thể có thêm
trường phụ khi cần phân loại — ghi rõ trong từng hàm), temperature 0.0-0.2 đặt
sẵn trong `llm.generate_json`, model theo feature `kg_lpv_n3_judge`
(mặc định gemini-2.5-pro — phán xử N3 cần chính xác hơn N2, §6.4).
"""
import json


def build_truc2_coherence_prompt(muc_tieu: str, noi_dung: str, san_pham: str, to_chuc: str) -> str:
    """Trục 2 — nhất quán nội bộ hoạt động (C4): 4 thành phần của MỘT hoạt động có
    khớp mức/loại với nhau không (vd: mục tiêu ở mức vận dụng nhưng sản phẩm chỉ là
    câu trả lời miệng = lệch nội bộ)."""
    return f"""Bạn là chuyên gia thẩm định tính nhất quán nội bộ của một hoạt động học trong
Kế hoạch bài dạy môn Tin học.

4 thành phần của MỘT hoạt động (nguyên văn):
- Mục tiêu: "{muc_tieu}"
- Nội dung: "{noi_dung}"
- Sản phẩm: "{san_pham}"
- Tổ chức thực hiện: "{to_chuc}"

Câu hỏi neo: 4 thành phần trên có NHẤT QUÁN với nhau không — sản phẩm và cách tổ
chức có đủ để đạt đúng MỨC NHẬN THỨC mà mục tiêu yêu cầu (ví dụ mục tiêu ở mức vận
dụng nhưng sản phẩm chỉ là một câu trả lời miệng đơn giản là KHÔNG nhất quán)?

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "khop" | "khong_khop",
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""


def build_truc3_bo_ba_bang_chung_prompt(objective_text: str, hanh_dong_text: str, san_pham_text: str) -> str:
    """Trục 3 — căn chỉnh mục tiêu-hoạt động-sản phẩm-đánh giá (C4, C5): kiểm "bộ ba
    bằng chứng" — hành động học tập đúng mức + sản phẩm thể hiện năng lực + tiêu chí
    đánh giá quan sát được TRÊN sản phẩm. Thiếu/lệch bất kỳ 1 trong 3 -> finding.
    `thanh_phan_thieu` cho biết CHÍNH XÁC thành phần nào thiếu/lệch (dùng để phân
    loại C4 vs C5 ở tầng gọi)."""
    return f"""Bạn là chuyên gia thẩm định căn chỉnh mục tiêu - hoạt động - sản phẩm - đánh giá
trong Kế hoạch bài dạy môn Tin học.

Mục tiêu cần đạt (nguyên văn): "{objective_text}"
Hành động tổ chức thực hiện (nguyên văn): "{hanh_dong_text}"
Sản phẩm học tập (nguyên văn): "{san_pham_text}"

Câu hỏi neo: quan hệ mục tiêu - hoạt động - sản phẩm trên có đủ CẢ BA bằng chứng sau
không?
1. Hành động học tập đúng MỨC mục tiêu yêu cầu.
2. Sản phẩm thể hiện được năng lực/kiến thức của mục tiêu (không chỉ là ghi chép/copy).
3. Có TIÊU CHÍ ĐÁNH GIÁ quan sát được TRÊN chính sản phẩm đó (không mơ hồ).

Nếu thiếu/lệch đúng 1 thành phần, ghi rõ thành phần đó vào "thanh_phan_thieu".

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "dat" | "khong_dat",
  "thanh_phan_thieu": "hanh_dong" | "san_pham" | "tieu_chi" | null,
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""


def build_truc4_cu_the_hoa_prompt(objective_text: str, activity_text: str, ngu_canh: str = "") -> str:
    """Trục 4 — cụ thể hóa năng lực (C2: NLd-NLe/NL chung/phẩm chất; C8: NLS): mục
    tiêu khai báo có được CỤ THỂ HÓA bằng một hoạt động thật (không chỉ nêu tên) không.
    `ngu_canh` (tuỳ chọn) chèn thêm mô tả chỉ báo NLS từ đồ thị khi dùng cho C8."""
    ngu_canh_block = f'\nCăn cứ chỉ báo/năng lực từ chương trình: "{ngu_canh}"\n' if ngu_canh else ""
    return f"""Bạn là chuyên gia thẩm định việc cụ thể hóa năng lực/phẩm chất trong Kế hoạch
bài dạy môn Tin học.

Mục tiêu khai báo (nguyên văn): "{objective_text}"
{ngu_canh_block}
Hoạt động tổ chức thực hiện liên quan gần nhất (nguyên văn): "{activity_text}"

Câu hỏi neo: hoạt động trên có CỤ THỂ HÓA (hiện thực bằng hành động/sản phẩm học tập
cụ thể) mục tiêu đã khai báo hay chỉ NÊU TÊN năng lực/phẩm chất mà không có hoạt
động thật sự tương ứng?

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "cu_the_hoa" | "khong_cu_the_hoa",
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""


def build_truc5_quy_trinh_prompt(method_name: str, standard_steps: list[dict], activity_text: str) -> str:
    """Trục 5 — thực chất phương pháp/kĩ thuật (C7): so bước tổ chức thực hiện thực tế
    với quy trình chuẩn (`BuocQuyTrinh`, đã lấy từ đồ thị qua `graph.get_method_procedures`).
    CHỈ hỏi các bước có khớp quy trình hay không — KHÔNG hỏi phương pháp có "tối ưu"
    hay không (quyền tự chủ giáo viên, §7)."""
    steps_json = json.dumps(
        [{"thu_tu": s.get("thu_tu"), "ten": s.get("ten")} for s in standard_steps], ensure_ascii=False
    )
    return f"""Bạn là chuyên gia thẩm định việc tổ chức thực hiện phương pháp/kĩ thuật dạy học
trong Kế hoạch bài dạy môn Tin học.

Phương pháp/kĩ thuật đã khai báo: "{method_name}"
Quy trình CHUẨN của phương pháp/kĩ thuật này (theo đúng thứ tự, lấy từ đồ thị tri thức):
{steps_json}

Phần tổ chức thực hiện thực tế trong KHBD (nguyên văn): "{activity_text}"

Câu hỏi neo: các bước tổ chức thực hiện thực tế có PHẢN ÁNH ĐÚNG quy trình chuẩn ở
trên không (đủ bước, đúng thứ tự về bản chất)? CHỈ đánh giá việc thực thi đúng quy
trình đã khai báo — KHÔNG đánh giá phương pháp được chọn có tối ưu/phù hợp hay không.

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "dung_quy_trinh" | "khong_dung_quy_trinh",
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""


def build_truc6_bao_phu_prompt(kien_thuc_objectives: list[str], luyen_tap_van_dung_texts: list[str]) -> str:
    """Trục 6 — tiến trình & điều kiện triển khai (C5, phần phán xử mạch phát triển):
    câu hỏi/luyện tập/vận dụng có bao phủ đủ các mục tiêu kiến thức của bài học không."""
    muc_tieu_json = json.dumps(kien_thuc_objectives, ensure_ascii=False)
    noi_dung_json = json.dumps(luyen_tap_van_dung_texts, ensure_ascii=False)
    return f"""Bạn là chuyên gia thẩm định mạch phát triển nhận thức trong Kế hoạch bài dạy
môn Tin học.

Các mục tiêu kiến thức của bài học (nguyên văn):
{muc_tieu_json}

Nội dung/sản phẩm của các hoạt động luyện tập/vận dụng (nguyên văn):
{noi_dung_json}

Câu hỏi neo: các hoạt động luyện tập/vận dụng trên có BAO PHỦ đủ các mục tiêu kiến
thức ở trên không (mỗi mục tiêu kiến thức có ít nhất 1 câu hỏi/bài tập luyện
tập/vận dụng tương ứng)?

Chỉ trả JSON theo đúng schema sau, không thêm giải thích ngoài JSON:
{{
  "verdict": "bao_phu" | "khong_bao_phu",
  "evidence_refs": [],
  "explanation": "giải thích ngắn gọn bằng tiếng Việt vì sao"
}}
"""
