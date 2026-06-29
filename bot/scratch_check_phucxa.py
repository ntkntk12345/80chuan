import json
import os

file_path = r"c:\Users\Administrator\Downloads\80lankh\bot\processed\districts_full\badinh.json"
session_id = "1782456825282"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Total records in badinh.json: {len(data)}")
    for row in data:
        if str(row.get("id")).strip() == session_id:
            print("Found record!")
            print("Session ID:", row.get("id"))
            print("Photos count:", len(row.get("photos", [])))
            print("Photos details:", row.get("photos"))
            print("Videos details:", row.get("videos"))
            print("Text preview:", row.get("text")[:100] if row.get("text") else "")
            break
    else:
        print("Session not found in badinh.json")
else:
    print("badinh.json not found")
