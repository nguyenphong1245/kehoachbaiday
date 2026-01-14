"""
Script để thêm năng lực hỗ trợ (CO_NANG_LUC_HO_TRO) vào Neo4j từ DL_KHBD.csv
"""
import os
import csv
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# Config
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
CSV_PATH = "app/services/data/DL_KHBD.csv"


def normalize_lesson_id(ten_loai_sach, lop, bai_hoc):
    """Tạo ID chuẩn từ thông tin bài học"""
    import re
    import unicodedata
    
    # Map loại sách
    book_map = {
        "Kết nối tri thức với cuộc sống": "KNTT",
        "Chân trời sáng tạo": "CTST",
        "Cánh diều": "CD"
    }
    book_code = book_map.get(ten_loai_sach, "KNTT")
    
    # Lấy số bài và tên bài
    # VD: "Bài 17. Biến và lệnh gán" -> "BAI_17_BIEN_VA_LENH_GAN"
    bai_hoc = bai_hoc.strip()
    
    # Bỏ dấu
    def remove_accents(text):
        text = text.replace('Đ', 'D').replace('đ', 'd')
        text = unicodedata.normalize('NFD', text)
        return ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    
    bai_normalized = remove_accents(bai_hoc)
    # Thay các ký tự đặc biệt bằng underscore
    bai_normalized = re.sub(r'[^A-Za-z0-9]', '_', bai_normalized.upper())
    # Xóa underscore liên tiếp
    bai_normalized = re.sub(r'_+', '_', bai_normalized)
    # Xóa underscore ở đầu/cuối
    bai_normalized = bai_normalized.strip('_')
    
    return f"{book_code}_{lop}_{bai_normalized}"


def parse_nang_luc(nang_luc_str):
    """Parse chuỗi năng lực thành list
    VD: "NLa, NLb, NLc" -> ["NLa", "NLb", "NLc"]
    """
    if not nang_luc_str or nang_luc_str.strip() == "":
        return []
    
    # Tách theo dấu phẩy và strip
    items = [item.strip() for item in nang_luc_str.split(',')]
    # Lọc các giá trị trống
    items = [item for item in items if item]
    return items


def add_nang_luc_ho_tro():
    """Thêm năng lực hỗ trợ vào Neo4j"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    # Đọc CSV
    lessons_data = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ten_loai_sach = row.get('ten_loai_sach', '')
            lop = row.get('lop', '')
            bai_hoc = row.get('bai_hoc', '')
            nang_luc_ho_tro = row.get('nang_luc_ho_tro', '')
            
            if not bai_hoc:
                continue
                
            lesson_id = normalize_lesson_id(ten_loai_sach, lop, bai_hoc)
            nang_luc_list = parse_nang_luc(nang_luc_ho_tro)
            
            if nang_luc_list:
                lessons_data.append({
                    'lesson_id': lesson_id,
                    'bai_hoc': bai_hoc,
                    'nang_luc_ho_tro': nang_luc_list
                })
    
    print(f"Đọc được {len(lessons_data)} bài có năng lực hỗ trợ từ CSV")
    
    # Thêm vào Neo4j
    with driver.session() as session:
        # Đầu tiên, tạo các node NangLuc nếu chưa có
        all_nang_luc = set()
        for data in lessons_data:
            all_nang_luc.update(data['nang_luc_ho_tro'])
        
        print(f"Các năng lực cần tạo: {all_nang_luc}")
        
        # Tạo hoặc merge các node NangLuc
        for nl in all_nang_luc:
            session.run("""
                MERGE (n:NangLuc {nang_luc_chinh: $nl})
            """, nl=nl)
        print(f"Đã tạo/merge {len(all_nang_luc)} node NangLuc")
        
        # Tạo relationship CO_NANG_LUC_HO_TRO
        count_success = 0
        count_not_found = 0
        
        for data in lessons_data:
            # Tìm BaiHoc theo nhiều cách
            result = session.run("""
                MATCH (bh:BaiHoc)
                WHERE bh.id CONTAINS $search_term
                RETURN bh.id AS id, bh.ten AS ten
                LIMIT 1
            """, search_term=data['lesson_id'].split('_')[-1][:10])
            
            record = result.single()
            
            if not record:
                # Thử tìm theo tên bài
                result = session.run("""
                    MATCH (bh:BaiHoc)
                    WHERE bh.ten CONTAINS $bai_hoc
                    RETURN bh.id AS id, bh.ten AS ten
                    LIMIT 1
                """, bai_hoc=data['bai_hoc'].split('.')[0])
                record = result.single()
            
            if record:
                bh_id = record['id']
                for nl in data['nang_luc_ho_tro']:
                    session.run("""
                        MATCH (bh:BaiHoc {id: $bh_id})
                        MATCH (nl:NangLuc {nang_luc_chinh: $nl})
                        MERGE (bh)-[:CO_NANG_LUC_HO_TRO]->(nl)
                    """, bh_id=bh_id, nl=nl)
                count_success += 1
                print(f"✓ Đã thêm năng lực hỗ trợ cho: {record['ten']}")
            else:
                count_not_found += 1
                print(f"✗ Không tìm thấy bài: {data['bai_hoc']}")
        
        print(f"\n=== KẾT QUẢ ===")
        print(f"Thành công: {count_success}")
        print(f"Không tìm thấy: {count_not_found}")
    
    driver.close()


def verify_nang_luc_ho_tro():
    """Kiểm tra năng lực hỗ trợ đã thêm"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    with driver.session() as session:
        result = session.run("""
            MATCH (bh:BaiHoc)-[:CO_NANG_LUC_HO_TRO]->(nl:NangLuc)
            RETURN bh.ten AS bai_hoc, collect(nl.nang_luc_chinh) AS nang_luc_ho_tro
            ORDER BY bh.id
            LIMIT 10
        """)
        
        print("\n=== KIỂM TRA NĂNG LỰC HỖ TRỢ ===")
        count = 0
        for record in result:
            print(f"- {record['bai_hoc']}: {record['nang_luc_ho_tro']}")
            count += 1
        
        if count == 0:
            print("Chưa có năng lực hỗ trợ nào!")
        else:
            print(f"\nĐã có {count} bài có năng lực hỗ trợ")
    
    driver.close()


if __name__ == "__main__":
    print("=== THÊM NĂNG LỰC HỖ TRỢ VÀO NEO4J ===\n")
    add_nang_luc_ho_tro()
    print("\n")
    verify_nang_luc_ho_tro()
