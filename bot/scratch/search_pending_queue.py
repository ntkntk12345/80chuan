import json
import os
import sys

# Write all output to a text file
out_file = open("search_pending_queue_results.txt", "w", encoding="utf-8")
sys.stdout = out_file

pending_path = r"c:\Users\Administrator\Downloads\80lankh\bot\pending_queue.json"

if not os.path.exists(pending_path):
    print("pending_queue.json not found")
    sys.exit(1)

with open(pending_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Type of data in pending_queue: {type(data)}")
if isinstance(data, list):
    print(f"Number of list items: {len(data)}")
    items = data
elif isinstance(data, dict):
    print(f"Number of dict keys: {len(data)}")
    items = list(data.values())
else:
    print("Unknown data type")
    sys.exit(0)

# Search items
print("\n--- Searching for '119' or '575' in pending_queue ---")
for idx, item in enumerate(items):
    item_str = json.dumps(item, ensure_ascii=False).lower()
    if '119' in item_str or '575' in item_str:
        # Check if the room code is 119 or the address is Ngõ 575 Kim Mã or similar
        print(f"\n[Index {idx}]")
        print(f"Instance ID / Session ID: {item.get('instance_id') or item.get('session_id')}")
        print(f"Symbol: {item.get('symbol')}")
        texts = item.get('texts', [])
        print(f"Texts ({len(texts)}):")
        for t in texts:
            if isinstance(t, dict):
                print("  - text:", repr(t.get('text', '')))
                print("    orig:", repr(t.get('original_text', '')))
            else:
                print("  -", repr(t))
        photos = item.get('photos', [])
        print(f"Photos count: {len(photos)}")
        for p in photos:
            print("  - Photo:", p.get('url'))
        videos = item.get('videos', [])
        print(f"Videos count: {len(videos)}")
        for v in videos:
            print("  - Video:", v.get('url'))
        print("-" * 40)
