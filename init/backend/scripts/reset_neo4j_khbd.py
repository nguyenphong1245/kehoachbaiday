"""
Script xóa và tạo lại dữ liệu KHBD (Kế Hoạch Bài Dạy) trên Neo4j
Bao gồm:
- Dữ liệu từ file DL_KHBD.csv
- Nội dung SGK từ thư mục DATA_SGK
"""
import os
import csv
import re
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

# Paths
DATA_DIR = Path(__file__).parent.parent / "app" / "services" / "data"
CSV_PATH = DATA_DIR / "DL_KHBD.csv"
SGK_DIR = DATA_DIR / "DATA_SGK"
MAP_CD_PATH = DATA_DIR / "MAP_CD.csv"
KY_THUAT_DH_PATH = DATA_DIR / "Kỹ thuật Dạy học Tích cực.csv"
PHUONG_PHAP_DH_PATH = DATA_DIR / "Phương Pháp Dạy Học Tích Cực.csv"

# Mapping loại sách sang mã
SACH_MAPPING = {
    "Kết nối tri thức với cuộc sống": "KNTT",
    "Cánh diều": "CD"
}

# Mapping định hướng
DINH_HUONG_MAPPING = {
    "": "CHUNG",
    "Tin học ứng dụng": "ICT",
    "Khoa học máy tính": "CS"
}


def normalize_text(text: str) -> str:
    """Chuẩn hóa text để so sánh"""
    if not text:
        return ""
    # Loại bỏ dấu và chuyển về chữ thường
    text = text.strip().lower()
    text = re.sub(r'\s+', ' ', text)
    return text


def extract_bai_number(bai_hoc: str) -> str:
    """Trích xuất số bài từ tên bài học"""
    match = re.search(r'Bài\s*(\d+[a-z]?)', bai_hoc, re.IGNORECASE)
    if match:
        return match.group(1)
    return ""


def normalize_bai_name(bai_hoc: str) -> str:
    """Chuẩn hóa tên bài học thành ID"""
    if not bai_hoc:
        return ""
    
    # Loại bỏ số bài ở đầu (Bài 1., Bài 1:, etc.)
    text = re.sub(r'^Bài\s*\d+[a-z]?[\.:]\s*', '', bai_hoc, flags=re.IGNORECASE)
    
    # Chuyển về chữ thường và loại bỏ dấu tiếng Việt
    vietnamese_map = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    }
    
    text = text.lower()
    for vn, en in vietnamese_map.items():
        text = text.replace(vn, en)
    
    # Loại bỏ ký tự đặc biệt, giữ lại chữ và số
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # Thay khoảng trắng bằng dấu gạch dưới
    text = re.sub(r'\s+', '_', text.strip())
    # Giới hạn độ dài
    text = text[:50]
    
    return text.upper()


def generate_bai_id(sach: str, lop: str, bai_hoc: str, dinh_huong: str = "") -> str:
    """Tạo ID duy nhất cho bài học - lấy bài học làm trung tâm"""
    sach_code = SACH_MAPPING.get(sach, "UNKNOWN")
    dh_code = DINH_HUONG_MAPPING.get(dinh_huong, "CHUNG")
    
    # Lấy số bài
    bai_number = extract_bai_number(bai_hoc)
    
    # Chuẩn hóa tên bài
    bai_name = normalize_bai_name(bai_hoc)
    
    parts = [sach_code, lop]
    if dh_code != "CHUNG":
        parts.append(dh_code)
    parts.append(f"BAI_{bai_number.zfill(2)}")
    if bai_name:
        parts.append(bai_name)
    
    return "_".join(parts)


def find_sgk_content(sach: str, lop: str, bai_number: str, bai_hoc: str = "", dinh_huong: str = "") -> str:
    """Tìm và đọc nội dung SGK tương ứng - khớp theo số bài VÀ tên bài"""
    sach_code = SACH_MAPPING.get(sach, "")
    if not sach_code:
        return ""
    
    # Xác định thư mục
    folder_name = f"{lop}_{sach_code}"
    folder_path = SGK_DIR / folder_name
    
    if not folder_path.exists():
        return ""
    
    # Chuẩn hóa tên bài để so sánh
    bai_name_normalized = normalize_bai_name(bai_hoc) if bai_hoc else ""
    
    # Nếu không có số bài, tìm trực tiếp theo tên bài
    if not bai_number and bai_name_normalized:
        for file in folder_path.glob("*.md"):
            if bai_name_normalized in file.stem.upper():
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        return f.read()
                except Exception as e:
                    print(f"⚠️ Lỗi đọc file {file}: {e}")
                    return ""
        return ""
    
    # Tìm file phù hợp theo số bài
    bai_padded = bai_number.zfill(2) if bai_number else ""
    pattern_num = f"{sach_code}_{lop}_BAI_{bai_padded}"
    
    # Tìm tất cả file khớp số bài
    matching_files = []
    for file in folder_path.glob("*.md"):
        file_name = file.stem.upper()
        if pattern_num.upper() in file_name:
            matching_files.append(file)
    
    # Nếu chỉ có 1 file, trả về luôn
    if len(matching_files) == 1:
        try:
            with open(matching_files[0], 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"⚠️ Lỗi đọc file {matching_files[0]}: {e}")
            return ""
    
    # Nếu có nhiều file, tìm file khớp tên bài
    if matching_files and bai_name_normalized:
        for file in matching_files:
            if bai_name_normalized in file.stem.upper():
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        return f.read()
                except Exception as e:
                    print(f"⚠️ Lỗi đọc file {file}: {e}")
                    return ""
    
    # Nếu không tìm được, trả về file đầu tiên (fallback)
    if matching_files:
        try:
            with open(matching_files[0], 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"⚠️ Lỗi đọc file {matching_files[0]}: {e}")
    
    return ""


def read_csv_data() -> list:
    """Đọc dữ liệu từ file CSV"""
    data = []
    
    print(f"📖 Đọc dữ liệu từ: {CSV_PATH}")
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ten_loai_sach = row.get('ten_loai_sach', '').strip()
            dinh_huong = row.get('dinh_huong', '').strip()
            lop = row.get('lop', '').strip()
            chu_de = row.get('chu_de', '').strip()
            loai = row.get('loai', '').strip()
            bai_hoc = row.get('bai_hoc', '').strip()
            muc_tieu = row.get('muc_tieu', '').strip()
            nang_luc_chinh = row.get('nang_luc_chinh', '').strip()
            nang_luc_ho_tro = row.get('nang_luc_ho_tro', '').strip()
            
            # Lấy các chỉ mục
            chi_muc = []
            for i in range(1, 8):
                cm = row.get(f'chi_muc_{i}', '').strip()
                if cm:
                    chi_muc.append(cm)
            
            if ten_loai_sach and lop and bai_hoc:
                bai_number = extract_bai_number(bai_hoc)
                bai_id = generate_bai_id(ten_loai_sach, lop, bai_hoc, dinh_huong)
                
                # Tìm nội dung SGK - truyền thêm tên bài để khớp chính xác
                noi_dung_sgk = find_sgk_content(ten_loai_sach, lop, bai_number, bai_hoc, dinh_huong)
                
                data.append({
                    'bai_id': bai_id,
                    'ten_loai_sach': ten_loai_sach,
                    'dinh_huong': dinh_huong,
                    'lop': lop,
                    'chu_de': chu_de,
                    'loai': loai,
                    'bai_hoc': bai_hoc,
                    'bai_number': bai_number,
                    'muc_tieu': muc_tieu,
                    'nang_luc_chinh': nang_luc_chinh,
                    'nang_luc_ho_tro': nang_luc_ho_tro,
                    'chi_muc': chi_muc,
                    'noi_dung_sgk': noi_dung_sgk
                })
    
    return data


def delete_all_data(session):
    """Xóa toàn bộ dữ liệu KHBD trong Neo4j"""
    print("\n" + "="*70)
    print("🗑️  XÓA TOÀN BỘ DỮ LIỆU KHBD TRONG NEO4J...")
    print("="*70)
    
    # Xóa các node theo label
    labels_to_delete = [
        'BaiHoc',
        'ChuDe', 
        'Sach',
        'Lop',
        'DinhHuong',
        'ChiMuc',
        'MucTieu',
        'YeuCauCanDat',
        'KyThuatDayHoc',
        'PhuongPhapDayHoc',
        'NangLuc'
    ]
    
    for label in labels_to_delete:
        try:
            result = session.run(f"""
                MATCH (n:{label})
                DETACH DELETE n
                RETURN count(n) AS deleted_count
            """)
            record = result.single()
            if record and record['deleted_count'] > 0:
                print(f"  ✅ Đã xóa {record['deleted_count']} node {label}")
        except Exception as e:
            print(f"  ⚠️ Lỗi xóa {label}: {e}")
    
    print("✅ Hoàn thành xóa dữ liệu cũ!")


def create_khbd_data(session, data: list):
    """Tạo dữ liệu KHBD mới trong Neo4j"""
    print("\n" + "="*70)
    print("🔄 TẠO DỮ LIỆU KHBD MỚI TRONG NEO4J...")
    print("="*70)
    
    # Tạo constraints và indexes
    print("\n📌 Tạo constraints và indexes...")
    constraints = [
        "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Sach) REQUIRE s.ten IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Lop) REQUIRE l.lop IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (b:BaiHoc) REQUIRE b.bai_id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (c:ChuDe) REQUIRE c.ten IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (d:DinhHuong) REQUIRE d.ten IS UNIQUE",
    ]
    
    for constraint in constraints:
        try:
            session.run(constraint)
        except Exception as e:
            pass  # Constraint có thể đã tồn tại
    
    # Thống kê
    stats = {
        'sach': set(),
        'lop': set(),
        'chu_de': set(),
        'dinh_huong': set(),
        'muc_tieu': 0,
        'chi_muc': 0,
        'bai_hoc': 0,
        'co_noi_dung': 0,
        'yeu_cau_can_dat': 0,
        'mapping_chu_de': 0
    }
    
    print("\n📚 Tạo các node Sách...")
    for sach_ten in SACH_MAPPING.keys():
        try:
            session.run("""
                MERGE (s:Sach {ten: $ten})
                SET s.ma = $ma
            """, {"ten": sach_ten, "ma": SACH_MAPPING[sach_ten]})
            stats['sach'].add(sach_ten)
        except Exception as e:
            print(f"  ⚠️ Lỗi tạo sách {sach_ten}: {e}")
    
    print("\n🎓 Tạo các node Lớp...")
    for lop in ['10', '11', '12']:
        try:
            session.run("""
                MERGE (l:Lop {lop: $lop})
                SET l.ten = $ten
            """, {"lop": lop, "ten": f"Lớp {lop}"})
            stats['lop'].add(lop)
            print(f"  ✅ Lớp {lop}")
        except Exception as e:
            print(f"  ⚠️ Lỗi tạo lớp {lop}: {e}")
    
    # Tạo các node Định hướng
    print("\n🧭 Tạo các node Định hướng...")
    dinh_huong_list = ["Chung", "Tin học ứng dụng", "Khoa học máy tính"]
    for dh in dinh_huong_list:
        try:
            session.run("""
                MERGE (d:DinhHuong {ten: $ten})
            """, {"ten": dh})
            stats['dinh_huong'].add(dh)
            print(f"  ✅ Định hướng: {dh}")
        except Exception as e:
            print(f"  ⚠️ Lỗi tạo định hướng {dh}: {e}")
    
    # Tạo các node Chủ đề (unique)
    print("\n📂 Tạo các node Chủ đề...")
    chu_de_set = set()
    for item in data:
        if item['chu_de']:
            chu_de_set.add(item['chu_de'])
    
    for chu_de in chu_de_set:
        try:
            session.run("""
                MERGE (c:ChuDe {ten: $ten})
            """, {"ten": chu_de})
            stats['chu_de'].add(chu_de)
        except Exception as e:
            print(f"  ⚠️ Lỗi tạo chủ đề: {e}")
    print(f"  ✅ Đã tạo {len(chu_de_set)} chủ đề")
    
    print("\n📖 Tạo các node Bài học và liên kết...")
    for idx, item in enumerate(data):
        try:
            # Tạo node BaiHoc với thuộc tính cơ bản
            has_content = len(item['noi_dung_sgk']) > 0
            dinh_huong = item['dinh_huong'] if item['dinh_huong'] else "Chung"
            
            session.run("""
                MERGE (b:BaiHoc {bai_id: $bai_id})
                SET b.ten = $ten,
                    b.so_bai = $so_bai,
                    b.loai = $loai,
                    b.nang_luc_chinh = $nang_luc_chinh,
                    b.nang_luc_ho_tro = $nang_luc_ho_tro,
                    b.noi_dung_sgk = $noi_dung_sgk,
                    b.co_noi_dung = $co_noi_dung
            """, {
                "bai_id": item['bai_id'],
                "ten": item['bai_hoc'],
                "so_bai": item['bai_number'],
                "loai": item['loai'],
                "nang_luc_chinh": item['nang_luc_chinh'],
                "nang_luc_ho_tro": item['nang_luc_ho_tro'],
                "noi_dung_sgk": item['noi_dung_sgk'],
                "co_noi_dung": has_content
            })
            
            # Liên kết BaiHoc -> Sach
            session.run("""
                MATCH (b:BaiHoc {bai_id: $bai_id})
                MATCH (s:Sach {ten: $sach})
                MERGE (b)-[:THUOC_SACH]->(s)
            """, {"bai_id": item['bai_id'], "sach": item['ten_loai_sach']})
            
            # Liên kết BaiHoc -> Lop
            session.run("""
                MATCH (b:BaiHoc {bai_id: $bai_id})
                MATCH (l:Lop {lop: $lop})
                MERGE (b)-[:THUOC_LOP]->(l)
            """, {"bai_id": item['bai_id'], "lop": item['lop']})
            
            # Liên kết BaiHoc -> ChuDe
            if item['chu_de']:
                session.run("""
                    MATCH (b:BaiHoc {bai_id: $bai_id})
                    MATCH (c:ChuDe {ten: $chu_de})
                    MERGE (b)-[:THUOC_CHU_DE]->(c)
                """, {"bai_id": item['bai_id'], "chu_de": item['chu_de']})
            
            # Liên kết BaiHoc -> DinhHuong
            session.run("""
                MATCH (b:BaiHoc {bai_id: $bai_id})
                MATCH (d:DinhHuong {ten: $dinh_huong})
                MERGE (b)-[:THUOC_DINH_HUONG]->(d)
            """, {"bai_id": item['bai_id'], "dinh_huong": dinh_huong})
            
            # Tạo node MucTieu và liên kết với BaiHoc
            if item['muc_tieu']:
                muc_tieu_id = f"{item['bai_id']}_MT"
                session.run("""
                    MERGE (m:MucTieu {id: $id})
                    SET m.noi_dung = $noi_dung
                    WITH m
                    MATCH (b:BaiHoc {bai_id: $bai_id})
                    MERGE (b)-[:CO_MUC_TIEU]->(m)
                """, {
                    "id": muc_tieu_id,
                    "noi_dung": item['muc_tieu'],
                    "bai_id": item['bai_id']
                })
                stats['muc_tieu'] += 1
            
            # Tạo các node ChiMuc và liên kết với BaiHoc
            for i, chi_muc in enumerate(item['chi_muc'], 1):
                chi_muc_id = f"{item['bai_id']}_CM{i}"
                session.run("""
                    MERGE (cm:ChiMuc {id: $id})
                    SET cm.noi_dung = $noi_dung,
                        cm.thu_tu = $thu_tu
                    WITH cm
                    MATCH (b:BaiHoc {bai_id: $bai_id})
                    MERGE (b)-[:CO_CHI_MUC]->(cm)
                """, {
                    "id": chi_muc_id,
                    "noi_dung": chi_muc,
                    "thu_tu": i,
                    "bai_id": item['bai_id']
                })
                stats['chi_muc'] += 1
            
            stats['bai_hoc'] += 1
            if has_content:
                stats['co_noi_dung'] += 1
            
            # Hiển thị tiến trình
            if (idx + 1) % 50 == 0:
                print(f"  ⏳ Đã xử lý {idx + 1}/{len(data)} bài học...")
                
        except Exception as e:
            print(f"  ❌ Lỗi tạo bài học {item['bai_id']}: {e}")
    
    return stats

def read_map_cd_data() -> list:
    """Đọc dữ liệu từ file MAP_CD.csv"""
    data = []
    
    if not MAP_CD_PATH.exists():
        print(f"⚠️ Không tìm thấy file MAP_CD.csv: {MAP_CD_PATH}")
        return data
    
    print(f"\n📖 Đọc dữ liệu mapping chủ đề từ: {MAP_CD_PATH}")
    
    current_lop = ""
    with open(MAP_CD_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lop = row.get('lop', '').strip()
            chu_de_cd = row.get('chu_de_canh_dieu', '').strip()
            chu_de_kntt = row.get('chu_de_ket_noi_chi_thuc', '').strip()
            yeu_cau_can_dat = row.get('yeu_cau_can_dat', '').strip()
            
            # Cập nhật lớp hiện tại nếu có giá trị mới
            if lop:
                current_lop = lop
            
            # Thêm dữ liệu nếu có chủ đề hoặc yêu cầu cần đạt
            if current_lop and (chu_de_cd or chu_de_kntt or yeu_cau_can_dat):
                data.append({
                    'lop': current_lop,
                    'chu_de_cd': chu_de_cd,
                    'chu_de_kntt': chu_de_kntt,
                    'yeu_cau_can_dat': yeu_cau_can_dat
                })
    
    print(f"  ✅ Đã đọc {len(data)} mục mapping chủ đề")
    return data


def create_topic_mapping_and_yccd(session, map_data: list):
    """Tạo liên kết giữa chủ đề của 2 sách và node YeuCauCanDat"""
    print("\n" + "="*70)
    print("🔗 TẠO LIÊN KẾT CHỦ ĐỀ VÀ YÊU CẦU CẦN ĐẠT...")
    print("="*70)
    
    stats = {
        'mapping_chu_de': 0,
        'yeu_cau_can_dat': 0,
        'chu_de_moi': 0
    }
    
    for idx, item in enumerate(map_data):
        try:
            lop = item['lop']
            chu_de_cd = item['chu_de_cd']
            chu_de_kntt = item['chu_de_kntt']
            yeu_cau_can_dat = item['yeu_cau_can_dat']
            
            # Tạo node ChuDe nếu chưa tồn tại (từ MAP_CD.csv có thể có chủ đề mới)
            if chu_de_cd:
                result = session.run("""
                    MERGE (c:ChuDe {ten: $ten})
                    ON CREATE SET c.sach = 'Cánh diều'
                    RETURN c.ten AS ten, c.sach AS sach
                """, {"ten": chu_de_cd})
                record = result.single()
                if record:
                    stats['chu_de_moi'] += 1
            
            if chu_de_kntt:
                result = session.run("""
                    MERGE (c:ChuDe {ten: $ten})
                    ON CREATE SET c.sach = 'Kết nối tri thức với cuộc sống'
                    RETURN c.ten AS ten, c.sach AS sach
                """, {"ten": chu_de_kntt})
                record = result.single()
                if record:
                    stats['chu_de_moi'] += 1
            
            # Nối hai chủ đề tương đương
            if chu_de_cd and chu_de_kntt:
                session.run("""
                    MATCH (cd:ChuDe {ten: $chu_de_cd})
                    MATCH (kntt:ChuDe {ten: $chu_de_kntt})
                    MERGE (cd)-[:TUONG_DUONG]->(kntt)
                    MERGE (kntt)-[:TUONG_DUONG]->(cd)
                """, {
                    "chu_de_cd": chu_de_cd,
                    "chu_de_kntt": chu_de_kntt
                })
                stats['mapping_chu_de'] += 1
            
            # Tạo node YeuCauCanDat và nối với chủ đề
            if yeu_cau_can_dat:
                # Tạo ID unique cho YeuCauCanDat
                # Sử dụng hash của nội dung để tránh trùng lặp
                yccd_id = f"YCCD_L{lop}_{idx+1}"
                
                session.run("""
                    MERGE (y:YeuCauCanDat {id: $id})
                    SET y.noi_dung = $noi_dung,
                        y.lop = $lop
                """, {
                    "id": yccd_id,
                    "noi_dung": yeu_cau_can_dat,
                    "lop": lop
                })
                
                # Nối YeuCauCanDat với chủ đề Cánh diều
                if chu_de_cd:
                    session.run("""
                        MATCH (y:YeuCauCanDat {id: $yccd_id})
                        MATCH (c:ChuDe {ten: $chu_de})
                        MERGE (c)-[:CO_YEU_CAU_CAN_DAT]->(y)
                    """, {
                        "yccd_id": yccd_id,
                        "chu_de": chu_de_cd
                    })
                
                # Nối YeuCauCanDat với chủ đề Kết nối tri thức
                if chu_de_kntt:
                    session.run("""
                        MATCH (y:YeuCauCanDat {id: $yccd_id})
                        MATCH (c:ChuDe {ten: $chu_de})
                        MERGE (c)-[:CO_YEU_CAU_CAN_DAT]->(y)
                    """, {
                        "yccd_id": yccd_id,
                        "chu_de": chu_de_kntt
                    })
                
                stats['yeu_cau_can_dat'] += 1
            
            if (idx + 1) % 10 == 0:
                print(f"  ⏳ Đã xử lý {idx + 1}/{len(map_data)} mục...")
                
        except Exception as e:
            print(f"  ❌ Lỗi xử lý mục {idx}: {e}")
    
    print(f"\n  ✅ Đã tạo {stats['mapping_chu_de']} liên kết chủ đề tương đương")
    print(f"  ✅ Đã tạo {stats['yeu_cau_can_dat']} node YeuCauCanDat")
    
    return stats


def read_ky_thuat_dh_data() -> list:
    """Đọc dữ liệu từ file Kỹ thuật Dạy học Tích cực.csv"""
    data = []
    
    if not KY_THUAT_DH_PATH.exists():
        print(f"⚠️ Không tìm thấy file Kỹ thuật Dạy học: {KY_THUAT_DH_PATH}")
        return data
    
    print(f"\n📖 Đọc dữ liệu Kỹ thuật Dạy học từ: {KY_THUAT_DH_PATH}")
    
    with open(KY_THUAT_DH_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ten_ki_thuat = row.get('ten_ki_thuat', '').strip()
            cach_tien_hanh = row.get('cach_tien_hanh', '').strip()
            uu_diem = row.get('uu_diem', '').strip()
            nhuoc_diem = row.get('nhuoc_diem', '').strip()
            bo_sung = row.get('bo_sung', '').strip()
            
            if ten_ki_thuat:
                data.append({
                    'ten_ki_thuat': ten_ki_thuat,
                    'cach_tien_hanh': cach_tien_hanh,
                    'uu_diem': uu_diem,
                    'nhuoc_diem': nhuoc_diem,
                    'bo_sung': bo_sung
                })
    
    print(f"  ✅ Đã đọc {len(data)} kỹ thuật dạy học")
    return data


def create_ky_thuat_dh(session, data: list):
    """Tạo các node Kỹ thuật Dạy học trong Neo4j"""
    print("\n" + "="*70)
    print("📚 TẠO CÁC NODE KỸ THUẬT DẠY HỌC...")
    print("="*70)
    
    count = 0
    for item in data:
        try:
            # Tạo ID từ tên kỹ thuật
            kt_id = normalize_bai_name(item['ten_ki_thuat'])
            
            session.run("""
                MERGE (kt:KyThuatDayHoc {id: $id})
                SET kt.ten = $ten,
                    kt.cach_tien_hanh = $cach_tien_hanh,
                    kt.uu_diem = $uu_diem,
                    kt.nhuoc_diem = $nhuoc_diem,
                    kt.bo_sung = $bo_sung
            """, {
                "id": kt_id,
                "ten": item['ten_ki_thuat'],
                "cach_tien_hanh": item['cach_tien_hanh'],
                "uu_diem": item['uu_diem'],
                "nhuoc_diem": item['nhuoc_diem'],
                "bo_sung": item['bo_sung']
            })
            count += 1
            print(f"  ✅ {item['ten_ki_thuat']}")
            
        except Exception as e:
            print(f"  ❌ Lỗi tạo kỹ thuật {item['ten_ki_thuat']}: {e}")
    
    print(f"\n  ✅ Đã tạo {count} node KyThuatDayHoc")
    return count


def read_phuong_phap_dh_data() -> list:
    """Đọc dữ liệu từ file Phương Pháp Dạy Học Tích Cực.csv"""
    data = []
    
    if not PHUONG_PHAP_DH_PATH.exists():
        print(f"⚠️ Không tìm thấy file Phương Pháp Dạy Học: {PHUONG_PHAP_DH_PATH}")
        return data
    
    print(f"\n📖 Đọc dữ liệu Phương Pháp Dạy Học từ: {PHUONG_PHAP_DH_PATH}")
    
    with open(PHUONG_PHAP_DH_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ten_phuong_phap = row.get('ten_phuong_phap', '').strip()
            cach_tien_hanh = row.get('cach_tien_hanh', '').strip()
            uu_diem = row.get('uu_diem', '').strip()
            nhuoc_diem = row.get('nhuoc_diem', '').strip()
            
            if ten_phuong_phap:
                data.append({
                    'ten_phuong_phap': ten_phuong_phap,
                    'cach_tien_hanh': cach_tien_hanh,
                    'uu_diem': uu_diem,
                    'nhuoc_diem': nhuoc_diem
                })
    
    print(f"  ✅ Đã đọc {len(data)} phương pháp dạy học")
    return data


def create_nang_luc_nodes(session):
    """Tạo các node Năng lực"""
    print("\n" + "="*70)
    print("🎯 TẠO CÁC NODE NĂNG LỰC...")
    print("="*70)
    
    # Các năng lực chung theo chương trình GDPT 2018
    nang_luc_list = [
        {"id": "TU_CHU_TU_HOC", "ten": "Năng lực tự chủ và tự học", "loai": "chung"},
        {"id": "GIAO_TIEP_HOP_TAC", "ten": "Năng lực giao tiếp và hợp tác", "loai": "chung"},
        {"id": "GIAI_QUYET_VAN_DE_SANG_TAO", "ten": "Năng lực giải quyết vấn đề và sáng tạo", "loai": "chung"},
    ]
    
    count = 0
    for nl in nang_luc_list:
        try:
            session.run("""
                MERGE (nl:NangLuc {id: $id})
                SET nl.ten = $ten,
                    nl.loai = $loai
            """, nl)
            count += 1
            print(f"  ✅ {nl['ten']}")
        except Exception as e:
            print(f"  ❌ Lỗi tạo năng lực {nl['ten']}: {e}")
    
    print(f"\n  ✅ Đã tạo {count} node NangLuc")
    return count


def create_phuong_phap_dh(session, data: list):
    """Tạo các node Phương Pháp Dạy Học và liên kết"""
    print("\n" + "="*70)
    print("📚 TẠO CÁC NODE PHƯƠNG PHÁP DẠY HỌC...")
    print("="*70)
    
    count = 0
    for item in data:
        try:
            # Tạo ID từ tên phương pháp
            pp_id = normalize_bai_name(item['ten_phuong_phap'])
            
            session.run("""
                MERGE (pp:PhuongPhapDayHoc {id: $id})
                SET pp.ten = $ten,
                    pp.cach_tien_hanh = $cach_tien_hanh,
                    pp.uu_diem = $uu_diem,
                    pp.nhuoc_diem = $nhuoc_diem
            """, {
                "id": pp_id,
                "ten": item['ten_phuong_phap'],
                "cach_tien_hanh": item['cach_tien_hanh'],
                "uu_diem": item['uu_diem'],
                "nhuoc_diem": item['nhuoc_diem']
            })
            count += 1
            print(f"  ✅ {item['ten_phuong_phap']}")
            
        except Exception as e:
            print(f"  ❌ Lỗi tạo phương pháp {item['ten_phuong_phap']}: {e}")
    
    print(f"\n  ✅ Đã tạo {count} node PhuongPhapDayHoc")
    return count


def create_relationships(session):
    """Tạo các liên kết giữa Phương pháp, Kỹ thuật, Năng lực, Định hướng, Chủ đề"""
    print("\n" + "="*70)
    print("🔗 TẠO CÁC LIÊN KẾT...")
    print("="*70)
    
    stats = {'pp_nl': 0, 'kt_nl': 0, 'pp_dh': 0, 'pp_cd': 0}
    
    # 1. Dạy học theo dự án, Dạy học hợp tác -> Năng lực tự chủ và tự học
    print("\n  📌 Liên kết Phương pháp -> Năng lực tự chủ và tự học")
    try:
        result = session.run("""
            MATCH (pp:PhuongPhapDayHoc)
            WHERE LOWER(pp.ten) CONTAINS 'dạy học dựa trên dự án' OR LOWER(pp.ten) CONTAINS 'dạy học hợp tác'
            MATCH (nl:NangLuc {id: 'TU_CHU_TU_HOC'})
            MERGE (pp)-[:PHAT_TRIEN_NANG_LUC]->(nl)
            RETURN count(pp) as count
        """)
        count = result.single()['count'] if result.single() else 0
        stats['pp_nl'] += count
        print(f"     ✅ Đã liên kết {count} phương pháp")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 2. Phương pháp/Kỹ thuật có làm việc nhóm -> Năng lực giao tiếp và hợp tác
    print("\n  📌 Liên kết PP/KT làm việc nhóm -> Năng lực giao tiếp và hợp tác")
    try:
        # Phương pháp có làm việc nhóm
        session.run("""
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'hợp tác' OR pp.cach_tien_hanh CONTAINS 'nhóm'
            MATCH (nl:NangLuc {id: 'GIAO_TIEP_HOP_TAC'})
            MERGE (pp)-[:PHAT_TRIEN_NANG_LUC]->(nl)
        """)
        # Kỹ thuật có làm việc nhóm
        session.run("""
            MATCH (kt:KyThuatDayHoc)
            WHERE kt.cach_tien_hanh CONTAINS 'nhóm' OR kt.ten CONTAINS 'nhóm' 
               OR kt.ten CONTAINS 'Khăn trải bàn' OR kt.ten CONTAINS 'Mảnh ghép'
               OR kt.ten CONTAINS 'Phòng tranh' OR kt.ten CONTAINS 'Công đoạn'
               OR kt.ten CONTAINS 'Bể cá'
            MATCH (nl:NangLuc {id: 'GIAO_TIEP_HOP_TAC'})
            MERGE (kt)-[:PHAT_TRIEN_NANG_LUC]->(nl)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 3. Năng lực giải quyết vấn đề và sáng tạo -> PP Phát hiện và giải quyết vấn đề
    print("\n  📌 Liên kết PP giải quyết vấn đề -> Năng lực GQVĐ và sáng tạo")
    try:
        session.run("""
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'giải quyết vấn đề' OR pp.ten CONTAINS 'khám phá'
            MATCH (nl:NangLuc {id: 'GIAI_QUYET_VAN_DE_SANG_TAO'})
            MERGE (pp)-[:PHAT_TRIEN_NANG_LUC]->(nl)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 4. Định hướng Khoa học máy tính -> PP nêu và giải quyết vấn đề
    print("\n  📌 Liên kết Định hướng KHMT -> PP giải quyết vấn đề")
    try:
        session.run("""
            MATCH (dh:DinhHuong {ten: 'Khoa học máy tính'})
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'giải quyết vấn đề'
            MERGE (dh)-[:PHU_HOP_PHUONG_PHAP]->(pp)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 5. PP Dạy học thực hành -> Định hướng Tin học ứng dụng
    print("\n  📌 Liên kết PP thực hành -> Định hướng ICT")
    try:
        session.run("""
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'thực hành'
            MATCH (dh:DinhHuong {ten: 'Tin học ứng dụng'})
            MERGE (dh)-[:PHU_HOP_PHUONG_PHAP]->(pp)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 6. Chủ đề B "Mạng máy tính và Internet", Chủ đề E "Ứng dụng tin học" -> PP thực hành
    print("\n  📌 Liên kết Chủ đề B, E -> PP thực hành")
    try:
        session.run("""
            MATCH (c:ChuDe)
            WHERE c.ten CONTAINS 'MẠNG MÁY TÍNH' OR c.ten CONTAINS 'ỨNG DỤNG TIN HỌC'
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'thực hành'
            MERGE (c)-[:PHU_HOP_PHUONG_PHAP]->(pp)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    # 7. Chủ đề D, E, C -> PP Dạy học dự án
    print("\n  📌 Liên kết Chủ đề D, E, C -> PP Dạy học dự án")
    try:
        session.run("""
            MATCH (c:ChuDe)
            WHERE c.ten CONTAINS 'ĐẠO ĐỨC' OR c.ten CONTAINS 'PHÁP LUẬT' 
               OR c.ten CONTAINS 'VĂN HÓA' OR c.ten CONTAINS 'VĂN HOÁ'
               OR c.ten CONTAINS 'ỨNG DỤNG TIN HỌC'
               OR c.ten CONTAINS 'TỔ CHỨC LƯU TRỮ' OR c.ten CONTAINS 'TÌM KIẾM'
            MATCH (pp:PhuongPhapDayHoc)
            WHERE pp.ten CONTAINS 'dự án'
            MERGE (c)-[:PHU_HOP_PHUONG_PHAP]->(pp)
        """)
        print("     ✅ Đã liên kết")
    except Exception as e:
        print(f"     ❌ Lỗi: {e}")
    
    print("\n  ✅ Hoàn thành tạo liên kết")
    return stats


def verify_data(session):
    """Kiểm tra dữ liệu đã tạo"""
    print("\n" + "="*70)
    print("📊 KIỂM TRA DỮ LIỆU ĐÃ TẠO:")
    print("="*70)
    
    # Đếm số node theo label
    labels = ['Sach', 'Lop', 'ChuDe', 'DinhHuong', 'BaiHoc', 'MucTieu', 'ChiMuc', 'YeuCauCanDat', 'KyThuatDayHoc', 'PhuongPhapDayHoc', 'NangLuc']
    for label in labels:
        result = session.run(f"MATCH (n:{label}) RETURN count(n) AS count")
        record = result.single()
        print(f"  📌 {label}: {record['count']} nodes")
    
    # Đếm số bài có nội dung SGK
    result = session.run("""
        MATCH (b:BaiHoc)
        WHERE b.co_noi_dung = true
        RETURN count(b) AS count
    """)
    record = result.single()
    print(f"  📌 Bài học có nội dung SGK: {record['count']} nodes")
    
    # Thống kê theo sách
    print("\n  📚 Thống kê theo sách:")
    result = session.run("""
        MATCH (b:BaiHoc)-[:THUOC_SACH]->(s:Sach)
        RETURN s.ten AS sach, count(b) AS count
        ORDER BY s.ten
    """)
    for record in result:
        print(f"     - {record['sach']}: {record['count']} bài")
    
    # Thống kê theo lớp
    print("\n  🎓 Thống kê theo lớp:")
    result = session.run("""
        MATCH (b:BaiHoc)-[:THUOC_LOP]->(l:Lop)
        RETURN l.lop AS lop, count(b) AS count
        ORDER BY l.lop
    """)
    for record in result:
        print(f"     - Lớp {record['lop']}: {record['count']} bài")
    
    # Thống kê theo định hướng
    print("\n  🧭 Thống kê theo định hướng:")
    result = session.run("""
        MATCH (b:BaiHoc)-[:THUOC_DINH_HUONG]->(d:DinhHuong)
        RETURN d.ten AS dinh_huong, count(b) AS count
        ORDER BY d.ten
    """)
    for record in result:
        print(f"     - {record['dinh_huong']}: {record['count']} bài")
    
    # Mẫu một số bài học với đầy đủ liên kết
    print("\n  📖 Mẫu một số bài học (với liên kết):")
    result = session.run("""
        MATCH (b:BaiHoc)-[:THUOC_SACH]->(s:Sach)
        MATCH (b)-[:THUOC_LOP]->(l:Lop)
        OPTIONAL MATCH (b)-[:THUOC_CHU_DE]->(c:ChuDe)
        OPTIONAL MATCH (b)-[:THUOC_DINH_HUONG]->(d:DinhHuong)
        OPTIONAL MATCH (b)-[:CO_MUC_TIEU]->(m:MucTieu)
        OPTIONAL MATCH (b)-[:CO_CHI_MUC]->(cm:ChiMuc)
        RETURN b.bai_id AS id, b.ten AS ten, s.ma AS sach, l.lop AS lop, 
               c.ten AS chu_de, d.ten AS dinh_huong, 
               m.noi_dung AS muc_tieu, count(cm) AS so_chi_muc,
               b.co_noi_dung AS co_noi_dung
        ORDER BY b.bai_id
        LIMIT 5
    """)
    for record in result:
        content_icon = "✅" if record['co_noi_dung'] else "❌"
        ten_short = record['ten'][:40] + "..." if len(record['ten']) > 40 else record['ten']
        print(f"     {content_icon} {record['id']}")
        print(f"        Tên: {ten_short}")
        print(f"        Sách: {record['sach']} | Lớp: {record['lop']} | ĐH: {record['dinh_huong']}")
        if record['chu_de']:
            print(f"        Chủ đề: {record['chu_de'][:50]}...")
        print(f"        Số chỉ mục: {record['so_chi_muc']}")


def main():
    print("\n" + "="*70)
    print("🚀 BẮT ĐẦU RESET DỮ LIỆU KHBD TRÊN NEO4J")
    print("="*70)
    print(f"📂 Thư mục dữ liệu: {DATA_DIR}")
    print(f"📄 File CSV: {CSV_PATH}")
    print(f"📚 Thư mục SGK: {SGK_DIR}")
    print(f"🔗 Neo4j URI: {NEO4J_URI}")
    print(f"📊 Database: {NEO4J_DATABASE}")
    
    # Kiểm tra file và thư mục
    if not CSV_PATH.exists():
        print(f"\n❌ Không tìm thấy file CSV: {CSV_PATH}")
        return
    
    if not SGK_DIR.exists():
        print(f"\n⚠️ Không tìm thấy thư mục SGK: {SGK_DIR}")
    
    # Đọc dữ liệu CSV
    data = read_csv_data()
    print(f"\n📊 Đã đọc {len(data)} bài học từ CSV")
    
    # Thống kê nội dung SGK
    co_noi_dung = sum(1 for item in data if item['noi_dung_sgk'])
    print(f"📚 Có {co_noi_dung} bài học có nội dung SGK")
    
    # Đọc dữ liệu MAP_CD.csv
    map_cd_data = read_map_cd_data()
    
    # Đọc dữ liệu Kỹ thuật Dạy học
    ky_thuat_dh_data = read_ky_thuat_dh_data()
    
    # Kết nối Neo4j và thực hiện
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
        
        with driver.session(database=NEO4J_DATABASE) as session:
            # Xóa dữ liệu cũ
            delete_all_data(session)
            
            # Tạo dữ liệu mới từ DL_KHBD.csv
            stats = create_khbd_data(session, data)
            
            # Tạo liên kết chủ đề và YeuCauCanDat từ MAP_CD.csv
            if map_cd_data:
                map_stats = create_topic_mapping_and_yccd(session, map_cd_data)
                stats['yeu_cau_can_dat'] = map_stats['yeu_cau_can_dat']
                stats['mapping_chu_de'] = map_stats['mapping_chu_de']
            
            # Tạo các node Kỹ thuật Dạy học
            if ky_thuat_dh_data:
                stats['ky_thuat_dh'] = create_ky_thuat_dh(session, ky_thuat_dh_data)
            
            # Đọc và tạo Phương Pháp Dạy Học
            phuong_phap_dh_data = read_phuong_phap_dh_data()
            if phuong_phap_dh_data:
                stats['phuong_phap_dh'] = create_phuong_phap_dh(session, phuong_phap_dh_data)
            
            # Tạo các node Năng lực
            stats['nang_luc'] = create_nang_luc_nodes(session)
            
            # Tạo các liên kết PP/KT/NL/ĐH/CĐ
            create_relationships(session)
            
            # Kiểm tra kết quả
            verify_data(session)
        
        driver.close()
        
        print("\n" + "="*70)
        print("✅ HOÀN THÀNH RESET DỮ LIỆU KHBD!")
        print("="*70)
        print(f"📚 Sách: {len(stats['sach'])}")
        print(f"🎓 Lớp: {len(stats['lop'])}")
        print(f"📂 Chủ đề: {len(stats['chu_de'])}")
        print(f"🧭 Định hướng: {len(stats['dinh_huong'])}")
        print(f"📖 Bài học: {stats['bai_hoc']}")
        print(f"🎯 Mục tiêu: {stats['muc_tieu']}")
        print(f"📑 Chỉ mục: {stats['chi_muc']}")
        print(f"📝 Có nội dung SGK: {stats['co_noi_dung']}")
        print(f"🔗 Liên kết chủ đề tương đương: {stats['mapping_chu_de']}")
        print(f"✅ Yêu cầu cần đạt: {stats['yeu_cau_can_dat']}")
        print(f"🎓 Kỹ thuật dạy học: {stats.get('ky_thuat_dh', 0)}")
        print(f"📚 Phương pháp dạy học: {stats.get('phuong_phap_dh', 0)}")
        print(f"🎯 Năng lực: {stats.get('nang_luc', 0)}")
        
        print("\n📋 CẤU TRÚC DỮ LIỆU:")
        print("   BaiHoc (trung tâm)")
        print("   ├── Thuộc tính: ten, loai, noi_dung_sgk")
        print("   └── Liên kết:")
        print("       ├── [:THUOC_SACH] -> Sach")
        print("       ├── [:THUOC_LOP] -> Lop")
        print("       ├── [:THUOC_CHU_DE] -> ChuDe")
        print("       │                      ├── [:TUONG_DUONG] <-> ChuDe (sách khác)")
        print("       │                      ├── [:CO_YEU_CAU_CAN_DAT] -> YeuCauCanDat")
        print("       │                      └── [:PHU_HOP_PHUONG_PHAP] -> PhuongPhapDayHoc")
        print("       ├── [:THUOC_DINH_HUONG] -> DinhHuong")
        print("       │                          └── [:PHU_HOP_PHUONG_PHAP] -> PhuongPhapDayHoc")
        print("       ├── [:CO_MUC_TIEU] -> MucTieu")
        print("       └── [:CO_CHI_MUC] -> ChiMuc")
        print("   PhuongPhapDayHoc")
        print("       └── [:PHAT_TRIEN_NANG_LUC] -> NangLuc")
        print("   KyThuatDayHoc")
        print("       └── [:PHAT_TRIEN_NANG_LUC] -> NangLuc")
        
    except Exception as e:
        print(f"\n❌ Lỗi kết nối Neo4j: {e}")
        raise


if __name__ == "__main__":
    main()