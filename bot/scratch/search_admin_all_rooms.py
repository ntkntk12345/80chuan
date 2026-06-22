with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/views/AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
found = False
for idx, line in enumerate(lines, 1):
    if "activeTab === 'all-rooms'" in line:
        start = max(1, idx - 2)
        end = min(len(lines), idx + 100)
        output.append(f"--- Render of all-rooms starts at line {idx} ---")
        for i in range(start, end + 1):
            output.append(f"{i}: {lines[i-1].rstrip()}")
        output.append("\n" + "="*50 + "\n")
        found = True

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/admin_all_rooms_render.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done search all-rooms render:", found)
