import sqlite3
import json
import sys
import re
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text):
    if not text:
        return ""
    norm = unicodedata.normalize('NFC', text).lower()
    s = unicodedata.normalize("NFKD", norm)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.replace("đ", "d").strip()

def extract_address_features(addr):
    if not addr:
        return {"street": "", "ngo": "", "ngach": "", "house_num": ""}
    
    s = clean_text(addr)
    
    # Extract ngo number
    ngo_match = re.search(r'ngo\s*(\d+)', s)
    ngo_num = ngo_match.group(1) if ngo_match else ""
    
    # Extract ngach/hem number
    # Often in formats like "ngach 11", "hem 23", or slash address like "575/10"
    ngach_match = re.search(r'(?:ngach|hem)\s*(\d+)', s)
    ngach_num = ngach_match.group(1) if ngach_match else ""
    
    # If there is a slash like "575/10", then 575 is ngo, 10 is ngach
    slash_match = re.search(r'(\d+)[\s/]+(\d+)', s)
    if slash_match:
        # Check if the first number matches ngo_num or if ngo_num is empty
        n1, n2 = slash_match.groups()
        if ngo_num == n1 or not ngo_num:
            ngo_num = n1
            if not ngach_num:
                ngach_num = n2
                
    # Extract house number
    house_match = re.search(r'(?:so nha|nha so|so)\s*(\d+)', s)
    house_num = house_match.group(1) if house_match else ""
    
    # Extract street name by stripping indicators and numbers
    cleaned = s
    districts = [
        'ba dinh', 'cau giay', 'dong da', 'ha dong', 'hai ba trung', 'hoang mai',
        'nam tu liem', 'bac tu liem', 'tay ho', 'thanh xuan', 'thanh tri', 'hoai duc',
        'long bien', 'hoan kiem', 'ha noi', 'viet nam', 'quan', 'huyen', 'thanh pho'
    ]
    for d in districts:
        cleaned = re.sub(r'\b' + re.escape(d) + r'\b', '', cleaned)
        
    indicators = ['ngo', 'ngach', 'hem', 'so nha', 'nha so', 'so', 'nha', 'tang', 'phong', 'ban cong', 'gac xep', 'chung cu', 'phuong', 'quan', 'duong']
    for ind in indicators:
        cleaned = re.sub(r'\b' + re.escape(ind) + r'\b', '', cleaned)
        
    cleaned = re.sub(r'[\d/\-]+', ' ', cleaned)
    
    words = [w.strip() for w in cleaned.split() if w.strip()]
    street_words = [w for w in words if len(w) >= 2]
    street_name = " ".join(street_words)
    
    return {
        "street": street_name,
        "ngo": ngo_num,
        "ngach": ngach_num,
        "house_num": house_num
    }

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, address, photos, videos, room_type, price, status FROM rooms;")
all_rooms = c.fetchall()

photo_rich = []
photo_less = []

for r in all_rooms:
    rid, addr, p_json, v_json, rtype, price, status = r
    try:
        p_list = json.loads(p_json) if p_json else []
    except:
        p_list = []
        
    features = extract_address_features(addr)
    
    if status == 'approved' and len(p_list) == 0:
        photo_less.append((rid, addr, rtype, price, features))
    elif len(p_list) > 0:
        photo_rich.append((rid, addr, p_json, v_json, rtype, price, features))

print(f"Total photo-rich rooms: {len(photo_rich)}")
print(f"Total photo-less approved rooms: {len(photo_less)}")

matched_count = 0
unmatched = []

for less_id, less_addr, less_type, less_price, less_feat in photo_less:
    candidates = []
    
    # 1. Match candidates by street name and ngo number
    for rich_id, rich_addr, rich_p, rich_v, rich_type, rich_price, rich_feat in photo_rich:
        if less_feat["street"] and less_feat["street"] == rich_feat["street"] and less_feat["ngo"] == rich_feat["ngo"]:
            # Calculate match score
            score = 0
            # If sub-alley (ngách) matches exactly
            if less_feat["ngach"] == rich_feat["ngach"]:
                score += 10
                # If house number also matches
                if less_feat["house_num"] == rich_feat["house_num"] and less_feat["house_num"]:
                    score += 5
            elif less_feat["ngach"] or rich_feat["ngach"]:
                # Penalty if one has ngách and the other doesn't, or they differ
                score -= 5
                
            # If room type or room code/layout matches
            if less_type and less_type == rich_type:
                score += 3
                
            candidates.append((score, rich_id, rich_addr, rich_p, rich_v))
            
    if candidates:
        matched_count += 1
        # Sort candidates: highest score first, then highest ID (most recent) first
        candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
        best_score, best_id, best_addr, best_p, best_v = candidates[0]
        
        if matched_count <= 40:
            print(f"\nMatch #{matched_count} (Score: {best_score}):")
            print(f"  Empty:  ID {less_id} | {less_addr}")
            print(f"  Source: ID {best_id} | {best_addr}")
            print(f"  Photos: {len(json.loads(best_p))} photos")
    else:
        unmatched.append((less_id, less_addr, less_feat))

print(f"\nSummary: Matched {matched_count} out of {len(photo_less)} empty photo rooms.")
print(f"Unmatched count: {len(unmatched)}")

conn.close()
