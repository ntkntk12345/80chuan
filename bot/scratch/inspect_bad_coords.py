import json
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Admin\Downloads\full\bot\distance_app\locations_db.json"
with open(db_path, 'r', encoding='utf-8') as f:
    landmarks = json.load(f)

print("Landmarks with potential default or suspicious coords:")
for idx, lm in enumerate(landmarks):
    lat = lm.get("lat")
    lon = lm.get("lon")
    name = lm.get("name")
    addr = lm.get("address")
    
    # 21.028279, 105.853881 is the default center coordinate returned by arcgis geocode for "Việt Nam" or generic queries
    is_default = abs(lat - 21.028279) < 0.001 and abs(lon - 105.853881) < 0.001
    
    # Check if coords are outside Hanoi (lat ~ 21, lon ~ 105.8)
    is_outside = not (20.9 <= lat <= 21.1) or not (105.7 <= lon <= 105.95)
    
    if is_default or is_outside:
        print(f"[{idx}] {name:<35} | Lat: {lat:<10.6f} | Lon: {lon:<10.6f} | Default: {is_default} | Outside: {is_outside} | Address: {addr}")
