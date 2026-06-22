import json
import sys

# Reconfigure stdout for utf-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

log_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\011aeb71-3de4-4eeb-8a2a-a3bbc01ff4f1\.system_generated\logs\transcript.jsonl"

found_any = False
with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            
            # Look for VIEW_FILE step where locations_db.json content is returned
            # Usually the system outputs the file contents in the step content if it's VIEW_FILE type
            if data.get("type") == "VIEW_FILE" and "locations_db.json" in content:
                print(f"Line {idx} matches VIEW_FILE of locations_db.json.")
                # Save it
                out_path = f"c:\\Users\Admin\\Downloads\\full\\bot\\scratch\\extracted_locations_db_{idx}.txt"
                with open(out_path, 'w', encoding='utf-8') as out_f:
                    out_f.write(content)
                print(f"Saved content to {out_path} (length: {len(content)})")
                found_any = True
        except Exception as e:
            pass

if not found_any:
    print("No matches found in VIEW_FILE type.")
