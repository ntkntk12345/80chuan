import sys
import os
import json
import sqlite3

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, '..', 'web-ha', 'database.sqlite'))
WORKSPACE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

def get_empty_media_rooms(conn):
    cursor = conn.cursor()
    # Find rooms that have empty photos or empty videos
    cursor.execute("""
        SELECT id, session_id, room_code, address, district, photos, videos 
        FROM rooms 
        WHERE photos IS NULL OR photos = '[]' OR photos = '' 
           OR videos IS NULL OR videos = '[]' OR videos = ''
    """)
    return cursor.fetchall()

def scan_workspace_for_sessions(target_sids):
    print(f"[RECOVER] Quét toàn bộ thư mục bot/ để tìm thông tin ảnh/video cho {len(target_sids)} sessions...")
    
    session_map = {}
    total_files = 0
    total_loaded = 0
    
    # We walk starting from WORKSPACE_DIR/bot to find all JSON files
    bot_dir = os.path.join(WORKSPACE_DIR, "bot")
    if not os.path.exists(bot_dir):
        bot_dir = WORKSPACE_DIR
        
    for root, dirs, files in os.walk(bot_dir):
        if ".git" in root or "node_modules" in root:
            continue
        for file in files:
            if not file.lower().endswith(".json"):
                continue
            file_path = os.path.join(root, file)
            total_files += 1
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read().strip()
                if not content:
                    continue
                # Fast check to see if any of our target sids is in raw content
                if not any(sid in content for sid in target_sids):
                    continue
                
                try:
                    data = json.loads(content)
                except Exception:
                    continue
                
                def parse_records(node):
                    nonlocal total_loaded
                    if isinstance(node, dict):
                        sid = str(node.get("id") or node.get("session_id") or node.get("instance_id") or "").strip()
                        if sid in target_sids:
                            photos = node.get("photos", [])
                            videos = node.get("videos", [])
                            # Preserve the one with more photos or videos
                            existing = session_map.get(sid)
                            if not existing or (len(photos) > len(existing["photos"])) or (len(videos) > len(existing["videos"])):
                                session_map[sid] = {
                                    "photos": photos,
                                    "videos": videos,
                                    "file": file_path
                                }
                                total_loaded += 1
                        for v in node.values():
                            parse_records(v)
                    elif isinstance(node, list):
                        for item in node:
                            parse_records(item)
                            
                parse_records(data)
            except Exception:
                pass
                
    print(f"[RECOVER] Đã quét {total_files} tệp JSON, tìm thấy khớp cho {len(session_map)} sessions.")
    return session_map

def run_recovery():
    db_path = DEFAULT_DB_PATH
    print(f"[RECOVER] Kết nối tới database: {db_path}")
    if not os.path.exists(db_path):
        print(f"[RECOVER] Lỗi: Không tìm thấy database tại {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    
    try:
        empty_rooms = get_empty_media_rooms(conn)
        print(f"[RECOVER] Tìm thấy {len(empty_rooms)} phòng trống ảnh hoặc trống video trong database.")
        if not empty_rooms:
            print("[RECOVER] Không có phòng nào cần khôi phục media.")
            return
            
        # Collect target session IDs
        target_sids = set()
        for r in empty_rooms:
            sid = str(r[1] or "").strip()
            if sid:
                target_sids.add(sid)
                if "." in sid:
                    try:
                        target_sids.add(str(int(float(sid))))
                    except:
                        pass
                        
        session_map = scan_workspace_for_sessions(target_sids)
        if not session_map:
            print("[RECOVER] Không tìm thấy dữ liệu nguồn nào phù hợp trong workspace.")
            return
            
        cursor = conn.cursor()
        fixed_photos_count = 0
        fixed_videos_count = 0
        
        for room_id, session_id, room_code, address, district, cur_photos, cur_videos in empty_rooms:
            sid_str = str(session_id or "").strip()
            if not sid_str:
                continue
                
            # Normalize session_id
            norm_sid = sid_str
            if "." in sid_str:
                try:
                    norm_sid = str(int(float(sid_str)))
                except:
                    pass
                    
            if norm_sid in session_map:
                record = session_map[norm_sid]
                photos = record["photos"]
                videos = record["videos"]
                
                # Check current DB states
                has_db_photos = cur_photos and cur_photos != '[]' and cur_photos != 'null'
                has_db_videos = cur_videos and cur_videos != '[]' and cur_videos != 'null'
                
                updated_photos = False
                updated_videos = False
                
                # 1. Update photos if DB has none, but source Zalo JSON has them
                if not has_db_photos and photos:
                    photos_json = json.dumps(photos, ensure_ascii=False)
                    cursor.execute("UPDATE rooms SET photos = ? WHERE id = ?", (photos_json, room_id))
                    updated_photos = True
                    fixed_photos_count += 1
                    
                # 2. Update videos if DB has none, but source Zalo JSON has them
                if not has_db_videos and videos:
                    videos_json = json.dumps(videos, ensure_ascii=False)
                    cursor.execute("UPDATE rooms SET videos = ? WHERE id = ?", (videos_json, room_id))
                    updated_videos = True
                    fixed_videos_count += 1
                    
                if updated_photos or updated_videos:
                    msg = f"[RECOVER] ✓ Khôi phục ID {room_id} (Session {sid_str}, Quận: {district})"
                    if updated_photos:
                        msg += f" | +{len(photos)} ảnh"
                    if updated_videos:
                        msg += f" | +{len(videos)} video"
                    msg += f" từ {os.path.basename(record['file'])}"
                    print(msg)
                    
        if fixed_photos_count > 0 or fixed_videos_count > 0:
            conn.commit()
            print(f"[RECOVER] 🎉 Hoàn thành! Đã khôi phục {fixed_photos_count} phòng có ảnh và {fixed_videos_count} phòng có video.")
        else:
            print("[RECOVER] Không khôi phục thêm được ảnh/video nào (các tệp nguồn cũng không có).")
            
    except Exception as e:
        print(f"[RECOVER] Lỗi trong quá trình khôi phục: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_recovery()
