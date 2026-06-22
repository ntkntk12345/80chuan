const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, session_id, room_code, address, json_array_length(photos) as photos_count, photos FROM rooms WHERE id = 5747", (err, rows) => {
    if (err) {
      // Fallback if json_array_length is not supported
      db.all("SELECT id, session_id, room_code, address, photos FROM rooms WHERE id = 5747", (err2, rows2) => {
        if (err2) throw err2;
        console.log(JSON.stringify(rows2, null, 2));
      });
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
  });
});
