const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, price1, price2 FROM rooms WHERE price1 > 0 AND price1 < 500000", [], (err, rows) => {
    if (err) throw err;
    console.log(`Found ${rows.length} rooms with suspiciously low prices.`);
    
    let stmt = db.prepare("UPDATE rooms SET price1 = ?, price2 = ? WHERE id = ?");
    
    for (const row of rows) {
      let p1 = row.price1;
      let p2 = row.price2 || row.price1;
      
      while (p1 > 0 && p1 < 500000) {
        p1 *= 10;
      }
      while (p2 > 0 && p2 < 500000) {
        p2 *= 10;
      }
      
      console.log(`Updating room ${row.id}: ${row.price1} -> ${p1}, ${row.price2} -> ${p2}`);
      stmt.run(p1, p2, row.id);
    }
    
    stmt.finalize(() => {
      console.log('Update completed.');
      db.close();
    });
  });
});
