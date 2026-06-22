/**
 * scratch_recalculate.cjs
 *
 * Recalculates geocoded coordinates and landmark distances for rooms
 * that have missing or zero coordinates (broken "Hà Nội" matches).
 *
 * Run with: node scratch_recalculate.cjs
 */

const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database.sqlite');
const LOCATIONS_DB_PATH = path.join(__dirname, 'locations_db.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadLandmarks() {
  try {
    const raw = fs.readFileSync(LOCATIONS_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load locations_db.json:', e.message);
    return [];
  }
}

function stripAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Mirror of the patched checkKnownLandmarks in server.js */
function checkKnownLandmarks(address) {
  const landmarks = loadLandmarks();
  if (!landmarks || landmarks.length === 0) return null;

  const addressLower = address.toLowerCase();
  const addressNoAccents = stripAccents(addressLower);

  for (const loc of landmarks) {
    const name = loc.name;
    if (!name) continue;
    const nameLower = name.toLowerCase();

    const candidates = [nameLower];
    if (nameLower.includes('đại học')) {
      candidates.push(nameLower.replace('đại học', 'đh'));
      candidates.push(nameLower.replace('đại học', ''));
    }
    if (nameLower.includes('trường đại học')) {
      candidates.push(nameLower.replace('trường đại học', 'đh'));
      candidates.push(nameLower.replace('trường đại học', ''));
    }
    if (nameLower.includes('hà nội')) {
      candidates.push(nameLower.replace('hà nội', ''));
      if (nameLower.includes('đại học')) {
        candidates.push(nameLower.replace('đại học', 'đh').replace('hà nội', ''));
        candidates.push(nameLower.replace('đại học', '').replace('hà nội', ''));
      }
    }
    if (nameLower.includes('vincom mega mall')) {
      candidates.push(nameLower.replace('vincom mega mall', 'vincom'));
    }
    if (nameLower.includes('aeon mall')) {
      candidates.push(nameLower.replace('aeon mall', 'aeon'));
    }

    const cleanCandidates = [];
    for (const c of candidates) {
      const cClean = c.trim();
      const cNoAccents = stripAccents(cClean).toLowerCase();
      // Same filter as patched server.js – exclude bare "ha noi"/"hanoi"
      if (cClean.length > 2 && cNoAccents !== 'ha noi' && cNoAccents !== 'hanoi') {
        cleanCandidates.push(cClean);
      }
    }
    cleanCandidates.sort((a, b) => b.length - a.length);

    for (const cand of cleanCandidates) {
      const candNoAccents = stripAccents(cand);
      if (addressLower.includes(cand) || addressNoAccents.includes(candNoAccents)) {
        return { lat: parseFloat(loc.lat), lon: parseFloat(loc.lon), name };
      }
    }
  }
  return null;
}

function fetchNominatim(address) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(address + ', Hà Nội, Việt Nam');
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=vn`;
    https
      .get(url, { headers: { 'User-Agent': 'RoomFinder/1.0 (recalculate-script)' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.length > 0) {
              resolve({ lat: parseFloat(parsed[0].lat), lon: parseFloat(parsed[0].lon) });
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null));
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computeLandmarkDistances(lat, lon) {
  const landmarks = loadLandmarks();
  const dists = {};
  for (const loc of landmarks) {
    if (loc.lat && loc.lon) {
      dists[loc.name] = Math.round(
        haversine(lat, lon, parseFloat(loc.lat), parseFloat(loc.lon))
      );
    }
  }
  return dists;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const db = new sqlite3.Database(DB_PATH);

  // Promisify helpers
  const all = (sql, params = []) =>
    new Promise((res, rej) =>
      db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
    );
  const run = (sql, params = []) =>
    new Promise((res, rej) =>
      db.run(sql, params, function (err) {
        err ? rej(err) : res(this);
      })
    );

  const rooms = await all(
    `SELECT id, address, latitude, longitude FROM rooms
     WHERE latitude IS NULL OR longitude IS NULL
        OR (ABS(CAST(latitude AS REAL)) < 0.001 AND ABS(CAST(longitude AS REAL)) < 0.001)`
  );

  console.log(`Found ${rooms.length} rooms to recalculate.\n`);

  let ok = 0, failed = 0;

  for (const room of rooms) {
    const address = room.address || '';
    console.log(`[${room.id}] ${address}`);

    // 1. Try local landmark DB first
    let coords = checkKnownLandmarks(address);
    let source = 'local';

    // 2. Fall back to Nominatim
    if (!coords) {
      source = 'nominatim';
      coords = await fetchNominatim(address);
      await sleep(1200); // respect Nominatim 1 req/s limit
    }

    if (!coords) {
      console.log(`  ✗ No coords found – skipping.\n`);
      failed++;
      continue;
    }

    const { lat, lon } = coords;
    const landmarkDists = computeLandmarkDistances(lat, lon);
    const landmarkJson = JSON.stringify(landmarkDists);

    await run(
      `UPDATE rooms SET latitude=?, longitude=?, landmark_distances=? WHERE id=?`,
      [lat, lon, landmarkJson, room.id]
    );

    console.log(`  ✓ [${source}] lat=${lat.toFixed(6)}, lon=${lon.toFixed(6)}\n`);
    ok++;
  }

  console.log(`\nDone. Updated: ${ok}, Failed: ${failed}`);
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
