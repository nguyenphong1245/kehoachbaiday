"""
Script để cập nhật dữ liệu Phương pháp dạy học (PPDH) và Kỹ thuật dạy học (KTDH) vào Neo4j
"""
import csv
import os
from neo4j import GraphDatabase

# Neo4j connection settings - đọc từ biến môi trường hoặc dùng giá trị mặc định
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+s://3d076d47.databases.neo4j.io")
NEO4J_USER = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

# File paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "services", "data")
PPDH_FILE = os.path.join(DATA_DIR, "PPDH.csv")
KTDH_FILE = os.path.join(DATA_DIR, "KTDH.csv")


def read_csv_file(file_path, encoding='utf-8'):
    """Đọc file CSV và trả về list các dict"""
    data = []
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
    except UnicodeDecodeError:
        # Try with different encoding
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
    return data


def update_ppdh(driver):
    """Cập nhật Phương pháp dạy học"""
    print("=" * 50)
    print("Cập nhật Phương pháp dạy học (PhuongPhapDayHoc)")
    print("=" * 50)
    
    # Đọc dữ liệu từ CSV
    ppdh_data = read_csv_file(PPDH_FILE)
    print(f"Đã đọc {len(ppdh_data)} phương pháp từ file CSV")
    
    with driver.session() as session:
        # Xóa tất cả PhuongPhapDayHoc cũ
        result = session.run("MATCH (p:PhuongPhapDayHoc) DETACH DELETE p RETURN count(p) as deleted")
        deleted = result.single()["deleted"]
        print(f"Đã xóa {deleted} PhuongPhapDayHoc cũ")
        
        # Thêm PhuongPhapDayHoc mới
        for item in ppdh_data:
            ten = item.get('ten_phuong_phap', '').strip()
            if not ten:
                continue
                
            cach_tien_hanh = item.get('cach_tien_hanh', '').strip()
            uu_diem = item.get('uu_diem', '').strip()
            nhuoc_diem = item.get('nhuoc_diem', '').strip()
            
            query = """
            CREATE (p:PhuongPhapDayHoc {
                ten: $ten,
                cach_tien_hanh: $cach_tien_hanh,
                uu_diem: $uu_diem,
                nhuoc_diem: $nhuoc_diem
            })
            RETURN p.ten as ten
            """
            result = session.run(query, 
                                ten=ten, 
                                cach_tien_hanh=cach_tien_hanh,
                                uu_diem=uu_diem,
                                nhuoc_diem=nhuoc_diem)
            created_ten = result.single()["ten"]
            print(f"  ✓ Đã tạo: {created_ten}")
        
        # Kiểm tra số lượng sau khi tạo
        result = session.run("MATCH (p:PhuongPhapDayHoc) RETURN count(p) as count")
        count = result.single()["count"]
        print(f"\nTổng số PhuongPhapDayHoc hiện tại: {count}")


def update_ktdh(driver):
    """Cập nhật Kỹ thuật dạy học"""
    print("\n" + "=" * 50)
    print("Cập nhật Kỹ thuật dạy học (KyThuatDayHoc)")
    print("=" * 50)
    
    # Đọc dữ liệu từ CSV
    ktdh_data = read_csv_file(KTDH_FILE)
    print(f"Đã đọc {len(ktdh_data)} kỹ thuật từ file CSV")
    
    with driver.session() as session:
        # Xóa tất cả KyThuatDayHoc cũ
        result = session.run("MATCH (k:KyThuatDayHoc) DETACH DELETE k RETURN count(k) as deleted")
        deleted = result.single()["deleted"]
        print(f"Đã xóa {deleted} KyThuatDayHoc cũ")
        
        # Thêm KyThuatDayHoc mới
        for item in ktdh_data:
            ten = item.get('ten_ki_thuat', '').strip()
            if not ten:
                continue
                
            cach_tien_hanh = item.get('cach_tien_hanh', '').strip()
            uu_diem = item.get('uu_diem', '').strip()
            nhuoc_diem = item.get('nhuoc_diem', '').strip()
            bo_sung = item.get('bo_sung', '').strip()
            
            query = """
            CREATE (k:KyThuatDayHoc {
                ten: $ten,
                cach_tien_hanh: $cach_tien_hanh,
                uu_diem: $uu_diem,
                nhuoc_diem: $nhuoc_diem,
                bo_sung: $bo_sung
            })
            RETURN k.ten as ten
            """
            result = session.run(query, 
                                ten=ten, 
                                cach_tien_hanh=cach_tien_hanh,
                                uu_diem=uu_diem,
                                nhuoc_diem=nhuoc_diem,
                                bo_sung=bo_sung)
            created_ten = result.single()["ten"]
            print(f"  ✓ Đã tạo: {created_ten}")
        
        # Kiểm tra số lượng sau khi tạo
        result = session.run("MATCH (k:KyThuatDayHoc) RETURN count(k) as count")
        count = result.single()["count"]
        print(f"\nTổng số KyThuatDayHoc hiện tại: {count}")


def main():
    print("Kết nối đến Neo4j...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    try:
        # Kiểm tra kết nối
        driver.verify_connectivity()
        print("Kết nối thành công!\n")
        
        # Cập nhật PPDH
        update_ppdh(driver)
        
        # Cập nhật KTDH
        update_ktdh(driver)
        
        print("\n" + "=" * 50)
        print("HOÀN THÀNH CẬP NHẬT!")
        print("=" * 50)
        
    except Exception as e:
        print(f"Lỗi: {e}")
        raise
    finally:
        driver.close()


if __name__ == "__main__":
    main()
