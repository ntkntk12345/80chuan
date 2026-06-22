"""
Import tất cả phòng từ districts_summary/*.json vào SQLite database.
Sử dụng text2 làm original_text (text đã xử lý, không có emoji hoa hồng).
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding='utf-8')

from map1 import save_room_to_sqlite, init_db

SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUMMARY_DIR = os.path.join(SCRIPT_DIR, 'districts_summary')
FULL_DIR    = os.path.join(SCRIPT_DIR, 'districts_ok')

# Map filename -> district name
DISTRICT_MAP = {
    'hadong': 'Hà Đông', 'caugiay': 'Cầu Giấy', 'hoangmai': 'Hoàng Mai',
    'thanhtri': 'Thanh Trì', 'badinh': 'Ba Đình', 'longbien': 'Long Biên',
    'tayho': 'Tây Hồ', 'bactuliem': 'Bắc Từ Liêm', 'haibatrung': 'Hai Bà Trưng',
    'namtuliem': 'Nam Từ Liêm', 'hoankiem': 'Hoàn Kiếm', 'thanhxuan': 'Thanh Xuân',
    'dongda': 'Đống Đa', 'hoaiduc': 'Hoài Đức', 'mydinh': 'Mỹ Đình',
}

# Khởi tạo DB
init_db()
print("DB initialized.")

total = 0
for fname in os.listdir(SUMMARY_DIR):
    if not fname.endswith('.json'):
        continue
    key = fname.replace('.json', '')
    district_name = DISTRICT_MAP.get(key, key)
    
    fpath = os.path.join(SUMMARY_DIR, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            sessions = json.load(f)
    except Exception as e:
        print(f"[SKIP] Cannot read {fpath}: {e}")
        continue

    # Load full data để lấy photos/videos
    full_path = os.path.join(FULL_DIR, fname)
    full_by_id = {}
    if os.path.exists(full_path):
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                full_list = json.load(f)
                full_by_id = {str(item.get('id', '')): item for item in full_list if isinstance(item, dict)}
        except Exception:
            pass

    for session in sessions:
        if not isinstance(session, dict):
            continue
        session_id = str(session.get('id', ''))
        # Lấy text2 làm mô tả (text đã xử lý)
        text2 = session.get('text2', '')
        text1 = session.get('text1', '')
        source_text = text2 or text1  # ưu tiên text2

        # Lấy full data cho photos/videos
        full_item = full_by_id.get(session_id, {})
        photos = full_item.get('photos', [])
        videos = full_item.get('videos', [])

        session_info = {
            'text2': text2,
            'text1': text1,
            'original_text': source_text,
            'photos': photos,
            'videos': videos,
        }

        # Tạo room_data từ session (phân tích address/price từ text)
        # Dùng text2 để extract địa chỉ/giá
        import re
        address = ''
        price = ''
        room_type = None

        # Extract address
        addr_match = re.search(r'[🏢🏡🏠]\s*Địa\s*chỉ\s*:?\s*([^\n]+)', source_text)
        if addr_match:
            address = addr_match.group(1).strip()
        else:
            addr_match2 = re.search(r'Địa\s*chỉ\s*:?\s*([^\n]+)', source_text, re.IGNORECASE)
            if addr_match2:
                address = addr_match2.group(1).strip()

        # Extract price
        price_match = re.search(r'[💰☘]\s*Giá\s*:?\s*([^\n]+)', source_text)
        if price_match:
            price = price_match.group(1).strip()
        else:
            price_match2 = re.search(r'Giá\s*:?\s*([^\n]+)', source_text, re.IGNORECASE)
            if price_match2:
                price = price_match2.group(1).strip()

        # Extract room type
        rt_match = re.search(r'[☘👉]\s*(?:Dạng\s*)?[Pp]hòng\s*:?\s*([^\n]+)', source_text)
        if rt_match:
            room_type = rt_match.group(1).strip()

        # Extract room code
        room_code_match = re.search(r'[Tt]rống\s*:\s*([A-Z]\d+)', source_text)
        room_code = room_code_match.group(1) if room_code_match else None

        if not address:
            print(f"  [SKIP] No address found in session {session_id}")
            continue

        room_data = {
            'session_id': session_id,
            'id': room_code,
            'address': address,
            'price': price,
            'price1': 0,
            'price2': 0,
            'type': room_type,
        }

        # Parse price to number
        if price:
            p = price.lower().replace(' ', '').replace(',', '.')
            m = re.search(r'(\d+(?:\.\d+)?)tr', p)
            if m:
                room_data['price1'] = int(float(m.group(1)) * 1_000_000)
                room_data['price2'] = room_data['price1']

        ok = save_room_to_sqlite(room_data, session_info, district_name)
        if ok:
            total += 1
            print(f"  [OK] {district_name} | {address} | {price}")

print(f"\nDone! Imported {total} rooms total.")
