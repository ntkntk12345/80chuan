import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

def print_raw_around(center_idx, window=20):
    start = max(0, center_idx - window)
    end = min(len(lines), center_idx + window)
    print(f"\n--- Range {start+1} to {end+1} (Center {center_idx+1}) ---")
    for idx in range(start, end):
        line = lines[idx].strip()
        # Find any URLs in this line or nearby
        print(f"L{idx+1}: {line}")

# Center 1: line 45480 (index 45479)
print_raw_around(45479, 10)

# Center 2: line 45542 (index 45541)
print_raw_around(45541, 10)

# Center 3: line 45553 (index 45552)
print_raw_around(45552, 10)

# Center 4: line 45599 (index 45598)
print_raw_around(45598, 15)
