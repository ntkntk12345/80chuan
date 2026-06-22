const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // 1. Delete the incorrect rooms for session '1781097649991' (we keep Room 19 which is the real Hoang Mai room)
  db.run("DELETE FROM rooms WHERE session_id = '1781097649991' AND id != 19", (err) => {
    if (err) console.error("Error deleting session 1781097649991 duplicates:", err);
    else console.log("Deleted incorrect duplicates for session 1781097649991.");
  });

  // 2. Delete other duplicates based on session_id (keeping only the one with max id)
  db.all("SELECT session_id, COUNT(*) as cnt, MAX(id) as max_id FROM rooms WHERE session_id IS NOT NULL AND session_id != 'manual' GROUP BY session_id HAVING cnt > 1", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Found duplicate sessions:", rows);
    for (const row of rows) {
      db.run("DELETE FROM rooms WHERE session_id = ? AND id < ?", [row.session_id, row.max_id], (err2) => {
        if (err2) console.error(`Error deleting duplicates for session ${row.session_id}:`, err2);
        else console.log(`Deleted duplicates for session ${row.session_id}, kept room ID ${row.max_id}.`);
      });
    }
  });

  // 3. Clean up orphaned distances
  db.run("DELETE FROM room_distances WHERE room_id NOT IN (SELECT id FROM rooms)", (err) => {
    if (err) console.error("Error cleaning up distances:", err);
    else console.log("Cleaned up room_distances.");
  });
});
