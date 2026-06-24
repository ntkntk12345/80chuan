import sqlite3

db_path = r"c:\Users\Admin\Downloads\80chuan\web-ha\database.sqlite"
out_path = r"c:\Users\Admin\Downloads\80chuan\bot\scratch\first_10.txt"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, category, room_code, text1, text2 FROM rooms LIMIT 10")
with open(out_path, "w", encoding="utf-8") as f:
    for r in cursor.fetchall():
        rid, cat, code, t1, t2 = r
        f.write(f"ID: {rid}, Category: {cat}, Room Code: {code}\n")
        f.write(f"  Text1: {repr((t1 or '')[:100])}\n")
        f.write(f"  Text2: {repr((t2 or '')[:100])}\n")
        f.write("-" * 50 + "\n")

conn.close()
print("Wrote output to", out_path)
