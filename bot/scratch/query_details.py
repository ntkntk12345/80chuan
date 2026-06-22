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
cursor.execute("SELECT id, price, price1, price2, text2, text1 FROM rooms WHERE id IN (279, 280)")
for row in cursor.fetchall():
    print(f"ID: {row[0]}")
    print(f"  Price: {row[1]}")
    print(f"  Price1: {row[2]}, Price2: {row[3]}")
    print(f"  Text1: {row[5]}")
    print(f"  Text2: {row[4]}")
    print("-" * 50)
conn.close()
