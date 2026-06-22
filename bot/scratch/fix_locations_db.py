import json
import os
import sys

# Configure UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Admin\Downloads\full\bot\distance_app\locations_db.json"

if not os.path.exists(db_path):
    print("Error: locations_db.json not found!")
    exit(1)

with open(db_path, 'r', encoding='utf-8') as f:
    landmarks = json.load(f)

FIXES = {
    "Đại học Ngoại thương": (21.02259, 105.80518),
    "Đại học Xây dựng Hà Nội": (21.0039, 105.8428),
    "Đại học Hà Nội": (20.985552, 105.790518),
    "Học viện Hành chính Quốc gia": (21.0667, 105.8033),
    "Học viện Tài chính": (21.074128, 105.774404),
    "Học viện Công nghệ Bưu chính Viễn thông": (20.9806, 105.7898),
    "Cao đẳng FPT Polytechnic": (21.030874, 105.758677),
    "Cao đẳng Y Dược Pasteur": (21.0471, 105.7845),
    "Bến xe Nước Ngầm": (20.974549, 105.844357),
    "Bến xe Mỹ Đình": (21.0284, 105.7779),
    "Ga La Thành": (21.0199, 105.8202),
    "Ga Thái Hà": (21.0156, 105.8186),
    "Ga Vành Đai 3": (20.991462, 105.803101),
    "Ga Văn Khê": (20.9602, 105.7505),
    "Ga Minh Khai": (21.048, 105.738),
    "Ga Lê Đức Thọ": (21.038, 105.778),
}

updated_count = 0
for lm in landmarks:
    name = lm.get("name")
    if name in FIXES:
        lat, lon = FIXES[name]
        old_lat = lm.get("lat")
        old_lon = lm.get("lon")
        print(f"Updating '{name}': ({old_lat}, {old_lon}) -> ({lat}, {lon})")
        lm["lat"] = lat
        lm["lon"] = lon
        updated_count += 1

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(landmarks, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully updated {updated_count} landmarks in locations_db.json!")
