"""
Script cập nhật biểu hiện phẩm chất từ file PC.csv lên Neo4j
"""
import os
import csv
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
CSV_PATH = Path(__file__).parent.parent / "app" / "services" / "data" / "PC.csv"


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
            ten_pham_chat = row.get('Tên', '').strip()
            bieu_hien_raw = row.get('Biểu Hiện', '')
            
            if ten_pham_chat:
                bieu_hien_list = parse_bieu_hien(bieu_hien_raw)
                data[ten_pham_chat] = bieu_hien_list
                print(f"\n📌 {ten_pham_chat}")
                print(f"   Số biểu hiện: {len(bieu_hien_list)}")
                for i, bh in enumerate(bieu_hien_list, 1):
                    print(f"   {i}. {bh[:80]}..." if len(bh) > 80 else f"   {i}. {bh}")
    
    return data


def update_neo4j(data: dict):
    """Cập nhật dữ liệu lên Neo4j"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    with driver.session(database=NEO4J_DATABASE) as session:
        print("\n" + "="*60)
        print("🗑️ XÓA TẤT CẢ PHẨM CHẤT CŨ TRONG NEO4J...")
        print("="*60)
        
        # Xóa tất cả node PhamChat cũ
        try:
            delete_result = session.run("""
                MATCH (pc:PhamChat)
                DETACH DELETE pc
                RETURN count(pc) AS deleted_count
            """)
            deleted = delete_result.single()
            if deleted:
                print(f"✅ Đã xóa {deleted['deleted_count']} phẩm chất cũ")
        except Exception as e:
            print(f"❌ Lỗi xóa phẩm chất cũ: {e}")
        
        print("\n" + "="*60)
        print("🔄 ĐANG CẬP NHẬT PHẨM CHẤT MỚI LÊN NEO4J...")
        print("="*60)
        
        # Mapping tên phẩm chất sang ID
        pham_chat_mapping = {
            "Yêu nước": "PC1",
            "Nhân ái": "PC2",
            "Chăm chỉ": "PC3",
            "Trung thực": "PC4",
            "Trách nhiệm": "PC5"
        }
        
        for ten_pham_chat, bieu_hien_list in data.items():
            pc_id = pham_chat_mapping.get(ten_pham_chat)
            if not pc_id:
                print(f"⚠️ Không tìm thấy ID cho: {ten_pham_chat}")
                continue
            
            try:
                # Tạo node mới với biểu hiện
                result = session.run("""
                    CREATE (pc:PhamChat {
                        id: $id,
                        ten: $ten,
                        bieu_hien: $bieu_hien
                    })
                    RETURN pc.id AS id, pc.ten AS ten, size(pc.bieu_hien) AS so_bieu_hien
                """, {
                    "id": pc_id,
                    "ten": ten_pham_chat,
                    "bieu_hien": bieu_hien_list
                })
                
                record = result.single()
                if record:
                    print(f"✅ Cập nhật thành công: {record['ten']}")
                    print(f"   ID: {record['id']}, Số biểu hiện: {record['so_bieu_hien']}")
                    
            except Exception as e:
                print(f"❌ Lỗi cập nhật {ten_pham_chat}: {e}")
        
        # Kiểm tra kết quả
        print("\n" + "-"*60)
        print("📊 KIỂM TRA KẾT QUẢ:")
        print("-"*60)
        
        check_result = session.run("""
            MATCH (pc:PhamChat)
            RETURN pc.id AS id, pc.ten AS ten, pc.bieu_hien AS bieu_hien
            ORDER BY pc.id
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
    print("✅ HOÀN THÀNH CẬP NHẬT PHẨM CHẤT!")
    print("="*60)


def main():
    print("\n" + "="*60)
    print("📖 ĐỌC DỮ LIỆU TỪ FILE PC.csv")
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
    
    print(f"\n📊 Tổng số phẩm chất: {len(data)}")
    
    # Cập nhật lên Neo4j
    update_neo4j(data)


if __name__ == "__main__":
    main()
