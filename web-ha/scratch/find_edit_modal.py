import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\src\views\AdminDashboardView.jsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines()

print("--- Searching for editRoomModal occurrences in AdminDashboardView.jsx ---")
for i, line in enumerate(lines, 1):
    if "editRoomModal" in line:
        print(f"Line {i}: {line.strip()}")
