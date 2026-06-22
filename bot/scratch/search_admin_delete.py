with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/views/AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    if 'DELETE' in line or 'xóa' in line.lower() or 'xoá' in line.lower() or 'sửa' in line.lower() or 'sua' in line.lower():
        if 'className' in line or 'button' in line or 'onClick' in line or 'fetch' in line or 'td' in line:
            start = max(1, idx - 5)
            end = min(len(lines), idx + 5)
            output.append(f"--- Occurrence at line {idx} ---")
            for i in range(start, end + 1):
                output.append(f"{i}: {lines[i-1].rstrip()}")
            output.append("\n" + "="*50 + "\n")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/admin_delete_search.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done search delete")
