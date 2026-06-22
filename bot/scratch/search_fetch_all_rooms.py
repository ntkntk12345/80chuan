with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/views/AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    if 'fetchAllRooms' in line:
        start = max(1, idx - 5)
        end = min(len(lines), idx + 10)
        output.append(f"--- Occurrence at line {idx} ---")
        for i in range(start, end + 1):
            output.append(f"{i}: {lines[i-1].rstrip()}")
        output.append("\n" + "="*50 + "\n")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/fetch_all_rooms_occurrences.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done search fetchAllRooms")
