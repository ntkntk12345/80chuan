import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pending_path = r"c:\Users\Administrator\Downloads\80lankh\bot\pending_queue.json"

with open(pending_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

session_ids = ["1781844693864", "1781844916962"]

for s_id in session_ids:
    print(f"\nSearching for Session ID: {s_id}")
    found = False
    for idx, item in enumerate(data):
        if str(item.get('instance_id')) == s_id or str(item.get('session_id')) == s_id:
            print(f"Found at index {idx}:")
            print(json.dumps(item, indent=2, ensure_ascii=False))
            found = True
            break
    if not found:
        print("Not found in pending_queue.json")
