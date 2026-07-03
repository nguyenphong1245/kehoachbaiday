"""Hằng số cấu hình module KG-LPV (đọc env qua app.core.config.Settings)."""

MODULE_VERSION = "0.1.0"

# TTL cache cờ bật/tắt runtime (bảng feature_flags, key='kg_lpv')
FEATURE_FLAG_CACHE_TTL_SECONDS = 30

# TTL cache kết quả kiểm tra sức khỏe đồ thị Neo4j KG-LPV
GRAPH_HEALTH_CACHE_TTL_SECONDS = 60

# Ngưỡng tỉ lệ khớp mờ tên bài học (difflib.SequenceMatcher.ratio) dùng ở N1 định danh
N1_FUZZY_THRESHOLD = 0.8

# N2 đối chiếu chương trình (§7 Bước 2b) — ngưỡng khớp mờ RULE (tỉ lệ từ vựng của
# tên YCCĐ/danh mục được bao phủ trong mệnh đề mục tiêu KHBD, xem
# `n2_curriculum._word_coverage`)
N2_YCCD_MATCH_THRESHOLD = 0.6  # M1: mục tiêu kiến thức phải khớp đủ gần 1 YCCĐ
N2_NLC_PC_MATCH_THRESHOLD = 0.6  # M4: năng lực chung/phẩm chất phải khớp đủ gần danh mục tổng thể

# N3 nhất quán sư phạm (§7 Bước 3) — ngưỡng khớp mờ thuật toán (word coverage, kiểu
# `n2_curriculum._word_coverage`) dùng ở các trục ALGORITHMIC/RULE.
N3_OBJECTIVE_ACTIVITY_MATCH_THRESHOLD = 0.5  # trục 1: mục tiêu <-> mục tiêu cục bộ của hoạt động coi là "hiện thực"
N3_C1_GROUNDING_THRESHOLD = 0.3  # trục 4 (C1): tên NLa-NLc phải xuất hiện đủ trong nội dung/sản phẩm hoạt động

# §9 Hiệu năng/chi phí: giới hạn số phán xử nguyên tử N3 (LLM_JUDGE) chạy đồng thời —
# tránh fan-out không giới hạn khi 1 KHBD có nhiều hoạt động/mục tiêu cần phán xử.
N3_JUDGE_CONCURRENCY = 5

# trục 6 (C3) — từ khoá thiết bị dùng để so khớp "khai báo" (tổ chức thực hiện) với
# "sử dụng thực tế" (nội dung/sản phẩm) trong CÙNG một hoạt động — danh sách tối
# thiểu đủ dùng cho bộ dữ liệu mẫu; nhóm nghiên cứu mở rộng khi curate dữ liệu thật.
N3_DEVICE_KEYWORDS: tuple[str, ...] = (
    "máy chiếu", "máy tính", "laptop", "điện thoại", "máy tính bảng", "internet",
    "loa", "micro", "bảng phụ", "phiếu học tập", "video", "phần mềm", "tivi", "màn hình",
)
