import sqlite3
import os

print("=== DB SEARCH FOR NGUYEN XA ===")
db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, session_id, room_code, address, photos, videos FROM rooms WHERE address LIKE '%Nguyên Xá%' OR text2 LIKE '%Nguyên Xá%';")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} matching rows in database:")
        for r in rows:
            print(f"\nID: {r[0]}, Session ID: {r[1]}, Room Code: {r[2]}")
            print(f"  Address: {r[3]}")
            print(f"  Photos count: {len(eval(r[4])) if r[4] else 0}")
            print(f"  Photos: {r[4][:300]}")
            print(f"  Videos: {r[5][:300] if r[5] else None}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("database.sqlite not found")
