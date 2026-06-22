import sqlite3, sys, json
sys.stdout.reconfigure(encoding='utf-8')
c = sqlite3.connect('../../web-ha/database.sqlite').cursor()
c.execute('SELECT id, photos, videos FROM rooms')
for r in c.fetchall():
    photos = json.loads(r[1]) if r[1] else []
    videos = json.loads(r[2]) if r[2] else []
    print(f"ID {r[0]}: {len(photos)} photos, {len(videos)} videos")
    if photos:
        print(f"  Ảnh đầu: {photos[0].get('url','')[:90]}")
