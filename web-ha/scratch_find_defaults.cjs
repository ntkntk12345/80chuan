const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.all(`
  SELECT id, address, latitude, longitude FROM rooms
`, (err, rows) => {
  if (err) {
    console.error(err);
    db.close();
    return;
  }
  
  const hanoiDefaultLat1 = 21.028279;
  const hanoiDefaultLon1 = 105.853881;
  const hanoiDefaultLat2 = 21.033333;
  const hanoiDefaultLon2 = 105.850000;
  
  const badRooms = [];
  
  for (const r of rows) {
    if (r.latitude === null || r.longitude === null) continue;
    
    // Check close proximity to Hanoi default coordinates
    const diff1 = Math.abs(r.latitude - hanoiDefaultLat1) + Math.abs(r.longitude - hanoiDefaultLon1);
    const diff2 = Math.abs(r.latitude - hanoiDefaultLat2) + Math.abs(r.longitude - hanoiDefaultLon2);
    
    if (diff1 < 0.005 || diff2 < 0.005) {
      badRooms.push(r);
    }
  }
  
  console.log(`Found ${badRooms.length} rooms with default Hanoi coordinates:`);
  console.log(JSON.stringify(badRooms, null, 2));
  db.close();
});
