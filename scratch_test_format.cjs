const sqlite3 = require('c:/Users/Administrator/Downloads/80lankh/web-ha/node_modules/sqlite3');
const dbPath = 'c:/Users/Administrator/Downloads/80lankh/web-ha/database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function buildAddressMap() {
  const addressMap = new Map();
  try {
    const fallbackSource = await dbAll(
      "SELECT address, photos, videos, thumbnail FROM rooms WHERE photos IS NOT NULL AND photos != '[]' AND photos != ''"
    );
    fallbackSource.forEach(row => {
      if (!row.address) return;
      const key = row.address.trim().toLowerCase();
      if (!addressMap.has(key)) {
        let photos = [];
        let videos = [];
        try {
          photos = row.photos ? JSON.parse(row.photos) : [];
        } catch (e) {}
        try {
          videos = row.videos ? JSON.parse(row.videos) : [];
        } catch (e) {}
        if (photos.length > 0) {
          addressMap.set(key, { photos, videos, thumbnail: row.thumbnail || '' });
        }
      }
    });
  } catch (e) {
    console.error("Error building address map:", e);
  }
  return addressMap;
}

function formatRoomResponse(r, distancesByRoomId = {}, addressMap = null) {
  let photos = [];
  let videos = [];
  try {
    photos = r.photos ? JSON.parse(r.photos) : [];
  } catch (e) {
    photos = [];
  }
  try {
    videos = r.videos ? JSON.parse(r.videos) : [];
  } catch (e) {
    videos = [];
  }
  
  // Fallback: borrow photos/videos/thumbnail from another room at the same address if currently empty
  if (photos.length === 0 && addressMap && r.address) {
    const key = r.address.trim().toLowerCase();
    const fallback = addressMap.get(key);
    if (fallback) {
      photos = fallback.photos || [];
      if (videos.length === 0) {
        videos = fallback.videos || [];
      }
    }
  }

  let extra = {};
  if (r.text2 && r.text2.trim().startsWith('{')) {
    try {
      extra = JSON.parse(r.text2);
    } catch (e) {}
  }

  let coverImage = r.thumbnail || extra.image || '';
  if (!coverImage && photos.length > 0) {
    coverImage = typeof photos[0] === 'string' ? photos[0] : (photos[0].url || '');
  }

  return {
    ...r,
    ...extra,
    roomType: r.room_type || extra.roomType || extra.areaText || 'Studio',
    room_type: r.room_type || extra.roomType || extra.areaText || 'Studio',
    image: coverImage,
    original_text: r.text2,
    photos,
    videos,
    distances: distancesByRoomId[r.id] || []
  };
}

async function run() {
  const addressMap = await buildAddressMap();
  console.log('AddressMap keys:', Array.from(addressMap.keys()));
  
  const room469 = await dbGet('SELECT * FROM rooms WHERE id = 469');
  console.log('Raw Room 469:', room469);
  
  const formatted = formatRoomResponse(room469, {}, addressMap);
  console.log('Formatted Room 469:', formatted);
  
  db.close();
}

run();
