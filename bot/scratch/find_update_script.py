import json

log_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\011aeb71-3de4-4eeb-8a2a-a3bbc01ff4f1\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if "update_hoangquocviet" in line:
            print(f"Line {idx} matches 'update_hoangquocviet'")
            try:
                data = json.loads(line)
                print("Content Preview:", str(data.get("content", ""))[:500])
                # If there's tool calls, print them too
                print("Tool Calls:", data.get("tool_calls"))
            except Exception:
                pass
            print("-" * 50)
