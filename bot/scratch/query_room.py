import sqlite3
import json

conn = sqlite3.connect('c:/Users/Administrator/Downloads/80lankh/web-ha/database.sqlite')
cursor = conn.cursor()

output = []
output.append("Rooms with code '909' or 'Mễ Trì':")
rows = cursor.execute("SELECT id, room_code, address, text2, status, price1, price2, room_type, district FROM rooms WHERE room_code = '909' OR id = 909 OR address LIKE '%Mễ Trì%'").fetchall()
for r in rows:
    output.append(f"ID: {r[0]}, Room Code: {r[1]}, Address: {r[2]}, Status: {r[4]}")
    output.append(f"Price1: {r[5]}, Price2: {r[6]}, Room Type: {r[7]}, District: {r[8]}")
    output.append(f"Text2: {r[3][:300]}")
    output.append("-" * 50)

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/query_room.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done writing to query_room.txt")
conn.close()
