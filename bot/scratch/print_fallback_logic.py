import sys

sys.stdout.reconfigure(encoding='utf-8')

server_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\server.js"

with open(server_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Print lines 1330 to 1430
for i in range(1329, 1430):
    print(f"{i+1}: {lines[i].strip()}")
