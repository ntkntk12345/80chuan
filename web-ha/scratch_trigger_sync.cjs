const sqlite3 = require('sqlite3');
const fs = require('fs');
const https = require('https');
const { join } = require('path');

const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
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

function removeAccents(str) {
  if (!str) return "";
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D');
}

function loadLandmarks() {
  const landmarksPath = 'c:/Users/Administrator/Downloads/80lankh/bot/distance_app/locations_db.json';
  try {
    const raw = fs.readFileSync(landmarksPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[GEOLOCATION] Error reading landmarks:`, e);
    return [];
  }
}

function checkKnownLandmarks(address) {
  if (!address) return null;
  const addressLower = address.toLowerCase().trim();
  const addressNoAccents = removeAccents(addressLower);

  // Special overrides
  if (addressLower.includes("hoàng quốc việt") || addressNoAccents.includes("hoang quoc viet")) {
    console.log(`[GEOLOCATION] [SPECIAL OVERRIDE] '${address}' on Hoàng Quốc Việt street -> geocoding to optimized coordinates`);
    return { lat: 21.0483230, lon: 105.7867828, name: "Đại học Điện lực" };
  }
  if (addressLower.includes("yên nghĩa") || addressNoAccents.includes("yen nghia")) {
    console.log(`[GEOLOCATION] [SPECIAL OVERRIDE] '${address}' in Yên Nghĩa -> geocoding near Đại học Phenikaa`);
    return { lat: 20.959502, lon: 105.747841, name: "Đại học Phenikaa" };
  }

  const landmarks = loadLandmarks();
  if (!landmarks || landmarks.length === 0) return null;

  for (const loc of landmarks) {
    const name = loc.name;
    if (!name) continue;
    const nameLower = name.toLowerCase();

    const candidates = [nameLower];
    if (nameLower.includes("đại học")) {
      candidates.push(nameLower.replace("đại học", "đh"));
      candidates.push(nameLower.replace("đại học", ""));
    }
    if (nameLower.includes("trường đại học")) {
      candidates.push(nameLower.replace("trường đại học", "đh"));
      candidates.push(nameLower.replace("trường đại học", ""));
    }
    if (nameLower.includes("hà nội")) {
      candidates.push(nameLower.replace("hà nội", ""));
      if (nameLower.includes("đại học")) {
        candidates.push(nameLower.replace("đại học", "đh").replace("hà nội", ""));
        candidates.push(nameLower.replace("đại học", "").replace("hà nội", ""));
      }
    }
    if (nameLower.includes("vincom mega mall")) {
      candidates.push(nameLower.replace("vincom mega mall", "vincom"));
    }
    if (nameLower.includes("aeon mall")) {
      candidates.push(nameLower.replace("aeon mall", "aeon"));
    }

    const cleanCandidates = [];
    for (const c of candidates) {
      const cClean = c.trim();
      const cNoAccents = cClean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
      if (cClean.length > 2 && cNoAccents !== 'ha noi' && cNoAccents !== 'hanoi') {
        cleanCandidates.push(cClean);
      }
    }

    cleanCandidates.sort((a, b) => b.length - a.length);

    for (const cand of cleanCandidates) {
      const candNoAccents = removeAccents(cand);
      if (addressLower.includes(cand) || addressNoAccents.includes(candNoAccents)) {
        console.log(`[GEOLOCATION] [LOCAL MATCH] '${address}' matched landmark '${name}' (via '${cand}')`);
        return { lat: parseFloat(loc.lat), lon: parseFloat(loc.lon), name };
      }
    }
  }

  return null;
}

function fetchJsonHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function geocodeAddressEsri(address) {
  const localMatch = checkKnownLandmarks(address);
  if (localMatch) {
    return localMatch;
  }

  let searchQuery = address;
  if (!searchQuery.toLowerCase().includes("hà nội") && !searchQuery.toLowerCase().includes("ha noi")) {
    searchQuery += ", Hà Nội, Việt Nam";
  }

  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(searchQuery)}&maxLocations=1&location=105.8542,21.0285&distance=50000`;

    const data = await fetchJsonHttps(url);
    const candidates = data.candidates || [];
    if (candidates.length > 0) {
      const candidate = candidates[0];
      const loc = candidate.location || {};
      return {
        lat: parseFloat(loc.y),
        lon: parseFloat(loc.x),
        name: candidate.address || address
      };
    }
  } catch (e) {
    console.error(`[GEOLOCATION] Error geocoding '${address}':`, e);
  }

  return null;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return Infinity;
  }
  const R = 6371.0;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

async function recalculateRoomGeocodeAndDistances(roomId, address) {
  if (!address) return;

  let district = 'Cầu Giấy';
  const hanoiDistricts = ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Mê Linh', 'Chương Mỹ', 'Thạch Thất', 'Quốc Oai', 'An Dương', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Sơn Tây'];
  for (const d of hanoiDistricts) {
    if (address.toLowerCase().includes(d.toLowerCase())) {
      district = d;
      break;
    }
  }

  const geo = await geocodeAddressEsri(address);
  let lat = null;
  let lon = null;
  if (geo) {
    lat = geo.lat;
    lon = geo.lon;
    console.log(`[GEOLOCATION] Geocoded successfully '${address}' -> ${lat}, ${lon}`);
  } else {
    console.warn(`[GEOLOCATION] Could not find coordinates for '${address}'`);
  }

  await dbRun(
    `UPDATE rooms SET latitude = ?, longitude = ?, district = ? WHERE id = ?`,
    [lat, lon, district, roomId]
  );

  await dbRun("DELETE FROM room_distances WHERE room_id = ?", [roomId]);

  if (lat !== null && lon !== null) {
    const landmarks = loadLandmarks();
    if (landmarks && landmarks.length > 0) {
      const distances = [];
      for (const loc of landmarks) {
        const lLat = loc.lat;
        const lLon = loc.lon;
        if (lLat !== undefined && lLon !== undefined) {
          const dist = haversineDistance(lat, lon, lLat, lLon);
          distances.push({ loc, dist });
        }
      }

      distances.sort((a, b) => a.dist - b.dist);

      let nearby = distances.filter(item => item.dist <= 5.0);
      if (nearby.length === 0 && distances.length > 0) {
        nearby = [distances[0]];
      }

      for (const item of nearby) {
        await dbRun(
          `INSERT INTO room_distances (room_id, landmark_name, landmark_category, distance) VALUES (?, ?, ?, ?)`,
          [roomId, item.loc.name, item.loc.category, item.dist]
        );
      }
      console.log(`[GEOLOCATION] Saved ${nearby.length} distances for room ${roomId}`);
    }
  }
}

async function run() {
  const room = await dbGet('SELECT * FROM rooms WHERE id = 1227');
  console.log("Existing room address:", room.address);
  console.log("Recalculating...");
  await recalculateRoomGeocodeAndDistances(1227, room.address);
  console.log("Recalculation complete. Checking updated data...");
  
  const updatedRoom = await dbGet('SELECT * FROM rooms WHERE id = 1227');
  console.log("Updated Room Coords:", updatedRoom.latitude, updatedRoom.longitude);
  
  const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };
  
  const distances = await dbAll('SELECT landmark_name, distance FROM room_distances WHERE room_id = 1227 ORDER BY distance');
  console.log("Updated distances:");
  console.log(JSON.stringify(distances, null, 2));
  
  db.close();
}

run();
