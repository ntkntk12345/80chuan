import sys

sys.stdout.reconfigure(encoding='utf-8')

log_path = r"c:\Users\Administrator\Downloads\80lankh\bot\listener.log"

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

occurrences = [6692, 6817, 11155, 45480, 45553, 51472, 51689, 51725, 51738]

with open("earlier_119_posts.txt", "w", encoding="utf-8") as out:
    for occ in occurrences:
        idx = occ - 1
        out.write(f"\n================ OCCURRENCE LINE {occ} ================\n")
        start = max(0, idx - 15)
        end = min(len(lines), idx + 25)
        for i in range(start, end):
            out.write(f"L{i+1}: {lines[i].strip()}\n")
