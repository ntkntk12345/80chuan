import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("search_pending_queue_results.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Separate items by ----------------------------------------
items = content.split("----------------------------------------")

print(f"Total split blocks: {len(items)}")

for idx, item in enumerate(items):
    if "575" in item or "119" in item:
        print(f"\nBLOCK MATCH:")
        lines = item.strip().split("\n")
        # print first few lines of block
        for line in lines:
            if any(k in line.lower() for k in ["instance", "symbol", "text:", "photos count", "photo:", "videos count"]):
                print("  ", line)
