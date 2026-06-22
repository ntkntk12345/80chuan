const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT phone, name, password, role FROM users", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    rows.forEach(row => {
      console.log(`Phone: ${row.phone}, Name: ${row.name}, Role: ${row.role}, Password: ${row.password}`);
      if (!row.password || row.password === 'null' || row.password === '') {
        console.log(`Fixing password for ${row.phone}`);
        let newPass = '123456';
        if (row.phone === 'BichHa80land') {
          newPass = 'BichHa80land010201@!';
        }
        db.run("UPDATE users SET password = ? WHERE phone = ?", [newPass, row.phone]);
      }
    });
  });
});
