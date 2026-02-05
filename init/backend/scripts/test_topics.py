from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

driver = GraphDatabase.driver(
    os.getenv('NEO4J_URI'), 
    auth=(os.getenv('NEO4J_USERNAME'), os.getenv('NEO4J_PASSWORD'))
)

with driver.session(database='neo4j') as session:
    # Test: Kiểm tra cấu trúc node ChuDe
    print("=== CAU TRUC NODE CHU DE ===")
    result = session.run('MATCH (cd:ChuDe) RETURN cd LIMIT 5')
    for r in result:
        print(f"  {dict(r['cd'])}")
    
    # Test: Kiểm tra relationship THUOC_CHU_DE
    print("\n=== BAI HOC VA CHU DE ===")
    result = session.run('''
        MATCH (bh:BaiHoc)-[:THUOC_CHU_DE]->(cd:ChuDe)
        RETURN bh.ten AS bai, properties(cd) AS chu_de_props
        LIMIT 5
    ''')
    for r in result:
        print(f"  Bai: {r['bai']}")
        print(f"    ChuDe props: {r['chu_de_props']}")

driver.close()
