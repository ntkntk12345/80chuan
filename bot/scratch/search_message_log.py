import json
import os

mids = []
session_id = '1782116985000'

# We can scan pending_queue.json, message_log.json and check_history.json
paths = ['pending_queue.json', 'message_log.json']
for path in paths:
    if os.path.exists(path):
        try:
            data = json.load(open(path, 'r', encoding='utf-8'))
            print(f'Checking {path}...')
            if isinstance(data, list):
                matches = [item for item in data if item.get('id') == session_id or item.get('session_id') == session_id]
                print(f'  Found {len(matches)} matches')
                for m in matches:
                    print(f'    ID: {m.get("id")} | Photos: {len(m.get("photos", []))}')
            elif isinstance(data, dict):
                # check if session_id is a key
                if session_id in data:
                    print(f'  Found key {session_id}')
        except Exception as e:
            print(f'  Error: {e}')
