with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/views/DetailView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    if 'setCurrentPage' in line or 'quay lại' in line.lower() or 'quay lai' in line.lower() or 'back' in line.lower():
        start = max(1, idx - 5)
        end = min(len(lines), idx + 5)
        output.append(f"--- DetailView occurrence at line {idx} ---")
        for i in range(start, end + 1):
            output.append(f"{i}: {lines[i-1].rstrip()}")
        output.append("\n" + "="*50 + "\n")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/detail_view_back.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done search DetailView back")
