import sys
import os
import urllib.parse
import urllib.request
import json
import re

def esri(address):
    encoded_query = urllib.parse.quote(address)
    url = (
        f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?"
        f"f=json&singleLine={encoded_query}&maxLocations=1"
        f"&location=105.8542,21.0285&distance=50000"
    )
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    import ssl
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, timeout=8, context=context) as response:
        data = json.loads(response.read().decode())
        candidates = data.get('candidates', [])
        if candidates:
            c = candidates[0]
            loc = c.get('location', {})
            return (float(loc.get('y')), float(loc.get('x')), c.get('address', ''), c.get('score'))
    return None

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def is_generic_match(original, result_addr):
    has_digits = bool(re.search(r'\d', original))
    res_has_digits = bool(re.search(r'\d', result_addr))
    return has_digits and not res_has_digits

addr1 = "Số 10 ngõ 268 Phạm Văn Đồng - Bắc Từ Liêm, Hà Nội"
res1 = esri(addr1)
print("Addr1:", res1, "Generic:", is_generic_match(addr1, res1[2]))

addr2 = "Số 10 ngõ 268 Phạm Văn Đồng, Hà Nội"
res2 = esri(addr2)
print("Addr2:", res2, "Generic:", is_generic_match(addr2, res2[2]))

