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

# Search broad price match
cursor.execute("SELECT id, price, price1, price2, address, category, room_type FROM rooms WHERE price LIKE '%70%' OR price1 IN (70, 7000, 70000, 700000, 7000000, 70000000)")
rows = cursor.fetchall()
print(f"Found {len(rows)} rooms:")
for row in rows:
    print(f"ID: {row[0]}, Price: '{row[1]}' (p1={row[2]}, p2={row[3]}), Addr: {row[4]}, Cat: {row[5]}, Type: {row[6]}")

conn.close()
