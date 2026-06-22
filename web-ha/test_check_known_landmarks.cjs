const fs = require('fs');
const { join } = require('path');

function removeAccents(str) {
  if (!str) return "";
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D');
}

function loadLandmarks() {
  const dbPath = join(__dirname, '..', 'bot', 'distance_app', 'locations_db.json');
  if (!fs.existsSync(dbPath)) {
    console.warn(`[GEOLOCATION] Warning: locations_db.json not found at ${dbPath}`);
    return [];
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
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

    // Build candidate patterns to check
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

    // Sort candidates by length descending
    cleanCandidates.sort((a, b) => b.length - a.length);

    for (const cand of cleanCandidates) {
      const candNoAccents = removeAccents(cand);
      if (addressLower.includes(cand) || addressNoAccents.includes(candNoAccents)) {
        return { lat: parseFloat(loc.lat), lon: parseFloat(loc.lon), name, matched_cand: cand };
      }
    }
  }

  return null;
}

console.log("Result for '58 Trần Bình - Cầu Giấy':", checkKnownLandmarks("58 Trần Bình - Cầu Giấy"));
