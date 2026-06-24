import sqlite3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from v3 import get_category_from_text2, get_message_symbol

db_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\database.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all rooms
cursor.execute("SELECT id, category, price1, price2, text1, text2, room_code FROM rooms")
rows = cursor.fetchall()
print(f"Total rooms in database: {len(rows)}")

# Category counts
cats = {}
for r in rows:
    rid, cat, p1, p2, text1, text2, room_code = r
    cats[cat] = cats.get(cat, 0) + 1

print("\nAll database categories distribution:")
for cat, count in cats.items():
    print(f"  {cat}: {count}")

# Check any room where text2 matches 'tài land' or 'tai land' or similar
print("\n--- Analysing rooms matching symbols ---")
symbol_matches = {}
for r in rows:
    rid, cat, p1, p2, text1, text2, room_code = r
    sym = get_message_symbol(text2 or "") or get_message_symbol(text1 or "")
    if sym:
        symbol_matches[sym] = symbol_matches.get(sym, {})
        symbol_matches[sym][cat] = symbol_matches[sym].get(cat, 0) + 1

for sym, cat_counts in symbol_matches.items():
    print(f"Symbol '{sym}':")
    for cat, count in cat_counts.items():
        print(f"  - {cat}: {count}")

conn.close()
