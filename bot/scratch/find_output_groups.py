import os

bot_dir = r"c:\Users\Admin\Downloads\80chuan\bot"

found = []
for file in os.listdir(bot_dir):
    if file.endswith(".py") or file.endswith(".json"):
        file_path = os.path.join(bot_dir, file)
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                for idx, line in enumerate(f):
                    if "output_groups_map" in line or "chung_cu_ids" in line or "nguyen_can_ids" in line:
                        found.append((file_path, idx + 1, line.strip()))
        except Exception:
            pass

print(f"Found {len(found)} matches for output groups:")
for path, line_no, content in found:
    print(f"  {os.path.basename(path)}:{line_no}: {content}")
