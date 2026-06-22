import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth's radius in km
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

# Coords from current check_tranthaitong.py:
# Room (Trần Thái Tông): Lat 21.0334933, Lon 105.7879041
# Coords from locations_db.json (the 20KB geocoded version):
# Đại học Ngoại thương: Lat 21.03956, Lon 105.78114
# Coords from step_143 (original locations_db.json version):
# Đại học Ngoại thương: Lat 21.0225, Lon 105.8033

# Let's calculate for both
dist_current_db = haversine_distance(21.0334933, 105.7879041, 21.03956, 105.78114)
dist_original_db = haversine_distance(21.0334933, 105.7879041, 21.0225, 105.8033)

print("Distance with 20KB DB (21.03956, 105.78114):", dist_current_db, "km")
print("Distance with Original DB (21.0225, 105.8033):", dist_original_db, "km")

# Actual coordinates of 91 Chùa Láng (FTU): 21.02259, 105.80518
dist_actual_ftu = haversine_distance(21.0334933, 105.7879041, 21.02259, 105.80518)
print("Distance with actual FTU coords (21.02259, 105.80518):", dist_actual_ftu, "km")
