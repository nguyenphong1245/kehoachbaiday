"""
Validator đồ thị tri thức KG-LPV.

Kết nối tới Neo4j KG-LPV (instance RIÊNG, bolt://localhost:7688 mặc định) và in báo cáo:
  - Số đỉnh theo từng label, số cạnh theo từng loại
  - Tỉ lệ % đỉnh/cạnh có ĐỦ 4 thuộc tính vết xuất xứ (phải đạt 100%)
  - Truy vấn mẫu: 1 BaiHoc đã biết lấy được bằng ma_dinh_danh VÀ bằng fulltext trên `ten`

Chạy từ thư mục backend:
    python scripts/kg_lpv/validate_graph.py

Thoát với mã khác 0 nếu tỉ lệ vết xuất xứ < 100% (để dùng trong CI/script kiểm tra).

Biến môi trường: giống import_kg.py (KG_LPV_NEO4J_URI/USERNAME/PASSWORD/DATABASE).
"""

import os
import sys

from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

KG_LPV_NEO4J_URI = os.getenv("KG_LPV_NEO4J_URI", "bolt://localhost:7688")
KG_LPV_NEO4J_USERNAME = os.getenv("KG_LPV_NEO4J_USERNAME", "neo4j")
KG_LPV_NEO4J_PASSWORD = os.getenv("KG_LPV_NEO4J_PASSWORD")
KG_LPV_NEO4J_DATABASE = os.getenv("KG_LPV_NEO4J_DATABASE", "neo4j")

REQUIRED_PROVENANCE_FIELDS = ["ma_nguon", "so_ky_hieu", "ngay_hieu_luc", "vi_tri_trang"]

# Đỉnh + fulltext index mẫu để kiểm truy vấn (khớp với scripts/kg_lpv/samples/01_chuong_trinh.json)
SAMPLE_BAIHOC_MA_DINH_DANH = "BH-TIN10-C1-B1"
SAMPLE_BAIHOC_FULLTEXT_QUERY = "Thông tin"


def _provenance_predicate(alias: str) -> str:
    checks = " AND ".join(
        f"{alias}.{field} IS NOT NULL AND trim(toString({alias}.{field})) <> ''"
        for field in REQUIRED_PROVENANCE_FIELDS
    )
    return checks


def report_node_counts(session) -> dict[str, int]:
    result = session.run(
        """
        MATCH (n)
        UNWIND labels(n) AS label
        RETURN label, count(*) AS so_luong
        ORDER BY label
        """
    )
    return {row["label"]: row["so_luong"] for row in result}


def report_edge_counts(session) -> dict[str, int]:
    result = session.run(
        """
        MATCH ()-[r]->()
        RETURN type(r) AS loai, count(*) AS so_luong
        ORDER BY loai
        """
    )
    return {row["loai"]: row["so_luong"] for row in result}


def report_provenance_coverage(session) -> tuple[int, int, int, int]:
    """Trả về (đỉnh có đủ vết, tổng đỉnh, cạnh có đủ vết, tổng cạnh)."""
    node_predicate = _provenance_predicate("n")
    node_result = session.run(
        f"""
        MATCH (n)
        RETURN count(n) AS tong,
               count(CASE WHEN {node_predicate} THEN 1 END) AS co_du_vet
        """
    ).single()

    edge_predicate = _provenance_predicate("r")
    edge_result = session.run(
        f"""
        MATCH ()-[r]->()
        RETURN count(r) AS tong,
               count(CASE WHEN {edge_predicate} THEN 1 END) AS co_du_vet
        """
    ).single()

    return (
        node_result["co_du_vet"] or 0,
        node_result["tong"] or 0,
        edge_result["co_du_vet"] or 0,
        edge_result["tong"] or 0,
    )


def sample_query_by_ma_dinh_danh(session, ma_dinh_danh: str) -> dict | None:
    result = session.run(
        "MATCH (b:BaiHoc {ma_dinh_danh: $ma_dinh_danh}) RETURN b.ma_dinh_danh AS ma_dinh_danh, b.ten AS ten",
        ma_dinh_danh=ma_dinh_danh,
    ).single()
    return dict(result) if result else None


def sample_query_by_fulltext(session, query_text: str) -> list[dict]:
    result = session.run(
        """
        CALL db.index.fulltext.queryNodes('baihoc_ten_fulltext', $query_text)
        YIELD node, score
        RETURN node.ma_dinh_danh AS ma_dinh_danh, node.ten AS ten, score
        ORDER BY score DESC
        LIMIT 5
        """,
        query_text=query_text,
    )
    return [dict(row) for row in result]


def main() -> None:
    print(f"[*] Kết nối Neo4j KG-LPV tại {KG_LPV_NEO4J_URI} (database={KG_LPV_NEO4J_DATABASE})...")
    driver = GraphDatabase.driver(KG_LPV_NEO4J_URI, auth=(KG_LPV_NEO4J_USERNAME, KG_LPV_NEO4J_PASSWORD))

    exit_code = 0
    try:
        with driver.session(database=KG_LPV_NEO4J_DATABASE) as session:
            print("\n=== BÁO CÁO ĐỒ THỊ TRI THỨC KG-LPV ===\n")

            print("-- Số đỉnh theo nhãn --")
            node_counts = report_node_counts(session)
            if not node_counts:
                print("  (không có đỉnh nào)")
            for label, count in node_counts.items():
                print(f"  {label}: {count}")

            print("\n-- Số cạnh theo loại --")
            edge_counts = report_edge_counts(session)
            if not edge_counts:
                print("  (không có cạnh nào)")
            for edge_type, count in edge_counts.items():
                print(f"  {edge_type}: {count}")

            print("\n-- Tỉ lệ vết xuất xứ (ma_nguon, so_ky_hieu, ngay_hieu_luc, vi_tri_trang) --")
            node_ok, node_total, edge_ok, edge_total = report_provenance_coverage(session)
            node_pct = 100.0 if node_total == 0 else node_ok / node_total * 100
            edge_pct = 100.0 if edge_total == 0 else edge_ok / edge_total * 100
            print(f"  Đỉnh: {node_ok}/{node_total} ({node_pct:.1f}%)")
            print(f"  Cạnh: {edge_ok}/{edge_total} ({edge_pct:.1f}%)")

            if node_pct < 100.0 or edge_pct < 100.0:
                print("\n[LỖI] Tỉ lệ vết xuất xứ CHƯA đạt 100% — có đỉnh/cạnh thiếu vết!")
                exit_code = 1
            else:
                print("\n[OK] 100% đỉnh và cạnh có đủ vết xuất xứ.")

            print("\n-- Truy vấn mẫu: BaiHoc theo ma_dinh_danh --")
            node = sample_query_by_ma_dinh_danh(session, SAMPLE_BAIHOC_MA_DINH_DANH)
            if node:
                print(f"  [OK] Tìm thấy: {node['ma_dinh_danh']} -> \"{node['ten']}\"")
            else:
                print(f"  [LỖI] Không tìm thấy BaiHoc với ma_dinh_danh='{SAMPLE_BAIHOC_MA_DINH_DANH}'")
                exit_code = 1

            print("\n-- Truy vấn mẫu: BaiHoc theo fulltext trên `ten` --")
            fulltext_hits = sample_query_by_fulltext(session, SAMPLE_BAIHOC_FULLTEXT_QUERY)
            if fulltext_hits:
                for hit in fulltext_hits:
                    print(f"  [OK] {hit['ma_dinh_danh']} -> \"{hit['ten']}\" (score={hit['score']:.3f})")
            else:
                print(f"  [LỖI] Fulltext không trả kết quả nào cho truy vấn '{SAMPLE_BAIHOC_FULLTEXT_QUERY}'")
                exit_code = 1
    finally:
        driver.close()

    print()
    if exit_code == 0:
        print("[OK] Đồ thị KG-LPV hợp lệ.")
    else:
        print("[LỖI] Đồ thị KG-LPV CHƯA hợp lệ — xem chi tiết ở trên.")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
