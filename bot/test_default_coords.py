import urllib.request
import urllib.parse
import json
import ssl
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def test_geocode(address):
    encoded_query = urllib.parse.quote(address)
    url = (
        f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?"
        f"f=json&singleLine={encoded_query}&maxLocations=1"
        f"&location=105.8542,21.0285&distance=50000"
    )
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0'
        }
    )
    
    try:
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=8, context=context) as response:
            data = json.loads(response.read().decode())
            candidates = data.get('candidates', [])
            if candidates:
                c = candidates[0]
                print(f"Query: {address} -> Match: {c.get('address')} -> Coordinates: {c.get('location')}")
            else:
                print(f"Query: {address} -> No candidates")
    except Exception as e:
        print(f"Error for {address}: {e}")

test_geocode("Hà Nội")
test_geocode("Hà Nội, Việt Nam")
test_geocode("Cầu Giấy")
test_geocode("Cầu Giấy, Hà Nội")
test_geocode("Mai Dịch")
test_geocode("Mai Dịch, Cầu Giấy")
test_geocode("Hanoi")
