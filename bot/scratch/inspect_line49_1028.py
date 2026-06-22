import re
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

input_path = r"c:\Users\Admin\Downloads\full\bot\scratch\extracted_locations_db_1028.txt"

with open(input_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = []
for line in lines:
    match = re.match(r'^\s*(\d+):\s*(.*)$', line)
    if match:
        clean_lines.append(match.group(2))

for idx in range(35, 60):
    if idx < len(clean_lines):
        print(f"Line {idx+1}: {repr(clean_lines[idx])}")
