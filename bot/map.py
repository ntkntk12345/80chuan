import os
import json
import math
import urllib.request
import urllib.parse
import sys

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Path to the pre-populated Hanoi landmarks database
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'distance_app', 'locations_db.json')

def load_locations():
    if not os.path.exists(DATABASE_PATH):
        print(f"Lỗi: Không tìm thấy tệp cơ sở dữ liệu tại {DATABASE_PATH}")
        print("Vui lòng đảm bảo tệp tin 'distance_app/locations_db.json' đã được tạo.")
        return []
    try:
        with open(DATABASE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Lỗi đọc cơ sở dữ liệu: {e}")
        return []

def geocode_address_esri(address):
    """
    Geocodes an address string using Esri Public Geocoding API,
    optimized specifically for Hanoi, Vietnam.
    """
    # Append Hanoi, Vietnam if not present to prioritize Hanoi coordinates
    search_query = address
    if "hà nội" not in search_query.lower() and "ha noi" not in search_query.lower():
        search_query += ", Hà Nội, Việt Nam"
        
    encoded_query = urllib.parse.quote(search_query)
    # Esri ArcGIS Geocoder URL prioritizing Hanoi (Lat 21.0285, Lon 105.8542)
    url = (
        f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?"
        f"f=json&singleLine={encoded_query}&maxLocations=1"
        f"&location=105.8542,21.0285&distance=50000"
    )
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    )
    
    try:
        import ssl
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=8, context=context) as response:
            data = json.loads(response.read().decode())
            candidates = data.get('candidates', [])
            if candidates:
                candidate = candidates[0]
                addr_name = candidate.get('address', '')
                loc = candidate.get('location', {})
                return float(loc.get('y')), float(loc.get('x')), addr_name
    except Exception as e:
        print(f"Lỗi kết nối API định vị: {e}")
    return None

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points in kilometers.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
        
    R = 6371.0  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)

def main():
    print("=" * 65)
    print("    HANOI ROUTES - CÔNG CỤ TÌM ĐỊA ĐIỂM TRONG PHẠM VI 5KM")
    print("=" * 65)
    
    # Load landmark database
    locations = load_locations()
    if not locations:
        return
        
    # User inputs Address A
    address_input = input("Nhập địa chỉ của bạn (Địa chỉ A): ").strip()
    if not address_input:
        print("Lỗi: Địa chỉ không được để trống!")
        return
        
    print("\nĐang định vị địa chỉ của bạn trên bản đồ Esri...")
    geo_result = geocode_address_esri(address_input)
    
    if not geo_result:
        print("Lỗi: Không tìm thấy tọa độ cho địa chỉ bạn nhập. Vui lòng kiểm tra lại!")
        return
        
    lat_a, lon_a, full_address_a = geo_result
    print(f"-> Đã định vị thành công điểm A:")
    print(f"   Địa chỉ chuẩn: {full_address_a}")
    print(f"   Tọa độ: Vĩ độ {lat_a:.6f}, Kinh độ {lon_a:.6f}")
    print("-" * 65)
    print("Đang tính toán các địa điểm trong bán kính 5km...\n")
    
    results = []
    for loc in locations:
        lat_b = loc.get('lat')
        lon_b = loc.get('lon')
        
        if lat_b is not None and lon_b is not None:
            dist = haversine_distance(lat_a, lon_a, lat_b, lon_b)
            # Filter strictly under 5.0 km
            if dist <= 5.0:
                results.append({
                    'name': loc.get('name'),
                    'category': loc.get('category'),
                    'address': loc.get('address'),
                    'distance': dist
                })
                
    # Sort nearest to farthest
    results.sort(key=lambda x: x['distance'])
    
    # Output results
    total_found = len(results)
    if total_found == 0:
        print("Không có địa điểm nào trong cơ sở dữ liệu nằm trong bán kính 5km từ vị trí của bạn.")
    else:
        print(f"Đã tìm thấy {total_found} địa điểm trong bán kính 5km (xếp theo gần nhất):")
        print("-" * 65)
        print(f"{'STT':<4} | {'Tên Địa Điểm':<32} | {'Danh Mục':<10} | {'Khoảng Cách':<10}")
        print("-" * 65)
        for idx, item in enumerate(results, 1):
            name_truncated = item['name'][:30] + '..' if len(item['name']) > 32 else item['name']
            print(f"{idx:<4} | {name_truncated:<32} | {item['category']:<10} | {item['distance']:>6} km")
            print(f"     └─ Địa chỉ: {item['address']}")
        print("-" * 65)
        print(f"Tổng cộng: {total_found} địa điểm nằm dưới 5km.")
    print("=" * 65)

if __name__ == "__main__":
    main()
