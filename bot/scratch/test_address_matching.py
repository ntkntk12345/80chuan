import sqlite3
import json
import sys
import re
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def clean_address(addr):
    if not addr:
        return "", ""
    
    # Normalize unicode and lowercase
    addr = unicodedata.normalize('NFC', addr).lower()
    
    # Remove accents
    s = unicodedata.normalize("NFKD", addr)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("đ", "d")
    
    # Extract base alley number
    ngo_match = re.search(r'ngo\s*(\d+)', s)
    ngo_num = ngo_match.group(1) if ngo_match else ""
    
    # Clean up words to extract street name
    districts = [
        'ba dinh', 'cau giay', 'dong da', 'ha dong', 'hai ba trung', 'hoang mai',
        'nam tu liem', 'bac tu liem', 'tay ho', 'thanh xuan', 'thanh tri', 'hoai duc',
        'long bien', 'hoan kiem', 'ha noi', 'viet nam', 'quan', 'huyen', 'thanh pho'
    ]
    
    cleaned = s
    for d in districts:
        cleaned = re.sub(r'\b' + re.escape(d) + r'\b', '', cleaned)
        
    indicators = ['ngo', 'ngach', 'hem', 'so nha', 'nha so', 'so', 'nha', 'tang', 'phong', 'ban cong', 'gac xep', 'chung cu']
    for ind in indicators:
        cleaned = re.sub(r'\b' + re.escape(ind) + r'\b', '', cleaned)
        
    cleaned = re.sub(r'[\d/\-]+', ' ', cleaned)
    
    words = [w.strip() for w in cleaned.split() if w.strip()]
    street_words = [w for w in words if len(w) >= 2]
    street_name = " ".join(street_words)
    
    return street_name, ngo_num

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Load all rooms in the database
c.execute("SELECT id, address, photos, videos, room_type, status FROM rooms;")
all_rooms = c.fetchall()

# Separate into photo-rich and photo-less
photo_rich = [] # list of (id, address, photos, videos, street_name, ngo_num)
photo_less = [] # list of (id, address, street_name, ngo_num)

for r in all_rooms:
    rid, addr, p_json, v_json, rtype, status = r
    try:
        p_list = json.loads(p_json) if p_json else []
    except:
        p_list = []
        
    street_name, ngo_num = clean_address(addr)
    
    # We only match approved rooms for photo_less
    if status == 'approved' and len(p_list) == 0:
        photo_less.append((rid, addr, street_name, ngo_num))
    elif len(p_list) > 0:
        photo_rich.append((rid, addr, p_json, v_json, street_name, ngo_num))

print(f"Total photo-rich rooms: {len(photo_rich)}")
print(f"Total photo-less approved rooms: {len(photo_less)}")

matched_count = 0
unmatched = []

print("\n--- SAMPLE MATCHES ---")
for idx, (less_id, less_addr, less_street, less_ngo) in enumerate(photo_less):
    # Find matching photo_rich rooms
    candidates = []
    for rich_id, rich_addr, rich_p, rich_v, rich_street, rich_ngo in photo_rich:
        # Check if street_name and ngo_num match
        # Let's require street_name to be non-empty and matching, and ngo_num to match (both empty or both matching)
        if less_street and less_street == rich_street and less_ngo == rich_ngo:
            candidates.append((rich_id, rich_addr, rich_p, rich_v))
            
    if candidates:
        matched_count += 1
        # Pick the most recent one (highest ID is usually newest)
        candidates.sort(key=lambda x: x[0], reverse=True)
        best_match = candidates[0]
        
        if matched_count <= 25:
            print(f"\nMatch #{matched_count}:")
            print(f"  Empty Room: ID {less_id} | {less_addr}")
            print(f"  Source Room: ID {best_match[0]} | {best_match[1]}")
            print(f"  Photos borrowed: {len(json.loads(best_match[2]))} photos")
    else:
        unmatched.append((less_id, less_addr, less_street, less_ngo))

print(f"\nSummary: Matched {matched_count} out of {len(photo_less)} empty photo rooms.")
print(f"Unmatched count: {len(unmatched)}")
if unmatched:
    print("\n--- SAMPLE UNMATCHED ROOMS ---")
    for r in unmatched[:10]:
        print(f"ID: {r[0]} | Addr: {r[1]} | Street: '{r[2]}' | Ngo: '{r[3]}'")

conn.close()
