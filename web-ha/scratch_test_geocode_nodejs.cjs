const https = require('https');

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

async function run() {
  const result = await geocodeAddressEsri("58 Trần Bình - Cầu Giấy");
  console.log("Geocoding result:", result);
}

run();
