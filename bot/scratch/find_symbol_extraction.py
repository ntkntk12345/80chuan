import os

sender_path = r"c:\Users\Admin\Downloads\80chuan\bot\sender.py"
out_path = r"c:\Users\Admin\Downloads\80chuan\bot\scratch\symbol_extraction.txt"

if not os.path.exists(sender_path):
    print("sender.py not found!")
    exit(1)

with open(sender_path, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

with open(out_path, "w", encoding="utf-8") as f:
    # Search for symbol extraction lines, usually near message receive or handling
    for idx, line in enumerate(lines):
        if "symbol" in line and ("=" in line or "get" in line):
            # Write a range of lines
            start = max(0, idx - 5)
            end = min(len(lines), idx + 10)
            f.write(f"--- Around Line {idx+1} ---\n")
            for j in range(start, end):
                f.write(f"Line {j+1}: {lines[j]}")
            f.write("=" * 60 + "\n")

print("Wrote output to", out_path)
