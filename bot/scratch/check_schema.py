import sqlite3
db_path = r'c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database:")
for t in tables:
    t_name = t[0]
    cursor.execute(f"SELECT COUNT(*) FROM {t_name}")
    count = cursor.fetchone()[0]
    print(f"  {t_name}: {count} rows")
conn.close()
