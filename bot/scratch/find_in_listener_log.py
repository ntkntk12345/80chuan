import os
import re

search_session = "1781851346099"
search_thread = "4821092087160405160"
search_keywords = ["Nguyên Xá", "P701/P404", "P701", "P404"]

print("=== SCANNING bot/listener.log ===")
log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

if os.path.exists(log_path):
    try:
        # We want to find the lines containing search_thread or search_keywords, and print them along with +/- 20 lines
        lines = []
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        print(f"Total lines in log: {len(lines)}")
        
        # Find line indices that match the session, thread or keywords
        matched_indices = []
        for idx, line in enumerate(lines):
            if search_session in line:
                matched_indices.append(idx)
            elif search_thread in line and any(kw in line for kw in ["P701", "P404", "Nguyên Xá"]):
                matched_indices.append(idx)
                
        print(f"Found {len(matched_indices)} matching events in listener.log:")
        
        # Print matching blocks (+/- 15 lines of context around each match)
        printed_blocks = set()
        for idx in matched_indices:
            start = max(0, idx - 15)
            end = min(len(lines), idx + 20)
            
            # Check if this range overlaps with a printed block to avoid duplicate printing
            block_key = (start, end)
            if any(s <= idx <= e for s, e in printed_blocks):
                continue
            printed_blocks.add(block_key)
            
            print(f"\n--- Context Block around line {idx+1} ---")
            for i in range(start, end):
                line_str = lines[i].strip()
                # Safe print with ascii conversion to avoid crash on terminal
                print(f"{i+1}: {line_str.encode('ascii', errors='replace').decode('ascii')}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("listener.log not found")
