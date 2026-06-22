import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pending_path = r"c:\Users\Administrator\Downloads\80lankh\bot\pending_queue.json"

if os.path.exists(pending_path):
    with open(pending_path, 'r', encoding='utf-8') as f:
        items = json.load(f)
    print(f"Total pending queue items: {len(items)}")
    
    match_count = 0
    for idx, item in enumerate(items):
        symbol = item.get('symbol', '')
        texts = item.get('texts', [])
        text_combined = " ".join([t.get('text', '') if isinstance(t, dict) else str(t) for t in texts])
        
        # We want to find any item containing "575" or room code "119" (case-insensitive)
        if "575" in text_combined or "119" in text_combined or "119" in symbol:
            match_count += 1
            photos = item.get('photos', [])
            videos = item.get('videos', [])
            print(f"\n[{match_count}] Index: {idx} | Instance ID: {item.get('instance_id')} | Symbol: {symbol}")
            print(f"  Texts:")
            for t in texts:
                t_str = t.get('text', '') if isinstance(t, dict) else str(t)
                print(f"    - {repr(t_str)}")
            print(f"  Photos count: {len(photos)}")
            for p in photos:
                p_url = p.get('url') if isinstance(p, dict) else p
                print(f"    Photo: {p_url}")
            print(f"  Videos count: {len(videos)}")
            for v in videos:
                v_url = v.get('url') if isinstance(v, dict) else v
                print(f"    Video: {v_url}")
            print("-" * 60)
            
else:
    print("pending_queue.json not found")
