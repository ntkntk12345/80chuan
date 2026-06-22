import os

def search_text_in_files(directory, queries):
    output = []
    for query in queries:
        output.append(f"Searching for '{query}' in {directory}:")
        for root, dirs, files in os.walk(directory):
            if 'node_modules' in root or '.git' in root or 'dist' in root:
                continue
            for file in files:
                if file.endswith(('.js', '.jsx', '.css', '.html')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            for line_num, line in enumerate(f, 1):
                                if query in line:
                                    output.append(f"{path}:{line_num}: {line.strip()}")
                    except Exception as e:
                        pass
        output.append("\n")

    with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/search_code.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))

search_text_in_files('c:/Users/Administrator/Downloads/80lankh/web-ha/src', ["includes(normalizeString('tr'))", "includes('tr')", "includes('triệu')"])
print("Done search")
