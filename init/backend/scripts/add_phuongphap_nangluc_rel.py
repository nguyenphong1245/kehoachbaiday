"""
Script thêm relationships giữa PhuongPhapDayHoc và NangLucChung

Theo lý thuyết dạy học:
- Dạy học hợp tác -> Năng lực giao tiếp và hợp tác
- Dạy học phát hiện và giải quyết vấn đề -> Năng lực giải quyết vấn đề và sáng tạo
- Dạy học khám phá -> Năng lực tự chủ và tự học, Năng lực giải quyết vấn đề và sáng tạo
- Dạy học dựa trên dự án -> Tất cả 3 năng lực
- Dạy học thực hành -> Năng lực tự chủ và tự học
- Dạy học thông qua trò chơi -> Năng lực giao tiếp và hợp tác
"""

import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(username, password))

# Mapping phương pháp -> năng lực phát triển
PHUONG_PHAP_NANG_LUC = {
    "Dạy học hợp tác": [
        "Năng lực giao tiếp và hợp tác"
    ],
    "Dạy học phát hiện và giải quyết vấn đề": [
        "Năng lực giải quyết vấn đề và sáng tạo",
        "Năng lực tự chủ và tự học"
    ],
    "Dạy học thực hành": [
        "Năng lực tự chủ và tự học",
        "Năng lực giải quyết vấn đề và sáng tạo"
    ],
    "Dạy học dựa trên dự án": [
        "Năng lực giao tiếp và hợp tác",
        "Năng lực giải quyết vấn đề và sáng tạo",
        "Năng lực tự chủ và tự học"
    ],
    "Dạy học khám phá": [
        "Năng lực tự chủ và tự học",
        "Năng lực giải quyết vấn đề và sáng tạo"
    ],
    "Dạy học thông qua trò chơi": [
        "Năng lực giao tiếp và hợp tác",
        "Năng lực tự chủ và tự học"
    ]
}

with driver.session() as session:
    # 1. Kiểm tra dữ liệu hiện có
    print("=" * 60)
    print("1. KIỂM TRA DỮ LIỆU HIỆN CÓ")
    print("=" * 60)
    
    # Lấy danh sách PhuongPhapDayHoc
    result = session.run("MATCH (p:PhuongPhapDayHoc) RETURN p.ten as ten")
    phuong_phaps = [r['ten'] for r in result]
    print(f"\n  PhuongPhapDayHoc: {phuong_phaps}")
    
    # Lấy danh sách NangLucChung
    result = session.run("MATCH (n:NangLucChung) RETURN n.ten as ten")
    nang_lucs = [r['ten'] for r in result]
    print(f"  NangLucChung: {nang_lucs}")
    
    # 2. Tạo relationships
    print("\n" + "=" * 60)
    print("2. TẠO RELATIONSHIPS: PhuongPhapDayHoc -[:PHAT_TRIEN_NANG_LUC]-> NangLucChung")
    print("=" * 60)
    
    created_count = 0
    for phuong_phap, nang_lucs_list in PHUONG_PHAP_NANG_LUC.items():
        for nang_luc in nang_lucs_list:
            # Kiểm tra xem cả 2 node có tồn tại không
            check_query = """
                MATCH (p:PhuongPhapDayHoc {ten: $phuong_phap})
                MATCH (n:NangLucChung {ten: $nang_luc})
                RETURN p, n
            """
            result = session.run(check_query, phuong_phap=phuong_phap, nang_luc=nang_luc)
            if result.single():
                # Tạo relationship
                create_query = """
                    MATCH (p:PhuongPhapDayHoc {ten: $phuong_phap})
                    MATCH (n:NangLucChung {ten: $nang_luc})
                    MERGE (p)-[r:PHAT_TRIEN_NANG_LUC]->(n)
                    RETURN r
                """
                session.run(create_query, phuong_phap=phuong_phap, nang_luc=nang_luc)
                print(f"  ✅ ({phuong_phap})-[:PHAT_TRIEN_NANG_LUC]->({nang_luc})")
                created_count += 1
            else:
                print(f"  ⚠️ SKIP: '{phuong_phap}' hoặc '{nang_luc}' không tồn tại")
    
    print(f"\n  Tổng: {created_count} relationships đã tạo")
    
    # 3. Xác nhận kết quả
    print("\n" + "=" * 60)
    print("3. XÁC NHẬN KẾT QUẢ")
    print("=" * 60)
    
    result = session.run("""
        MATCH (p:PhuongPhapDayHoc)-[r:PHAT_TRIEN_NANG_LUC]->(n:NangLucChung)
        RETURN p.ten as phuong_phap, n.ten as nang_luc
        ORDER BY p.ten, n.ten
    """)
    
    for record in result:
        print(f"  ({record['phuong_phap']})-[:PHAT_TRIEN_NANG_LUC]->({record['nang_luc']})")

driver.close()
print("\n✅ HOÀN TẤT!")
