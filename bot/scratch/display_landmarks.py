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

print(f"{'Landmark Name':<45} | {'Lat':<10} | {'Lon':<10} | {'Address'}")
print("-" * 100)
for lm in landmarks:
    print(f"{lm['name']:<45} | {lm.get('lat'):<10} | {lm.get('lon'):<10} | {lm.get('address')}")
