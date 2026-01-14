"""
Sync Neo4j lessons với SQLite
- Lấy ID từ Neo4j
- Tìm file markdown tương ứng
- Lưu nội dung vào SQLite với cùng ID
"""
import os
import re
import sqlite3
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# Config
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
DB_PATH = "app.db"
MD_BASE = Path(__file__).parent / "app" / "services" / "markdown" / "data_md"


def get_neo4j_lessons():
    """Lấy tất cả bài học từ Neo4j"""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    lessons = []
    with driver.session() as session:
        result = session.run("""
            MATCH (b:BaiHoc)
            RETURN b.id as id, b.ten as ten
            ORDER BY b.id
        """)
        for r in result:
            lessons.append({'id': r['id'], 'ten': r['ten']})
    driver.close()
    return lessons


def normalize_for_match(text):
    """Chuẩn hóa text để so sánh"""
    # Bỏ dấu
    import unicodedata
    text = text.replace('Đ', 'D').replace('đ', 'd')
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Uppercase, chỉ giữ chữ và số
    text = re.sub(r'[^A-Za-z0-9]', '', text.upper())
    return text


def get_all_md_files():
    """Lấy tất cả file markdown"""
    files = {}
    for md_file in MD_BASE.rglob("*.md"):
        # Lấy tên file không có extension
        name = md_file.stem
        # Tạo key để match
        normalized = normalize_for_match(name)
        files[normalized] = {
            'path': md_file,
            'original_name': name
        }
    return files


def find_matching_md(neo4j_id, md_files):
    """Tìm file markdown khớp với neo4j_id
    Match theo: loại sách + lớp + tên bài (bỏ qua số bài)
    """
    # Parse neo4j_id: CD_10_BAI_01_TEN_BAI
    parts = neo4j_id.split('_')
    if len(parts) < 5:
        return None
    
    book = parts[0]  # CD, KNTT
    grade = parts[1]  # 10, 11, 12
    # parts[2] = BAI, parts[3] = số bài, parts[4:] = tên bài
    name_part = '_'.join(parts[4:])  # TEN_BAI
    
    # Tìm file có cùng book + grade + tên bài (bỏ qua số bài)
    normalized_name = normalize_for_match(name_part)
    
    for key, value in md_files.items():
        # Parse key (đã normalize): CD10BAI01TENBAI
        # Tìm file bắt đầu bằng book + grade
        prefix = normalize_for_match(f"{book}_{grade}_BAI_")
        if not key.startswith(prefix):
            continue
        
        # Lấy phần tên bài trong key (sau BAI_XX_)
        # Key format: CD10BAI01TENBAI
        # Cần tìm phần sau số bài
        key_name = key[len(prefix):]  # 01TENBAI
        # Bỏ 2 ký tự đầu (số bài)
        if len(key_name) > 2:
            key_name = key_name[2:]  # TENBAI
        
        # So sánh tên bài
        if key_name == normalized_name or key_name.startswith(normalized_name) or normalized_name.startswith(key_name):
            return value['path']
    
    return None


def sync_to_sqlite(lessons, md_files):
    """Sync vào SQLite"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear và recreate table
    cursor.execute("DROP TABLE IF EXISTS lesson_contents")
    cursor.execute("""
        CREATE TABLE lesson_contents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            neo4j_lesson_id VARCHAR(100) UNIQUE NOT NULL,
            lesson_name VARCHAR(255),
            content TEXT
        )
    """)
    
    matched = 0
    not_matched = []
    
    for lesson in lessons:
        neo4j_id = lesson['id']
        lesson_name = lesson['ten']
        
        # Tìm file markdown
        md_path = find_matching_md(neo4j_id, md_files)
        
        if md_path and md_path.exists():
            content = md_path.read_text(encoding='utf-8')
            cursor.execute("""
                INSERT INTO lesson_contents (neo4j_lesson_id, lesson_name, content)
                VALUES (?, ?, ?)
            """, (neo4j_id, lesson_name, content))
            matched += 1
        else:
            not_matched.append(neo4j_id)
    
    conn.commit()
    
    # Verify
    total = cursor.execute("SELECT COUNT(*) FROM lesson_contents").fetchone()[0]
    conn.close()
    
    return matched, not_matched, total


def main():
    print("=" * 60)
    print("SYNC NEO4J → SQLITE")
    print("=" * 60)
    
    # 1. Lấy lessons từ Neo4j
    print("\n1. Đọc bài học từ Neo4j...")
    lessons = get_neo4j_lessons()
    print(f"   → {len(lessons)} bài học")
    
    # 2. Lấy tất cả file markdown
    print("\n2. Đọc file markdown...")
    md_files = get_all_md_files()
    print(f"   → {len(md_files)} files")
    
    # 3. Sync
    print("\n3. Sync vào SQLite...")
    matched, not_matched, total = sync_to_sqlite(lessons, md_files)
    
    print(f"\n" + "=" * 60)
    print("KẾT QUẢ:")
    print("=" * 60)
    print(f"Neo4j lessons: {len(lessons)}")
    print(f"Markdown files: {len(md_files)}")
    print(f"Matched & saved to SQLite: {matched}")
    print(f"Not matched: {len(not_matched)}")
    
    if not_matched:
        print(f"\n--- Không tìm thấy markdown ({len(not_matched)}) ---")
        for id in not_matched:
            print(f"  {id}")
    
    print(f"\n✅ SQLite: {total} records trong lesson_contents")


if __name__ == "__main__":
    main()
