const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.join('C:', 'Users', 'Administrator', 'Downloads', '80lankh', 'web-ha', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT status, COUNT(*) as count FROM rooms GROUP BY status", (err, rows) => {
  if (err) {
    console.error("Group by status error:", err);
  } else {
    console.log("Rooms count by status:", rows);
  }

  db.all("SELECT COUNT(*) as count FROM rooms WHERE photos IS NULL OR photos = '[]' OR photos = '' OR photos = 'null'", (err, rows2) => {
    if (err) {
      console.error("No photos query error:", err);
    } else {
      console.log("Rooms with empty or null photos:", rows2[0].count);
    }

    db.all("SELECT id, session_id, address, photos, status FROM rooms WHERE (photos IS NULL OR photos = '[]' OR photos = '' OR photos = 'null') LIMIT 10", (err, rows3) => {
      if (err) {
        console.error("Fetch limit error:", err);
      } else {
        console.log("Sample rooms with empty photos:", JSON.stringify(rows3, null, 2));
      }
      db.close();
    });
  });
});
