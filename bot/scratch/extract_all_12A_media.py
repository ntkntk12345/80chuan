import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

# Let's inspect all lines containing '4821092087160405160' or '(12A)'
# We want to collect all photo and video URLs that were sent, with their line number and timestamp if possible.
with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# We can group messages that occurred close to the target lines:
# Target line 45480 for 575/09 Kim Mã, and 45553 for 575/18 Kim Mã.
# Let's inspect lines 45300 to 45700 for any media links from 12A.
print("\n--- Media from 12A around lines 45300 to 45700 ---")
for idx in range(45000, min(46000, len(lines))):
    line = lines[idx]
    if "12A" in line and ("http" in line or "photo" in line or "video" in line):
        print(f"Line {idx+1}: {line.strip()}")

print("\n--- Media from 12A around lines 51400 to 52000 ---")
for idx in range(51000, min(52000, len(lines))):
    line = lines[idx]
    if "12A" in line and ("http" in line or "photo" in line or "video" in line):
        print(f"Line {idx+1}: {line.strip()}")
