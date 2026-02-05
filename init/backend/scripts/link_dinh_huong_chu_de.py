"""
Script tạo liên kết giữa Định hướng và Chủ đề trong Neo4j
Dựa trên dữ liệu từ file DL_KHBD.csv
"""
import os
import csv
from collections import defaultdict
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Neo4j connection
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# Path to CSV file
CSV_PATH = Path(__file__).parent.parent / "app" / "services" / "data" / "DL_KHBD_S.csv"


def read_csv_and_extract_mapping():
    """Đọc file CSV và trích xuất mapping định hướng -> chủ đề"""
    mapping = defaultdict(set)
    
    print(f"📖 Đọc dữ liệu từ: {CSV_PATH}")
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            dinh_huong = row.get('dinh_huong', '').strip()
            chu_de = row.get('chu_de', '').strip()
            
            if chu_de:
                # Chuyển đổi định hướng rỗng thành 'Chung'
                dh = dinh_huong if dinh_huong else 'Chung'
                mapping[dh].add(chu_de)
    
    return mapping


def create_relationships(mapping: dict):
    """Tạo liên kết trong Neo4j"""
    print(f"\n🔗 Kết nối Neo4j: {NEO4J_URI}")
    print(f"📊 Database: {NEO4J_DATABASE}")
    
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    with driver.session(database=NEO4J_DATABASE) as session:
        # Xóa các liên kết cũ (nếu có)
        print("\n" + "="*70)
        print("🗑️  XÓA LIÊN KẾT CŨ (ChuDe)-[:THUOC_DINH_HUONG]->(DinhHuong)")
        print("="*70)
        
        result = session.run("""
            MATCH (c:ChuDe)-[r:THUOC_DINH_HUONG]->(d:DinhHuong)
            DELETE r
            RETURN count(r) as deleted
        """)
        deleted = result.single()['deleted']
        print(f"  ✅ Đã xóa {deleted} liên kết cũ")
        
        # Tạo các liên kết mới
        print("\n" + "="*70)
        print("🔄 TẠO LIÊN KẾT MỚI (ChuDe)-[:THUOC_DINH_HUONG]->(DinhHuong)")
        print("="*70)
        
        created_count = 0
        not_found_count = 0
        
        for dinh_huong, chu_de_list in mapping.items():
            print(f"\n📌 Định hướng: {dinh_huong}")
            
            for chu_de in chu_de_list:
                result = session.run("""
                    MATCH (c:ChuDe)
                    WHERE c.ten = $chu_de
                    MATCH (d:DinhHuong)
                    WHERE d.ten = $dinh_huong
                    MERGE (c)-[r:THUOC_DINH_HUONG]->(d)
                    RETURN c.ten as chu_de, d.ten as dinh_huong
                """, chu_de=chu_de, dinh_huong=dinh_huong)
                
                record = result.single()
                if record:
                    created_count += 1
                    chu_de_short = chu_de[:50] + "..." if len(chu_de) > 50 else chu_de
                    print(f"   ✅ {chu_de_short}")
                else:
                    not_found_count += 1
                    chu_de_short = chu_de[:50] + "..." if len(chu_de) > 50 else chu_de
                    print(f"   ⚠️ Không tìm thấy: {chu_de_short}")
        
        # Tổng kết
        print("\n" + "="*70)
        print("📊 TỔNG KẾT")
        print("="*70)
        print(f"  ✅ Đã tạo: {created_count} liên kết")
        print(f"  ⚠️ Không tìm thấy: {not_found_count} chủ đề")
        
        # Kiểm tra kết quả
        print("\n" + "="*70)
        print("🔍 KIỂM TRA KẾT QUẢ")
        print("="*70)
        
        result = session.run("""
            MATCH (c:ChuDe)-[r:THUOC_DINH_HUONG]->(d:DinhHuong)
            RETURN d.ten as dinh_huong, count(c) as so_chu_de
            ORDER BY d.ten
        """)
        
        print("\nThống kê liên kết theo Định hướng:")
        for record in result:
            print(f"   - {record['dinh_huong']}: {record['so_chu_de']} chủ đề")
        
        # Hiển thị chi tiết
        print("\n📝 Chi tiết liên kết:")
        result = session.run("""
            MATCH (c:ChuDe)-[:THUOC_DINH_HUONG]->(d:DinhHuong)
            RETURN d.ten as dinh_huong, collect(c.ten) as chu_de_list
            ORDER BY d.ten
        """)
        
        for record in result:
            print(f"\n   {record['dinh_huong']}:")
            for cd in sorted(record['chu_de_list']):
                cd_short = cd[:60] + "..." if len(cd) > 60 else cd
                print(f"      - {cd_short}")
    
    driver.close()
    print("\n✅ Hoàn thành!")


def main():
    print("\n" + "="*70)
    print("🚀 TẠO LIÊN KẾT ĐỊNH HƯỚNG - CHỦ ĐỀ TRONG NEO4J")
    print("="*70)
    
    # Đọc dữ liệu từ CSV
    mapping = read_csv_and_extract_mapping()
    
    print("\n📊 Mapping từ DL_KHBD.csv:")
    for dh, cd_list in mapping.items():
        print(f"   - {dh}: {len(cd_list)} chủ đề")
    
    # Tạo liên kết
    create_relationships(mapping)


if __name__ == "__main__":
    main()
