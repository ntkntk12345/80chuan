import sys
import os
import time
import json
import re
import sqlite3
import unicodedata

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add current directory to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

DEFAULT_DB_PATH = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"

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
    ngach_match = re.search(r'(?:ngach|hem)\s*(\d+)', s)
    ngach_num = ngach_match.group(1) if ngach_match else ""
    
    # If there is a slash like "575/10", then 575 is ngo, 10 is ngach
    slash_match = re.search(r'(\d+)[\s/]+(\d+)', s)
    if slash_match:
        n1, n2 = slash_match.groups()
        if ngo_num == n1 or not ngo_num:
            ngo_num = n1
            if not ngach_num:
                ngach_num = n2
                
    # Extract house number
    house_match = re.search(r'(?:so nha|nha so|so)\s*(\d+)', s)
    house_num = house_match.group(1) if house_match else ""
    
    # Extract street name
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

def fix_empty_photos():
    print(f"[PHOTO-FIX] Bắt đầu quét các phòng trống ảnh tại {DEFAULT_DB_PATH}...")
    if not os.path.exists(DEFAULT_DB_PATH):
        print(f"[PHOTO-FIX] Lỗi: Không tìm thấy database tại {DEFAULT_DB_PATH}")
        return

    conn = sqlite3.connect(DEFAULT_DB_PATH)
    cursor = conn.cursor()

    try:
        # 1. Fetch all rooms
        cursor.execute("SELECT id, address, photos, videos, room_type, status FROM rooms;")
        all_rooms = cursor.fetchall()
        
        photo_rich = []
        photo_less = []

        for r in all_rooms:
            rid, addr, p_json, v_json, rtype, status = r
            try:
                p_list = json.loads(p_json) if p_json else []
            except:
                p_list = []
                
            features = extract_address_features(addr)
            
            # We fix photo-less rooms that are approved
            if status == 'approved' and len(p_list) == 0:
                photo_less.append((rid, addr, rtype, features))
            elif len(p_list) > 0:
                photo_rich.append((rid, addr, p_json, v_json, rtype, features))
                
        print(f"[PHOTO-FIX] Tổng số phòng có ảnh: {len(photo_rich)}")
        print(f"[PHOTO-FIX] Tổng số phòng được duyệt đang trống ảnh: {len(photo_less)}")
        
        if not photo_less:
            print("[PHOTO-FIX] Không có phòng trống ảnh nào cần sửa.")
            conn.close()
            return

        updated_count = 0
        
        for less_id, less_addr, less_type, less_feat in photo_less:
            candidates = []
            
            # Match candidates by street name and ngo number
            for rich_id, rich_addr, rich_p, rich_v, rich_type, rich_feat in photo_rich:
                if less_feat["street"] and less_feat["street"] == rich_feat["street"] and less_feat["ngo"] == rich_feat["ngo"]:
                    # Match score
                    score = 0
                    if less_feat["ngach"] == rich_feat["ngach"]:
                        score += 10
                        if less_feat["house_num"] == rich_feat["house_num"] and less_feat["house_num"]:
                            score += 5
                    elif less_feat["ngach"] or rich_feat["ngach"]:
                        score -= 5
                        
                    if less_type and less_type == rich_type:
                        score += 3
                        
                    candidates.append((score, rich_id, rich_addr, rich_p, rich_v))
                    
            if candidates:
                # Sort: highest score first, then highest ID (most recent) first
                candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
                best_score, best_id, best_addr, best_p, best_v = candidates[0]
                
                # Copy photos and videos to the database row
                cursor.execute("""
                    UPDATE rooms 
                    SET photos = ?, videos = ? 
                    WHERE id = ?
                """, (best_p, best_v, less_id))
                updated_count += 1
                
                print(f"[PHOTO-FIX] Đã sửa ID {less_id} ({less_addr}) -> Mượn ảnh từ ID {best_id} ({best_addr}) | Số ảnh: {len(json.loads(best_p))} (Score: {best_score})")

        if updated_count > 0:
            conn.commit()
            print(f"[PHOTO-FIX] Đã cập nhật thành công {updated_count} phòng trống ảnh trong database.")
        else:
            print("[PHOTO-FIX] Không tìm thấy phòng nào khớp để cập nhật.")
            
    except Exception as e:
        print(f"[PHOTO-FIX] Lỗi: {e}")
    finally:
        conn.close()

def main():
    print("[PHOTO-FIX] Khởi chạy dịch vụ tự động cập nhật ảnh phòng trống...")
    while True:
        try:
            fix_empty_photos()
        except Exception as e:
            print(f"[PHOTO-FIX] Lỗi vòng lặp chính: {e}")
        print("[PHOTO-FIX] Đang ngủ 5 phút trước lượt quét tiếp theo...")
        time.sleep(300)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        fix_empty_photos()
    else:
        main()
