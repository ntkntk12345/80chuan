import os

sender_path = r"c:\Users\Admin\Downloads\80chuan\bot\sender.py"
out_path = r"c:\Users\Admin\Downloads\80chuan\bot\scratch\sender_lines.txt"

if not os.path.exists(sender_path):
    print("sender.py not found!")
    exit(1)

with open(sender_path, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

with open(out_path, "w", encoding="utf-8") as f:
    for idx in range(1099, min(1165, len(lines))):
        f.write(f"Line {idx+1}: {lines[idx]}")

print("Wrote output to", out_path)
