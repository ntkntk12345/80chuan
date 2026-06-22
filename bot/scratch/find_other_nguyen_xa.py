import json
import os

print("=== SEARCHING OTHER NGUYEN XA LISTINGS ===")
search_files = [
    r"c:\Users\Administrator\Downloads\80lankh\bot\processed\districts_full\bactuliem.json",
    r"c:\Users\Administrator\Downloads\80lankh\bot\processed\districts_ok\bactuliem.json",
    r"c:\Users\Administrator\Downloads\80lankh\bot\districts_full\bactuliem.json",
    r"c:\Users\Administrator\Downloads\80lankh\bot\districts_summary\bactuliem.json"
]

found_any = False
for fpath in search_files:
    if os.path.exists(fpath):
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            items = data if isinstance(data, list) else [data]
            for item in items:
                text_str = str(item)
                # We want matches containing 'Nguyên Xá' but NOT our session_id 1781851346099 (to find other instances)
                if 'nguyên xá' in text_str.lower():
                    # check if it has photos
                    photos = item.get('photos', [])
                    videos = item.get('videos', [])
                    p_len = len(photos) if isinstance(photos, list) else 0
                    v_len = len(videos) if isinstance(videos, list) else 0
                    
                    # Print if it has photos/videos or is close in content
                    print(f"\nMatch in: {os.path.basename(fpath)}")
                    print(f"  ID/Session: {item.get('id') or item.get('session_id')}")
                    print(f"  Address: {item.get('address')}")
                    print(f"  Text preview: {repr(str(item.get('text') or item.get('text1') or '')[:150])}")
                    print(f"  Photos count: {p_len}, Videos count: {v_len}")
                    if p_len > 0:
                        print(f"  Photos: {repr(photos)}")
                        found_any = True
        except Exception as e:
            print(f"Error reading {fpath}: {e}")

if not found_any:
    print("\nNo other listings with photos found for Nguyên Xá in Bac Tu Liem.")
