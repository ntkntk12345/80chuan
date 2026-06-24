import os

web_ha_dir = r"c:\Users\Admin\Downloads\80chuan\web-ha"

found = []
for root, dirs, files in os.walk(web_ha_dir):
    for file in files:
        if file.endswith((".js", ".jsx", ".html", ".css", ".json")):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    for idx, line in enumerate(f):
                        if "tài land" in line.lower() or "tai land" in line.lower():
                            found.append((file_path, idx + 1, line.strip()))
            except Exception:
                pass

print(f"Found {len(found)} matches in web-ha:")
for path, line_no, content in found:
    print(f"  {os.path.basename(path)}:{line_no}: {content}")
