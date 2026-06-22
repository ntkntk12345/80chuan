const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Find rooms where price1 is between 100k and 990k (likely missing a zero from my previous bad script)
  // Exclude dorms/shared rooms where 500k-900k might be a legit price
  const query = `
    SELECT id, price1, price2, room_type 
    FROM rooms 
    WHERE price1 >= 100000 AND price1 <= 990000 
    AND (room_type IS NULL OR (room_type NOT LIKE '%ghép%' AND room_type NOT LIKE '%giường%' AND room_type NOT LIKE '%ktx%'))
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) throw err;
    console.log(`Found ${rows.length} rooms to fix.`);
    
    let stmt = db.prepare("UPDATE rooms SET price1 = ?, price2 = ? WHERE id = ?");
    
    for (const row of rows) {
      let p1 = row.price1 * 10;
      let p2 = (row.price2 || row.price1) * 10;
      
      console.log(`Updating room ${row.id} (${row.room_type}): ${row.price1} -> ${p1}`);
      stmt.run(p1, p2, row.id);
    }
    
    stmt.finalize(() => {
      console.log('Update completed.');
      db.close();
    });
  });
});
