import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"
target_id = "4821092087160405160"

if os.path.exists(log_path):
    print(f"=== SEARCHING MESSAGES FOR {target_id} BETWEEN L45400 and L45650 ===")
    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            line_num = idx + 1
            if 45400 <= line_num <= 45650:
                if target_id in line or "Orphan" in line:
                    print(f"L{line_num}: {line.strip()}")
else:
    print("listener.log not found")
