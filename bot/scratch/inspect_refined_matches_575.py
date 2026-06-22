import sqlite3
import json
import sys
from test_refined_matching import extract_address_features

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

ids = [5417, 5759, 5760]

for target_id in ids:
    c.execute("SELECT id, address, room_type, price, photos, text2 FROM rooms WHERE id = ?;", (target_id,))
    room = c.fetchone()
    if not room:
        print(f"Room ID {target_id} not found!")
        continue
        
    rid, addr, rtype, price, photos_raw, text2 = room
    feat = extract_address_features(addr)
    print(f"\n================ INSPECTING ID {rid} ================")
    print(f"Address: {addr}")
    print(f"Features: {feat}")
    print(f"Room Type: {rtype} | Price: {price}")
    
    # Let's find candidates in photo_rich
    c.execute("SELECT id, address, room_type, price, photos, text2 FROM rooms WHERE photos IS NOT NULL AND json_array_length(photos) > 0;")
    rich_rooms = c.fetchall()
    
    candidates = []
    for r_id, r_addr, r_type, r_price, r_photos, r_text2 in rich_rooms:
        r_feat = extract_address_features(r_addr)
        if feat["street"] and feat["street"] == r_feat["street"] and feat["ngo"] == r_feat["ngo"]:
            # Match score
            score = 0
            if feat["ngach"] == r_feat["ngach"]:
                score += 10
                if feat["house_num"] == r_feat["house_num"] and feat["house_num"]:
                    score += 5
            elif feat["ngach"] or r_feat["ngach"]:
                score -= 5
                
            if rtype and rtype == r_type:
                score += 3
                
            p_len = len(json.loads(r_photos))
            candidates.append((score, r_id, r_addr, r_type, r_price, p_len))
            
    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    print(f"Found {len(candidates)} candidates in the same Ngõ:")
    for score, r_id, r_addr, r_type, r_price, p_len in candidates[:10]:
        print(f"  Score: {score} | ID {r_id} | Addr: {r_addr} | Type: {r_type} | Price: {r_price} | Photos: {p_len}")

conn.close()
