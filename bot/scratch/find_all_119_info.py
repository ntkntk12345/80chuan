import sqlite3
import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# We look for room_code = '119' or containing '119' where photos is not empty/null
query = """
SELECT id, session_id, room_code, address, price, photos, text2 
FROM rooms 
WHERE (room_code = '119' OR text2 LIKE '%mã 119%')
  AND photos IS NOT NULL 
  AND json_array_length(photos) > 0;
"""
cursor.execute(query)
rows = cursor.fetchall()
print(f"Total matching rooms with photos: {len(rows)}")

for r in rows:
    p_list = json.loads(r[5])
    print(f"ID: {r[0]} | Session: {r[1]} | Code: {r[2]} | Price: {r[4]} | Photos: {len(p_list)}")
    print(f"  Address: {r[3]}")
    text_snippet = r[6].replace('\n', ' ') if r[6] else ''
    print(f"  Text: {text_snippet[:150]}...")
    print("-" * 80)

conn.close()
