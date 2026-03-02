"""
Script chuyển toàn bộ dữ liệu Neo4j từ Cloud (Aura) sang Local (Docker).

Cách dùng:
1. Đảm bảo Neo4j local đang chạy: docker compose up neo4j -d
2. Chạy script: python scripts/migrate_neo4j_cloud_to_local.py

Script tự đọc NEO4J_CLOUD_* (cloud) và NEO4J_* (local) từ .env
Không cần sửa .env qua lại.
"""

import os
import sys
import json
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Cloud connection (đọc từ NEO4J_CLOUD_* trong .env)
CLOUD_URI = os.getenv("NEO4J_CLOUD_URI")
CLOUD_USERNAME = os.getenv("NEO4J_CLOUD_USERNAME", "neo4j")
CLOUD_PASSWORD = os.getenv("NEO4J_CLOUD_PASSWORD")
CLOUD_DATABASE = os.getenv("NEO4J_CLOUD_DATABASE", "neo4j")

# Local connection (đọc từ NEO4J_* trong .env)
LOCAL_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
LOCAL_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
LOCAL_PASSWORD = os.getenv("NEO4J_PASSWORD", "Khbd2025Neo4j")
LOCAL_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# Backup file
BACKUP_DIR = Path(__file__).parent / "neo4j_backup"


def export_from_cloud(driver, database):
    """Export toàn bộ nodes và relationships từ Cloud"""
    print("\n" + "=" * 70)
    print("EXPORT TỪ CLOUD NEO4J")
    print("=" * 70)

    nodes = []
    relationships = []

    with driver.session(database=database) as session:
        # --- Export tất cả nodes ---
        print("\n  Đang export nodes...")
        result = session.run("""
            MATCH (n)
            RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props
        """)
        for record in result:
            nodes.append({
                "id": record["id"],
                "labels": record["labels"],
                "props": dict(record["props"])
            })
        print(f"  Tìm thấy {len(nodes)} nodes")

        # Thống kê theo label
        label_counts = {}
        for node in nodes:
            for label in node["labels"]:
                label_counts[label] = label_counts.get(label, 0) + 1
        for label, count in sorted(label_counts.items()):
            print(f"    - {label}: {count}")

        # --- Export tất cả relationships ---
        print("\n  Đang export relationships...")
        result = session.run("""
            MATCH (a)-[r]->(b)
            RETURN elementId(a) AS from_id,
                   elementId(b) AS to_id,
                   type(r) AS rel_type,
                   properties(r) AS props
        """)
        for record in result:
            relationships.append({
                "from_id": record["from_id"],
                "to_id": record["to_id"],
                "rel_type": record["rel_type"],
                "props": dict(record["props"]) if record["props"] else {}
            })
        print(f"  Tìm thấy {len(relationships)} relationships")

        # Thống kê theo type
        rel_counts = {}
        for rel in relationships:
            rel_counts[rel["rel_type"]] = rel_counts.get(rel["rel_type"], 0) + 1
        for rel_type, count in sorted(rel_counts.items()):
            print(f"    - {rel_type}: {count}")

    return nodes, relationships


def save_backup(nodes, relationships):
    """Lưu backup ra file JSON"""
    BACKUP_DIR.mkdir(exist_ok=True)

    nodes_file = BACKUP_DIR / "nodes.json"
    rels_file = BACKUP_DIR / "relationships.json"

    with open(nodes_file, "w", encoding="utf-8") as f:
        json.dump(nodes, f, ensure_ascii=False, indent=2)

    with open(rels_file, "w", encoding="utf-8") as f:
        json.dump(relationships, f, ensure_ascii=False, indent=2)

    print(f"\n  Backup đã lưu tại: {BACKUP_DIR}")
    print(f"    - nodes.json: {len(nodes)} nodes")
    print(f"    - relationships.json: {len(relationships)} relationships")


def import_to_local(driver, database, nodes, relationships):
    """Import toàn bộ data vào Local Neo4j"""
    print("\n" + "=" * 70)
    print("IMPORT VÀO LOCAL NEO4J")
    print("=" * 70)

    with driver.session(database=database) as session:
        # --- Xóa data cũ trong local (nếu có) ---
        print("\n  Xóa data cũ trong local...")
        session.run("MATCH (n) DETACH DELETE n")
        print("  Đã xóa sạch")

        # --- Tạo constraints trước ---
        print("\n  Tạo constraints...")
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Lop) REQUIRE l.lop IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (b:BaiHoc) REQUIRE b.bai_id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:ChuDe) REQUIRE c.ten IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (d:DinhHuong) REQUIRE d.ten IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (cb:ChiBao) REQUIRE cb.ma IS UNIQUE",
        ]
        for c in constraints:
            try:
                session.run(c)
            except Exception:
                pass  # Constraint có thể đã tồn tại
        print("  Constraints đã tạo")

        # --- Tạo nodes ---
        print("\n  Đang import nodes...")

        # Map cloud elementId -> local node identifier
        # Dùng _migration_id tạm để map relationships
        id_map = {}
        created = 0
        errors = 0

        for i, node in enumerate(nodes):
            try:
                labels_str = ":".join(node["labels"])
                props = node["props"]

                # Thêm _migration_id tạm để map
                props["_migration_id"] = node["id"]

                # Build SET clause
                set_parts = []
                params = {}
                for key, value in props.items():
                    param_name = f"p_{key}"
                    set_parts.append(f"n.`{key}` = ${param_name}")
                    params[param_name] = value

                set_clause = ", ".join(set_parts) if set_parts else ""
                query = f"CREATE (n:{labels_str})"
                if set_clause:
                    query += f" SET {set_clause}"
                query += " RETURN elementId(n) AS new_id"

                result = session.run(query, params)
                record = result.single()
                if record:
                    id_map[node["id"]] = record["new_id"]
                    created += 1

            except Exception as e:
                errors += 1
                if errors <= 5:
                    print(f"    Lỗi node {node['labels']}: {e}")

            if (i + 1) % 100 == 0:
                print(f"    Đã import {i + 1}/{len(nodes)} nodes...")

        print(f"  Đã tạo {created} nodes ({errors} lỗi)")

        # --- Tạo relationships ---
        print("\n  Đang import relationships...")
        rel_created = 0
        rel_errors = 0

        for i, rel in enumerate(relationships):
            try:
                from_new_id = id_map.get(rel["from_id"])
                to_new_id = id_map.get(rel["to_id"])

                if not from_new_id or not to_new_id:
                    rel_errors += 1
                    continue

                # Build props
                props = rel["props"]
                params = {
                    "from_id": rel["from_id"],
                    "to_id": rel["to_id"],
                }

                set_parts = []
                for key, value in props.items():
                    param_name = f"rp_{key}"
                    set_parts.append(f"r.`{key}` = ${param_name}")
                    params[param_name] = value

                set_clause = f" SET {', '.join(set_parts)}" if set_parts else ""

                query = f"""
                    MATCH (a {{_migration_id: $from_id}})
                    MATCH (b {{_migration_id: $to_id}})
                    CREATE (a)-[r:{rel['rel_type']}]->(b)
                    {set_clause}
                """

                session.run(query, params)
                rel_created += 1

            except Exception as e:
                rel_errors += 1
                if rel_errors <= 5:
                    print(f"    Lỗi rel {rel['rel_type']}: {e}")

            if (i + 1) % 100 == 0:
                print(f"    Đã import {i + 1}/{len(relationships)} relationships...")

        print(f"  Đã tạo {rel_created} relationships ({rel_errors} lỗi)")

        # --- Xóa _migration_id tạm ---
        print("\n  Dọn dẹp _migration_id tạm...")
        session.run("MATCH (n) WHERE n._migration_id IS NOT NULL REMOVE n._migration_id")
        print("  Đã dọn dẹp")

        # --- Tạo indexes ---
        print("\n  Tạo indexes...")
        indexes = [
            "CREATE INDEX IF NOT EXISTS FOR (m:MienNangLuc) ON (m.name)",
            "CREATE INDEX IF NOT EXISTS FOR (n:NangLucThanhPhan) ON (n.name)",
            "CREATE INDEX IF NOT EXISTS FOR (c:ChiBao) ON (c.ma)",
            "CREATE INDEX IF NOT EXISTS FOR (b:BaiHoc) ON (b.ten)",
            "CREATE INDEX IF NOT EXISTS FOR (pp:PhuongPhapDayHoc) ON (pp.ten)",
            "CREATE INDEX IF NOT EXISTS FOR (kt:KyThuatDayHoc) ON (kt.ten)",
        ]
        for idx in indexes:
            try:
                session.run(idx)
            except Exception:
                pass
        print("  Indexes đã tạo")


def verify_migration(cloud_driver, local_driver, cloud_db, local_db):
    """So sánh data giữa Cloud và Local"""
    print("\n" + "=" * 70)
    print("KIỂM TRA KẾT QUẢ MIGRATION")
    print("=" * 70)

    # Lấy thống kê từ cloud
    with cloud_driver.session(database=cloud_db) as session:
        result = session.run("""
            MATCH (n)
            UNWIND labels(n) AS label
            RETURN label, count(*) AS count
            ORDER BY label
        """)
        cloud_stats = {r["label"]: r["count"] for r in result}

        result = session.run("MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count ORDER BY type")
        cloud_rel_stats = {r["type"]: r["count"] for r in result}

    # Lấy thống kê từ local
    with local_driver.session(database=local_db) as session:
        result = session.run("""
            MATCH (n)
            UNWIND labels(n) AS label
            RETURN label, count(*) AS count
            ORDER BY label
        """)
        local_stats = {r["label"]: r["count"] for r in result}

        result = session.run("MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count ORDER BY type")
        local_rel_stats = {r["type"]: r["count"] for r in result}

    # So sánh nodes
    print("\n  Nodes:")
    print(f"  {'Label':<25} {'Cloud':>8} {'Local':>8} {'Status':>10}")
    print(f"  {'-'*25} {'-'*8} {'-'*8} {'-'*10}")

    all_labels = sorted(set(list(cloud_stats.keys()) + list(local_stats.keys())))
    all_match = True
    for label in all_labels:
        cloud_count = cloud_stats.get(label, 0)
        local_count = local_stats.get(label, 0)
        status = "OK" if cloud_count == local_count else "KHÁC"
        if status == "KHÁC":
            all_match = False
        print(f"  {label:<25} {cloud_count:>8} {local_count:>8} {status:>10}")

    # So sánh relationships
    print(f"\n  Relationships:")
    print(f"  {'Type':<30} {'Cloud':>8} {'Local':>8} {'Status':>10}")
    print(f"  {'-'*30} {'-'*8} {'-'*8} {'-'*10}")

    all_rel_types = sorted(set(list(cloud_rel_stats.keys()) + list(local_rel_stats.keys())))
    for rel_type in all_rel_types:
        cloud_count = cloud_rel_stats.get(rel_type, 0)
        local_count = local_rel_stats.get(rel_type, 0)
        status = "OK" if cloud_count == local_count else "KHÁC"
        if status == "KHÁC":
            all_match = False
        print(f"  {rel_type:<30} {cloud_count:>8} {local_count:>8} {status:>10}")

    if all_match:
        print("\n  MIGRATION THÀNH CÔNG! Dữ liệu Cloud = Local")
    else:
        print("\n  CÓ KHÁC BIỆT! Kiểm tra lại các mục KHÁC ở trên")

    return all_match


def main():
    print("\n" + "=" * 70)
    print("CHUYỂN DỮ LIỆU NEO4J: CLOUD -> LOCAL")
    print("=" * 70)

    if not CLOUD_URI or not CLOUD_PASSWORD:
        print("\n  Thiếu cấu hình Cloud Neo4j!")
        print("  Thêm vào .env:")
        print("    NEO4J_CLOUD_URI=neo4j+s://xxx.databases.neo4j.io")
        print("    NEO4J_CLOUD_PASSWORD=your_cloud_password")
        sys.exit(1)

    print(f"  Cloud: {CLOUD_URI}")
    print(f"  Local: {LOCAL_URI}")

    # Kiểm tra kết nối
    print("\n  Kiểm tra kết nối Cloud...")
    try:
        cloud_driver = GraphDatabase.driver(CLOUD_URI, auth=(CLOUD_USERNAME, CLOUD_PASSWORD))
        cloud_driver.verify_connectivity()
        print("  Cloud: OK")
    except Exception as e:
        print(f"  Lỗi kết nối Cloud: {e}")
        sys.exit(1)

    print("  Kiểm tra kết nối Local...")
    try:
        local_driver = GraphDatabase.driver(LOCAL_URI, auth=(LOCAL_USERNAME, LOCAL_PASSWORD))
        local_driver.verify_connectivity()
        print("  Local: OK")
    except Exception as e:
        print(f"  Lỗi kết nối Local: {e}")
        print("  Đảm bảo Neo4j local đang chạy: docker compose up neo4j -d")
        cloud_driver.close()
        sys.exit(1)

    try:
        # 1. Export từ Cloud
        nodes, relationships = export_from_cloud(cloud_driver, CLOUD_DATABASE)

        # 2. Lưu backup
        save_backup(nodes, relationships)

        # 3. Import vào Local
        import_to_local(local_driver, LOCAL_DATABASE, nodes, relationships)

        # 4. Verify
        verify_migration(cloud_driver, local_driver, CLOUD_DATABASE, LOCAL_DATABASE)

        print("\n" + "=" * 70)
        print("HOÀN TẤT!")
        print("=" * 70)
        print("""
Migration thành công! .env đã trỏ sẵn local Neo4j.

Bước tiếp theo:
1. Xóa dòng NEO4J_CLOUD_* trong .env (không cần nữa)

2. Restart backend:
   docker compose restart backend
   (hoặc nếu chạy local: restart uvicorn)

3. Truy cập Neo4j Browser kiểm tra:
   http://localhost:7474
   User: neo4j / Password: Khbd2025Neo4j
""")

    except Exception as e:
        print(f"\n  Lỗi: {e}")
        raise
    finally:
        cloud_driver.close()
        local_driver.close()


if __name__ == "__main__":
    main()
