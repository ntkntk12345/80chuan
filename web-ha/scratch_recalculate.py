import sys
import os

# Add bot path
bot_dir = os.path.join(os.path.dirname(__file__), '..', 'bot')
sys.path.append(os.path.abspath(bot_dir))

from map1 import geocode_address_esri, is_default_hanoi, haversine_distance, load_locations, clean_address_progressively
import sqlite3

def recalculate_all():
    db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite')
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, address, room_code FROM rooms WHERE address IS NOT NULL")
    rooms = cursor.fetchall()
    
    print(f"Bắt đầu tính toán lại vị trí cho {len(rooms)} phòng...")
    
    landmarks = load_locations()
    
    success = 0
    errors = 0

    for room in rooms:
        r_id = room['id']
        address = room['address']
        
        try:
            # Geocode
            geo = geocode_address_esri(address)
            lat, lon = None, None
            if geo:
                lat, lon, _ = geo
            
            if lat is None or lon is None or is_default_hanoi(lat, lon):
                print(f"[{r_id}] Lỗi định vị hoặc ra tọa độ mặc định: {address}")
                # Fallback to district centroid
                continue # Let's just skip updating if it fails completely
                
            # Update lat, lon
            cursor.execute("UPDATE rooms SET latitude = ?, longitude = ? WHERE id = ?", (lat, lon, r_id))
            
            # Delete old distances
            cursor.execute("DELETE FROM room_distances WHERE room_id = ?", (r_id,))
            
            # Calculate new distances
            distances = []
            for loc in landmarks:
                l_lat, l_lon = float(loc['lat']), float(loc['lon'])
                dist = haversine_distance(lat, lon, l_lat, l_lon)
                distances.append((dist, loc))
                
            distances.sort(key=lambda x: x[0])
            nearby = [d for d in distances if d[0] <= 5.0]
            if not nearby and distances:
                nearby = [distances[0]]
                
            for dist, loc in nearby:
                cursor.execute(
                    "INSERT INTO room_distances (room_id, landmark_name, landmark_category, distance) VALUES (?, ?, ?, ?)",
                    (r_id, loc.get('name', ''), loc.get('category', 'unknown'), dist)
                )
            
            conn.commit()
            print(f"[{r_id}] OK: {address} -> {lat}, {lon}")
            success += 1
            
        except Exception as e:
            print(f"[{r_id}] Error: {e}")
            errors += 1

    print(f"Xong! Thành công: {success}, Lỗi: {errors}")
    conn.close()

if __name__ == "__main__":
    recalculate_all()
