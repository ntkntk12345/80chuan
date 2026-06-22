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

target_steps = [143, 205, 766, 1250]
with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if idx in target_steps:
            try:
                data = json.loads(line)
                print(f"--- Step {idx} (type={data.get('type')}, status={data.get('status')}) ---")
                content = data.get("content", "")
                print("Length:", len(content))
                # Save it to a file
                out_path = f"c:\\Users\\Admin\\Downloads\\full\\bot\\scratch\\step_{idx}_content.txt"
                with open(out_path, 'w', encoding='utf-8') as out_f:
                    out_f.write(content)
                print(f"Saved to {out_path}")
            except Exception as e:
                print(f"Error reading step {idx}: {e}")
