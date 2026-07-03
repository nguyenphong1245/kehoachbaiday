"""Hằng số cấu hình module KG-LPV (đọc env qua app.core.config.Settings)."""

MODULE_VERSION = "0.1.0"

# TTL cache cờ bật/tắt runtime (bảng feature_flags, key='kg_lpv')
FEATURE_FLAG_CACHE_TTL_SECONDS = 30

# TTL cache kết quả kiểm tra sức khỏe đồ thị Neo4j KG-LPV
GRAPH_HEALTH_CACHE_TTL_SECONDS = 60

# Ngưỡng tỉ lệ khớp mờ tên bài học (difflib.SequenceMatcher.ratio) dùng ở N1 định danh
N1_FUZZY_THRESHOLD = 0.8
