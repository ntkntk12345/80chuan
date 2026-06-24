import sqlite3
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from v3 import chung_cu_symbols, nguyen_can_symbols, mbkd_symbols, chdv_symbols, tai_land_symbols, vietquoc_1_symbols

db_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\database.sqlite"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, text1, text2, category FROM rooms")
rooms = cursor.fetchall()
print(f"Total rooms: {len(rooms)}")

all_lists = {
    "chung_cu": chung_cu_symbols,
    "nguyen_can": nguyen_can_symbols,
    "mbkd": mbkd_symbols,
    "chdv": chdv_symbols,
    "tai_land": tai_land_symbols,
    "vietquoc_1": vietquoc_1_symbols
}

matches = {k: 0 for k in all_lists}

for rid, t1, t2, cat in rooms:
    t2_str = (t2 or "").lower()
    t1_str = (t1 or "").lower()
    for cat_name, symbols in all_lists.items():
        for sym in symbols:
            # check if sym is in t2 or t1 as a prefix or word
            if sym in t2_str or sym in t1_str:
                matches[cat_name] += 1
                break

print("\nNumber of rooms matching any symbol name in text1/text2:")
for cat_name, count in matches.items():
    print(f"  {cat_name}: {count} rooms")

conn.close()
