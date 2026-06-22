import requests
import json
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

API_KEY = "sk-lWIIAQLc58sZOoRUZIFjcG7kpgN9eYVMK9DUwQyL9qbTYhyR"
BASE_URL = "https://api.vietapi.tech/v1"

payload = {
    "model": "gpt-5.5-high",
    "messages": [
        {
            "role": "user",
            "content": "Hi, say hello"
        }
    ],
    "stream": False
}

for attempt in range(5):
    try:
        response = requests.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=120
        )
        print(f"Attempt {attempt+1} - Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response Headers Content-Type:", response.headers.get("Content-Type"))
            print(json.dumps(response.json(), ensure_ascii=False, indent=2))
            break
        else:
            print("Error body:", response.text)
    except Exception as e:
        print("Error:", e)
