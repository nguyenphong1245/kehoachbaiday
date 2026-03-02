"""
Script để import dữ liệu NLS (Năng lực số) vào Neo4j
Chạy từ thư mục backend: python scripts/import_nls_neo4j.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")


def import_nls_data():
    """Import NLS data into Neo4j"""

    print(f"Connecting to Neo4j at {NEO4J_URI}...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

    try:
        with driver.session(database=NEO4J_DATABASE) as session:
            # Check if data already exists
            result = session.run("MATCH (m:MienNangLuc) RETURN count(m) as count")
            count = result.single()["count"]

            if count > 0:
                print(f"[!] Da co {count} MienNangLuc trong database.")
                print("[*] Dang xoa du lieu NLS cu...")
                session.run("MATCH (c:ChiBao) DETACH DELETE c")
                session.run("MATCH (n:NangLucThanhPhan) DETACH DELETE n")
                session.run("MATCH (m:MienNangLuc) DETACH DELETE m")
                print("[+] Da xoa du lieu cu")

            # Import data
            print("\n[*] Dang import du lieu NLS...")

            # 1. Create MienNangLuc
            print("  -> Tao 6 Mien nang luc...")
            mien_nang_luc = [
                "1. Khai thác dữ liệu và thông tin",
                "2. Giao tiếp và Hợp tác",
                "3. Sáng tạo nội dung số",
                "4. An toàn",
                "5. Giải quyết vấn đề",
                "6. Ứng dụng trí tuệ nhân tạo"
            ]
            for name in mien_nang_luc:
                session.run("CREATE (m:MienNangLuc {name: $name})", name=name)

            # 2. Create NangLucThanhPhan with relationships
            print("  -> Tao 24 Nang luc thanh phan...")
            nang_luc_data = [
                # Miền 1
                ("1. Khai thác dữ liệu và thông tin", "1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số"),
                ("1. Khai thác dữ liệu và thông tin", "1.2. Đánh giá dữ liệu, thông tin và nội dung số"),
                ("1. Khai thác dữ liệu và thông tin", "1.3. Quản lý dữ liệu, thông tin và nội dung số"),
                # Miền 2
                ("2. Giao tiếp và Hợp tác", "2.1. Tương tác thông qua công nghệ số"),
                ("2. Giao tiếp và Hợp tác", "2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số"),
                ("2. Giao tiếp và Hợp tác", "2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân"),
                ("2. Giao tiếp và Hợp tác", "2.4. Hợp tác thông qua công nghệ số"),
                ("2. Giao tiếp và Hợp tác", "2.5. Quy tắc ứng xử trên mạng"),
                ("2. Giao tiếp và Hợp tác", "2.6. Quản lý danh tính số"),
                # Miền 3
                ("3. Sáng tạo nội dung số", "3.1 Phát triển nội dung số"),
                ("3. Sáng tạo nội dung số", "3.2. Tích hợp và tạo lập lại nội dung số"),
                ("3. Sáng tạo nội dung số", "3.3. Thực thi bản quyền và giấy phép"),
                ("3. Sáng tạo nội dung số", "3.4. Lập trình"),
                # Miền 4
                ("4. An toàn", "4.1. Bảo vệ thiết bị"),
                ("4. An toàn", "4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư"),
                ("4. An toàn", "4.3 Bảo vệ sức khỏe và an sinh số"),
                ("4. An toàn", "4.4 Bảo vệ môi trường"),
                # Miền 5
                ("5. Giải quyết vấn đề", "5.1. Giải quyết các vấn đề kỹ thuật"),
                ("5. Giải quyết vấn đề", "5.2 Xác định nhu cầu và giải pháp công nghệ"),
                ("5. Giải quyết vấn đề", "5.3 Sử dụng sáng tạo công nghệ số"),
                ("5. Giải quyết vấn đề", "5.4 Xác định các vấn đề cần cải thiện về NLS"),
                # Miền 6
                ("6. Ứng dụng trí tuệ nhân tạo", "6.1 Hiểu biết về trí tuệ nhân tạo"),
                ("6. Ứng dụng trí tuệ nhân tạo", "6.2 Sử dụng trí tuệ nhân tạo"),
                ("6. Ứng dụng trí tuệ nhân tạo", "6.3 Đánh giá trí tuệ nhân tạo"),
            ]

            for mien, nangluc in nang_luc_data:
                session.run("""
                    MATCH (m:MienNangLuc {name: $mien})
                    CREATE (n:NangLucThanhPhan {name: $nangluc})
                    CREATE (m)-[:CO_NANG_LUC]->(n)
                """, mien=mien, nangluc=nangluc)

            # 3. Create ChiBao with relationships
            print("  -> Tao 55 Chi bao...")
            chi_bao_data = [
                # 1.1
                ("1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số", "1.1.NC1a", "Đáp ứng được nhu cầu thông tin"),
                ("1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số", "1.1.NC1b", "Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số"),
                ("1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số", "1.1.NC1c", "Chỉ cho người khác cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng"),
                ("1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số", "1.1.NC1d", "Tự đề xuất được chiến lược tìm kiếm."),
                # 1.2
                ("1.2. Đánh giá dữ liệu, thông tin và nội dung số", "1.2.NC1a", "Thực hiện đánh giá được độ tin cậy và độ tin cậy của các nguồn dữ liệu, thông tin và nội dung số"),
                ("1.2. Đánh giá dữ liệu, thông tin và nội dung số", "1.2.NC1b", "Tiến hành đánh giá được các dữ liệu, thông tin và nội dung số khác nhau"),
                # 1.3
                ("1.3. Quản lý dữ liệu, thông tin và nội dung số", "1.3.NC1a", "Thao tác được thông tin, dữ liệu và nội dung để tổ chức, lưu trữ và truy xuất dễ dàng hơn"),
                ("1.3. Quản lý dữ liệu, thông tin và nội dung số", "1.3.NC1b", "Triển khai được việc tổ chức và sắp xếp dữ liệu, thông tin và nội dung trong môi trường có cấu trúc"),
                # 2.1
                ("2.1. Tương tác thông qua công nghệ số", "2.1.NC1a", "Sử dụng được nhiều công nghệ số để tương tác"),
                ("2.1. Tương tác thông qua công nghệ số", "2.1.NC1b", "Cho người khác thấy phương tiện giao tiếp số phù hợp nhất cho một bối cảnh cụ thể"),
                # 2.2
                ("2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số", "2.2.NC1a", "Chia sẻ dữ liệu, thông tin và nội dung số thông qua nhiều công cụ số phù hợp"),
                ("2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số", "2.2.NC1b", "Hướng dẫn người khác cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số"),
                ("2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số", "2.2.NC1c", "Áp dụng được nhiều phương pháp tham chiếu và ghi nguồn khác nhau"),
                # 2.3
                ("2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân", "2.3.NC1a", "Đề xuất được các dịch vụ số khác nhau để tham gia vào xã hội"),
                ("2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân", "2.3.NC1b", "Sử dụng được các công nghệ số thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân"),
                # 2.4
                ("2.4. Hợp tác thông qua công nghệ số", "2.4.NC1a", "Đề xuất được các công cụ và công nghệ số khác nhau cho các quá trình hợp tác"),
                # 2.5
                ("2.5. Quy tắc ứng xử trên mạng", "2.5.NC1a", "Áp dụng được các chuẩn mực hành vi và bí quyết khác nhau khi sử dụng công nghệ số và tương tác trong môi trường số"),
                ("2.5. Quy tắc ứng xử trên mạng", "2.5.NC1b", "Áp dụng được các chiến lược giao tiếp khác nhau trong môi trường số một cách phù hợp"),
                ("2.5. Quy tắc ứng xử trên mạng", "2.5.NC1c", "Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau để xem xét trong môi trường số"),
                # 2.6
                ("2.6. Quản lý danh tính số", "2.6.NC1a", "Sử dụng được nhiều danh tính số khác nhau"),
                ("2.6. Quản lý danh tính số", "2.6.NC1b", "Áp dụng được các cách khác nhau để bảo vệ danh tính trực tuyến của bản thân"),
                ("2.6. Quản lý danh tính số", "2.6.NC1c", "Sử dụng được dữ liệu tạo ra thông qua công cụ, môi trường và một số dịch vụ số"),
                # 3.1
                ("3.1 Phát triển nội dung số", "3.1.NC1a", "Áp dụng được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau"),
                ("3.1 Phát triển nội dung số", "3.1.NC1b", "Chỉ ra được những cách thể hiện bản thân thông qua việc tạo ra các nội dung số"),
                # 3.2
                ("3.2. Tích hợp và tạo lập lại nội dung số", "3.2.NC1a", "Làm việc với các mục nội dung và thông tin mới khác nhau, sửa đổi, tinh chỉnh, cải thiện và tích hợp chúng để tạo ra những mục mới và độc đáo"),
                # 3.3
                ("3.3. Thực thi bản quyền và giấy phép", "3.3.NC1a", "Áp dụng được các quy định khác nhau về bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số"),
                # 3.4
                ("3.4. Lập trình", "3.4.NC1a", "Tự thao tác được bằng các hướng dẫn dành cho hệ thống máy tính để giải quyết một vấn đề khác hoặc thực hiện các nhiệm vụ khác nhau"),
                # 4.1
                ("4.1. Bảo vệ thiết bị", "4.1.NC1a", "Áp dụng được các cách khác nhau để bảo vệ thiết bị và nội dung số"),
                ("4.1. Bảo vệ thiết bị", "4.1.NC1b", "Nhận thức được sự đa dạng của các rủi ro và đe dọa trong môi trường số"),
                ("4.1. Bảo vệ thiết bị", "4.1.NC1c", "Áp dụng được các biện pháp an toàn và bảo mật"),
                ("4.1. Bảo vệ thiết bị", "4.1.NC1d", "Sử dụng được các cách thức khác nhau để quan tâm đến mức độ tin cậy và quyền riêng tư"),
                # 4.2
                ("4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư", "4.2.NC1a", "Áp dụng được các cách thức khác nhau để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số"),
                ("4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư", "4.2.NC1b", "Áp dụng được các cách thức đặc thù để chia sẻ dữ liệu cá nhân một cách an toàn"),
                ("4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư", "4.2.NC1c", "Giải thích được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số"),
                # 4.3
                ("4.3 Bảo vệ sức khỏe và an sinh số", "4.3.NC1a", "Trình bày được các cách thức khác nhau để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số"),
                ("4.3 Bảo vệ sức khỏe và an sinh số", "4.3.NC1b", "Áp dụng được các cách thức khác nhau để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số"),
                ("4.3 Bảo vệ sức khỏe và an sinh số", "4.3.NC1c", "Trình bày được các công nghệ số khác nhau giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội"),
                # 4.4
                ("4.4 Bảo vệ môi trường", "4.4.NC1a", "Trình bày được các cách thức khác nhau để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số"),
                # 5.1
                ("5.1. Giải quyết các vấn đề kỹ thuật", "5.1.NC1a", "Đánh giá được các vấn đề kỹ thuật khi sử dụng môi trường số và vận hành các thiết bị số"),
                ("5.1. Giải quyết các vấn đề kỹ thuật", "5.1.NC1b", "Áp dụng được các giải pháp khác nhau cho chúng"),
                # 5.2
                ("5.2 Xác định nhu cầu và giải pháp công nghệ", "5.2.NC1a", "Đánh giá được nhu cầu cá nhân"),
                ("5.2 Xác định nhu cầu và giải pháp công nghệ", "5.2.NC1b", "Áp dụng được các công cụ số khác nhau và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó"),
                ("5.2 Xác định nhu cầu và giải pháp công nghệ", "5.2.NC1c", "Sử dụng được các cách khác nhau để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân"),
                # 5.3
                ("5.3 Sử dụng sáng tạo công nghệ số", "5.3.NC1a", "Áp dụng được các công cụ và công nghệ số khác nhau để tạo ra kiến thức cũng như các quy trình và sản phẩm đổi mới"),
                ("5.3 Sử dụng sáng tạo công nghệ số", "5.3.NC1b", "Áp dụng xử lý nhận thức của cá nhân và tập thể để giải quyết các vấn đề khái niệm và tình huống có vấn đề khác nhau trong môi trường số"),
                # 5.4
                ("5.4 Xác định các vấn đề cần cải thiện về NLS", "5.4.NC1a", "Chứng minh được NLS của tôi cần được cải thiện hoặc cập nhật ở đâu"),
                ("5.4 Xác định các vấn đề cần cải thiện về NLS", "5.4.NC1b", "Minh họa được những cách khác nhau để hỗ trợ người khác phát triển NLS của họ"),
                ("5.4 Xác định các vấn đề cần cải thiện về NLS", "5.4.NC1c", "Đề xuất được các cơ hội khác nhau để phát triển bản thân và cập nhật sự phát triển công nghệ số"),
                # 6.1
                ("6.1 Hiểu biết về trí tuệ nhân tạo", "6.1.NC1a", "Phân tích được cách AI hoạt động trong các ứng dụng cụ thể"),
                ("6.1 Hiểu biết về trí tuệ nhân tạo", "6.1.NC1b", "So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu"),
                # 6.2
                ("6.2 Sử dụng trí tuệ nhân tạo", "6.2.NC1a", "Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể"),
                ("6.2 Sử dụng trí tuệ nhân tạo", "6.2.NC1b", "Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể"),
                ("6.2 Sử dụng trí tuệ nhân tạo", "6.2.NC1c", "Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI"),
                # 6.3
                ("6.3 Đánh giá trí tuệ nhân tạo", "6.3.NC1a", "Đánh giá được độ chính xác và tin cậy của các hệ thống AI"),
                ("6.3 Đánh giá trí tuệ nhân tạo", "6.3.NC1b", "Xem xét được các kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI"),
            ]

            for nangluc, ma, noi_dung in chi_bao_data:
                session.run("""
                    MATCH (n:NangLucThanhPhan {name: $nangluc})
                    CREATE (c:ChiBao {ma: $ma, noi_dung: $noi_dung})
                    CREATE (n)-[:CO_CHI_BAO]->(c)
                """, nangluc=nangluc, ma=ma, noi_dung=noi_dung)

            # 4. Create indexes
            print("  -> Tao indexes...")
            session.run("CREATE INDEX mien_name IF NOT EXISTS FOR (m:MienNangLuc) ON (m.name)")
            session.run("CREATE INDEX nangluc_name IF NOT EXISTS FOR (n:NangLucThanhPhan) ON (n.name)")
            session.run("CREATE INDEX chibao_ma IF NOT EXISTS FOR (c:ChiBao) ON (c.ma)")

            # 5. Verify
            print("\n[*] Kiem tra ket qua:")
            result = session.run("MATCH (m:MienNangLuc) RETURN count(m) as count")
            print(f"  [+] MienNangLuc: {result.single()['count']}")

            result = session.run("MATCH (n:NangLucThanhPhan) RETURN count(n) as count")
            print(f"  [+] NangLucThanhPhan: {result.single()['count']}")

            result = session.run("MATCH (c:ChiBao) RETURN count(c) as count")
            print(f"  [+] ChiBao: {result.single()['count']}")

            print("\n[OK] Import NLS thanh cong!")

    finally:
        driver.close()


if __name__ == "__main__":
    import_nls_data()
