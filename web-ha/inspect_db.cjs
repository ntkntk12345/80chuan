const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT id, address, photos, thumbnail, text2 FROM rooms WHERE address LIKE '%Yết Kiêu%'", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
