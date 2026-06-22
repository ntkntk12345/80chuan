import sqlite3
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

db_path = r"c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
c = conn.cursor()

# We count how many rooms have photos = '[]' or photos = '' or photos is null
c.execute("SELECT id, address, photos, status FROM rooms WHERE status = 'approved' AND (photos IS NULL OR photos = '' OR photos = '[]');")
rows = c.fetchall()

print(f"Total approved rooms with empty photos: {len(rows)}")

# Print a few samples
for idx, r in enumerate(rows[:20]):
    print(f"ID: {r[0]} | Address: {r[1]} | Photos (raw): {repr(r[2])} | Status: {r[3]}")

conn.close()
