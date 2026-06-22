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
        if idx >= 1460 and idx <= 1470:
            try:
                data = json.loads(line)
                print(f"--- Step {idx} (type={data.get('type')}, status={data.get('status')}) ---")
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    if "update_hoangquocviet.py" in str(tc):
                        print("Found tool call!")
                        print("Args:")
                        print(tc.get("args", {}).get("CodeContent"))
            except Exception as e:
                print(f"Error parsing line {idx}: {e}")
