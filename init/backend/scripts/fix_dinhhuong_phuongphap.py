"""
Sửa lại relationships DinhHuong - PhuongPhapDayHoc theo đúng yêu cầu:
- Khoa học máy tính -> Dạy học phát hiện và giải quyết vấn đề
- Tin học ứng dụng -> Dạy học thực hành
"""

import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(username, password))

with driver.session() as session:
    # 1. Xóa TẤT CẢ relationships PHU_HOP_PHUONG_PHAP cũ
    print("=" * 60)
    print("1. XÓA TẤT CẢ RELATIONSHIPS CŨ")
    print("=" * 60)
    
    result = session.run("""
        MATCH (d:DinhHuong)-[r:PHU_HOP_PHUONG_PHAP]->(p:PhuongPhapDayHoc)
        DELETE r
        RETURN count(r) as deleted
    """)
    deleted = result.single()['deleted']
    print(f"  Đã xóa: {deleted} relationships")
    
    # 2. Tạo lại đúng theo yêu cầu
    print("\n" + "=" * 60)
    print("2. TẠO RELATIONSHIPS MỚI (CHỈ 2 CẶP)")
    print("=" * 60)
    
    # Khoa học máy tính -> Dạy học phát hiện và giải quyết vấn đề
    session.run("""
        MATCH (d:DinhHuong {ten: 'Khoa học máy tính'})
        MATCH (p:PhuongPhapDayHoc {ten: 'Dạy học phát hiện và giải quyết vấn đề'})
        MERGE (d)-[r:PHU_HOP_PHUONG_PHAP]->(p)
    """)
    print("  ✅ (Khoa học máy tính)-[:PHU_HOP_PHUONG_PHAP]->(Dạy học phát hiện và giải quyết vấn đề)")
    
    # Tin học ứng dụng -> Dạy học thực hành
    session.run("""
        MATCH (d:DinhHuong {ten: 'Tin học ứng dụng'})
        MATCH (p:PhuongPhapDayHoc {ten: 'Dạy học thực hành'})
        MERGE (d)-[r:PHU_HOP_PHUONG_PHAP]->(p)
    """)
    print("  ✅ (Tin học ứng dụng)-[:PHU_HOP_PHUONG_PHAP]->(Dạy học thực hành)")
    
    # 3. Xác nhận
    print("\n" + "=" * 60)
    print("3. XÁC NHẬN KẾT QUẢ")
    print("=" * 60)
    
    result = session.run("""
        MATCH (d:DinhHuong)-[r:PHU_HOP_PHUONG_PHAP]->(p:PhuongPhapDayHoc)
        RETURN d.ten as dinh_huong, p.ten as phuong_phap
    """)
    
    count = 0
    for record in result:
        print(f"  ({record['dinh_huong']})-[:PHU_HOP_PHUONG_PHAP]->({record['phuong_phap']})")
        count += 1
    
    print(f"\n  Tổng: {count} relationships")

driver.close()
print("\n✅ HOÀN TẤT!")
