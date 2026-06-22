import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print("=== PARSING ALL 12A LOG LINES AROUND THE 119 POSTS ===")

# Let's find every line containing 12A or 4821092087160405160 between 45350 and 45650
for idx in range(45350, 45650):
    line = lines[idx].strip()
    if "4821092087160405160" in line or "12A" in line or "Mã 119" in line:
        print(f"Line {idx+1}: {line}")
