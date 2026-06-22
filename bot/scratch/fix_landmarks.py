import os
import json
import urllib.request
import urllib.parse
import time
import sys

# Configure UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'distance_app', 'locations_db.json'))
print("Landmarks DB Path:", db_path)

if not os.path.exists(db_path):
    print("Error: locations_db.json not found!")
    exit(1)

with open(db_path, 'r', encoding='utf-8') as f:
    landmarks = json.load(f)

def geocode(query):
    encoded = urllib.parse.quote(query)
    url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine={encoded}&maxLocations=1"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                cand = candidates[0]
                location = cand.get('location', {})
                return float(location.get('y')), float(location.get('x')), cand.get('address')
    except Exception as e:
        print(f"  Error geocoding {query}: {e}")
    return None

updated_count = 0
for idx, lm in enumerate(landmarks):
    name = lm.get("name")
    search_q = lm.get("search_query") or f"{name}, Hà Nội, Việt Nam"
    old_lat, old_lon = lm.get("lat"), lm.get("lon")
    
    print(f"[{idx+1}/{len(landmarks)}] Geocoding '{name}'...")
    res = geocode(search_q)
    if res:
        new_lat, new_lon, full_addr = res
        # Check if coordinates are close to Hanoi (lat ~ 21, lon ~ 105.8)
        if 20.5 <= new_lat <= 21.5 and 105.0 <= new_lon <= 106.5:
            if abs(new_lat - old_lat) > 0.001 or abs(new_lon - old_lon) > 0.001:
                print(f"  -> UPDATED: Old ({old_lat}, {old_lon}) -> New ({new_lat}, {new_lon})")
                lm["lat"] = new_lat
                lm["lon"] = new_lon
                updated_count += 1
            else:
                print("  -> Keep current coords (already correct)")
        else:
            print(f"  -> Ignored: Coordinates {new_lat}, {new_lon} are outside Hanoi region.")
    else:
        print("  -> Geocoding failed.")
    time.sleep(0.2)

if updated_count > 0:
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(landmarks, f, ensure_ascii=False, indent=2)
    print(f"\nSuccessfully updated {updated_count} landmarks in locations_db.json!")
else:
    print("\nNo landmarks needed updating.")
