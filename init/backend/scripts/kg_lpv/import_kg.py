"""
Importer đồ thị tri thức KG-LPV.

Đọc các file JSON curate trong một thư mục (mặc định: samples/ cạnh script này),
kiểm tra vết xuất xứ bắt buộc trên MỌI đỉnh/cạnh, rồi nạp vào Neo4j KG-LPV
(instance RIÊNG, KHÔNG phải Neo4j chính của ứng dụng) bằng MERGE idempotent.

Chạy từ thư mục backend:
    python scripts/kg_lpv/import_kg.py
    python scripts/kg_lpv/import_kg.py duong/dan/khac

Yêu cầu chạy schema.cypher trước (tạo constraint + fulltext index) — xem README.md.

Biến môi trường (đọc từ .env, KHÔNG dùng NEO4J_* của app chính):
    KG_LPV_NEO4J_URI       (mặc định bolt://localhost:7688)
    KG_LPV_NEO4J_USERNAME  (mặc định neo4j)
    KG_LPV_NEO4J_PASSWORD
    KG_LPV_NEO4J_DATABASE  (mặc định neo4j)
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

KG_LPV_NEO4J_URI = os.getenv("KG_LPV_NEO4J_URI", "bolt://localhost:7688")
KG_LPV_NEO4J_USERNAME = os.getenv("KG_LPV_NEO4J_USERNAME", "neo4j")
KG_LPV_NEO4J_PASSWORD = os.getenv("KG_LPV_NEO4J_PASSWORD")
KG_LPV_NEO4J_DATABASE = os.getenv("KG_LPV_NEO4J_DATABASE", "neo4j")

DEFAULT_SAMPLES_DIR = Path(__file__).resolve().parent / "samples"

# 4 thuộc tính vết xuất xứ bắt buộc trên MỌI đỉnh/cạnh (mục 5.2 kế hoạch KG-LPV)
REQUIRED_PROVENANCE_FIELDS = ["ma_nguon", "so_ky_hieu", "ngay_hieu_luc", "vi_tri_trang"]

# Lớp đỉnh hợp lệ theo mục 5.2 kế hoạch — chặn tiêm nhãn tuỳ ý khi build Cypher động
ALLOWED_LABELS = {
    "VanBan", "KhoiLop", "ChuDe", "BaiHoc", "YCCD",
    "NangLucTinHoc", "BieuHienNL", "NangLucChung", "PhamChat",
    "MienNLS", "NangLucThanhPhanNLS", "ChiBaoNLS", "MucDoNLS",
    "MucNhanThuc", "DongTuNhanThuc",
    "PhuongPhapDH", "KyThuatDH", "BuocQuyTrinh",
    "MenhDeKienThuc",
}

# Loại cạnh hợp lệ: 6 loại tiêu biểu nêu ở mục 5.2 + các loại cây/chuỗi tự thiết kế
# (xem README.md mục "Quan hệ" để biết lý do bổ sung)
ALLOWED_EDGE_TYPES = {
    "CO_YCCD", "O_MUC", "HINH_THANH", "AP_DUNG_CHO", "GOM_BUOC", "THUOC",
    "CO_CHU_DE", "CO_BAI_HOC",
    "CO_NANG_LUC_THANH_PHAN", "CO_CHI_BAO", "CO_MUC_DO",
}


def validate_provenance(record: dict) -> list[str]:
    """Hàm THUẦN (không phụ thuộc Neo4j): kiểm tra 4 trường vết xuất xứ bắt buộc.

    Trả về danh sách thông báo lỗi tiếng Việt cho từng trường thiếu/rỗng.
    Danh sách rỗng nghĩa là bản ghi hợp lệ.
    """
    errors: list[str] = []
    for field in REQUIRED_PROVENANCE_FIELDS:
        value = record.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors.append(f"Thiếu trường vết xuất xứ bắt buộc: '{field}'")
    return errors


def _describe_node(node: dict) -> str:
    return f"đỉnh {node.get('label', '?')}(ma_dinh_danh={node.get('ma_dinh_danh', '?')})"


def _describe_edge(edge: dict) -> str:
    return f"cạnh {edge.get('type', '?')} ({edge.get('from', '?')} -> {edge.get('to', '?')})"


def load_records(json_dir: Path) -> tuple[list[dict], list[dict]]:
    """Đọc mọi file *.json trong json_dir, gộp thành danh sách đỉnh + cạnh thô."""
    nodes: list[dict] = []
    edges: list[dict] = []
    for path in sorted(json_dir.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        nodes.extend(data.get("nodes", []))
        edges.extend(data.get("edges", []))
    return nodes, edges


def validate_records(
    nodes: list[dict], edges: list[dict]
) -> tuple[list[dict], list[dict], list[str]]:
    """Kiểm tra vết xuất xứ + trường bắt buộc cấu trúc trên từng bản ghi.

    Trả về (đỉnh hợp lệ, cạnh hợp lệ, danh sách thông báo từ chối tiếng Việt).
    Bản ghi thiếu BẤT KỲ trong 4 trường vết xuất xứ bị TỪ CHỐI (không nạp).
    """
    valid_nodes: list[dict] = []
    valid_edges: list[dict] = []
    rejected: list[str] = []

    for node in nodes:
        desc = _describe_node(node)
        struct_errors = []
        if not node.get("label"):
            struct_errors.append("thiếu trường 'label'")
        elif node["label"] not in ALLOWED_LABELS:
            struct_errors.append(f"nhãn không hợp lệ: '{node['label']}'")
        if not node.get("ma_dinh_danh"):
            struct_errors.append("thiếu trường 'ma_dinh_danh'")

        prov_errors = validate_provenance(node)
        all_errors = struct_errors + prov_errors
        if all_errors:
            rejected.append(f"TỪ CHỐI {desc}: {'; '.join(all_errors)}")
        else:
            valid_nodes.append(node)

    for edge in edges:
        desc = _describe_edge(edge)
        struct_errors = []
        if not edge.get("type"):
            struct_errors.append("thiếu trường 'type'")
        elif edge["type"] not in ALLOWED_EDGE_TYPES:
            struct_errors.append(f"loại cạnh không hợp lệ: '{edge['type']}'")
        if not edge.get("from"):
            struct_errors.append("thiếu trường 'from'")
        if not edge.get("to"):
            struct_errors.append("thiếu trường 'to'")

        prov_errors = validate_provenance(edge)
        all_errors = struct_errors + prov_errors
        if all_errors:
            rejected.append(f"TỪ CHỐI {desc}: {'; '.join(all_errors)}")
        else:
            valid_edges.append(edge)

    return valid_nodes, valid_edges, rejected


def _import_nodes(session, nodes: list[dict]) -> int:
    count = 0
    for node in nodes:
        label = node["label"]
        props = dict(node.get("properties") or {})
        props["ten"] = node.get("ten")
        for field in REQUIRED_PROVENANCE_FIELDS:
            props[field] = node[field]
        # label đã được whitelist ở validate_records() -> an toàn để nội suy trực tiếp
        session.run(
            f"""
            MERGE (n:`{label}` {{ma_dinh_danh: $ma_dinh_danh}})
            SET n += $props
            """,
            ma_dinh_danh=node["ma_dinh_danh"],
            props=props,
        )
        count += 1
    return count


def _import_edges(session, edges: list[dict]) -> int:
    count = 0
    for edge in edges:
        edge_type = edge["type"]
        props = dict(edge.get("properties") or {})
        for field in REQUIRED_PROVENANCE_FIELDS:
            props[field] = edge[field]
        # type đã được whitelist ở validate_records() -> an toàn để nội suy trực tiếp
        result = session.run(
            f"""
            MATCH (a {{ma_dinh_danh: $from_id}})
            MATCH (b {{ma_dinh_danh: $to_id}})
            MERGE (a)-[r:`{edge_type}`]->(b)
            SET r += $props
            RETURN a, b
            """,
            from_id=edge["from"],
            to_id=edge["to"],
            props=props,
        )
        if result.single() is None:
            print(
                f"  [!] Bỏ qua {_describe_edge(edge)}: không tìm thấy đỉnh đầu/cuối "
                "(kiểm tra ma_dinh_danh đã nạp đỉnh trước chưa)"
            )
            continue
        count += 1
    return count


def import_kg(json_dir: Path) -> None:
    print(f"[*] Đọc file curate JSON từ: {json_dir}")
    nodes, edges = load_records(json_dir)
    print(f"  -> Đọc được {len(nodes)} đỉnh thô, {len(edges)} cạnh thô")

    valid_nodes, valid_edges, rejected = validate_records(nodes, edges)

    if rejected:
        print(f"\n[!] {len(rejected)} bản ghi bị TỪ CHỐI (thiếu vết xuất xứ / cấu trúc sai):")
        for msg in rejected:
            print(f"  - {msg}")

    print(f"\n[*] Kết nối Neo4j KG-LPV tại {KG_LPV_NEO4J_URI} (database={KG_LPV_NEO4J_DATABASE})...")
    driver = GraphDatabase.driver(KG_LPV_NEO4J_URI, auth=(KG_LPV_NEO4J_USERNAME, KG_LPV_NEO4J_PASSWORD))
    try:
        with driver.session(database=KG_LPV_NEO4J_DATABASE) as session:
            print(f"[*] Nạp {len(valid_nodes)} đỉnh hợp lệ (MERGE theo ma_dinh_danh)...")
            n_count = _import_nodes(session, valid_nodes)
            print(f"  -> Đã nạp/cập nhật {n_count} đỉnh")

            print(f"[*] Nạp {len(valid_edges)} cạnh hợp lệ (MERGE)...")
            e_count = _import_edges(session, valid_edges)
            print(f"  -> Đã nạp/cập nhật {e_count} cạnh")
    finally:
        driver.close()

    print("\n[OK] Nạp liệu KG-LPV hoàn tất.")
    if rejected:
        print(f"[!] Lưu ý: {len(rejected)} bản ghi đã bị từ chối — xem chi tiết ở trên.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Nạp dữ liệu curate JSON vào đồ thị KG-LPV")
    parser.add_argument(
        "json_dir",
        nargs="?",
        default=str(DEFAULT_SAMPLES_DIR),
        help="Thư mục chứa file *.json curate (mặc định: scripts/kg_lpv/samples/)",
    )
    args = parser.parse_args()

    json_dir = Path(args.json_dir)
    if not json_dir.is_dir():
        print(f"[LỖI] Thư mục không tồn tại: {json_dir}")
        sys.exit(1)

    import_kg(json_dir)


if __name__ == "__main__":
    main()
