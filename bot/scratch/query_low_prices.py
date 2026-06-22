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
cursor.execute('SELECT id, session_id, price, price1, price2, address FROM rooms WHERE price1 > 0 AND price1 < 1000000 LIMIT 20')
rows = cursor.fetchall()
print(f"Total rooms under 1M: {len(rows)}")
for row in rows:
    print(f"ID: {row[0]}, Session: {row[1]}, Price: {row[2]}, Price1: {row[3]}, Price2: {row[4]}, Addr: {row[5]}")
conn.close()
