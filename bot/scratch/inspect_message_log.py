import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

msg_log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\message_log.json"
pending_path = r"c:\Users\Administrator\Downloads\80lankh\bot\pending_queue.json"

if os.path.exists(msg_log_path):
    with open(msg_log_path, 'r', encoding='utf-8') as f:
        msg_data = json.load(f)
    print(f"message_log.json loaded. Total items: {len(msg_data)}")
    
    # Let's count by group_id
    groups = {}
    for entry in msg_data:
        g = entry.get('group_id')
        groups[g] = groups.get(g, 0) + 1
    print("Group ID distribution in message_log.json:", groups)
else:
    print("message_log.json not found")

if os.path.exists(pending_path):
    with open(pending_path, 'r', encoding='utf-8') as f:
        pending_data = json.load(f)
    print(f"pending_queue.json loaded. Total items: {len(pending_data)}")
    
    # Check keys of pending_data if it's a dict, or length if list
    if isinstance(pending_data, dict):
        print("Keys of pending_queue:", list(pending_data.keys())[:10])
        # Let's search for '119' or thread 12A
        found_in_pending = []
        for k, v in pending_data.items():
            if '119' in str(k) or '119' in str(v):
                found_in_pending.append(k)
        print("Keys containing '119' in pending_queue:", found_in_pending)
    elif isinstance(pending_data, list):
        print("pending_queue is a list.")
else:
    print("pending_queue.json not found")
