import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

ids = [5669, 4966, 5414, 5415, 5417, 5759, 5760]

for id_val in ids:
    c.execute("SELECT id, room_code, address, price, room_type, photos, text2 FROM rooms WHERE id = ?", (id_val,))
    row = c.fetchone()
    if row:
        p_len = len(json.loads(row[5])) if row[5] else 0
        print(f"ID: {row[0]}")
        print(f"  Room Code: {row[1]}")
        print(f"  Address: {row[2]}")
        print(f"  Price: {row[3]}")
        print(f"  Room Type: {row[4]}")
        print(f"  Photos count: {p_len}")
        print(f"  Text2:\n{row[6]}")
        if p_len > 0:
            print(f"  First photo URL: {json.loads(row[5])[0]['url']}")
        print("-" * 60)

conn.close()
