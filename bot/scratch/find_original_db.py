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
            # We want to find a VIEW_FILE step where the file is locations_db.json
            step_type = data.get("type")
            tool_calls = data.get("tool_calls", [])
            content = data.get("content", "")
            
            # Check if it's a VIEW_FILE response or tool call with locations_db.json
            is_match = False
            if step_type == "VIEW_FILE" and "locations_db.json" in str(data.get("content", "")):
                is_match = True
            elif "locations_db.json" in str(tool_calls):
                is_match = True
                
            if is_match:
                print(f"Match found at line {idx}: type={step_type}, status={data.get('status')}")
                # Print the content or first 500 chars of it
                content_str = str(data.get("content", ""))
                print("Content Length:", len(content_str))
                print("Content Preview:", content_str[:1000])
                print("-" * 50)
        except Exception as e:
            pass
