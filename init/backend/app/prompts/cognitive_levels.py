COGNITIVE_LEVEL_PROMPTS: dict[str, str] = {
    "weak": """
<muc_do_nhan_thuc>
MỨC ĐỘ NHẬN THỨC HỌC SINH: YẾU
Lớp học có nhiều HS tiếp thu chậm, cần hỗ trợ sát và chia nhỏ nhiệm vụ.

YÊU CẦU ĐIỀU CHỈNH KHBD:
- Mức câu hỏi: chủ yếu nhận biết và thông hiểu, diễn đạt ngắn gọn
- Mức bài tập: rất cơ bản; nếu có code thì cho sẵn khung và bước làm
- Tổ chức hoạt động: chia nhỏ từng bước, thời lượng linh hoạt, ưu tiên làm mẫu
- Hỗ trợ học tập: dùng gợi ý trực tiếp, phiếu học tập ngắn (tối đa 3 yêu cầu)
- Vai trò giáo viên: theo sát, chốt kiến thức sau mỗi hoạt động nhỏ
</muc_do_nhan_thuc>
""",
    "average": """
<muc_do_nhan_thuc>
MỨC ĐỘ NHẬN THỨC HỌC SINH: TRUNG BÌNH
Lớp học nắm được lý thuyết cơ bản, cần bài tập vận dụng vừa sức.

YÊU CẦU ĐIỀU CHỈNH KHBD:
- Mức câu hỏi: cân bằng nhận biết, thông hiểu và một phần vận dụng đơn giản
- Mức bài tập: cơ bản đến trung bình; code có hướng dẫn theo quy trình rõ ràng
- Tổ chức hoạt động: cân bằng giải thích và thực hành, có kiểm tra giữa chặng
- Hỗ trợ học tập: có gợi ý theo mức độ, khuyến khích thảo luận cặp đôi
- Vai trò giáo viên: dẫn dắt theo mốc, tổng kết ngắn ở cuối mỗi hoạt động
</muc_do_nhan_thuc>
""",
    "fair": """
<muc_do_nhan_thuc>
MỨC ĐỘ NHẬN THỨC HỌC SINH: KHÁ
Lớp học chủ động, có thể làm bài tập phức tạp.

YÊU CẦU ĐIỀU CHỈNH KHBD:
- Mức câu hỏi: trọng tâm vận dụng và phân tích
- Mức bài tập: trung bình đến khá; code yêu cầu tự viết và kiểm tra nhiều trường hợp
- Tổ chức hoạt động: giảm thời gian giảng, tăng thực hành cá nhân/nhóm
- Hỗ trợ học tập: thêm nhiệm vụ thử thách cho nhóm hoàn thành sớm
- Vai trò giáo viên: đặt câu hỏi mở, điều phối thảo luận và chuẩn hóa kết luận
</muc_do_nhan_thuc>
""",
    "good": """
<muc_do_nhan_thuc>
MỨC ĐỘ NHẬN THỨC HỌC SINH: GIỎI
Lớp học có nền tảng tốt, tiếp thu nhanh, sẵn sàng với bài tập khó.

YÊU CẦU ĐIỀU CHỈNH KHBD:
- Mức câu hỏi: vận dụng cao, phân tích sâu, so sánh cách tiếp cận
- Mức bài tập: khó; code yêu cầu tối ưu cơ bản và giải thích phương án
- Tổ chức hoạt động: tăng nhiệm vụ mở, tăng thời gian phản biện nhóm
- Hỗ trợ học tập: phân tầng nhiệm vụ để mọi nhóm đều có thử thách phù hợp
- Vai trò giáo viên: giao nhiệm vụ theo mục tiêu đầu ra, phản hồi theo tiêu chí rõ ràng
</muc_do_nhan_thuc>
""",
    "excellent": """
<muc_do_nhan_thuc>
MỨC ĐỘ NHẬN THỨC HỌC SINH: XUẤT SẮC
Lớp học tự học tốt, nhanh nhạy, cần thử thách.

YÊU CẦU ĐIỀU CHỈNH KHBD:
- Mức câu hỏi: phân tích, đánh giá, sáng tạo ở mức cao
- Mức bài tập: rất khó; code yêu cầu tối ưu, xử lý ngoại lệ và tính mở rộng
- Tổ chức hoạt động: ưu tiên dự án mini, tình huống thực tế phức tạp, báo cáo sản phẩm
- Hỗ trợ học tập: khuyến khích tự học, tự phản biện, dạy lại cho bạn học
- Vai trò giáo viên: đóng vai trò điều phối, cố vấn, giảm giảng giải trực tiếp
</muc_do_nhan_thuc>
""",
}

# Labels hiển thị trên UI (dùng cho API response nếu cần)
COGNITIVE_LEVEL_LABELS: dict[str, str] = {
    "weak": "Yếu",
    "average": "Trung bình",
    "fair": "Khá",
    "good": "Giỏi",
    "excellent": "Xuất sắc",
}


def build_cognitive_level_section(level: str | None) -> str:
    """Trả về prompt section cho mức nhận thức đã chọn.

    Args:
        level: 'weak' | 'average' | 'fair' | 'good' | 'excellent' | None

    Returns:
        Prompt string. Rỗng nếu không chọn mức.
    """
    if not level:
        return ""
    return COGNITIVE_LEVEL_PROMPTS.get(level, "")
