import urllib.request
import json
import sys

# Configure UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

url = "http://localhost:3001/api/rooms"
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode('utf-8'))
        for room in data:
            if "Trần Thái Tông" in room.get('address', ''):
                print(f"Address: {room.get('address')}")
                print(f"Distances key in API response:")
                for d in room.get('distances', []):
                    print(f"  - {d['landmark_name']}: {d['distance']} km ({d['landmark_category']})")
except Exception as e:
    print(f"API Server check failed: {e}")
