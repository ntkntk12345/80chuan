import sqlite3

conn = sqlite3.connect('c:/Users/Administrator/Downloads/80lankh/web-ha/database.sqlite')
cursor = conn.cursor()

output = []

# Find by room_code '909'
output.append("Find by room_code = '909':")
rows = cursor.execute("SELECT id, room_code, address, status, price1, price2, room_type, text2 FROM rooms WHERE room_code = '909'").fetchall()
for r in rows:
    output.append(f"ID: {r[0]}, Room Code: {r[1]}, Address: {r[2]}, Status: {r[3]}, Price: {r[4]}-{r[5]}, Type: {r[6]}, Text2: {r[7][:200]}")

output.append("\nFind by room_code LIKE '%909%':")
rows = cursor.execute("SELECT id, room_code, address, status, price1, price2 FROM rooms WHERE room_code LIKE '%909%'").fetchall()
for r in rows:
    output.append(str(r))

output.append("\nFind by address LIKE '%Ngõ 14 Mễ Trì Hạ%':")
rows = cursor.execute("SELECT id, room_code, address, status, price1, price2, text2 FROM rooms WHERE address LIKE '%Ngõ 14 Mễ Trì Hạ%'").fetchall()
for r in rows:
    output.append(f"ID: {r[0]}, Room Code: {r[1]}, Address: {r[2]}, Status: {r[3]}, Price: {r[4]}-{r[5]}, Text2: {r[6][:200]}")

output.append("\nFind by text2 LIKE '%Ngõ 14 Mễ Trì Hạ%':")
rows = cursor.execute("SELECT id, room_code, address, status, price1, price2, text2 FROM rooms WHERE text2 LIKE '%Ngõ 14 Mễ Trì Hạ%'").fetchall()
for r in rows:
    output.append(f"ID: {r[0]}, Room Code: {r[1]}, Address: {r[2]}, Status: {r[3]}, Price: {r[4]}-{r[5]}, Text2: {r[6][:200]}")

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/search_all_909.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done search 909")
conn.close()
