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
        print(f"API server is running at {url}. Total rooms: {len(data)}")
        for idx, room in enumerate(data):
            print(f"\nRoom {idx+1}: {room.get('address')}")
            print(f"  Code: {room.get('room_code')} | District: {room.get('district')}")
            print(f"  Coordinates: {room.get('latitude')}, {room.get('longitude')}")
            print(f"  Near: {room.get('nearPlace')} | Distance: {room.get('distanceText')}")
except Exception as e:
    print(f"API Server check failed: {e}")
