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
