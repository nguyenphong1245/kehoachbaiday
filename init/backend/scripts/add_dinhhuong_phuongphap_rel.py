"""
Script thêm relationships giữa DinhHuong và PhuongPhapDayHoc

Theo chương trình GDPT 2018:
- Tin học ứng dụng: Dạy học thực hành, Dạy học dựa trên dự án
- Khoa học máy tính: Dạy học phát hiện và giải quyết vấn đề, Dạy học khám phá
- Chung: Dạy học hợp tác, Dạy học thông qua trò chơi (phù hợp cả 2 định hướng)
"""

import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(username, password))

# Định nghĩa mapping giữa Định hướng và Phương pháp phù hợp
DINH_HUONG_PHUONG_PHAP = {
    "Tin học ứng dụng": [
        "Dạy học thực hành",
        "Dạy học dựa trên dự án",
        "Dạy học hợp tác",
        "Dạy học thông qua trò chơi"
    ],
    "Khoa học máy tính": [
        "Dạy học phát hiện và giải quyết vấn đề",
        "Dạy học khám phá", 
        "Dạy học hợp tác",
        "Dạy học thông qua trò chơi"
    ],
    "Chung": [
        "Dạy học hợp tác",
        "Dạy học thông qua trò chơi",
        "Dạy học thực hành",
        "Dạy học phát hiện và giải quyết vấn đề",
        "Dạy học khám phá",
        "Dạy học dựa trên dự án"
    ]
}

with driver.session() as session:
    # 1. Kiểm tra dữ liệu hiện có
    print("=" * 60)
    print("1. KIỂM TRA DỮ LIỆU HIỆN CÓ")
    print("=" * 60)
    
    # Lấy danh sách DinhHuong
    result = session.run("MATCH (d:DinhHuong) RETURN d.ten as ten")
    dinh_huongs = [r['ten'] for r in result]
    print(f"\n  DinhHuong: {dinh_huongs}")
    
    # Lấy danh sách PhuongPhapDayHoc
    result = session.run("MATCH (p:PhuongPhapDayHoc) RETURN p.ten as ten")
    phuong_phaps = [r['ten'] for r in result]
    print(f"  PhuongPhapDayHoc: {phuong_phaps}")
    
    # 2. Tạo relationships
    print("\n" + "=" * 60)
    print("2. TẠO RELATIONSHIPS: DinhHuong -[:PHU_HOP_PHUONG_PHAP]-> PhuongPhapDayHoc")
    print("=" * 60)
    
    created_count = 0
    for dinh_huong, phuong_phaps_list in DINH_HUONG_PHUONG_PHAP.items():
        for phuong_phap in phuong_phaps_list:
            # Kiểm tra xem cả 2 node có tồn tại không
            check_query = """
                MATCH (d:DinhHuong {ten: $dinh_huong})
                MATCH (p:PhuongPhapDayHoc {ten: $phuong_phap})
                RETURN d, p
            """
            result = session.run(check_query, dinh_huong=dinh_huong, phuong_phap=phuong_phap)
            if result.single():
                # Tạo relationship
                create_query = """
                    MATCH (d:DinhHuong {ten: $dinh_huong})
                    MATCH (p:PhuongPhapDayHoc {ten: $phuong_phap})
                    MERGE (d)-[r:PHU_HOP_PHUONG_PHAP]->(p)
                    RETURN r
                """
                session.run(create_query, dinh_huong=dinh_huong, phuong_phap=phuong_phap)
                print(f"  ✅ ({dinh_huong})-[:PHU_HOP_PHUONG_PHAP]->({phuong_phap})")
                created_count += 1
            else:
                print(f"  ⚠️ SKIP: '{dinh_huong}' hoặc '{phuong_phap}' không tồn tại")
    
    print(f"\n  Tổng: {created_count} relationships đã tạo")
    
    # 3. Xác nhận kết quả
    print("\n" + "=" * 60)
    print("3. XÁC NHẬN KẾT QUẢ")
    print("=" * 60)
    
    result = session.run("""
        MATCH (d:DinhHuong)-[r:PHU_HOP_PHUONG_PHAP]->(p:PhuongPhapDayHoc)
        RETURN d.ten as dinh_huong, p.ten as phuong_phap
        ORDER BY d.ten, p.ten
    """)
    
    for record in result:
        print(f"  ({record['dinh_huong']})-[:PHU_HOP_PHUONG_PHAP]->({record['phuong_phap']})")

driver.close()
print("\n✅ HOÀN TẤT!")
