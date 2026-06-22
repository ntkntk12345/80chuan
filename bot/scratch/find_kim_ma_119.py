import sqlite3
import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get column names
cursor.execute("PRAGMA table_info(rooms)")
cols = [c[1] for c in cursor.fetchall()]
print("Columns in 'rooms':", cols)

print("\n--- Rows with room_code 119 or address containing Kim Ma ---")
cursor.execute("SELECT id, room_code, address, price, photos, text2, session_id FROM rooms WHERE room_code = '119' OR address LIKE '%Kim Mã%';")
rows = cursor.fetchall()
for row in rows:
    r_dict = dict(zip(["id", "room_code", "address", "price", "photos", "text2", "session_id"], row))
    print(f"ID: {r_dict['id']}")
    print(f"  Room Code: {r_dict['room_code']}")
    print(f"  Address: {r_dict['address']}")
    print(f"  Price: {r_dict['price']}")
    try:
        p_list = json.loads(r_dict['photos'])
        print(f"  Photos count: {len(p_list)}")
    except Exception as e:
        print(f"  Photos (raw): {r_dict['photos']}")
    print(f"  Text2: {repr(r_dict['text2'][:100]) if r_dict['text2'] else None}")
    print(f"  Session ID: {r_dict['session_id']}")
    print("-" * 50)

conn.close()
