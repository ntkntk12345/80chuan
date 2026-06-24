import os
import json
import math
import sqlite3
import urllib.request
import urllib.parse
import sys

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(SCRIPT_DIR, 'distance_app', 'locations_db.json')
DEFAULT_DB_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'web-ha', 'database.sqlite'))

def load_locations():
    if not os.path.exists(DATABASE_PATH):
        print(f"[MAP1] Cảnh báo: Không tìm thấy tệp landmarks tại {DATABASE_PATH}")
        return []
    try:
        with open(DATABASE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[MAP1] Lỗi đọc landmarks: {e}")
        return []

import unicodedata

def remove_accents(input_str):
    if not input_str:
        return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    only_ascii = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    return only_ascii.replace('đ', 'd').replace('Đ', 'D')

def check_known_landmarks(address):
    if not address:
        return None
    address_lower = address.lower().strip()
    
    # Special override for Hoàng Quốc Việt street to place it at its precise location
    if "hoàng quốc việt" in address_lower or "hoang quoc viet" in remove_accents(address_lower):
        print(f"[MAP1] [SPECIAL OVERRIDE] '{address}' on Hoàng Quốc Việt street -> geocoding to optimized coordinates")
        return 21.0483230, 105.7867828, "Đại học Điện lực"
        
    # Special override for Yên Nghĩa, Hà Đông to place it near Đại học Phenikaa
    if "yên nghĩa" in address_lower or "yen nghia" in remove_accents(address_lower):
        print(f"[MAP1] [SPECIAL OVERRIDE] '{address}' in Yên Nghĩa -> geocoding near Đại học Phenikaa")
        return 20.959502, 105.747841, "Đại học Phenikaa"
        
    landmarks = load_locations()
    if not landmarks:
        return None
        
    for loc in landmarks:
        name = loc.get("name")
        if not name:
            continue
        name_lower = name.lower()
        
        # Build candidate patterns to check
        candidates = [name_lower]
        
        if "đại học" in name_lower:
            candidates.append(name_lower.replace("đại học", "đh"))
            rem = name_lower.replace("đại học", "").strip()
            if rem != "hà nội":
                candidates.append(rem)
        if "trường đại học" in name_lower:
            candidates.append(name_lower.replace("trường đại học", "đh"))
            rem = name_lower.replace("trường đại học", "").strip()
            if rem != "hà nội":
                candidates.append(rem)
        if "hà nội" in name_lower:
            candidates.append(name_lower.replace("hà nội", "hn"))
        if name_lower == "đại học hà nội":
            candidates.extend(["hanu", "đh hà nội", "đh hn"])
        if name_lower == "đại học bách khoa hà nội":
            candidates.extend(["bách khoa", "bkhn", "hust"])
        if "vincom mega mall" in name_lower:
            candidates.append(name_lower.replace("vincom mega mall", "vincom"))
        if "aeon mall" in name_lower:
            candidates.append(name_lower.replace("aeon mall", "aeon"))
            
        clean_candidates = []
        for c in candidates:
            c_clean = c.strip()
            if len(c_clean) > 2:
                clean_candidates.append(c_clean)
                
        # Sort by length descending
        clean_candidates.sort(key=len, reverse=True)
        
        for cand in clean_candidates:
            if cand in address_lower or remove_accents(cand) in remove_accents(address_lower):
                print(f"[MAP1] [LOCAL MATCH] '{address}' matched landmark '{name}' (via '{cand}')")
                return float(loc["lat"]), float(loc["lon"]), name
                
    return None

district_centroids = {
    'Cầu Giấy': { 'lat': 21.0362, 'lon': 105.7905 },
    'Đống Đa': { 'lat': 21.0180, 'lon': 105.8299 },
    'Hai Bà Trưng': { 'lat': 21.0074, 'lon': 105.8525 },
    'Ba Đình': { 'lat': 21.0370, 'lon': 105.8153 },
    'Hoàn Kiếm': { 'lat': 21.0285, 'lon': 105.8523 },
    'Tây Hồ': { 'lat': 21.0717, 'lon': 105.8130 },
    'Thanh Xuân': { 'lat': 20.9937, 'lon': 105.8122 },
    'Hoàng Mai': { 'lat': 20.9781, 'lon': 105.8501 },
    'Long Biên': { 'lat': 21.0377, 'lon': 105.8920 },
    'Hà Đông': { 'lat': 20.9686, 'lon': 105.7748 },
    'Nam Từ Liêm': { 'lat': 21.0135, 'lon': 105.7650 },
    'Bắc Từ Liêm': { 'lat': 21.0694, 'lon': 105.7599 },
    'Thanh Trì': { 'lat': 20.9529, 'lon': 105.8458 },
    'Gia Lâm': { 'lat': 21.0248, 'lon': 105.9396 },
    'Đông Anh': { 'lat': 21.1444, 'lon': 105.8494 },
    'Sóc Sơn': { 'lat': 21.2586, 'lon': 105.8159 },
    'Mê Linh': { 'lat': 21.1837, 'lon': 105.7275 },
    'Chương Mỹ': { 'lat': 20.8752, 'lon': 105.6560 },
    'Thạch Thất': { 'lat': 21.0163, 'lon': 105.5786 },
    'Quốc Oai': { 'lat': 20.9918, 'lon': 105.6429 },
    'Thanh Oai': { 'lat': 20.8732, 'lon': 105.7830 },
    'Thường Tín': { 'lat': 20.8728, 'lon': 105.8576 },
    'Phú Xuyên': { 'lat': 20.7301, 'lon': 105.9001 },
    'Ứng Hòa': { 'lat': 20.7397, 'lon': 105.7820 },
    'Mỹ Đức': { 'lat': 20.7042, 'lon': 105.7335 },
    'Ba Vì': { 'lat': 21.1712, 'lon': 105.4013 },
    'Phúc Thọ': { 'lat': 21.1071, 'lon': 105.5906 },
    'Đan Phượng': { 'lat': 21.1070, 'lon': 105.6791 },
    'Hoài Đức': { 'lat': 21.0204, 'lon': 105.7022 },
    'Sơn Tây': { 'lat': 21.1348, 'lon': 105.5036 }
}

import re

def clean_address_progressively(address):
    if not address:
        return ""
    clean = address
    # 1. Remove text inside parentheses (both standard and full-width)
    clean = re.sub(r'\([^)]*\)', '', clean)
    clean = re.sub(r'（[^）]*）', '', clean)
    # 2. Strip after "-" or "," since they often separate district and street, confusing ESRI
    clean = re.sub(r'\s*-\s*.*', '', clean)
    clean = re.sub(r',.*', '', clean)
    # 3. Simplify nested slashes (e.g. 322/95/1 -> 322)
    clean = re.sub(r'\b(\d+\w*)(?:/\d+\w*)+\b', r'\1', clean)
    # 4. Remove duplicate whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def is_default_hanoi(lat, lon):
    if lat is None or lon is None:
        return False
    diff1 = abs(lat - 21.028279) + abs(lon - 105.853881)
    diff2 = abs(lat - 21.033333) + abs(lon - 105.850000)
    return (diff1 < 0.005 or diff2 < 0.005)

def geocode_address_esri(address):
    """
    Geocodes an address string using Esri Public Geocoding API,
    optimized specifically for Hanoi, Vietnam.
    """
    # Check if address contains a known landmark locally first
    local_match = check_known_landmarks(address)
    if local_match:
        return local_match

    search_query = address
    if "hà nội" not in search_query.lower() and "ha noi" not in search_query.lower():
        search_query += ", Hà Nội, Việt Nam"
        
    encoded_query = urllib.parse.quote(search_query)
    url = (
        f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?"
        f"f=json&singleLine={encoded_query}&maxLocations=1"
        f"&location=105.8542,21.0285&distance=50000"
    )
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    )
    
    result = None
    try:
        import ssl
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=8, context=context) as response:
            data = json.loads(response.read().decode())
            candidates = data.get('candidates', [])
            if candidates:
                candidate = candidates[0]
                addr_name = candidate.get('address', '')
                loc = candidate.get('location', {})
                result = (float(loc.get('y')), float(loc.get('x')), addr_name)
    except Exception as e:
        print(f"[MAP1] Lỗi kết nối API định vị cho '{address}': {e}")

    # Check if we got default Hanoi coordinates or a generic district match
    is_generic = False
    if result:
        has_digits = bool(re.search(r'\d', address))
        res_has_digits = bool(re.search(r'\d', result[2]))
        if has_digits and not res_has_digits:
            is_generic = True

    if result and (is_default_hanoi(result[0], result[1]) or is_generic):
        print(f"[MAP1] Geocoded '{address}' returned generic/default coordinates ({result[0]}, {result[1]}). Attempting progressive cleaning...")
        cleaned_address = clean_address_progressively(address)
        print(f"[MAP1] Cleaned address: '{cleaned_address}'")
        
        if cleaned_address and cleaned_address != address:
            retry_query = cleaned_address
            if "hà nội" not in retry_query.lower() and "ha noi" not in retry_query.lower():
                retry_query += ", Hà Nội, Việt Nam"
            encoded_retry = urllib.parse.quote(retry_query)
            retry_url = (
                f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?"
                f"f=json&singleLine={encoded_retry}&maxLocations=1"
                f"&location=105.8542,21.0285&distance=50000"
            )
            req_retry = urllib.request.Request(
                retry_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            )
            try:
                with urllib.request.urlopen(req_retry, timeout=8, context=context) as response:
                    data = json.loads(response.read().decode())
                    candidates = data.get('candidates', [])
                    if candidates:
                        candidate = candidates[0]
                        addr_name = candidate.get('address', '')
                        loc = candidate.get('location', {})
                        retry_result = (float(loc.get('y')), float(loc.get('x')), addr_name)
                        
                        if not is_default_hanoi(retry_result[0], retry_result[1]):
                            print(f"[MAP1] Định vị thành công địa chỉ đã làm sạch '{cleaned_address}' -> {retry_result[0]}, {retry_result[1]}")
                            return retry_result
                        else:
                            print(f"[MAP1] Địa chỉ đã làm sạch định vị cũng ra tọa độ mặc định Hà Nội.")
            except Exception as e:
                print(f"[MAP1] Lỗi kết nối API định vị cho địa chỉ đã làm sạch '{cleaned_address}': {e}")
                
    return result

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points in kilometers.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
        
    R = 6371.0  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)

def init_db(db_path=DEFAULT_DB_PATH):
    """Initializes sqlite database and tables if they do not exist."""
    print(f"[MAP1] Khởi tạo database tại: {db_path}")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create rooms table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        room_code TEXT,
        address TEXT,
        price TEXT,
        price1 INTEGER,
        price2 INTEGER,
        room_type TEXT,
        district TEXT,
        latitude REAL,
        longitude REAL,
        text1 TEXT,
        text2 TEXT,
        photos TEXT, -- JSON string array
        videos TEXT,  -- JSON string array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        timestamp REAL,
        category TEXT DEFAULT 'phong-tro'
    )
    """)
    
    # Safe migration: Add text1 column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN text1 TEXT")
    except Exception:
        pass

    # Safe migration: Add timestamp column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN timestamp REAL")
    except Exception:
        pass

    # Safe migration: Add category column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN category TEXT DEFAULT 'phong-tro'")
    except Exception:
        pass
    
    # Create room_distances table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS room_distances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        landmark_name TEXT,
        landmark_category TEXT,
        distance REAL,
        FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
    )
    """)
    
    # Create index to optimize search
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_session_code ON rooms(session_id, room_code)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_room_distances_room ON room_distances(room_id)")
    
    conn.commit()
    conn.close()

def determine_category(text2):
    if not text2:
        return 'phong-tro'
    text_lower = text2.strip().lower()
    if text_lower.startswith('{'):
        try:
            parsed = json.loads(text_lower)
            if parsed and 'category' in parsed:
                return parsed['category']
        except Exception:
            pass
            
    if 'mặt bằng' in text_lower or 'mbkd' in text_lower or 'kinh doanh' in text_lower or 'cửa hàng' in text_lower:
        return 'mat-bang-kinh-doanh'
    elif 'nhà nguyên căn' in text_lower or 'nhà riêng' in text_lower:
        return 'nha-nguyen-can'
    elif 'chdv' in text_lower or 'căn hộ dịch vụ' in text_lower or 'studio' in text_lower or 'căn hộ mini' in text_lower or 'chung cư mini' in text_lower:
        return 'can-ho-dich-vu'
    elif ('chung cư' in text_lower or 'căn hộ' in text_lower or 'masteri' in text_lower or 'waterfront' in text_lower or 'vinhomes' in text_lower) and \
         'gác xép' not in text_lower and 'phòng trọ' not in text_lower and 'nhà trọ' not in text_lower and \
         'gần chung cư' not in text_lower and 'cạnh chung cư' not in text_lower and 'sau chung cư' not in text_lower and 'đối diện chung cư' not in text_lower:
        return 'chung-cu'
    return 'phong-tro'

def save_room_to_sqlite(room_data, session_info, district_name, db_path=DEFAULT_DB_PATH):
    """
    Saves or updates a room record, calculates landmark distances and saves them.
    """
    session_id = room_data.get("session_id")
    room_code = room_data.get("id") # this is the room code e.g. P301, P201
    address = room_data.get("address")
    price = room_data.get("price")
    
    price1 = int(room_data.get("price1", 0)) if room_data.get("price1") else 0
    price2 = int(room_data.get("price2", 0)) if room_data.get("price2") else 0
    room_type = room_data.get("type")
    
    if not session_id or not address:
        print(f"[MAP1] Bỏ qua phòng thiếu session_id hoặc address: {room_data}")
        return False
        
    # Get session details from session_info with multiple fallback keys
    text1 = ""
    text2 = ""
    if session_info:
        text1 = session_info.get("text1") or ""
        text2 = session_info.get("text2") or ""
        if not text1 and not text2:
            # Fallback for older sessions with only text2/original_text/text
            text2 = (
                session_info.get("text2") or 
                session_info.get("original_text") or 
                session_info.get("text") or 
                ""
            )
            
    photos = session_info.get("photos", []) if session_info else []
    videos = session_info.get("videos", []) if session_info else []
    
    photos_json = json.dumps(photos, ensure_ascii=False)
    videos_json = json.dumps(videos, ensure_ascii=False)
    
    # Extract timestamp from session_info
    timestamp = None
    if session_info:
        timestamp = session_info.get("timestamp")
        if not timestamp and "texts" in session_info and session_info["texts"]:
            timestamp = session_info["texts"][0].get("timestamp")
        if not timestamp and "photos" in session_info and session_info["photos"]:
            timestamp = session_info["photos"][0].get("timestamp")
        if not timestamp and "videos" in session_info and session_info["videos"]:
            timestamp = session_info["videos"][0].get("timestamp")

    # Format created_at in Vietnam Time (UTC+7)
    from datetime import datetime, timezone, timedelta
    tz_vn = timezone(timedelta(hours=7))
    if timestamp:
        try:
            dt_vn = datetime.fromtimestamp(float(timestamp), tz=timezone.utc).astimezone(tz_vn)
            created_at_str = dt_vn.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            dt_vn = datetime.now(tz=tz_vn)
            created_at_str = dt_vn.strftime("%Y-%m-%d %H:%M:%S")
    else:
        dt_vn = datetime.now(tz=tz_vn)
        created_at_str = dt_vn.strftime("%Y-%m-%d %H:%M:%S")
    
    category = room_data.get("category") or determine_category(text2)

    # Geocode address
    geo = geocode_address_esri(address)
    lat, lon = None, None
    if geo:
        lat, lon, full_addr = geo

    # Check if we need centroid fallback (either geocoding failed or returned default Hanoi coords)
    if lat is None or lon is None or is_default_hanoi(lat, lon):
        fallback = district_centroids.get(district_name)
        if fallback:
            lat = fallback['lat']
            lon = fallback['lon']
            print(f"  [GEOCODE] Định vị thất bại hoặc trả về mặc định cho '{address}'. Sử dụng tọa độ trung tâm quận '{district_name}' -> {lat}, {lon}")
        else:
            print(f"  [GEOCODE] Định vị thất bại cho '{address}' và không tìm thấy tọa độ trung tâm quận '{district_name}'")
    else:
        print(f"  [GEOCODE] Đã định vị thành công '{address}' -> {lat}, {lon}")

    # Connect to DB
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if room already exists based on text2 (matching 100% identical, non-empty text2)
        row = None
        if text2 and text2.strip():
            cursor.execute("SELECT id FROM rooms WHERE text2 = ?", (text2,))
            row = cursor.fetchone()
            if row:
                room_id = row[0]
                # Update existing room and also update session_id and room_code since it matched by text2
                cursor.execute("""
                    UPDATE rooms 
                    SET session_id = ?, room_code = ?, address = ?, price = ?, price1 = ?, price2 = ?, room_type = ?, district = ?, latitude = ?, longitude = ?,
                        text1 = ?, text2 = ?, photos = ?, videos = ?, timestamp = ?, created_at = ?, category = ?
                    WHERE id = ?
                """, (session_id, room_code, address, price, price1, price2, room_type, district_name, lat, lon, text1, text2, photos_json, videos_json, timestamp, created_at_str, category, room_id))
                print(f"  [SQLITE] Đã phát hiện phòng trùng text2 100% (ID: {room_id}). Đã cập nhật thông tin.")

        # If not found by text2, check by session_id and room_code as fallback
        if not row:
            chk_code = room_code if room_code else ""
            cursor.execute("""
                SELECT id FROM rooms 
                WHERE session_id = ? AND COALESCE(room_code, '') = ?
            """, (session_id, chk_code))
            
            row = cursor.fetchone()
            if row:
                room_id = row[0]
                # Update existing room
                cursor.execute("""
                    UPDATE rooms 
                    SET address = ?, price = ?, price1 = ?, price2 = ?, room_type = ?, district = ?, latitude = ?, longitude = ?,
                        text1 = ?, text2 = ?, photos = ?, videos = ?, timestamp = ?, created_at = ?, category = ?
                    WHERE id = ?
                """, (address, price, price1, price2, room_type, district_name, lat, lon, text1, text2, photos_json, videos_json, timestamp, created_at_str, category, room_id))
                print(f"  [SQLITE] Đã cập nhật phòng ID {room_id} (Session: {session_id}, Mã phòng: {room_code})")
            else:
                # Insert new room
                cursor.execute("""
                    INSERT INTO rooms (session_id, room_code, address, price, price1, price2, room_type, district, latitude, longitude, text1, text2, photos, videos, timestamp, created_at, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (session_id, room_code, address, price, price1, price2, room_type, district_name, lat, lon, text1, text2, photos_json, videos_json, timestamp, created_at_str, category))
                room_id = cursor.lastrowid
                print(f"  [SQLITE] Đã thêm phòng mới ID {room_id} (Session: {session_id}, Mã phòng: {room_code})")
            
        # Clean up old distances for this room
        cursor.execute("DELETE FROM room_distances WHERE room_id = ?", (room_id,))
        
        # Calculate distances if coordinates are available
        if lat is not None and lon is not None:
            landmarks = load_locations()
            if landmarks:
                distances = []
                for loc in landmarks:
                    l_lat = loc.get("lat")
                    l_lon = loc.get("lon")
                    if l_lat is not None and l_lon is not None:
                        dist = haversine_distance(lat, lon, l_lat, l_lon)
                        distances.append((loc, dist))
                
                # Sort by distance
                distances.sort(key=lambda x: x[1])
                
                # Filter <= 5km
                nearby = [item for item in distances if item[1] <= 5.0]
                if not nearby and distances:
                    # Fallback to nearest 1 if none within 5km
                    nearby = [distances[0]]
                    
                # Insert nearby distances
                for loc, dist in nearby:
                    cursor.execute("""
                        INSERT INTO room_distances (room_id, landmark_name, landmark_category, distance)
                        VALUES (?, ?, ?, ?)
                    """, (room_id, loc["name"], loc["category"], dist))
                print(f"  [SQLITE] Đã lưu {len(nearby)} mốc khoảng cách landmarks cho phòng ID {room_id}")
                
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"[MAP1] Lỗi khi lưu phòng vào SQLite: {e}")
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    # Initialize the database
    init_db()
    print("Khởi tạo database hoàn tất.")
