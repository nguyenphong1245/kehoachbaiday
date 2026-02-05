from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv('NEO4J_URI'), 
    auth=(os.getenv('NEO4J_USERNAME'), os.getenv('NEO4J_PASSWORD'))
)

print("=" * 80)
print("MERGE 2 CHỦ ĐỀ D TRÙNG LẶP")
print("=" * 80)

with driver.session(database='neo4j') as session:
    # Tìm 2 chủ đề D
    print("\n1. Tìm các chủ đề D hiện có:")
    result = session.run('''
        MATCH (cd:ChuDe)
        WHERE cd.ten STARTS WITH 'CHỦ ĐỀ D.'
        RETURN cd.ten AS ten, elementId(cd) AS id, 
               COUNT {(cd)<-[:THUOC_CHU_DE]-()} AS so_bai_hoc
        ORDER BY cd.ten
    ''')
    
    topics_d = list(result)
    
    for topic in topics_d:
        print(f"   - {topic['ten']}: {topic['so_bai_hoc']} bài học (ID: {topic['id']})")
    
    if len(topics_d) != 2:
        print(f"\n⚠️  Tìm thấy {len(topics_d)} chủ đề D, cần chính xác 2 chủ đề để merge!")
        driver.close()
        exit(1)
    
    # Xác định chủ đề chính (giữ lại) và chủ đề phụ (sẽ xóa)
    # Chọn chủ đề có nhiều bài học hơn làm chủ đề chính
    if topics_d[0]['so_bai_hoc'] >= topics_d[1]['so_bai_hoc']:
        main_topic = topics_d[0]
        duplicate_topic = topics_d[1]
    else:
        main_topic = topics_d[1]
        duplicate_topic = topics_d[0]
    
    print(f"\n2. Quyết định merge:")
    print(f"   - GIỮ LẠI: {main_topic['ten']} ({main_topic['so_bai_hoc']} bài)")
    print(f"   - XÓA: {duplicate_topic['ten']} ({duplicate_topic['so_bai_hoc']} bài)")
    
    # Cập nhật tên chủ đề chính về chuẩn "VĂN HÓA"
    standard_name = "CHỦ ĐỀ D. ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ"
    
    print(f"\n3. Chuẩn hóa tên chủ đề chính thành:")
    print(f"   '{standard_name}'")
    
    # Chuyển tất cả relationships từ duplicate sang main trước
    print(f"\n4. Chuyển các bài học từ chủ đề trùng lặp sang chủ đề chính...")
    
    result = session.run('''
        MATCH (bh:BaiHoc)-[r:THUOC_CHU_DE]->(duplicate:ChuDe)
        WHERE elementId(duplicate) = $duplicate_id
        MATCH (main:ChuDe) WHERE elementId(main) = $main_id
        
        // Tạo relationship mới từ BaiHoc đến main topic
        MERGE (bh)-[:THUOC_CHU_DE]->(main)
        
        // Xóa relationship cũ
        DELETE r
        
        RETURN count(bh) AS moved_count
    ''', duplicate_id=duplicate_topic['id'], main_id=main_topic['id'])
    
    moved = result.single()['moved_count']
    print(f"   ✓ Đã chuyển {moved} bài học")
    
    # Xóa chủ đề trùng lặp
    print(f"\n5. Xóa chủ đề trùng lặp...")
    session.run('''
        MATCH (cd:ChuDe) WHERE elementId(cd) = $id
        DETACH DELETE cd
    ''', id=duplicate_topic['id'])
    print(f"   ✓ Đã xóa: {duplicate_topic['ten']}")
    
    # Sau đó mới cập nhật tên chủ đề chính
    print(f"\n6. Cập nhật tên chủ đề chính...")
    session.run('''
        MATCH (cd:ChuDe) WHERE elementId(cd) = $id
        SET cd.ten = $new_name
    ''', id=main_topic['id'], new_name=standard_name)
    print(f"   ✓ Đã cập nhật tên")
    
    # Kiểm tra kết quả
    print(f"\n7. Kiểm tra kết quả:")
    result = session.run('''
        MATCH (cd:ChuDe)
        WHERE cd.ten STARTS WITH 'CHỦ ĐỀ D.'
        RETURN cd.ten AS ten, 
               COUNT {(cd)<-[:THUOC_CHU_DE]-()} AS so_bai_hoc
    ''')
    
    final_topics = list(result)
    for topic in final_topics:
        print(f"   - {topic['ten']}: {topic['so_bai_hoc']} bài học")
    
    print(f"\n{'='*80}")
    print(f"✅ HOÀN THÀNH! Đã gộp thành công 2 chủ đề D")
    print(f"   Kết quả: {main_topic['so_bai_hoc']} + {duplicate_topic['so_bai_hoc']} = {main_topic['so_bai_hoc'] + duplicate_topic['so_bai_hoc']} bài học")
    print(f"{'='*80}")

driver.close()
