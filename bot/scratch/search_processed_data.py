import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

bot_dir = r"c:\Users\Administrator\Downloads\80lankh\bot"
merged_path = os.path.join(bot_dir, "merged_report.json")
processed_dir = os.path.join(bot_dir, "processed")

print("=== SEARCHING IN MERGED REPORT ===")
if os.path.exists(merged_path):
    try:
        with open(merged_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded merged_report.json. Total items: {len(data) if isinstance(data, list) else 'dict'}")
        
        # Search for 575/09, 575/18 or 119
        items = data if isinstance(data, list) else list(data.values())
        match_count = 0
        for idx, item in enumerate(items):
            item_str = json.dumps(item, ensure_ascii=False).lower()
            if '575/09' in item_str or '575/18' in item_str:
                match_count += 1
                print(f"Match {match_count}: ID {item.get('id')} | Address: {item.get('address')} | Photos: {len(item.get('photos', []))}")
    except Exception as e:
        print(f"Error reading merged_report.json: {e}")
else:
    print("merged_report.json not found")

print("\n=== SEARCHING IN PROCESSED DIR ===")
if os.path.exists(processed_dir):
    files = os.listdir(processed_dir)
    print(f"Found {len(files)} files in processed dir.")
    match_count = 0
    for f in files:
        if f.endswith('.json'):
            fpath = os.path.join(processed_dir, f)
            try:
                with open(fpath, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    item_str = json.dumps(item, ensure_ascii=False).lower()
                    if '575/09' in item_str or '575/18' in item_str:
                        match_count += 1
                        print(f"Match {match_count} in {f}: ID {item.get('id')} | Address: {item.get('address')} | Photos: {len(item.get('photos', []))}")
            except Exception as e:
                print(f"Error reading {f}: {e}")
else:
    print("processed dir not found")
