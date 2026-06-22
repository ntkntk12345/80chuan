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
    encoded = urllib.parse.quote(query)
    url = f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine={encoded}&maxLocations=1"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            candidates = data.get('candidates', [])
            if candidates:
                cand = candidates[0]
                location = cand.get('location', {})
                return float(location.get('y')), float(location.get('x')), cand.get('address')
    except Exception as e:
        print(f"Error geocoding {query}: {e}")
    return None

test_landmarks = {
    "Đại học Ngoại thương": "Trường Đại học Ngoại thương, 91 Chùa Láng, Láng, Đống Đa, Hà Nội, Việt Nam",
    "Học viện Tài chính": "Học viện Tài chính, 58 Lê Văn Hiến, Đức Thắng, Bắc Từ Liêm, Hà Nội, Việt Nam",
    "Ga La Thành": "Ga La Thành, Đê La Thành, Ô Chợ Dừa, Đống Đa, Hà Nội, Việt Nam",
    "Đại học Hà Nội": "Trường Đại học Hà Nội, 264 Nguyễn Trãi, Thanh Xuân, Hà Nội, Việt Nam",
    "Cao đẳng Du lịch Hà Nội": "Trường Cao đẳng Du lịch Hà Nội, 236 Hoàng Quốc Việt, Cổ Nhuế, Bắc Từ Liêm, Hà Nội, Việt Nam",
    "Cao đẳng FPT Polytechnic": "Cao đẳng FPT Polytechnic, Phố Trịnh Văn Bô, Phương Canh, Nam Từ Liêm, Hà Nội, Việt Nam",
    "Bến xe Nước Ngầm": "Bến xe Nước Ngầm, Số 1 Ngọc Hồi, Hoàng Liệt, Hoàng Mai, Hà Nội, Việt Nam",
    "Ga Thái Hà": "Ga Thái Hà, Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội, Việt Nam",
    "Ga Vành Đai 3": "Ga Vành Đai 3, Nguyễn Trãi, Thanh Xuân Trung, Thanh Xuân, Hà Nội, Việt Nam",
}

for name, q in test_landmarks.items():
    res = geocode(q)
    if res:
        print(f"{name:<30} -> Lat: {res[0]:<10.6f} | Lon: {res[1]:<10.6f} | Match: {res[2]}")
    else:
        print(f"{name:<30} -> Failed")
