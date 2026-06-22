import sqlite3
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Admin\Downloads\full\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, room_code, address, latitude, longitude, district FROM rooms")
rooms = cursor.fetchall()

print(f"Total rooms in database: {len(rooms)}")
for r in rooms:
    room_id, room_code, address, lat, lon, district = r
    print(f"\n[{district.upper()}] Room ID: {room_id} | Code: {room_code} | Address: {address}")
    print(f"Coordinates: {lat}, {lon}")
    
    # Get distances
    cursor.execute("SELECT landmark_name, distance FROM room_distances WHERE room_id = ? ORDER BY distance", (room_id,))
    distances = cursor.fetchall()
    print("Nearby landmarks:")
    for name, dist in distances:
        # Format dist: if < 1km print as m, else as km
        if dist < 1.0:
            dist_str = f"{int(dist * 1000)}m"
        else:
            dist_str = f"{dist} km"
        print(f"  - {name}: {dist_str}")

conn.close()
