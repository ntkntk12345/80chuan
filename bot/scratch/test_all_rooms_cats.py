import sqlite3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from v3 import get_message_symbol, get_category_from_text2

db_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\database.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get counts
cursor.execute("SELECT category, count(*) FROM rooms GROUP BY category")
print("Database categories count:")
for cat, cnt in cursor.fetchall():
    print(f"  {cat}: {cnt}")

# Let's inspect some samples from each category
for category in ["phong-tro", "chung-cu", "nha-nguyen-can", "mat-bang-kinh-doanh", "can-ho-dich-vu"]:
    cursor.execute("SELECT id, text2, text1 FROM rooms WHERE category = ? LIMIT 5", (category,))
    rows = cursor.fetchall()
    print(f"\nSamples for category '{category}' (total {len(rows)} samples):")
    for r in rows:
        rid, t2, t1 = r
        t2_str = (t2 or "").strip()
        t1_str = (t1 or "").strip()
        sym = get_message_symbol(t2_str)
        # Write to console safely without unicode crash by replacing non-ascii
        ascii_t2 = t2_str[:120].replace('\n', ' ').encode('ascii', 'replace').decode('ascii')
        print(f"  - ID: {rid}, matched_symbol: {sym}, text2: {ascii_t2}")

conn.close()
