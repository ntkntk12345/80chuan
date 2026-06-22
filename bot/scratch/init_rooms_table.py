import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')

db_path = '../../web-ha/database.sqlite'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Tạo bảng rooms nếu chưa có
c.execute("""
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    room_code TEXT,
    address TEXT,
    price TEXT,
    price1 INTEGER,
    price2 INTEGER,
    room_type TEXT,
    district TEXT,
    latitude REAL,
    longitude REAL,
    original_text TEXT,
    photos TEXT,
    videos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
c.execute("""
CREATE TABLE IF NOT EXISTS room_distances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER,
    landmark_name TEXT,
    landmark_category TEXT,
    distance REAL,
    FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
)
""")
c.execute("CREATE INDEX IF NOT EXISTS idx_rooms_session_code ON rooms(session_id, room_code)")
c.execute("CREATE INDEX IF NOT EXISTS idx_room_distances_room ON room_distances(room_id)")

conn.commit()
print("Đã tạo bảng rooms và room_distances thành công!")

c.execute("SELECT COUNT(*) FROM rooms")
print("Rooms count:", c.fetchone()[0])
conn.close()
