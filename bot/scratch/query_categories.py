import sqlite3
import sys

# Configure console to support Vietnamese Unicode print out on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

db_path = r'c:\Users\Administrator\Downloads\80lankh\web-ha\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Unique categories in rooms:")
cursor.execute("SELECT category, COUNT(*) FROM rooms GROUP BY category")
for row in cursor.fetchall():
    print(row)

print("\nUnique room_types in rooms:")
cursor.execute("SELECT room_type, COUNT(*) FROM rooms GROUP BY room_type")
for row in cursor.fetchall():
    print(row)

conn.close()
