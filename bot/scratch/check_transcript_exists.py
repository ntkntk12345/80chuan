import os
import json

log_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\011aeb71-3de4-4eeb-8a2a-a3bbc01ff4f1\.system_generated\logs\transcript.jsonl"
print("Exists:", os.path.exists(log_path))
if os.path.exists(log_path):
    print("Size:", os.path.getsize(log_path))
