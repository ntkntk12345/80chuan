import json
import os

print("=== CHECKING ALL ENTRIES IN message_log.json ===")
msg_log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\message_log.json"

if os.path.exists(msg_log_path):
    try:
        with open(msg_log_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"Total entries: {len(data)}")
        
        matches = []
        for i, entry in enumerate(data):
            entry_str = str(entry)
            if "4821092087160405160" in entry_str or "7431744169303350381" in entry_str or "12A" in entry_str:
                matches.append((i, entry))
                
        print(f"Found {len(matches)} matching entries:")
        for idx, entry in matches[:10]:
            print(f"\nEntry index {idx}:")
            print(f"  Keys: {list(entry.keys())}")
            print(f"  Datetime: {entry.get('datetime')}")
            print(f"  Group ID: {entry.get('group_id')}")
            print(f"  User ID: {entry.get('user_id')}")
            print(f"  Keyword: {entry.get('keyword')}")
            items = entry.get('items', [])
            print(f"  Items count: {len(items)}")
            # print first item preview
            if items:
                print(f"    First item type: {items[0].get('type')}")
                if items[0].get('type') == 'text':
                    print(f"    First item text: {repr(items[0].get('data', {}).get('text', '')[:100])}")
                else:
                    print(f"    First item data: {repr(str(items[0].get('data'))[:150])}")
                    
    except Exception as e:
        print(f"Error: {e}")
else:
    print("message_log.json not found")
