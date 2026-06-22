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

# Load the raw hoangmai.json
json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'districts_full', 'hoangmai.json'))
if not os.path.exists(json_path):
    print("Error: hoangmai.json does not exist!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

if not data:
    print("Error: hoangmai.json is empty!")
    exit(1)

session = data[0]
session_id = session.get("id")

# Construct mock parsed room data for Hoang Mai
# Min price is 5.2tr (Trục 02), Max is 6.5tr (Trục 03)
room_data = {
    "session_id": session_id,
    "id": "Trục 01/02/03",
    "address": "156 Hoàng Mai - Hoàng Mai",
    "price": "5.2-6.5tr",
    "price1": "5200000",
    "price2": "6500000",
    "type": "studio"
}

# Construct session info
session_info = {
    "original_text": session.get("original_text") or session.get("text") or "",
    "photos": session.get("photos", []),
    "videos": session.get("videos", [])
}

print("Manually inserting Hoàng Mai room to SQLite...")
success = save_room_to_sqlite(room_data, session_info, "hoangmai")
if success:
    print("Hoàng Mai room successfully inserted!")
else:
    print("Failed to insert Hoàng Mai room.")
