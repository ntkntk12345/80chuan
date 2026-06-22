import sqlite3
import os
import json
import re

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

def clean_address(addr):
    if not addr:
        return ""
    # Convert to lowercase and strip whitespace
    addr = addr.lower().strip()
    # Normalize some common abbreviations
    addr = addr.replace("ngách", "ngõ").replace("hẻm", "ngõ").replace("số", "")
    return addr

def extract_base_address(addr):
    # Try to extract the main street/alley name (e.g. "575 Kim Mã" from "Ngõ 575/18 Kim Mã")
    if not addr:
        return ""
    addr = addr.lower()
    # Match pattern like "ngõ X/Y tên_phố" or "ngõ X tên_phố" or "số X ngõ Y tên_phố"
    # Let's simplify: replace specific sub-alleys "/Y" with empty space
    addr_clean = re.sub(r'/\d+', '', addr)
    addr_clean = re.sub(r'ngõ\s+\d+/\d+', 'ngõ', addr_clean)
    addr_clean = re.sub(r'ngách\s+\d+/\d+', 'ngõ', addr_clean)
    
    # Remove house numbers at the beginning
    addr_clean = re.sub(r'^\d+\s+', '', addr_clean)
    addr_clean = re.sub(r'^số\s+\d+\s+', '', addr_clean)
    
    # Clean up whitespace
    addr_clean = re.sub(r'\s+', ' ', addr_clean).strip()
    return addr_clean

print("=== SCANNIG DB FOR ROOMS WITH EMPTY PHOTOS ===")
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Query all approved rooms
        cursor.execute("SELECT id, session_id, room_code, address, photos, price, room_type FROM rooms WHERE status = 'approved';")
        all_rooms = cursor.fetchall()
        
        empty_rooms = []
        filled_rooms = []
        
        for r in all_rooms:
            rid, session_id, room_code, address, photos_str, price, room_type = r
            try:
                photos = json.loads(photos_str) if photos_str else []
            except Exception:
                photos = []
            
            if not photos:
                empty_rooms.append({
                    'id': rid,
                    'session_id': session_id,
                    'room_code': room_code,
                    'address': address,
                    'price': price,
                    'room_type': room_type
                })
            else:
                filled_rooms.append({
                    'id': rid,
                    'session_id': session_id,
                    'room_code': room_code,
                    'address': address,
                    'photos': photos,
                    'price': price,
                    'room_type': room_type
                })
                
        print(f"Total rooms: {len(all_rooms)}")
        print(f"Rooms with photos: {len(filled_rooms)}")
        print(f"Rooms without photos (Ảnh đang cập nhật): {len(empty_rooms)}")
        
        print("\nListing first 20 rooms without photos:")
        for r in empty_rooms[:20]:
            print(f"ID: {r['id']}, Code: {r['room_code']}, Price: {r['price']}, Address: {r['address']}")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("database.sqlite not found")
