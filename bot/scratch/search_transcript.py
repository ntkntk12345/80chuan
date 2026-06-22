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

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            # Check if locations_db.json is in content or tool_calls
            found = False
            if "locations_db.json" in str(line):
                # Print index and type
                print(f"Line {idx}: type={data.get('type')}, status={data.get('status')}")
                # Print snippet
                text = str(line)
                pos = text.find("locations_db.json")
                print("  Snippet:", text[max(0, pos-100):min(len(text), pos+300)])
        except Exception as e:
            print(f"Error on line {idx}: {e}")
