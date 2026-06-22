import sys

sys.stdout.reconfigure(encoding='utf-8')

# Write all output to a text file
out_file = open("search_486_results.txt", "w", encoding="utf-8")
sys.stdout = out_file

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

target_ts = 1781836065.345

print("=== SEARCHING 2A MESSAGES AROUND 1781836065 ===")

# Let's search for lines mentioning "486" or "575/09" in the log
for idx, line in enumerate(lines):
    if "486" in line or "575/09" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # Let's print 10 lines before and after to see if there are photo URLs
        print("--- CONTEXT ---")
        start = max(0, idx - 15)
        end = min(len(lines), idx + 15)
        for c_idx in range(start, end):
            print(f"  L{c_idx+1}: {lines[c_idx].strip()}")
        print("-" * 50)
