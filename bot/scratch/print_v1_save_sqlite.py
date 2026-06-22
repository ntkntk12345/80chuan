import sys

sys.stdout.reconfigure(encoding='utf-8')

v1_path = r"c:\Users\Administrator\Downloads\80lankh\bot\v1.py"

with open(v1_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Find lines containing save_room_to_sqlite
for idx, line in enumerate(lines):
    if "save_room_to_sqlite" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # Let's print the context (30 lines)
        start = max(0, idx - 5)
        end = min(len(lines), idx + 100)
        for c_idx in range(start, end):
            print(f"  L{c_idx+1}: {lines[c_idx].strip()}")
        break
