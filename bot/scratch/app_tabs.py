import os

app_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\src\App.jsx"
out_path = r"c:\Users\Admin\Downloads\80chuan\bot\scratch\app_tabs.txt"

if not os.path.exists(app_path):
    print("App.jsx not found!")
    exit(1)

with open(app_path, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

with open(out_path, "w", encoding="utf-8") as f:
    for idx, line in enumerate(lines):
        if "chung-cu" in line or "nha-nguyen-can" in line or "can-ho-dich-vu" in line or "mat-bang-kinh-doanh" in line:
            start = max(0, idx - 5)
            end = min(len(lines), idx + 10)
            f.write(f"--- Around Line {idx+1} ---\n")
            for j in range(start, end):
                f.write(f"Line {j+1}: {lines[j]}")
            f.write("=" * 60 + "\n")

print("Wrote output to", out_path)
