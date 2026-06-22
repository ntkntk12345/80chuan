import json
import os
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

msg_log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\message_log.json"

target_times = [1781844693.864, 1781844916.962]

if not os.path.exists(msg_log_path):
    print("message_log.json not found")
    sys.exit(1)

with open(msg_log_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total log messages: {len(data)}")

for t_idx, target_time in enumerate(target_times):
    print(f"\n================ TARGET TIME {target_time} (Index {t_idx}) ================")
    dt_target = datetime.fromtimestamp(target_time)
    print(f"Datetime: {dt_target}")
    
    matches = []
    for entry in data:
        timestamp = entry.get('timestamp') or 0
        time_diff = abs(timestamp - target_time)
        # Match if within 30 minutes
        if time_diff < 1800:
            matches.append((time_diff, entry))
            
    matches.sort(key=lambda x: x[0])
    
    print(f"Found {len(matches)} messages within 30 mins:")
    for diff, entry in matches[:30]:
        print(f"\nTime diff: {diff:.1f}s | Timestamp: {entry.get('timestamp')} | Datetime: {entry.get('datetime')}")
        print(f"Group ID: {entry.get('group_id')} | User ID: {entry.get('user_id')}")
        items = entry.get('items', [])
        for idx, it in enumerate(items):
            it_type = it.get('type')
            it_data = it.get('data', {})
            if it_type == 'text':
                print(f"  Item {idx+1} [text]: {repr(it_data.get('text', ''))}")
            elif it_type == 'photo':
                print(f"  Item {idx+1} [photo]: URL={it_data.get('url')} ID={it_data.get('id')}")
            elif it_type == 'video':
                print(f"  Item {idx+1} [video]: URL={it_data.get('url')}")
            else:
                print(f"  Item {idx+1} [{it_type}]: {it_data}")
