import sqlite3
import json
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, session_id, room_code, address, price, photos, videos FROM rooms WHERE room_code LIKE '%P701%' OR room_code LIKE '%P404%' OR address LIKE '%Nguyên Xá%'")
    rows = cursor.fetchall()
    print("Found", len(rows), "matching rooms:")
    for row in rows:
        print("--- Room ---")
        print("ID:", row["id"])
        print("Session ID:", row["session_id"])
        print("Room Code:", row["room_code"])
        print("Address:", row["address"])
        print("Price:", row["price"])
        print("Photos Type:", type(row["photos"]))
        print("Photos Content:", row["photos"])
        print("Videos Content:", row["videos"])
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
