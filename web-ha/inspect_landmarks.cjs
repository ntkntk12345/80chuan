const fs = require('fs');
const landmarks = JSON.parse(fs.readFileSync('../bot/distance_app/locations_db.json', 'utf8'));
const matches = landmarks.filter(l => l.name.toLowerCase().includes('hoàng mai'));
console.log(matches);
