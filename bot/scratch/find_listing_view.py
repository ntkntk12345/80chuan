with open('c:/Users/Administrator/Downloads/80lankh/web-ha/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    if 'ListingView' in line or 'onFiltersChange' in line:
        output.append(f"{idx}: {line.strip()}")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/listing_view_in_app.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done")
