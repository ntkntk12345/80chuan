import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("=== TIMELINE 1 (45430 - 45560) ===")
for idx in range(45430, 45560):
    line = lines[idx].strip()
    print(f"Line {idx+1}: {line}")
