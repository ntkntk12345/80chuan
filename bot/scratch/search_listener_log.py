import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

queries = ["1781844693864", "1781844916962", "Ngõ 575/09", "Ngõ 575/18", "Mã 119"]

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

print(f"Total lines in listener.log: {len(lines)}")

for query in queries:
    print(f"\nSearching for: {query}")
    matches = 0
    for idx, line in enumerate(lines):
        if query.lower() in line.lower():
            print(f"Line {idx+1}: {line.strip()}")
            matches += 1
            if matches >= 15:
                print("... truncated matches")
                break
    if matches == 0:
        print("No matches found")
