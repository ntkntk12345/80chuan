import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

# Print lines 51400 to 51800
start = 51400
end = 51800

for i in range(start, min(end, len(lines))):
    print(f"{i+1}: {lines[i].strip()}")
