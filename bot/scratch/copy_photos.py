import sqlite3
import os

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

print("=== COPYING PHOTOS FOR P701/P404 NGUYEN XA ===")
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Fetch photos from source room (ID: 2962)
        cursor.execute("SELECT photos, videos FROM rooms WHERE id = 2962;")
        row = cursor.fetchone()
        if not row:
            print("Source room ID 2962 not found!")
            conn.close()
            exit(1)
            
        src_photos = row[0]
        src_videos = row[1]
        print(f"Source photos count: {len(eval(src_photos)) if src_photos else 0}")
        
        # 2. Update target room (ID: 5747)
        cursor.execute("UPDATE rooms SET photos = ?, videos = ? WHERE id = 5747;", (src_photos, src_videos))
        conn.commit()
        print("Updated room ID 5747 photos successfully!")
        
        # 3. Verify target room update
        cursor.execute("SELECT id, session_id, room_code, address, photos, videos FROM rooms WHERE id = 5747;")
        updated_row = cursor.fetchone()
        print("\nVerified target room:")
        print(f"  ID: {updated_row[0]}")
        print(f"  Session ID: {updated_row[1]}")
        print(f"  Room Code: {updated_row[2]}")
        print(f"  Address: {updated_row[3]}")
        print(f"  Photos count: {len(eval(updated_row[4])) if updated_row[4] else 0}")
        print(f"  Photos: {updated_row[4][:300]}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("database.sqlite not found")
