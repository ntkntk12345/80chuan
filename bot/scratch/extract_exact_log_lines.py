import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

if os.path.exists(log_path):
    print("=== INSPECTING LINES L40800 TO L40900 ===")
    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            line_num = idx + 1
            if 40800 <= line_num <= 40900:
                print(f"L{line_num}: {line.strip()}")
else:
    print("listener.log not found")
