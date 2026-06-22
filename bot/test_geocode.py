import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from map1 import geocode_address_esri

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

address = "Số 10 ngõ 268 Phạm Văn Đồng - Bắc Từ Liêm, Hà Nội"
res = geocode_address_esri(address)
print(f"Address: {address}")
print(f"Result: {res}")
