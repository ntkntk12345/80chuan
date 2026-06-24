import sqlite3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from v3 import get_message_symbol, chung_cu_symbols, nguyen_can_symbols, tai_land_symbols

db_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\database.sqlite"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, text1, text2, category FROM rooms")
rows = cursor.fetchall()
print(f"Total rooms: {len(rows)}")

# Let's search text2 for keywords of each symbol list
results = {}
for r in rows:
    rid, t1, t2, cat = r
    t2_str = (t2 or "").strip()
    t1_str = (t1 or "").strip()
    
    # We want to search if any symbol name exists in t2 (case-insensitive)
    t2_lower = t2_str.lower()
    for name in ["việt quốc 2", "vietquoc 2", "việt quốc 3", "vietquoc 3", "tc 2", "tc2", "vinsmartcity", "tc 1", "tc1", "tc 3", "tc3", "đăng bài hn", "dang bai hn", "đại lộc land 1", "dai loc land 1", "tài land 1", "tai land 1", "tài land 2", "tai land 2"]:
        if name in t2_lower:
            results[name] = results.get(name, [])
            results[name].append((rid, cat, t2_str[:100]))

print("\nOccurrences of symbol texts inside text2 in the database:")
for name, list_rooms in results.items():
    print(f"Symbol word '{name}': {len(list_rooms)} rooms")
    print(f"  First 3 samples:")
    for rid, cat, sample in list_rooms[:3]:
        print(f"    - ID: {rid}, Category: {cat}, Text2: {repr(sample)}")

conn.close()
