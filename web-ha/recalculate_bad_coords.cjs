const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const LOCATIONS_DB_PATH = path.join(__dirname, '..', 'bot', 'distance_app', 'locations_db.json');

const districtCentroids = {
  'Cầu Giấy': { lat: 21.0362, lon: 105.7905 },
  'Đống Đa': { lat: 21.0180, lon: 105.8299 },
  'Hai Bà Trưng': { lat: 21.0074, lon: 105.8525 },
  'Ba Đình': { lat: 21.0370, lon: 105.8153 },
  'Hoàn Kiếm': { lat: 21.0285, lon: 105.8523 },
  'Tây Hồ': { lat: 21.0717, lon: 105.8130 },
  'Thanh Xuân': { lat: 20.9937, lon: 105.8122 },
  'Hoàng Mai': { lat: 20.9781, lon: 105.8501 },
  'Long Biên': { lat: 21.0377, lon: 105.8920 },
  'Hà Đông': { lat: 20.9686, lon: 105.7748 },
  'Nam Từ Liêm': { lat: 21.0135, lon: 105.7650 },
  'Bắc Từ Liêm': { lat: 21.0694, lon: 105.7599 },
  'Thanh Trì': { lat: 20.9529, lon: 105.8458 },
  'Gia Lâm': { lat: 21.0248, lon: 105.9396 },
  'Đông Anh': { lat: 21.1444, lon: 105.8494 },
  'Sóc Sơn': { lat: 21.2586, lon: 105.8159 },
  'Mê Linh': { lat: 21.1837, lon: 105.7275 },
  'Chương Mỹ': { lat: 20.8752, lon: 105.6560 },
  'Thạch Thất': { lat: 21.0163, lon: 105.5786 },
  'Quốc Oai': { lat: 20.9918, lon: 105.6429 },
  'Thanh Oai': { lat: 20.8732, lon: 105.7830 },
  'Thường Tín': { lat: 20.8728, lon: 105.8576 },
  'Phú Xuyên': { lat: 20.7301, lon: 105.9001 },
  'Ứng Hòa': { lat: 20.7397, lon: 105.7820 },
  'Mỹ Đức': { lat: 20.7042, lon: 105.7335 },
  'Ba Vì': { lat: 21.1712, lon: 105.4013 },
  'Phúc Thọ': { lat: 21.1071, lon: 105.5906 },
  'Đan Phượng': { lat: 21.1070, lon: 105.6791 },
  'Hoài Đức': { lat: 21.0204, lon: 105.7022 },
  'Sơn Tây': { lat: 21.1348, lon: 105.5036 }
};

function loadLandmarks() {
  if (!fs.existsSync(LOCATIONS_DB_PATH)) {
    console.warn(`[GEOLOCATION] Warning: locations_db.json not found at ${LOCATIONS_DB_PATH}`);
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCATIONS_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[GEOLOCATION] Error reading landmarks:`, e);
    return [];
  }
}

function removeAccents(str) {
  if (!str) return "";
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D');
}

function checkKnownLandmarks(address) {
  if (!address) return null;
  const addressLower = address.toLowerCase().trim();
  const addressNoAccents = removeAccents(addressLower);

  // Special overrides
  if (addressLower.includes("hoàng quốc việt") || addressNoAccents.includes("hoang quoc viet")) {
    return { lat: 21.0483230, lon: 105.7867828, name: "Đại học Điện lực" };
  }
  if (addressLower.includes("yên nghĩa") || addressNoAccents.includes("yen nghia")) {
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

function cleanAddressProgressively(address) {
  if (!address) return "";
  let clean = address;
  // 1. Remove text inside parentheses
  clean = clean.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '');
  // 2. Strip Zalo code suffixes matching [a-zA-Z]+-\w+
  clean = clean.replace(/[a-zA-Z]+-\w+/g, '');
  // 3. Simplify nested slashes
  clean = clean.replace(/\b(\d+[\w]*)(?:\/\d+[\w]*)+\b/g, '$1');
  // 4. Remove duplicate whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

function isDefaultHanoi(lat, lon) {
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) return false;
  const diff1 = Math.abs(lat - 21.028279) + Math.abs(lon - 105.853881);
  const diff2 = Math.abs(lat - 21.033333) + Math.abs(lon - 105.850000);
  return (diff1 < 0.005 || diff2 < 0.005);
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

  let result = null;
  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(searchQuery)}&maxLocations=1&location=105.8542,21.0285&distance=50000`;

    const data = await fetchJsonHttps(url);
    const candidates = data.candidates || [];
    if (candidates.length > 0) {
      const candidate = candidates[0];
      const loc = candidate.location || {};
      result = {
        lat: parseFloat(loc.y),
        lon: parseFloat(loc.x),
        name: candidate.address || address
      };
    }
  } catch (e) {
    console.error(`[GEOLOCATION] Error geocoding '${address}':`, e);
  }

  if (result && isDefaultHanoi(result.lat, result.lon)) {
    console.log(`[GEOLOCATION] Geocoded '${address}' returned default Hanoi coordinates (${result.lat}, ${result.lon}). Attempting progressive cleaning...`);
    const cleanedAddress = cleanAddressProgressively(address);
    console.log(`[GEOLOCATION] Cleaned address: '${cleanedAddress}'`);
    
    if (cleanedAddress && cleanedAddress !== address) {
      let retryQuery = cleanedAddress;
      if (!retryQuery.toLowerCase().includes("hà nội") && !retryQuery.toLowerCase().includes("ha noi")) {
        retryQuery += ", Hà Nội, Việt Nam";
      }
      try {
        const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(retryQuery)}&maxLocations=1&location=105.8542,21.0285&distance=50000`;
        const data = await fetchJsonHttps(url);
        const candidates = data.candidates || [];
        if (candidates.length > 0) {
          const candidate = candidates[0];
          const loc = candidate.location || {};
          const retryResult = {
            lat: parseFloat(loc.y),
            lon: parseFloat(loc.x),
            name: candidate.address || cleanedAddress
          };
          
          if (!isDefaultHanoi(retryResult.lat, retryResult.lon)) {
            console.log(`[GEOLOCATION] Successfully geocoded cleaned address '${cleanedAddress}' -> ${retryResult.lat}, ${retryResult.lon}`);
            return retryResult;
          } else {
            console.log(`[GEOLOCATION] Cleaned address geocode also returned default Hanoi coordinates.`);
          }
        }
      } catch (e) {
        console.error(`[GEOLOCATION] Error geocoding cleaned address '${cleanedAddress}':`, e);
      }
    }
  }

  return result;
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

async function main() {
  const db = new sqlite3.Database(DB_PATH);

  const dbRun = (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };

  const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  // Find bad rooms (default Hanoi coordinates)
  const rows = await dbAll(`SELECT id, address, latitude, longitude FROM rooms`);
  const badRooms = [];

  for (const r of rows) {
    if (r.latitude === null || r.longitude === null) {
      badRooms.push(r);
      continue;
    }
    if (isDefaultHanoi(r.latitude, r.longitude)) {
      badRooms.push(r);
    }
  }

  console.log(`Found ${badRooms.length} rooms to recalculate geocode and landmark distances.`);

  for (const room of badRooms) {
    console.log(`\n----------------------------------------`);
    console.log(`Processing Room ${room.id}: '${room.address}'`);

    // Determine district
    let district = 'Cầu Giấy';
    const hanoiDistricts = ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Mê Linh', 'Chương Mỹ', 'Thạch Thất', 'Quốc Oai', 'An Dương', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Sơn Tây'];
    for (const d of hanoiDistricts) {
      if (room.address.toLowerCase().includes(d.toLowerCase())) {
        district = d;
        break;
      }
    }

    const geo = await geocodeAddressEsri(room.address);
    let lat = null;
    let lon = null;
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
    }

    // Check fallback
    if (lat === null || lon === null || isDefaultHanoi(lat, lon)) {
      const fallback = districtCentroids[district];
      if (fallback) {
        lat = fallback.lat;
        lon = fallback.lon;
        console.log(`[MIGRATION] Geocoding failed or returned default. Falling back to centroid of district '${district}' -> ${lat}, ${lon}`);
      } else {
        console.warn(`[MIGRATION] Geocoding failed and no centroid for district '${district}'`);
      }
    } else {
      console.log(`[MIGRATION] Geocoded successfully -> ${lat}, ${lon}`);
    }

    // Update in database
    await dbRun(
      `UPDATE rooms SET latitude = ?, longitude = ?, district = ? WHERE id = ?`,
      [lat, lon, district, room.id]
    );

    // Delete old distances
    await dbRun("DELETE FROM room_distances WHERE room_id = ?", [room.id]);

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
            [room.id, item.loc.name, item.loc.category, item.dist]
          );
        }
        console.log(`[MIGRATION] Saved ${nearby.length} distances for room ${room.id}. Nearest: ${nearby[0].loc.name} (${nearby[0].dist} km)`);
      }
    }
  }

  console.log(`\nMigration completed successfully.`);
  db.close();
}

main().catch(console.error);
