import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

full_dir = r"c:\Users\Administrator\Downloads\80lankh\bot\districts_full"

print(f"Searching in directory: {full_dir}")

for fname in os.listdir(full_dir):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(full_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error reading {fname}: {e}")
            continue
        for item in data:
            item_str = json.dumps(item, ensure_ascii=False).lower()
            if '575/09' in item_str or '575/18' in item_str or '1781844693864' in item_str or '1781844916962' in item_str:
                print(f"\nFound match in {fname}:")
                print(f"  ID: {item.get('id')}")
                print(f"  Address: {item.get('address')}")
                print(f"  Price: {item.get('price')}")
                print(f"  Photos count: {len(item.get('photos', []))}")
                for p in item.get('photos', []):
                    print("    Photo:", p.get('url'))
