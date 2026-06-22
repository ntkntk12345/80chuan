import sqlite3
import sys

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r'c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Search for Xuân Thủy listings
cursor.execute("SELECT id, price, price1, price2, address, text2, text1, category FROM rooms WHERE address LIKE '%Xuân Thủy%' OR address LIKE '%Xuan Thuy%' OR price1 = 70000000 OR price = '70 triệu/tháng' LIMIT 5")
rows = cursor.fetchall()
print(f"Found {len(rows)} matching rooms:")
for row in rows:
    print(f"ID: {row[0]}")
    print(f"  Price: {row[1]} (p1={row[2]}, p2={row[3]})")
    print(f"  Address: {row[4]}")
    print(f"  Category: {row[7]}")
    print(f"  Text2: {row[5]}")
    print(f"  Text1: {row[6]}")
    print("-" * 50)

conn.close()
