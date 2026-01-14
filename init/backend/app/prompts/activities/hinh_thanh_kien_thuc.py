"""
Prompt cho hoạt động Hình thành kiến thức
"""

PROMPT = """
📌 HƯỚNG DẪN CHỈNH SỬA HOẠT ĐỘNG **HÌNH THÀNH KIẾN THỨC** (~40 phút):

**Nguyên tắc:** Chia thành các hoạt động con theo chỉ mục bài học

**Cấu trúc mỗi hoạt động con (format đúng):**
***a) Mục tiêu:*** Học sinh đạt được gì sau hoạt động
***b) Nội dung:*** HS hoạt động [cá nhân/cặp đôi/nhóm] để [làm gì]
***c) Sản phẩm:*** 
   - Dòng 1: "Câu trả lời của HS."
   - Dòng 2: "Dự kiến câu trả lời:"
   - Dòng 3+: Đáp án chi tiết hoặc Phiếu học tập có đáp án
***d) Tổ chức thực hiện:*** 4 bước:
   - **B1. Chuyển giao nhiệm vụ:**
   - **B2. Thực hiện nhiệm vụ:**
   - **B3. Báo cáo, thảo luận:**
   - **B4. Kết luận, nhận định:**

**Lưu ý quan trọng:**
- ⚠️ KHÔNG đề cập sách giáo khoa
- Mỗi hoạt động con phân bổ thời gian hợp lý
- Áp dụng phương pháp/kỹ thuật dạy học đã chọn
- Có câu hỏi dẫn dắt, ví dụ minh họa cụ thể
"""
