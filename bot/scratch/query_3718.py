import sqlite3
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r'c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, price, price1, price2, address, text2, text1, category, room_type FROM rooms WHERE id = 3718")
row = cursor.fetchone()
if row:
    print(f"ID: {row[0]}")
    print(f"  Price: {row[1]} (p1={row[2]}, p2={row[3]})")
    print(f"  Address: {row[4]}")
    print(f"  Category: {row[7]}")
    print(f"  Type: {row[8]}")
    print(f"  Text2:\n{row[5]}")
    print("-" * 50)
    print(f"  Text1:\n{row[6]}")
else:
    print("Room not found")

conn.close()
