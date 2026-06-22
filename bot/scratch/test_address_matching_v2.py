import sqlite3
import json
import sys
import re
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def clean_address_v2(addr):
    if not addr:
        return "", ""
    
    # Split by common delimiters and take the first part
    parts = re.split(r'[,–\-]', addr)
    base_part = parts[0].strip()
    if len(base_part) < 8 and len(parts) > 1:
        base_part = base_part + " " + parts[1].strip()
        
    # Normalize unicode and lowercase
    base_part = unicodedata.normalize('NFC', base_part).lower()
    
    # Remove accents
    s = unicodedata.normalize("NFKD", base_part)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("đ", "d")
    
    # Extract base alley number
    ngo_match = re.search(r'ngo\s*(\d+)', s)
    ngo_num = ngo_match.group(1) if ngo_match else ""
    
    # Clean up words to extract street name
    indicators = ['ngo', 'ngach', 'hem', 'so nha', 'nha so', 'so', 'nha', 'tang', 'phong', 'ban cong', 'gac xep', 'chung cu', 'phuong', 'quan', 'duong']
    cleaned = s
    for ind in indicators:
        cleaned = re.sub(r'\b' + re.escape(ind) + r'\b', '', cleaned)
        
    cleaned = re.sub(r'[\d/\-]+', ' ', cleaned)
    
    words = [w.strip() for w in cleaned.split() if w.strip()]
    # Keep words that are at least 2 chars long (unless the word is 'o' or similar, but 2 is safe)
    street_words = [w for w in words if len(w) >= 2]
    street_name = " ".join(street_words)
    
    return street_name, ngo_num

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, address, photos, videos, room_type, status FROM rooms;")
all_rooms = c.fetchall()

photo_rich = []
photo_less = []

for r in all_rooms:
    rid, addr, p_json, v_json, rtype, status = r
    try:
        p_list = json.loads(p_json) if p_json else []
    except:
        p_list = []
        
    street_name, ngo_num = clean_address_v2(addr)
    
    if status == 'approved' and len(p_list) == 0:
        photo_less.append((rid, addr, street_name, ngo_num))
    elif len(p_list) > 0:
        photo_rich.append((rid, addr, p_json, v_json, street_name, ngo_num))

print(f"Total photo-rich rooms: {len(photo_rich)}")
print(f"Total photo-less approved rooms: {len(photo_less)}")

matched_count = 0
unmatched = []

for less_id, less_addr, less_street, less_ngo in photo_less:
    candidates = []
    for rich_id, rich_addr, rich_p, rich_v, rich_street, rich_ngo in photo_rich:
        if less_street and less_street == rich_street and less_ngo == rich_ngo:
            candidates.append((rich_id, rich_addr, rich_p, rich_v))
            
    if candidates:
        matched_count += 1
    else:
        unmatched.append((less_id, less_addr, less_street, less_ngo))

print(f"Summary: Matched {matched_count} out of {len(photo_less)} empty photo rooms.")
print(f"Unmatched count: {len(unmatched)}")
if unmatched:
    print("\n--- SAMPLE UNMATCHED ROOMS ---")
    for r in unmatched[:20]:
        print(f"ID: {r[0]} | Addr: {r[1]} | Street: '{r[2]}' | Ngo: '{r[3]}'")

conn.close()
