import sqlite3
import os
import json

print("=== DB SEARCH FOR ROOM CODE 119 ===")
db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, session_id, room_code, address, price, photos, text2 FROM rooms WHERE room_code LIKE '%119%' OR text2 LIKE '%119%' OR text2 LIKE '%mã 119%';")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} matching rows in database:")
        for r in rows:
            try:
                p_len = len(json.loads(r[5])) if r[5] else 0
            except:
                p_len = 0
            print(f"\nID: {r[0]}, Session ID: {r[1]}, Room Code: {r[2]}")
            print(f"  Address: {r[3]}")
            print(f"  Price: {r[4]}")
            print(f"  Photos count: {p_len}")
            print(f"  Text2: {repr(r[6][:200]) if r[6] else None}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("database.sqlite not found")
