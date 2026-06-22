import urllib.request
import urllib.parse
import json
import sys

# Configure UTF-8 console output
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def geocode(query):
    encoded = urllib.parse.quote(query + ", Hà Nội, Việt Nam")
    url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine={encoded}&maxLocations=1"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                cand = candidates[0]
                return cand.get('location', {}).get('y'), cand.get('location', {}).get('x'), cand.get('address')
    except Exception as e:
        print(f"Error geocoding {query}: {e}")
    return None

test_queries = [
    "Trường Đại học Ngoại thương, 91 Chùa Láng",
    "Trường Đại học Sư phạm Hà Nội, 136 Xuân Thủy",
    "Trường Đại học Bách khoa Hà Nội, 1 Đại Cồ Việt",
    "8 Ngõ 76 Trần Thái Tông",
]

for q in test_queries:
    res = geocode(q)
    if res:
        print(f"Query: {q} -> Lat/Lon: {res[0]}, {res[1]} | Address: {res[2]}")
    else:
        print(f"Query: {q} -> Failed")
