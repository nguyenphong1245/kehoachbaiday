// ============================================================
// KG-LPV — Lược đồ đồ thị tri thức (schema.cypher)
// ============================================================
// Chạy TRƯỚC import_kg.py, trên chính instance Neo4j KG-LPV
// (bolt://localhost:7688 mặc định, KHÔNG phải Neo4j chính 7687).
//
// Cách chạy:
//   cypher-shell -a bolt://localhost:7688 -u neo4j -p <password> -f schema.cypher
// hoặc dán nội dung file này vào Neo4j Browser (http://localhost:7475).
//
// Idempotent: dùng "IF NOT EXISTS" (cú pháp Neo4j 5.x) — chạy lại nhiều lần an toàn.
// ============================================================

// ---------- 1. Ràng buộc duy nhất (unique constraints) trên ma_dinh_danh ----------
// Theo mục 5.3 kế hoạch: chỉ 3 label này bắt buộc unique ma_dinh_danh.

CREATE CONSTRAINT baihoc_ma_dinh_danh_unique IF NOT EXISTS
FOR (n:BaiHoc) REQUIRE n.ma_dinh_danh IS UNIQUE;

CREATE CONSTRAINT yccd_ma_dinh_danh_unique IF NOT EXISTS
FOR (n:YCCD) REQUIRE n.ma_dinh_danh IS UNIQUE;

CREATE CONSTRAINT chibaonls_ma_dinh_danh_unique IF NOT EXISTS
FOR (n:ChiBaoNLS) REQUIRE n.ma_dinh_danh IS UNIQUE;

// ---------- 2. Fulltext index trên `ten` (phục vụ N1 so khớp mờ) ----------

CREATE FULLTEXT INDEX baihoc_ten_fulltext IF NOT EXISTS
FOR (n:BaiHoc) ON EACH [n.ten];

CREATE FULLTEXT INDEX chude_ten_fulltext IF NOT EXISTS
FOR (n:ChuDe) ON EACH [n.ten];

// ============================================================
// Ghi chú lược đồ (không tạo ràng buộc — chỉ tài liệu tham khảo):
//
// Lớp đỉnh (node labels) theo mục 5.2 kế hoạch:
//   VanBan, KhoiLop, ChuDe, BaiHoc, YCCD,
//   NangLucTinHoc, BieuHienNL, NangLucChung, PhamChat,
//   MienNLS, NangLucThanhPhanNLS, ChiBaoNLS, MucDoNLS,
//   MucNhanThuc, DongTuNhanThuc,
//   PhuongPhapDH, KyThuatDH, BuocQuyTrinh,
//   MenhDeKienThuc
//
// Mọi đỉnh/cạnh đều mang 4 thuộc tính vết xuất xứ bắt buộc:
//   ma_nguon, so_ky_hieu, ngay_hieu_luc, vi_tri_trang
// (kiểm tra ở tầng importer — import_kg.py — không phải ràng buộc CSDL,
//  vì Neo4j Community không hỗ trợ property-existence constraint).
// ============================================================
