"""
Cập nhật photos/videos cho tất cả rooms trong DB từ districts_full/*.json
Match theo session_id (field 'id' trong JSON).
"""
import os, sys, json, sqlite3
sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FULL_DIR   = os.path.join(SCRIPT_DIR, 'districts_full')
DB_PATH    = os.path.join(SCRIPT_DIR, '..', 'web-ha', 'database.sqlite')

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Load tất cả rooms hiện tại từ DB
c.execute("SELECT id, session_id FROM rooms")
db_rooms = c.fetchall()  # [(room_id, session_id), ...]
print(f"Rooms trong DB: {len(db_rooms)}")

updated = 0
for fname in os.listdir(FULL_DIR):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(FULL_DIR, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            items = json.load(f)
    except Exception as e:
        print(f"[SKIP] {fname}: {e}")
        continue

    # Build dict by session_id
    full_by_sid = {}
    for item in (items if isinstance(items, list) else []):
        sid = str(item.get('id', ''))
        if sid:
            full_by_sid[sid] = item

    # Cập nhật từng room trong DB nếu có match
    for room_id, session_id in db_rooms:
        item = full_by_sid.get(str(session_id))
        if not item:
            continue

        photos = item.get('photos', [])
        videos = item.get('videos', [])

        photos_json = json.dumps(photos, ensure_ascii=False)
        videos_json = json.dumps(videos, ensure_ascii=False)

        c.execute(
            "UPDATE rooms SET photos = ?, videos = ? WHERE id = ?",
            (photos_json, videos_json, room_id)
        )
        print(f"  [UPDATE] Room ID {room_id} (session {session_id}) <- {len(photos)} photos, {len(videos)} videos")
        updated += 1

conn.commit()
conn.close()
print(f"\nDone! Updated {updated} rooms with real photos/videos.")
