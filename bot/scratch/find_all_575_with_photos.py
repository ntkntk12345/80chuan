import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, room_code, address, price, room_type, photos, text2 FROM rooms WHERE address LIKE '%575%' AND address LIKE '%Kim Mã%';")
rows = c.fetchall()

print(f"Found {len(rows)} rooms matching 575 and Kim Mã:")
for row in rows:
    p_len = len(json.loads(row[5])) if row[5] else 0
    print(f"ID: {row[0]}, Code: {row[1]}, Address: {row[2]}, Price: {row[3]}, Type: {row[4]}, Photos: {p_len}")
    print(f"Text2 preview: {repr(row[6][:120]) if row[6] else None}")
    print("-" * 60)

conn.close()
