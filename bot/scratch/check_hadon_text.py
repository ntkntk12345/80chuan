import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('../../web-ha/database.sqlite')
c = conn.cursor()

for rid in [7, 11]:
    c.execute("SELECT id, address, text1, text2 FROM rooms WHERE id=?", (rid,))
    r = c.fetchone()
    if r:
        print(f"=================================")
        print(f"ID: {r[0]}")
        print(f"Address: {r[1]}")
        print(f"text1 (100 chars): {repr(r[2][:100] if r[2] else None)}")
        print(f"text2 (100 chars): {repr(r[3][:100] if r[3] else None)}")
        print(f"Có '🌺' trong text1: {'CÓ' if r[2] and '🌺' in r[2] else 'KHÔNG'}")
        print(f"Có '1A' trong text2: {'CÓ' if r[3] and '1A' in r[3] else 'KHÔNG'}")

conn.close()
