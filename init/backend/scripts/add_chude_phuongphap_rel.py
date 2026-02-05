"""
Thêm relationships giữa ChuDe và PhuongPhapDayHoc - SỬA LẠI TÊN ĐÚNG
"""
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()
driver = GraphDatabase.driver(os.getenv('NEO4J_URI'), auth=(os.getenv('NEO4J_USERNAME'), os.getenv('NEO4J_PASSWORD')))

# Mapping: dùng CONTAINS để tìm kiếm linh hoạt
# Keyword -> Phương pháp
MAPPINGS = [
    # Phương pháp dạy học thực hành
    ("MẠNG MÁY TÍNH VÀ INTERNET", "Dạy học thực hành"),
    ("ỨNG DỤNG TIN HỌC", "Dạy học thực hành"),
    
    # Phương pháp dạy học dựa trên dự án
    ("ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN", "Dạy học dựa trên dự án"),  # văn hóa/văn hoá
    ("ỨNG DỤNG TIN HỌC", "Dạy học dựa trên dự án"),
    ("TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI", "Dạy học dựa trên dự án"),
]

with driver.session() as session:
    print("=" * 60)
    print("TẠO RELATIONSHIPS: ChuDe -[:PHU_HOP_PHUONG_PHAP]-> PhuongPhapDayHoc")
    print("=" * 60)
    
    created_count = 0
    for keyword, phuong_phap in MAPPINGS:
        # Tìm tất cả chủ đề chứa keyword
        query = """
            MATCH (c:ChuDe) WHERE toUpper(c.ten) CONTAINS $keyword
            MATCH (p:PhuongPhapDayHoc {ten: $phuong_phap})
            MERGE (c)-[r:PHU_HOP_PHUONG_PHAP]->(p)
            RETURN c.ten as chu_de, p.ten as pp
        """
        result = session.run(query, keyword=keyword, phuong_phap=phuong_phap)
        records = list(result)
        
        for record in records:
            print(f"  ✅ ({record['chu_de']})-[:PHU_HOP_PHUONG_PHAP]->({record['pp']})")
            created_count += 1
        
        if not records:
            print(f"  ⚠️ KHÔNG TÌM THẤY: '{keyword}'")
    
    print(f"\n  Tổng: {created_count} relationships đã tạo")
    
    # Xác nhận
    print("\n" + "=" * 60)
    print("XÁC NHẬN - TẤT CẢ RELATIONSHIPS ChuDe -> PhuongPhapDayHoc")
    print("=" * 60)
    result = session.run("""
        MATCH (c:ChuDe)-[r:PHU_HOP_PHUONG_PHAP]->(p:PhuongPhapDayHoc)
        RETURN c.ten as chu_de, p.ten as phuong_phap
        ORDER BY p.ten, c.ten
    """)
    for record in result:
        print(f"  ({record['chu_de']})-[:PHU_HOP_PHUONG_PHAP]->({record['phuong_phap']})")

driver.close()
print("\n✅ HOÀN TẤT!")
