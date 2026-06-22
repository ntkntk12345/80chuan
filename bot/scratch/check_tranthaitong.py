import sqlite3
import json
import sys

# Reconfigure stdout for utf-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Admin\Downloads\full\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find room
cursor.execute("SELECT id, room_code, address, latitude, longitude, original_text FROM rooms WHERE address LIKE '%Trần Thái Tông%'")
rooms = cursor.fetchall()

print(f"Found {len(rooms)} rooms:")
for r in rooms:
    room_id, room_code, address, lat, lon, text = r
    print(f"\nRoom ID: {room_id}, Code: {room_code}, Address: {address}, Lat: {lat}, Lon: {lon}")
    # Get distances
    cursor.execute("SELECT landmark_name, distance FROM room_distances WHERE room_id = ? ORDER BY distance", (room_id,))
    distances = cursor.fetchall()
    print("Nearby landmarks:")
    for name, dist in distances:
        print(f"  - {name}: {dist} km")

conn.close()
