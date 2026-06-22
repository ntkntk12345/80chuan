import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== TARGETED INSPECT OF PENDING QUEUE FOR KIM MA / 119 ===")
pending_path = r"c:\Users\Administrator\Downloads\80lankh\bot\pending_queue.json"

if os.path.exists(pending_path):
    try:
        with open(pending_path, 'r', encoding='utf-8') as f:
            items = json.load(f)
            
        found_idx = 0
        for item in items:
            symbol = item.get('symbol', '')
            texts = item.get('texts', [])
            text_combined = " ".join([t.get('text', '') if isinstance(t, dict) else str(t) for t in texts])
            
            # Match only if related to 119 and Kim Ma
            is_119 = '119' in text_combined or '119' in symbol
            is_kim_ma = 'kim mã' in text_combined.lower() or '575' in text_combined
            
            if is_119 or is_kim_ma:
                found_idx += 1
                print(f"\nMatch {found_idx}:")
                print(f"  Instance ID: {item.get('instance_id')}")
                print(f"  Symbol: {item.get('symbol')}")
                print(f"  Source Thread ID: {item.get('source_thread_id')}")
                print(f"  Timestamp: {item.get('timestamp')}")
                print(f"  Text count: {len(texts)}")
                for t in texts:
                    t_str = t.get('text', '') if isinstance(t, dict) else str(t)
                    print(f"    Text: {repr(t_str)}")
                photos = item.get('photos', [])
                print(f"  Photos count: {len(photos)}")
                for p in photos:
                    print(f"    Photo URL: {p.get('url') if isinstance(p, dict) else p}")
                videos = item.get('videos', [])
                print(f"  Videos count: {len(videos)}")
                for v in videos:
                    print(f"    Video URL: {v.get('url') if isinstance(v, dict) else v}")
                print("-" * 80)
    except Exception as e:
        print(f"Error: {e}")
else:
    print("pending_queue.json not found")
