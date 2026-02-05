"""
Script cập nhật biểu hiện năng lực chung từ file NLC.csv lên Neo4j
"""
import os
import csv
import re
from neo4j import GraphDatabase
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Neo4j connection
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# Path to CSV file
CSV_PATH = Path(__file__).parent.parent / "app" / "services" / "data" / "NLC.csv"


def parse_bieu_hien(text: str) -> list:
    """Parse biểu hiện từ text trong CSV thành list"""
    if not text:
        return []
    
    # Xóa khoảng trắng thừa và xuống dòng
    text = text.strip()
    
    # Tách các biểu hiện theo dấu "-" ở đầu dòng
    lines = text.split('\n')
    bieu_hien_list = []
    current_bieu_hien = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Kiểm tra nếu bắt đầu bằng "-"
        if line.startswith('-'):
            # Lưu biểu hiện trước đó nếu có
            if current_bieu_hien:
                bieu_hien_list.append(current_bieu_hien.strip())
            # Bắt đầu biểu hiện mới
            current_bieu_hien = line[1:].strip()
        else:
            # Nối tiếp vào biểu hiện hiện tại
            current_bieu_hien += " " + line
    
    # Thêm biểu hiện cuối cùng
    if current_bieu_hien:
        bieu_hien_list.append(current_bieu_hien.strip())
    
    return bieu_hien_list


def read_csv_data() -> dict:
    """Đọc dữ liệu từ file CSV"""
    data = {}
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ten_nang_luc = row.get('Tên năng lực', '').strip()
            bieu_hien_raw = row.get('Biểu hiện', '')
            
            if ten_nang_luc:
                bieu_hien_list = parse_bieu_hien(bieu_hien_raw)
                data[ten_nang_luc] = bieu_hien_list
                print(f"\n📌 {ten_nang_luc}")
                print(f"   Số biểu hiện: {len(bieu_hien_list)}")
                for i, bh in enumerate(bieu_hien_list, 1):
                    print(f"   {i}. {bh[:80]}..." if len(bh) > 80 else f"   {i}. {bh}")
    
    return data


def update_neo4j(data: dict):
    """Cập nhật dữ liệu lên Neo4j"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    with driver.session(database=NEO4J_DATABASE) as session:
        print("\n" + "="*60)
        print("�️ XÓA TẤT CẢ NĂNG LỰC CHUNG CŨ TRONG NEO4J...")
        print("="*60)
        
        # Xóa tất cả node NangLucChung cũ
        try:
            delete_result = session.run("""
                MATCH (nlc:NangLucChung)
                DETACH DELETE nlc
                RETURN count(nlc) AS deleted_count
            """)
            deleted = delete_result.single()
            if deleted:
                print(f"✅ Đã xóa {deleted['deleted_count']} năng lực chung cũ")
        except Exception as e:
            print(f"❌ Lỗi xóa năng lực chung cũ: {e}")
        
        print("\n" + "="*60)
        print("🔄 ĐANG CẬP NHẬT NĂNG LỰC CHUNG MỚI LÊN NEO4J...")
        print("="*60)
        
        # Mapping tên năng lực sang ID
        nang_luc_mapping = {
            "Năng lực giao tiếp và hợp tác": "NLC1",
            "Năng lực giải quyết vấn đề và sáng tạo": "NLC2", 
            "Năng lực tự chủ và tự học": "NLC3"
        }
        
        for ten_nang_luc, bieu_hien_list in data.items():
            nlc_id = nang_luc_mapping.get(ten_nang_luc)
            if not nlc_id:
                print(f"⚠️ Không tìm thấy ID cho: {ten_nang_luc}")
                continue
            
            try:
                # Xóa biểu hiện cũ và cập nhật biểu hiện mới
                result = session.run("""
                    MERGE (nlc:NangLucChung {id: $id})
                    SET nlc.ten = $ten,
                        nlc.bieu_hien = $bieu_hien
                    RETURN nlc.id AS id, nlc.ten AS ten, size(nlc.bieu_hien) AS so_bieu_hien
                """, {
                    "id": nlc_id,
                    "ten": ten_nang_luc,
                    "bieu_hien": bieu_hien_list
                })
                
                record = result.single()
                if record:
                    print(f"✅ Cập nhật thành công: {record['ten']}")
                    print(f"   ID: {record['id']}, Số biểu hiện: {record['so_bieu_hien']}")
                    
            except Exception as e:
                print(f"❌ Lỗi cập nhật {ten_nang_luc}: {e}")
        
        # Kiểm tra kết quả
        print("\n" + "-"*60)
        print("📊 KIỂM TRA KẾT QUẢ:")
        print("-"*60)
        
        check_result = session.run("""
            MATCH (nlc:NangLucChung)
            RETURN nlc.id AS id, nlc.ten AS ten, nlc.bieu_hien AS bieu_hien
            ORDER BY nlc.id
        """)
        
        for record in check_result:
            print(f"\n🔹 {record['id']} - {record['ten']}")
            bieu_hien = record['bieu_hien']
            if bieu_hien:
                print(f"   Số biểu hiện: {len(bieu_hien)}")
                for i, bh in enumerate(bieu_hien[:3], 1):
                    bh_short = bh[:70] + "..." if len(bh) > 70 else bh
                    print(f"   {i}. {bh_short}")
                if len(bieu_hien) > 3:
                    print(f"   ... và {len(bieu_hien) - 3} biểu hiện khác")
    
    driver.close()
    print("\n" + "="*60)
    print("✅ HOÀN THÀNH CẬP NHẬT!")
    print("="*60)


def main():
    print("\n" + "="*60)
    print("📖 ĐỌC DỮ LIỆU TỪ FILE NLC.csv")
    print("="*60)
    print(f"📁 File path: {CSV_PATH}")
    
    if not CSV_PATH.exists():
        print(f"❌ Không tìm thấy file: {CSV_PATH}")
        return
    
    # Đọc dữ liệu từ CSV
    data = read_csv_data()
    
    if not data:
        print("❌ Không có dữ liệu để cập nhật")
        return
    
    print(f"\n📊 Tổng số năng lực chung: {len(data)}")
    
    # Cập nhật lên Neo4j
    update_neo4j(data)


if __name__ == "__main__":
    main()
