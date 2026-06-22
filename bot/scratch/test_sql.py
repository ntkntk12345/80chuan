import sqlite3

conn = sqlite3.connect('c:/Users/Administrator/Downloads/80lankh/web-ha/database.sqlite')
cursor = conn.cursor()

q = "Ngõ 14 Mễ Trì Hạ, Nam Từ Liêm, Hà Nội"
tokens = [t.strip() for t in q.replace(',', ' ').replace('.', ' ').replace('-', ' ').split() if t.strip()][:6]

output = []
output.append(f"Tokens: {tokens}")

whereClause = 'WHERE 1=1 AND rooms.status = ?'
params = ['approved']

for token in tokens:
    whereClause += " AND (COALESCE(rooms.address, '') || ', Hà Nội' LIKE ? OR rooms.room_type LIKE ? OR rooms.text2 LIKE ? OR rooms.district LIKE ?)"
    params.extend([f'%{token}%', f'%{token}%', f'%{token}%', f'%{token}%'])

query = f"SELECT id, room_code, address, status, price1, price2 FROM rooms {whereClause} ORDER BY rooms.created_at DESC"
output.append("Running query...")
rows = cursor.execute(query, params).fetchall()
output.append(f"Found {len(rows)} results:")
for r in rows:
    output.append(str(r))

with open('c:/Users/Administrator/Downloads/80lankh/bot/scratch/test_sql.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("Done test_sql")
conn.close()
