import sys

sys.stdout.reconfigure(encoding='utf-8')

sync_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\scratch_trigger_sync.cjs"

with open(sync_path, "r", encoding="utf-8") as f:
    content = f.read()

print("File content length:", len(content))
# Print first 200 lines
lines = content.split("\n")
for i, line in enumerate(lines[:200]):
    print(f"{i+1}: {line}")
