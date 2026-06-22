import json
import os
import datetime

target_thread = "4821092087160405160"
target_author = "7431744169303350381"  # source_author_id
target_time = 1781851346.098585        # timestamp of the room post

print(f"=== SEARCHING NEIGHBORING ZALO MESSAGES FOR THREAD: {target_thread} ===")
msg_log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\message_log.json"

if os.path.exists(msg_log_path):
    try:
        with open(msg_log_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        matches = []
        for i, entry in enumerate(data):
            # check if it matches thread or author
            group_id = str(entry.get('group_id'))
            user_id = str(entry.get('user_id'))
            timestamp = entry.get('timestamp') or 0
            
            # calculate time difference in seconds
            time_diff = abs(timestamp - target_time)
            
            # Match if same group/thread and close in time (within 10 minutes / 600 seconds)
            if (group_id == target_thread or user_id == target_author) and time_diff < 1200:
                matches.append((time_diff, entry))
                
        # Sort by time difference ascending (closest first)
        matches.sort(key=lambda x: x[0])
        
        print(f"Found {len(matches)} neighboring messages:")
        for diff, entry in matches[:15]:
            print(f"\nTime difference: {diff:.1f}s")
            print(f"  Timestamp: {entry.get('timestamp')}")
            print(f"  Datetime: {entry.get('datetime')}")
            print(f"  Group/User: {entry.get('group_id')} / {entry.get('user_id')}")
            items = entry.get('items', [])
            print(f"  Items in Zalo packet: {len(items)}")
            for idx, it in enumerate(items):
                it_type = it.get('type')
                it_data = it.get('data', {})
                print(f"    Item {idx+1} Type: {it_type}")
                if it_type == 'text':
                    print(f"      Text: {repr(it_data.get('text', '')[:100])}")
                elif it_type == 'photo':
                    print(f"      Photo URL: {it_data.get('url')}")
                elif it_type == 'video':
                    print(f"      Video URL: {it_data.get('url')}")
    except Exception as e:
        print(f"Error reading message_log.json: {e}")
else:
    print("message_log.json not found")
