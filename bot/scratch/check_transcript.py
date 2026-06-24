import json
import os
import sys

transcript_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\87c8c742-3718-42d4-aeae-17ef5ad064ec\.system_generated\logs\transcript.jsonl"
out_path = r"c:\Users\Admin\Downloads\80chuan\bot\scratch\user_msgs.txt"

if not os.path.exists(transcript_path):
    print("Transcript not found")
    exit(0)

user_msgs = []
with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        try:
            step = json.loads(line)
            source = step.get("source")
            stype = step.get("type")
            content = step.get("content")
            
            if source == "USER" or stype == "USER_INPUT" or "USER" in str(source):
                user_msgs.append((i, source, stype, content))
        except Exception as e:
            pass

with open(out_path, "w", encoding="utf-8") as f:
    f.write(f"Found {len(user_msgs)} user messages.\n")
    for idx, (step_i, src, typ, msg) in enumerate(user_msgs[-20:]):
        f.write(f"--- Msg #{idx} (Step {step_i}): {src} / {typ} ---\n")
        f.write(str(msg) + "\n")
        f.write("=" * 60 + "\n")

print("Wrote output to", out_path)
