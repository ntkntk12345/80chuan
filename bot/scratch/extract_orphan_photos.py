import os
import re

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

print("=== EXTRACTING ORPHAN PHOTOS FROM LOG ===")
if os.path.exists(log_path):
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        # We target lines from 48570 to 48610 (1-based index is 48570-48610, so 0-based is 48569 to 48609)
        target_lines = lines[48569:48615]
        
        photo_urls = []
        for idx, line in enumerate(target_lines):
            line_idx = 48570 + idx
            line_str = line.strip()
            print(f"{line_idx}: {line_str.encode('ascii', errors='replace').decode('ascii')[:150]}")
            
            # Find href or url in the line
            urls = re.findall(r"href='([^']+)'", line_str)
            if not urls:
                urls = re.findall(r'href="([^"]+)"', line_str)
            if urls:
                photo_urls.extend(urls)
                print(f"  -> Found URL: {urls[0]}")
                
        print(f"\nExtracted {len(photo_urls)} URLs:")
        for u in photo_urls:
            print(u)
            
    except Exception as e:
        print(f"Error: {e}")
else:
    print("listener.log not found")
