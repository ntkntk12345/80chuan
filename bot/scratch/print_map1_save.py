import sys

sys.stdout.reconfigure(encoding='utf-8')

map1_path = r"c:\Users\Administrator\Downloads\80lankh\bot\map1.py"

with open(map1_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in map1.py: {len(lines)}")

for idx, line in enumerate(lines):
    if "def save_room_to_sqlite" in line:
        print(f"Line {idx+1}: {line.strip()}")
        start = idx
        end = min(len(lines), idx + 80)
        for c_idx in range(start, end):
            print(f"  L{c_idx+1}: {lines[c_idx].strip()}")
        break
