const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

db.run(`
  UPDATE rooms 
  SET latitude = NULL, longitude = NULL 
  WHERE id = 1227
`, (err) => {
  if (err) {
    console.error("Error resetting coordinates:", err);
  } else {
    console.log("Successfully reset coordinates for room 1227 to NULL.");
  }
  db.close();
});
