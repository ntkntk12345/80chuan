import sys

sys.stdout.reconfigure(encoding='utf-8')

server_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\server.js"

with open(server_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in server.js: {len(lines)}")

matches = 0
for idx, line in enumerate(lines):
    if "rooms" in line.lower():
        print(f"Line {idx+1}: {line.strip()}")
        matches += 1
        if matches >= 50:
            print("... truncated matches")
            break
