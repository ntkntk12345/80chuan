import json
import sys

# Reconfigure stdout for utf-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r"c:\Users\Admin\Downloads\full\bot\distance_app\locations_db.json"
with open(db_path, 'r', encoding='utf-8') as f:
    landmarks = json.load(f)

for loc in landmarks:
    if "ngoại thương" in loc["name"].lower():
        print(f"Name: {loc['name']}, Lat: {loc['lat']}, Lon: {loc['lon']}, Category: {loc['category']}")
