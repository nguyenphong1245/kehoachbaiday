from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv('NEO4J_URI'), 
    auth=(os.getenv('NEO4J_USERNAME'), os.getenv('NEO4J_PASSWORD'))
)

print("=" * 80)
print("DANH SÁCH TẤT CẢ CHỦ ĐỀ TRONG NEO4J")
print("=" * 80)

with driver.session(database='neo4j') as session:
    # Lấy tất cả chủ đề
    result = session.run('''
        MATCH (cd:ChuDe)
        RETURN cd.ten AS ten_chu_de, 
               cd.ma AS ma_chu_de,
               id(cd) AS node_id,
               elementId(cd) AS element_id
        ORDER BY cd.ten
    ''')
    
    topics = list(result)
    
    if not topics:
        print("\n⚠️  Không tìm thấy chủ đề nào trong Neo4j!")
    else:
        print(f"\n📚 Tổng số chủ đề: {len(topics)}\n")
        
        for i, record in enumerate(topics, 1):
            ten = record['ten_chu_de'] or "(Chưa có tên)"
            ma = record['ma_chu_de'] or "(Chưa có mã)"
            node_id = record['node_id']
            element_id = record['element_id']
            
            print(f"{i:3d}. {ten}")
            print(f"     Mã: {ma}")
            print(f"     Node ID: {node_id} | Element ID: {element_id}")
            print()

    # Thống kê số bài học theo từng chủ đề
    print("\n" + "=" * 80)
    print("THỐNG KÊ SỐ BÀI HỌC THEO CHỦ ĐỀ")
    print("=" * 80 + "\n")
    
    result = session.run('''
        MATCH (cd:ChuDe)
        OPTIONAL MATCH (bh:BaiHoc)-[:THUOC_CHU_DE]->(cd)
        WITH cd, COUNT(bh) AS so_bai_hoc
        RETURN cd.ten AS ten_chu_de, 
               cd.ma AS ma_chu_de,
               so_bai_hoc
        ORDER BY so_bai_hoc DESC, cd.ten
    ''')
    
    for record in result:
        ten = record['ten_chu_de'] or "(Chưa có tên)"
        ma = record['ma_chu_de'] or "(Chưa có mã)"
        so_bai = record['so_bai_hoc']
        
        print(f"  {ten:50s} [{ma}]: {so_bai} bài học")

driver.close()
