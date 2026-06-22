with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    if 'handleFiltersChange' in line or 'fetchRooms' in line or 'refreshRooms' in line:
        # Get context of 5 lines before and after
        start = max(1, idx - 10)
        end = min(len(lines), idx + 20)
        output.append(f"--- Occurrence at line {idx} ---")
        for i in range(start, end + 1):
            output.append(f"{i}: {lines[i-1].rstrip()}")
        output.append("\n" + "="*50 + "\n")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/filters_change_in_app.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done")
