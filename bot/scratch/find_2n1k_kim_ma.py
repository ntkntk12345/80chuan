import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Query all rooms with Kim Mã in address and 2n1k in room_type/text
query = """
SELECT id, room_code, address, price, room_type, photos, text2 
FROM rooms 
WHERE address LIKE '%Kim Mã%' 
  AND (room_type LIKE '%2n1k%' OR text2 LIKE '%2n1k%' OR text2 LIKE '%2 ngủ%')
  AND photos IS NOT NULL 
  AND json_array_length(photos) > 0;
"""
c.execute(query)
rows = c.fetchall()

print(f"Found {len(rows)} 2N1K rooms in Kim Mã with photos:")
for r in rows:
    p_len = len(json.loads(r[5]))
    print(f"ID: {r[0]} | Code: {r[1]} | Price: {r[3]} | Photos: {p_len}")
    print(f"  Address: {r[2]}")
    text_snippet = r[6].replace('\n', ' ') if r[6] else ''
    print(f"  Text: {text_snippet[:150]}...")
    print("-" * 80)

conn.close()
