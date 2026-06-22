import os
import json
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from map1 import save_room_to_sqlite

# Configure UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load Cầu Giấy full JSON
json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'districts_full', 'caugiay.json'))
if not os.path.exists(json_path):
    print("Error: caugiay.json does not exist!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Room 1: Trần Thái Tông
room1_data = {
    "session_id": "1781097718356",
    "id": "P301",
    "address": "Số 8 Ngõ 76 Trần Thái Tông - Cầu Giấy",
    "price": "7.5tr",
    "price1": "7500000",
    "price2": "7500000",
    "type": "1n1k"
}
session1_info = {
    "original_text": data[0].get("original_text") or data[0].get("text") or "",
    "photos": data[0].get("photos", []),
    "videos": data[0].get("videos", [])
}

# Room 2: Hoàng Quốc Việt
room2_data = {
    "session_id": "1781097860339",
    "id": "P303",
    "address": "Số nhà 21 Ngách 63 Ngõ 5 Hoàng Quốc Việt - Cầu Giấy",
    "price": "8.5tr",
    "price1": "8500000",
    "price2": "8500000",
    "type": "2n1k"
}
session2_info = {
    "original_text": data[1].get("original_text") or data[1].get("text") or "",
    "photos": data[1].get("photos", []),
    "videos": data[1].get("videos", [])
}

print("Saving Trần Thái Tông room...")
save_room_to_sqlite(room1_data, session1_info, "caugiay")

print("\nSaving Hoàng Quốc Việt room with new coordinates override...")
save_room_to_sqlite(room2_data, session2_info, "caugiay")

print("\nCầu Giấy update complete!")
