const sqlite3 = require('c:/Users/Administrator/Downloads/80lankh/web-ha/node_modules/sqlite3');
const dbPath = 'c:/Users/Administrator/Downloads/80lankh/web-ha/database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

function deduplicateRooms(rooms) {
  const seenText2 = new Set();
  const uniqueRooms = [];
  for (const r of rooms) {
    let rawText = '';
    if (r.text2) {
      const trimmed = r.text2.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          rawText = (parsed.text2 || '').trim();
        } catch (e) {
          rawText = trimmed;
        }
      } else {
        rawText = trimmed;
      }
    }
    if (rawText) {
      if (!seenText2.has(rawText)) {
        seenText2.add(rawText);
        uniqueRooms.push(r);
      }
    } else {
      uniqueRooms.push(r);
    }
  }
  return uniqueRooms;
}

db.all('SELECT * FROM rooms WHERE id IN (469, 471)', [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Raw texts match:', rows[0].text2 === rows[1].text2);
  const uniq = deduplicateRooms(rows);
  console.log('Deduplicated IDs:', uniq.map(r => r.id));
  db.close();
});
