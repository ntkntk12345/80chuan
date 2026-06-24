import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3001);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Session store in memory
const activeSessions = new Map();

// Helper to get session from cookie or auth header
const getSession = (req) => {
  let token = null;
  // 1. Check cookies
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
    token = cookies.session_token;
  }
  // 2. Check auth header if not in cookies
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  return token ? activeSessions.get(token) : null;
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const session = getSession(req);
  if (session) {
    req.user = session;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  const session = getSession(req);
  if (session && session.role === 'admin') {
    req.user = session;
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

// Middleware to require admin or ctv role
const requireAdminOrCtv = (req, res, next) => {
  const session = getSession(req);
  if (session && (session.role === 'admin' || session.role === 'ctv')) {
    req.user = session;
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Access denied' });
  }
};

app.use((req, res, next) => {
  // Suppress log spam for background status, log, and notification polling to avoid bloating RAM/console logs
  const isSpammyPoll = req.url.includes('/api/bot/status') ||
    req.url.includes('/api/bot/logs/') ||
    req.url.includes('/notifications');
  if (!isSpammyPoll) {
    console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, JSON.stringify(req.body));
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use(express.static(join(__dirname, 'public')));

// Setup uploads directory
const uploadsDir = join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Commission data path (batdongsan)
const COMMISSION_DIR = join(__dirname, '..', 'batdongsan', 'data', 'bichha-commissions', 'districts');

// Open SQLite database file
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Helper database functions wrapped in promises for async/await usage
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        err.query = query;
        reject(err);
      }
      else resolve(this);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        err.query = query;
        reject(err);
      }
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        err.query = query;
        reject(err);
      }
      else resolve(row);
    });
  });
};

// Create tables and insert initial mock data if database is empty
async function initializeDatabase() {
  try {
    // 1. Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        phone TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        referralCode TEXT UNIQUE,
        avatar TEXT,
        role TEXT,
        walletBalance INTEGER DEFAULT 0,
        totalEarned INTEGER DEFAULT 0,
        pendingCommissions INTEGER DEFAULT 0,
        totalReferrals INTEGER DEFAULT 0,
        activeReferrals INTEGER DEFAULT 0
      )
    `);

    // 2. Create referrals table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referralCode TEXT,
        name TEXT,
        phone TEXT,
        date TEXT,
        status TEXT,
        commission INTEGER DEFAULT 0
      )
    `);

    // 3. Create transactions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        date TEXT,
        type TEXT,
        amount TEXT,
        status TEXT
      )
    `);

    // 4. Create settings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // Insert default settings if empty
    const settingsCount = await dbGet('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
      console.log('Initializing default settings...');
      const defaultSettings = [
        { key: 'min_withdrawal', value: '50000' },
        { key: 'referral_commission', value: '300000' },
        { key: 'tiktok_base_reward', value: '30000' },
        { key: 'tiktok_max_reward', value: '800000' },
        {
          key: 'tiktok_reward_tiers', value: JSON.stringify([
            { views: '5.000 - dưới 10.000 view', reward: 50000 },
            { views: '10.000 - dưới 30.000 view', reward: 100000 },
            { views: '30.000 - dưới 50.000 view', reward: 200000 },
            { views: '50.000 - dưới 100.000 view', reward: 400000 },
            { views: '100.000 - dưới 200.000 view', reward: 600000 },
            { views: '200.000 - dưới 500.000 view', reward: 800000 },
            { views: '>= 500.000 view', reward: 800000 }
          ])
        }
      ];
      for (const s of defaultSettings) {
        await dbRun('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
      }
    }

    // Insert default users if empty (only admin)
    const usersCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
      console.log('Initializing default users database...');
      await dbRun(
        `INSERT INTO users (phone, password, name, referralCode, avatar, role, walletBalance, totalEarned, pendingCommissions, totalReferrals, activeReferrals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['BichHa80land', 'BichHa80land010201@!', 'Quản trị viên', 'ADMIN80', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', 'admin', 99999999, 0, 0, 0, 0]
      );
    }

    // Ensure database migration updates the admin user to use the new credentials and deletes old default/mock credentials
    await dbRun("DELETE FROM users WHERE phone = 'admin'");
    await dbRun("DELETE FROM users WHERE phone = 'user'");
    const adminExists = await dbGet("SELECT * FROM users WHERE phone = 'BichHa80land'");
    if (adminExists) {
      await dbRun(
        "UPDATE users SET password = ?, role = ? WHERE phone = 'BichHa80land'",
        ['BichHa80land010201@!', 'admin']
      );
    } else {
      await dbRun(
        `INSERT INTO users (phone, password, name, referralCode, avatar, role, walletBalance, totalEarned, pendingCommissions, totalReferrals, activeReferrals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['BichHa80land', 'BichHa80land010201@!', 'Quản trị viên', 'ADMIN80', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', 'admin', 99999999, 0, 0, 0, 0]
      );
    }

    // Initialize rooms and room_distances tables
    await dbRun(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        room_code TEXT,
        address TEXT,
        price TEXT,
        price1 INTEGER,
        price2 INTEGER,
        room_type TEXT,
        district TEXT,
        latitude REAL,
        longitude REAL,
        text1 TEXT,
        text2 TEXT,
        photos TEXT,
        videos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'approved'
      )
    `);

    // Safe migration: Add status column if it does not exist
    try {
      await dbRun("ALTER TABLE rooms ADD COLUMN status TEXT DEFAULT 'approved'");
      console.log('Added status column to rooms table.');
    } catch (e) {
      // Column may already exist
    }

    // Safe migration: Add text1 column if it does not exist
    try {
      await dbRun("ALTER TABLE rooms ADD COLUMN text1 TEXT");
      console.log('Added text1 column to rooms table.');
    } catch (e) {
      // Column may already exist
    }

    await dbRun(`
      CREATE TABLE IF NOT EXISTS room_distances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        landmark_name TEXT,
        landmark_category TEXT,
        distance REAL,
        FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
      )
    `);

    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_session_code ON rooms(session_id, room_code)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_room_distances_room ON room_distances(room_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_district ON rooms(district)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_price1_price2 ON rooms(price1, price2)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category)`);

    // Safe migration: add note column to referrals
    try { await dbRun("ALTER TABLE referrals ADD COLUMN note TEXT DEFAULT ''"); } catch (e) { }
    // Safe migration: add note column to transactions
    try { await dbRun("ALTER TABLE transactions ADD COLUMN note TEXT DEFAULT ''"); } catch (e) { }
    // Safe migration: add category column to rooms for quick lookup
    try { await dbRun("ALTER TABLE rooms ADD COLUMN category TEXT DEFAULT 'phong-tro'"); } catch (e) { }
    // Safe migration: add thumbnail column to rooms
    try { await dbRun("ALTER TABLE rooms ADD COLUMN thumbnail TEXT DEFAULT ''"); } catch (e) { }
    // Safe migration: add description column to rooms
    try { await dbRun("ALTER TABLE rooms ADD COLUMN description TEXT DEFAULT ''"); } catch (e) { }
    // Safe migration: add timestamp column to rooms
    try { await dbRun("ALTER TABLE rooms ADD COLUMN timestamp REAL"); } catch (e) { }

    // Startup migration: Categorize existing rooms if they are all default
    try {
      const nonPhongTro = await dbGet("SELECT COUNT(*) as count FROM rooms WHERE category != 'phong-tro'");
      if (nonPhongTro && nonPhongTro.count === 0) {
        console.log('[MIGRATION] Migrating existing rooms to correct categories...');
        
        function extractMaxPriceVnd(text) {
          if (!text) return 0;
          let normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/trieu/g, 'tr');
          let regex = /\d+(?:\.\d+)?\s*(?:tr|k|ty)/g;
          let matches = normalized.match(regex);
          if (!matches) {
            let rawRegex = /\d{1,3}(?:[.,]\d{3})+/g;
            let rawMatches = normalized.match(rawRegex);
            if (rawMatches) {
              let prices = rawMatches.map(m => parseInt(m.replace(/[.,]/g, ''), 10) || 0);
              return Math.max(...prices);
            }
            return 0;
          }
          let maxVal = 0;
          for (let match of matches) {
            let num = parseFloat(match);
            if (isNaN(num)) continue;
            let val = 0;
            if (match.includes('tr')) {
              val = num * 1000000;
            } else if (match.includes('k')) {
              val = num * 1000;
            } else if (match.includes('ty')) {
              val = num * 1000000000;
            }
            if (val > maxVal) {
              maxVal = val;
            }
          }
          return maxVal;
        }

        function getCategoryFromText2(text2, text1 = '') {
          if (!text2) return 'phong-tro';
          const t2Lower = text2.trim().toLowerCase();
          
          const chungCuSymbols = ["việt quốc 2", "vietquoc 2", "việt quốc 3", "vietquoc 3", "tc 2", "tc2", "vinsmartcity"];
          const nguyenCanSymbols = ["tc 1", "tc1", "tc 3", "tc3", "đăng bài hn", "dang bai hn", "đại lộc land 1", "dai loc land 1"];
          const mbkdSymbols = ["1a", "tc 4", "tc4", "đại lộc land 2", "dai loc land 2"];
          const chdvSymbols = ["tuananh chdv 1", "chdv chọn lọc", "chdv chon loc", "dũng chdv", "dung chdv", "tuananh chdv 2", "n34 chdv", "chinh trần chdv", "chinh tran chdv"];
          const taiLandSymbols = ["tài land 1", "tai land 1", "tài land 2", "tai land 2"];
          const vietquoc1Symbols = ["việt quốc 1", "vietquoc 1"];
          
          const allSymbols = [
            ...chungCuSymbols,
            ...nguyenCanSymbols,
            ...mbkdSymbols,
            ...chdvSymbols,
            ...taiLandSymbols,
            ...vietquoc1Symbols
          ].sort((a, b) => b.length - a.length);
          
          let matchedSymbol = null;
          for (const sym of allSymbols) {
            if (t2Lower.startsWith(sym)) {
              const symLen = sym.length;
              if (t2Lower.length > symLen) {
                const nextChar = t2Lower[symLen];
                if (/[a-z0-9]/.test(nextChar)) {
                  continue;
                }
              }
              matchedSymbol = sym;
              break;
            }
          }
          
          if (!matchedSymbol) return 'phong-tro';
          
          if (chungCuSymbols.includes(matchedSymbol)) return 'chung-cu';
          if (nguyenCanSymbols.includes(matchedSymbol)) return 'nha-nguyen-can';
          if (mbkdSymbols.includes(matchedSymbol)) return 'mat-bang-kinh-doanh';
          if (chdvSymbols.includes(matchedSymbol)) return 'can-ho-dich-vu';
          if (taiLandSymbols.includes(matchedSymbol)) {
            const maxPrice = extractMaxPriceVnd(text1 || text2);
            return maxPrice >= 25000000 ? 'mat-bang-kinh-doanh' : 'nha-nguyen-can';
          }
          if (vietquoc1Symbols.includes(matchedSymbol)) {
            return (t2Lower.includes('mbkd') || t2Lower.includes('mặt bằng') || t2Lower.includes('văn phòng')) 
              ? 'mat-bang-kinh-doanh' : 'nha-nguyen-can';
          }
          return 'phong-tro';
        }

        const allRooms = await dbAll("SELECT id, text2, text1 FROM rooms");
        let migratedCount = 0;
        for (const r of allRooms) {
          let roomCategory = 'phong-tro';
          if (r.text2) {
            const text2Str = r.text2.trim();
            if (text2Str.startsWith('{')) {
              try {
                const parsed = JSON.parse(text2Str);
                if (parsed && parsed.category) {
                  roomCategory = parsed.category;
                }
              } catch (e) { }
            } else {
              roomCategory = getCategoryFromText2(r.text2, r.text1);
            }
          }

          if (roomCategory !== 'phong-tro') {
            await dbRun("UPDATE rooms SET category = ? WHERE id = ?", [roomCategory, r.id]);
            migratedCount++;
          }
        }
        console.log(`[MIGRATION] Successfully migrated ${migratedCount} rooms.`);
      }
    } catch (migErr) {
      console.error('[MIGRATION] Error migrating room categories:', migErr);
    }

    // Create page_views table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT,
        visitor_id TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at)`);

    // Create activity_logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_phone TEXT,
        actor_name TEXT,
        action_type TEXT,
        room_id INTEGER,
        details TEXT,
        created_at TEXT
      )
    `);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs(actor_phone)`);

    // Create notifications table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        message TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT
      )
    `);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_notifications_phone ON notifications(phone)`);

    console.log('SQLite database initialization complete.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

// Helper to recalculate single user stats
async function recalculateUserStats(phone) {
  if (!phone) return;
  const user = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!user) return;

  const userTx = await dbAll('SELECT * FROM transactions WHERE phone = ?', [phone]);
  let totalEarned = 0;
  let totalWithdrawn = 0;

  userTx.forEach(t => {
    if (t.status === 'Từ chối') return; // Ignore rejected transactions (refund money to balance)
    let amt = 0;
    if (t.amount) {
      let clean = t.amount.toString().replace(/[đ\s\+]/g, '').replace(/\./g, '');
      amt = parseFloat(clean) || 0;
    }
    if (amt > 0) {
      totalEarned += amt;
    } else if (amt < 0) {
      totalWithdrawn += Math.abs(amt);
    }
  });

  const walletBalance = Math.max(0, totalEarned - totalWithdrawn);

  // Recount referrals stats
  const referrals = await dbAll('SELECT * FROM referrals WHERE referralCode = ?', [user.referralCode]);
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'Đã kiếm được tiền' || r.status === 'approved' || (r.status && r.status.includes('Đã kiếm'))).length;

  await dbRun(
    `UPDATE users 
     SET walletBalance = ?, totalEarned = ?, totalReferrals = ?, activeReferrals = ? 
     WHERE phone = ?`,
    [walletBalance, totalEarned, totalReferrals, activeReferrals, phone]
  );
  console.log(`Stats recalculated for user ${phone}: balance=${walletBalance}, earned=${totalEarned}, referrals=${totalReferrals}`);
}

// --- GEOLOCATION & LANDMARKS DISTANCE RECALCULATION ---

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
  'Sơn Tây': { lat: 21.1348, lon: 105.5036 },
  'Mỹ Đình': { lat: 21.0282, lon: 105.7770 }
};

function cleanAddressProgressively(address) {
  if (!address) return "";
  let clean = address;
  // 1. Remove text inside parentheses (standard and full-width)
  clean = clean.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '');
  // 2. Strip after "-" or "," since they often separate district and street, confusing ESRI
  clean = clean.replace(/\s*-\s*.*/g, '');
  clean = clean.replace(/,.*/g, '');
  // 3. Simplify nested slashes (e.g. 322/95/1 -> 322)
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
      let rem = nameLower.replace("đại học", "").trim();
      if (rem !== "hà nội") candidates.push(rem);
    }
    if (nameLower.includes("trường đại học")) {
      candidates.push(nameLower.replace("trường đại học", "đh"));
      let rem = nameLower.replace("trường đại học", "").trim();
      if (rem !== "hà nội") candidates.push(rem);
    }
    if (nameLower.includes("hà nội")) {
      candidates.push(nameLower.replace("hà nội", "hn"));
    }
    if (nameLower === "đại học hà nội") {
      candidates.push("hanu", "đh hà nội", "đh hn");
    }
    if (nameLower === "đại học bách khoa hà nội") {
      candidates.push("bách khoa", "bkhn", "hust");
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
      // Strip Vietnamese diacritics inline for comparison
      const cNoAccents = cClean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
      // Filter out generic "hà nội" / "ha noi" tokens to prevent
      // landmarks like "Đại học Hà Nội" from matching every Hanoi address
      if (cClean.length > 2 && cNoAccents !== 'ha noi' && cNoAccents !== 'hanoi') {
        cleanCandidates.push(cClean);
      }
    }

    // Sort candidates by length descending
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
  // Check local match first
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

  // Check if we got default Hanoi coordinates or a generic match
  let isGeneric = false;
  if (result) {
    const hasDigits = /\d/.test(address);
    const resHasDigits = /\d/.test(result.name);
    if (hasDigits && !resHasDigits) {
      isGeneric = true;
    }
  }

  if (result && (isDefaultHanoi(result.lat, result.lon) || isGeneric)) {
    console.log(`[GEOLOCATION] Geocoded '${address}' returned generic/default coordinates (${result.lat}, ${result.lon}). Attempting progressive cleaning...`);
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

async function recalculateRoomGeocodeAndDistances(roomId, address) {
  if (!address) return;

  // Update district
  let district = 'Cầu Giấy';
  const hanoiDistricts = ['Mỹ Đình', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Mê Linh', 'Chương Mỹ', 'Thạch Thất', 'Quốc Oai', 'An Dương', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Sơn Tây'];
  for (const d of hanoiDistricts) {
    if (address.toLowerCase().includes(d.toLowerCase())) {
      district = d;
      break;
    }
  }

  // Geocode address
  const geo = await geocodeAddressEsri(address);
  let lat = null;
  let lon = null;
  if (geo) {
    lat = geo.lat;
    lon = geo.lon;
  }

  // Check if we need centroid fallback (either geocoding failed or returned default Hanoi coords)
  if (lat === null || lon === null || isDefaultHanoi(lat, lon)) {
    const fallback = districtCentroids[district];
    if (fallback) {
      lat = fallback.lat;
      lon = fallback.lon;
      console.log(`[GEOLOCATION] Geocoding failed or returned default for '${address}'. Falling back to centroid of district '${district}' -> ${lat}, ${lon}`);
    } else {
      console.warn(`[GEOLOCATION] Geocoding failed for '${address}' and no centroid found for district '${district}'`);
    }
  } else {
    console.log(`[GEOLOCATION] Geocoded successfully '${address}' -> ${lat}, ${lon}`);
  }

  // Update room latitude, longitude, and district in DB
  await dbRun(
    `UPDATE rooms SET latitude = ?, longitude = ?, district = ? WHERE id = ?`,
    [lat, lon, district, roomId]
  );

  // Clean up old distances for this room
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

      // Sort by distance
      distances.sort((a, b) => a.dist - b.dist);

      // Filter <= 5km
      let nearby = distances.filter(item => item.dist <= 5.0);
      if (nearby.length === 0 && distances.length > 0) {
        // Fallback to nearest 1 if none within 5km
        nearby = [distances[0]];
      }

      // Insert nearby distances
      for (const item of nearby) {
        await dbRun(
          `INSERT INTO room_distances (room_id, landmark_name, landmark_category, distance)
           VALUES (?, ?, ?, ?)`,
          [roomId, item.loc.name, item.loc.category, item.dist]
        );
      }
      console.log(`[GEOLOCATION] Saved ${nearby.length} landmarks for room ID ${roomId}`);

      // Also update text2 JSON if the room is a manual post, so they are fully consistent!
      const room = await dbGet("SELECT text2 FROM rooms WHERE id = ?", [roomId]);
      if (room && room.text2 && room.text2.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(room.text2);
          const closest = nearby[0];
          if (closest) {
            parsed.nearPlace = closest.loc.name;
            const distNum = closest.dist;
            parsed.distanceText = `Cách ${closest.loc.name} • ${distNum < 1.0 ? Math.round(distNum * 1000) + 'm' : distNum + ' km'}`;
            await dbRun("UPDATE rooms SET text2 = ? WHERE id = ?", [JSON.stringify(parsed), roomId]);
          }
        } catch (e) {
          console.error(`[GEOLOCATION] Error updating JSON metadata:`, e);
        }
      }
    }
  }
}

// --- API ROUTES ---

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
    if (user && user.password === password) {
      // Generate session token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      activeSessions.set(token, { phone: user.phone, role: user.role });

      // Set session cookie
      res.cookie('session_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, path: '/' });

      const { password: _, ...safeUser } = user;
      res.json({ ...safeUser, sessionToken: token });
    } else {
      res.status(401).json({ error: 'Số điện thoại/Email hoặc mật khẩu không chính xác!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT ROUTE
app.post('/api/logout', (req, res) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
    const token = cookies.session_token;
    if (token) {
      activeSessions.delete(token);
    }
  }
  res.clearCookie('session_token');
  res.json({ success: true });
});

// USERS ROUTES
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM users');
    // Sanitize user list by removing password from items
    const sanitized = users.map(({ password, ...u }) => u);
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:phone', async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE phone = ?', [req.params.phone]);
    if (user) {
      const session = getSession(req);
      if (session && (session.role === 'admin' || session.phone === req.params.phone)) {
        // Return full details (without password)
        const { password, ...safeUser } = user;
        res.json(safeUser);
      } else {
        // Return safe check fields (no passwords, names, avatars or wallet balances)
        res.json({ phone: user.phone, exists: true });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const u = req.body;
  try {
    const existing = await dbGet('SELECT * FROM users WHERE phone = ?', [u.phone]);
    if (existing) {
      // Require auth for update
      const session = getSession(req);
      if (!session || (session.role !== 'admin' && session.phone !== u.phone)) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }

      // Prevent non-admins from changing roles or balances
      const targetRole = session.role === 'admin' ? u.role : existing.role;
      const targetWalletBalance = session.role === 'admin' ? u.walletBalance : existing.walletBalance;
      const targetTotalEarned = session.role === 'admin' ? u.totalEarned : existing.totalEarned;
      const targetPendingCommissions = session.role === 'admin' ? u.pendingCommissions : existing.pendingCommissions;
      const targetTotalReferrals = session.role === 'admin' ? u.totalReferrals : existing.totalReferrals;
      const targetActiveReferrals = session.role === 'admin' ? u.activeReferrals : existing.activeReferrals;

      await dbRun(
        `UPDATE users 
         SET password = ?, name = ?, referralCode = ?, avatar = ?, role = ?, walletBalance = ?, totalEarned = ?, pendingCommissions = ?, totalReferrals = ?, activeReferrals = ?
         WHERE phone = ?`,
        [u.password || existing.password, u.name || existing.name, u.referralCode || existing.referralCode, u.avatar !== undefined ? u.avatar : existing.avatar, targetRole, targetWalletBalance, targetTotalEarned, targetPendingCommissions, targetTotalReferrals, targetActiveReferrals, u.phone]
      );

      const updated = await dbGet('SELECT * FROM users WHERE phone = ?', [u.phone]);
      const { password, ...safeUpdated } = updated;
      res.json(safeUpdated);
    } else {
      // New insert (registration) - force role to be 'user'
      await dbRun(
        `INSERT INTO users (phone, password, name, referralCode, avatar, role, walletBalance, totalEarned, pendingCommissions, totalReferrals, activeReferrals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.phone, u.password, u.name, u.referralCode, u.avatar, 'user', 0, 0, 0, 0, 0]
      );

      // Auto login: generate session token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      activeSessions.set(token, { phone: u.phone, role: 'user' });
      res.cookie('session_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, path: '/' });

      const created = await dbGet('SELECT * FROM users WHERE phone = ?', [u.phone]);
      const { password, ...safeCreated } = created;
      res.json({ ...safeCreated, sessionToken: token });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REFERRALS ROUTES
app.get('/api/referrals', requireAdminOrCtv, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const refs = await dbAll('SELECT * FROM referrals ORDER BY id DESC');
      res.json(refs);
    } else {
      const user = await dbGet('SELECT referralCode FROM users WHERE phone = ?', [req.user.phone]);
      const myCode = user ? user.referralCode : '';
      const refs = await dbAll('SELECT * FROM referrals WHERE referralCode = ? ORDER BY id DESC', [myCode]);
      res.json(refs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/referrals', async (req, res) => {
  const r = req.body;
  try {
    const referralCode = r.referralCode;
    const name = r.name || 'Người dùng mới';
    const phone = r.phone;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Verify that the referral code actually belongs to an existing user
    const inviter = await dbGet('SELECT * FROM users WHERE referralCode = ?', [referralCode]);
    if (!inviter) {
      return res.status(400).json({ error: 'Mã giới thiệu không hợp lệ' });
    }

    // Force safe default status and commission on backend to prevent clients from spoofing approval status/amount
    await dbRun(
      `INSERT INTO referrals (referralCode, name, phone, date, status, commission) VALUES (?, ?, ?, ?, ?, ?)`,
      [referralCode, name, phone, dateStr, 'pending', 0]
    );

    // Recalculate stats for the inviter
    await recalculateUserStats(inviter.phone);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/referrals/batch', requireAdmin, async (req, res) => {
  const { list, method } = req.body; // method: 'overwrite' | 'merge'
  try {
    if (method === 'overwrite') {
      await dbRun('DELETE FROM referrals');
    }

    for (const ref of list) {
      if (method !== 'overwrite') {
        // Prevent duplicate phones in merge
        const exists = await dbGet('SELECT * FROM referrals WHERE phone = ?', [ref.phone]);
        if (exists) {
          await dbRun(
            `UPDATE referrals SET referralCode = ?, name = ?, date = ?, status = ?, commission = ? WHERE phone = ?`,
            [ref.referralCode, ref.name, ref.date, ref.status, ref.commission, ref.phone]
          );
          continue;
        }
      }
      await dbRun(
        `INSERT INTO referrals (referralCode, name, phone, date, status, commission) VALUES (?, ?, ?, ?, ?, ?)`,
        [ref.referralCode, ref.name, ref.phone, ref.date, ref.status, ref.commission]
      );
    }

    // Recalculate stats for all users
    const allUsers = await dbAll('SELECT * FROM users');
    for (const u of allUsers) {
      await recalculateUserStats(u.phone);
    }

    res.json({ success: true, count: list.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/referrals/clear', requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM referrals');
    // Recalculate all stats
    const allUsers = await dbAll('SELECT * FROM users');
    for (const u of allUsers) {
      await recalculateUserStats(u.phone);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRANSACTIONS ROUTES
app.get('/api/transactions', requireAdmin, async (req, res) => {
  try {
    const tx = await dbAll('SELECT * FROM transactions ORDER BY id DESC');
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  const tx = req.body;
  const userPhone = req.user.phone;
  const isAdmin = req.user.role === 'admin';

  // Secure check: only admin can submit transactions for others
  if (!isAdmin && userPhone !== tx.phone) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  try {
    let finalPhone = tx.phone;
    let finalType = tx.type;
    let finalAmount = tx.amount;
    let finalStatus = tx.status;
    let finalNote = tx.note || '';
    const nowStr = new Date().toLocaleString('vi-VN');

    if (!isAdmin) {
      // For regular users, they can ONLY request a withdrawal
      finalPhone = userPhone;
      finalType = 'Rút tiền';
      finalStatus = 'Đang xử lý';

      // Parse and validate withdrawal amount
      if (!tx.amount) {
        return res.status(400).json({ error: 'Thiếu số tiền rút' });
      }
      // Clean amount string to get number
      const cleanAmount = parseFloat(tx.amount.toString().replace(/[đ\s\+-]/g, '').replace(/\./g, '')) || 0;

      const minWithdraw = 50000; // default min withdrawal or fetch from settings
      const settingsMinWithdraw = await dbGet('SELECT value FROM settings WHERE key = ?', ['min_withdrawal']);
      const parsedMin = settingsMinWithdraw ? parseInt(settingsMinWithdraw.value) : minWithdraw;

      if (cleanAmount < parsedMin) {
        return res.status(400).json({ error: `Số tiền rút tối thiểu là ${parsedMin.toLocaleString('vi-VN')}đ` });
      }

      // Fetch user's current actual backend balance to verify
      const user = await dbGet('SELECT * FROM users WHERE phone = ?', [userPhone]);
      if (!user || user.walletBalance < cleanAmount) {
        return res.status(400).json({ error: 'Số dư tài khoản không đủ để thực hiện giao dịch' });
      }

      // Force format to negative VND representation
      finalAmount = `-${cleanAmount.toLocaleString('vi-VN')}đ`;
    }

    await dbRun(
      `INSERT INTO transactions (phone, date, type, amount, status, note) VALUES (?, ?, ?, ?, ?, ?)`,
      [finalPhone, nowStr, finalType, finalAmount, finalStatus, finalNote]
    );

    if (finalPhone) {
      await recalculateUserStats(finalPhone);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[SERVER ERROR] Error in POST /api/transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions/batch', requireAdmin, async (req, res) => {
  const { list, method } = req.body;
  try {
    if (method === 'overwrite') {
      await dbRun('DELETE FROM transactions');
    }

    for (const tx of list) {
      if (method !== 'overwrite') {
        // Check exact duplicate to avoid double insertion in merge
        const exists = await dbGet(
          'SELECT * FROM transactions WHERE phone = ? AND date = ? AND type = ? AND amount = ?',
          [tx.phone, tx.date, tx.type, tx.amount]
        );
        if (exists) continue;
      }
      await dbRun(
        `INSERT INTO transactions (phone, date, type, amount, status, note) VALUES (?, ?, ?, ?, ?, ?)`,
        [tx.phone, tx.date, tx.type, tx.amount, tx.status, tx.note || '']
      );
    }

    // Recalculate stats for all users
    const allUsers = await dbAll('SELECT * FROM users');
    for (const u of allUsers) {
      await recalculateUserStats(u.phone);
    }

    res.json({ success: true, count: list.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions/clear', requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM transactions');
    // Recalculate all stats
    const allUsers = await dbAll('SELECT * FROM users');
    for (const u of allUsers) {
      await recalculateUserStats(u.phone);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SYNC REFERRAL COMMISSIONS TO TRANSACTIONS LOGIC
app.post('/api/sync-referrals', requireAdmin, async (req, res) => {
  try {
    const referrals = await dbAll('SELECT * FROM referrals');
    const transactions = await dbAll('SELECT * FROM transactions');
    const users = await dbAll('SELECT * FROM users');

    // Get default referral commission from settings
    const settingsRefCommission = await dbGet('SELECT value FROM settings WHERE key = ?', ['referral_commission']);
    const defaultComm = settingsRefCommission ? parseInt(settingsRefCommission.value) : 300000;

    let changed = false;

    for (const ref of referrals) {
      if (ref.status === 'Đã kiếm được tiền' || ref.commission > 0) {
        const comm = ref.commission || defaultComm;
        const inviter = users.find(u => u.referralCode === ref.referralCode);
        const phone = inviter ? inviter.phone : 'user';

        // Check if transaction exists
        const exists = transactions.some(t =>
          t.phone === phone &&
          t.type === 'Hoa hồng giới thiệu' &&
          t.amount === `+${comm.toLocaleString('vi-VN')}đ` &&
          t.date.split(' ')[0] === ref.date.split(' ')[0]
        );

        if (!exists) {
          await dbRun(
            `INSERT INTO transactions (phone, date, type, amount, status) VALUES (?, ?, ?, ?, ?)`,
            [phone, ref.date, 'Hoa hồng giới thiệu', `+${comm.toLocaleString('vi-VN')}đ`, 'Thành công']
          );
          changed = true;
        }
      }
    }

    if (changed) {
      // Recalculate all stats
      for (const u of users) {
        await recalculateUserStats(u.phone);
      }
    }

    res.json({ success: true, synced: changed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECALCULATE STATS DIRECTLY
app.post('/api/recalculate-stats', requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbAll('SELECT * FROM users');
    for (const u of allUsers) {
      await recalculateUserStats(u.phone);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE REFERRAL STATUS
app.post('/api/referrals/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the referral before update to get referralCode
    const ref = await dbGet('SELECT * FROM referrals WHERE id = ?', [id]);
    if (!ref) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    await dbRun('UPDATE referrals SET status = ? WHERE id = ?', [status, id]);

    // Recalculate stats for the inviter
    const inviter = await dbGet('SELECT * FROM users WHERE referralCode = ?', [ref.referralCode]);
    if (inviter) {
      await recalculateUserStats(inviter.phone);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TRANSACTION STATUS
app.post('/api/transactions/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the transaction before update to get phone
    const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await dbRun('UPDATE transactions SET status = ? WHERE id = ?', [status, id]);

    // Recalculate stats for the user
    await recalculateUserStats(tx.phone);

    // Create notification if withdrawal is approved successfully
    if (tx.type === 'Rút tiền' && status === 'Thành công') {
      const displayAmount = tx.amount ? tx.amount.replace(/[-+]/g, '') : '';
      const nowStr = new Date().toLocaleString('vi-VN');
      const notiMsg = `Yêu cầu rút tiền trị giá ${displayAmount} của bạn đã được duyệt thành công.`;
      await dbRun(
        `INSERT INTO notifications (phone, message, read, created_at) VALUES (?, ?, 0, ?)`,
        [tx.phone, notiMsg, nowStr]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETTINGS ROUTES
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM settings');
    const settingsObj = {};
    rows.forEach(r => {
      settingsObj[r.key] = r.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', requireAdmin, async (req, res) => {
  const newSettings = req.body;
  try {
    for (const key of Object.keys(newSettings)) {
      let val = newSettings[key];
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      await dbRun(
        `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
        [key, String(val)]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to filter out rooms with duplicate text2 (100% identical, public text)
function deduplicateRooms(rooms) {
  const seenText2 = new Set();
  const uniqueRooms = [];
  for (const r of rooms) {
    let rawText = '';
    if (r.text2) {
      const trimmed = r.text2.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          rawText = (parsed.text2 || '').trim();
        } catch (e) {
          rawText = trimmed;
        }
      } else {
        rawText = trimmed;
      }
    }
    if (rawText) {
      if (!seenText2.has(rawText)) {
        seenText2.add(rawText);
        uniqueRooms.push(r);
      }
    } else {
      uniqueRooms.push(r);
    }
  }
  return uniqueRooms;
}

// Helper to build a map of address -> photos/videos/thumbnail ONLY for the rooms in the current batch that have empty photos
async function getAddressMapForRooms(rooms) {
  const addressMap = new Map();
  const emptyPhotoAddresses = [];
  rooms.forEach(r => {
    let photos = [];
    try {
      photos = r.photos ? JSON.parse(r.photos) : [];
    } catch (e) {}
    if (photos.length === 0 && r.address) {
      emptyPhotoAddresses.push(r.address.trim().toLowerCase());
    }
  });

  if (emptyPhotoAddresses.length === 0) {
    return addressMap;
  }

  try {
    const placeholders = emptyPhotoAddresses.map(() => '?').join(',');
    const fallbackSource = await dbAll(
      `SELECT address, photos, videos, thumbnail FROM rooms 
       WHERE LOWER(TRIM(address)) IN (${placeholders}) 
         AND photos IS NOT NULL AND photos != '[]' AND photos != ''`,
      emptyPhotoAddresses
    );
    fallbackSource.forEach(row => {
      if (!row.address) return;
      const key = row.address.trim().toLowerCase();
      if (!addressMap.has(key)) {
        let photos = [];
        let videos = [];
        try {
          photos = row.photos ? JSON.parse(row.photos) : [];
        } catch (e) { }
        try {
          videos = row.videos ? JSON.parse(row.videos) : [];
        } catch (e) { }
        if (photos.length > 0) {
          addressMap.set(key, { photos, videos, thumbnail: row.thumbnail || '' });
        }
      }
    });
  } catch (e) {
    console.error("Error building address map on demand:", e);
  }
  return addressMap;
}

// Helper to parse and format a room record for the API responses
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
    } catch (e) { }
  }

  // Resolve cover image: use thumbnail -> manual post extra.image -> first photo url
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

app.get('/api/rooms', async (req, res) => {
  try {
    const { district, type, price_min, price_max, status, page, limit, q, landmark, category, id, session_id } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(300, Math.max(1, parseInt(limit) || 60));
    const offset = (pageNum - 1) * limitNum;

    let joinClause = '';
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (id) {
      whereClause += ' AND rooms.id = ?';
      params.push(parseInt(id));
    }
    if (session_id) {
      whereClause += ' AND rooms.session_id = ?';
      params.push(session_id);
    }

    // Default to 'approved' if status is not specified or not 'all'
    const filterStatus = status || 'approved';
    if (filterStatus !== 'all' && !id && !session_id) {
      whereClause += ' AND rooms.status = ?';
      params.push(filterStatus);
    }

    if (district) {
      whereClause += ' AND rooms.district = ?';
      params.push(district);
    }
    if (type) {
      whereClause += ' AND rooms.room_type LIKE ?';
      params.push(`%${type}%`);
    }
    if (price_min) {
      whereClause += ' AND rooms.price1 >= ?';
      params.push(parseInt(price_min));
    }
    if (price_max) {
      whereClause += ' AND rooms.price2 <= ?';
      params.push(parseInt(price_max));
    }
    if (q) {
      const tokens = q.split(/[\s,.-]+/).map(t => t.trim()).filter(t => t.length > 0).slice(0, 6);
      if (tokens.length > 0) {
        tokens.forEach(token => {
          whereClause += " AND (COALESCE(rooms.address, '') || ', Hà Nội' LIKE ? OR rooms.room_type LIKE ? OR rooms.text2 LIKE ? OR rooms.district LIKE ?)";
          params.push(`%${token}%`, `%${token}%`, `%${token}%`, `%${token}%`);
        });
      }
    }
    if (landmark) {
      joinClause = 'INNER JOIN room_distances ON rooms.id = room_distances.room_id';
      whereClause += ' AND room_distances.landmark_name = ?';
      params.push(landmark);
    }
    if (category && category !== 'saved-rooms' && category !== 'viewed-rooms') {
      if (category === 'pass-phong') {
        // Pass phong is a sub-filter within phong-tro: search phong-tro rooms with pass/nhượng keywords
        whereClause += " AND rooms.category = 'phong-tro' AND (rooms.text2 LIKE '%pass%' OR rooms.text2 LIKE '%nh\u01b0\u1ee3ng%' OR rooms.text1 LIKE '%pass%' OR rooms.text1 LIKE '%nh\u01b0\u1ee3ng%')";
      } else if (category === 'o-ghep') {
        // O ghep is a sub-filter within phong-tro: search phong-tro rooms with ghep/roommate keywords
        whereClause += " AND rooms.category = 'phong-tro' AND (rooms.text2 LIKE '%gh\u00e9p%' OR rooms.text2 LIKE '%\u1edf gh\u00e9p%' OR rooms.text2 LIKE '%roommate%' OR rooms.text1 LIKE '%gh\u00e9p%' OR rooms.text1 LIKE '%\u1edf gh\u00e9p%')";
      } else {
        whereClause += ' AND rooms.category = ?';
        params.push(category);
      }
    }

    // Get total count for pagination metadata
    const countRow = await dbGet(`SELECT COUNT(DISTINCT rooms.id) as total FROM rooms ${joinClause} ${whereClause}`, params);
    const total = countRow ? countRow.total : 0;

    const query = `SELECT DISTINCT rooms.* FROM rooms ${joinClause} ${whereClause} ORDER BY rooms.created_at DESC LIMIT ? OFFSET ?`;
    const rooms = await dbAll(query, [...params, limitNum, offset]);
    const uniqueRooms = deduplicateRooms(rooms);

    const roomIds = uniqueRooms.map(r => r.id);
    let distances = [];
    if (roomIds.length > 0) {
      const placeholders = roomIds.map(() => '?').join(',');
      distances = await dbAll(`SELECT * FROM room_distances WHERE room_id IN (${placeholders})`, roomIds);
    }

    const distancesByRoomId = {};
    distances.forEach(d => {
      if (!distancesByRoomId[d.room_id]) {
        distancesByRoomId[d.room_id] = [];
      }
      distancesByRoomId[d.room_id].push({
        landmark_name: d.landmark_name,
        landmark_category: d.landmark_category,
        distance: d.distance
      });
    });

    const addressMap = await getAddressMapForRooms(uniqueRooms);
    const result = uniqueRooms.map(r => formatRoomResponse(r, distancesByRoomId, addressMap));

    res.json({ data: result, total, page: pageNum, limit: limitNum, hasMore: offset + uniqueRooms.length < total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ADMIN ENDPOINTS FOR ROOMS
app.get('/api/admin/rooms', requireAdminOrCtv, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 1200';
    const rooms = await dbAll(query, params);
    const uniqueRooms = deduplicateRooms(rooms);

    const roomIds = uniqueRooms.map(r => r.id);
    let distances = [];
    if (roomIds.length > 0) {
      const placeholders = roomIds.map(() => '?').join(',');
      distances = await dbAll(`SELECT * FROM room_distances WHERE room_id IN (${placeholders})`, roomIds);
    }

    const distancesByRoomId = {};
    distances.forEach(d => {
      if (!distancesByRoomId[d.room_id]) {
        distancesByRoomId[d.room_id] = [];
      }
      distancesByRoomId[d.room_id].push({
        landmark_name: d.landmark_name,
        landmark_category: d.landmark_category,
        distance: d.distance
      });
    });

    const addressMap = await getAddressMapForRooms(uniqueRooms);
    const result = uniqueRooms.map(r => formatRoomResponse(r, distancesByRoomId, addressMap));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/recalculate-all', requireAdmin, async (req, res) => {
  // Return early to prevent UI timeout
  res.json({ message: 'Bắt đầu quá trình cập nhật tọa độ cho tất cả các phòng. Quá trình này sẽ chạy ngầm và có thể mất vài phút.' });
  
  // Run process in the background
  (async () => {
    try {
      console.log('[BACKGROUND] Bắt đầu cập nhật tọa độ toàn bộ phòng...');
      const rooms = await dbAll('SELECT id, address FROM rooms WHERE address IS NOT NULL');
      console.log(`[BACKGROUND] Tìm thấy ${rooms.length} phòng cần kiểm tra tọa độ.`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const room of rooms) {
        try {
          await recalculateRoomGeocodeAndDistances(room.id, room.address);
          successCount++;
          // Small delay to prevent rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`[BACKGROUND] Lỗi cập nhật phòng ID ${room.id}:`, err);
          errorCount++;
        }
      }
      console.log(`[BACKGROUND] Cập nhật hoàn tất! Thành công: ${successCount}, Lỗi: ${errorCount}`);
    } catch (err) {
      console.error('[BACKGROUND] Lỗi tổng quát trong quá trình cập nhật tọa độ toàn bộ phòng:', err);
    }
  })();
});

app.post('/api/rooms', requireAdminOrCtv, async (req, res) => {
  const room = req.body;
  try {
    const originalText = JSON.stringify({
      isManual: true,
      category: room.category,
      title: room.title,
      nearPlace: room.nearPlace,
      distanceText: room.distanceText,
      priceText: room.priceText,
      priceRaw: room.priceRaw,
      areaText: room.areaText,
      badgeText: room.badgeText,
      badgeColor: room.badgeColor,
      zaloNumber: room.zaloNumber,
      image: room.image,
      subCategory: room.subCategory,
      gender: room.gender,
      passIncentive: room.passIncentive,
      text2: room.text2,
      customLandmarks: room.customLandmarks
    });

    const photos = room.photos ? JSON.stringify(room.photos) : JSON.stringify([{ url: room.image }]);
    const videos = room.videos ? JSON.stringify(room.videos) : JSON.stringify([]);
    const priceText = room.priceText;
    const priceRaw = room.priceRaw;
    const roomType = room.areaText;
    const address = room.address;

    // Parse district
    let district = 'Cầu Giấy';
    const hanoiDistricts = ['Mỹ Đình', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Mê Linh', 'Chương Mỹ', 'Thạch Thất', 'Quốc Oai', 'An Dương', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Sơn Tây'];
    for (const d of hanoiDistricts) {
      if (address.toLowerCase().includes(d.toLowerCase())) {
        district = d;
        break;
      }
    }

    const uniqSessionId = `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = Date.now() / 1000;
    const created_at = new Date(Date.now() + 7 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const result = await dbRun(
      `INSERT INTO rooms (session_id, room_code, address, price, price1, price2, room_type, district, category, text2, photos, videos, status, timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uniqSessionId, null, address, priceText, priceRaw, priceRaw, roomType, district, room.category || 'phong-tro', originalText, photos, videos, 'approved', timestamp, created_at]
    );

    const roomId = result.lastID;

    // Log collaborator activity
    const log_phone = req.user.phone;
    let log_name = 'CTV';
    const logUser = await dbGet('SELECT name FROM users WHERE phone = ?', [log_phone]);
    if (logUser && logUser.name) {
      log_name = logUser.name;
    }
    if (log_phone) {
      const logTime = new Date().toLocaleString('vi-VN');
      await dbRun(
        `INSERT INTO activity_logs (actor_phone, actor_name, action_type, room_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [log_phone, log_name, 'add_room', roomId, `Thêm phòng: ${room.title || 'Không rõ tiêu đề'} (Danh mục: ${room.category || 'phong-tro'}, Giá: ${priceText || 'Liên hệ'}, Địa chỉ: ${address || ''})`, logTime]
      );
    }

    res.json({ success: true, id: roomId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/batch', requireAdmin, async (req, res) => {
  const { list, category, method } = req.body;
  try {
    if (method === 'overwrite') {
      await dbRun("DELETE FROM room_distances WHERE room_id IN (SELECT id FROM rooms WHERE category = ?)", [category]);
      await dbRun("DELETE FROM rooms WHERE category = ?", [category]);
    }

    for (const room of list) {
      const originalText = JSON.stringify({
        isManual: true,
        category: category,
        title: room.title,
        nearPlace: room.nearPlace,
        distanceText: room.distanceText,
        priceText: room.priceText,
        priceRaw: room.priceRaw,
        areaText: room.areaText,
        badgeText: room.badgeText,
        badgeColor: room.badgeColor,
        zaloNumber: room.zaloNumber || '0876480130',
        image: room.image,
        subCategory: room.subCategory,
        gender: room.gender,
        passIncentive: room.passIncentive,
        text2: room.text2
      });

      const photos = JSON.stringify([{ url: room.image }]);
      const priceText = room.priceText;
      const priceRaw = room.priceRaw;
      const roomType = room.areaText;
      const address = room.address || 'Hà Nội';

      let district = 'Cầu Giấy';
      const hanoiDistricts = ['Mỹ Đình', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Hà Đông', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Gia Lâm', 'Đông Anh', 'Sóc Sơn', 'Mê Linh', 'Chương Mỹ', 'Thạch Thất', 'Quốc Oai', 'An Dương', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên', 'Ứng Hòa', 'Mỹ Đức', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Sơn Tây'];
      for (const d of hanoiDistricts) {
        if (address.toLowerCase().includes(d.toLowerCase())) {
          district = d;
          break;
        }
      }

      const uniqSessionId = `manual_excel_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const timestamp = Date.now() / 1000;
      const created_at = new Date(Date.now() + 7 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);

      const result = await dbRun(
        `INSERT INTO rooms (session_id, room_code, address, price, price1, price2, room_type, district, category, text2, photos, status, timestamp, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uniqSessionId, null, address, priceText, priceRaw, priceRaw, roomType, district, category || 'phong-tro', originalText, photos, 'approved', timestamp, created_at]
      );
      const roomId = result.lastID;
    }

    res.json({ success: true, count: list.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/:id/approve', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await dbRun("UPDATE rooms SET status = 'approved' WHERE id = ?", [id]);
    res.json({ success: true, message: 'Đã duyệt tin đăng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/:id/reject', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await dbRun("UPDATE rooms SET status = 'rejected' WHERE id = ?", [id]);
    res.json({ success: true, message: 'Đã từ chối tin đăng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await dbRun("DELETE FROM rooms WHERE id = ?", [id]);
    await dbRun("DELETE FROM room_distances WHERE room_id = ?", [id]);
    res.json({ success: true, message: 'Đã xóa tin đăng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE REFERRAL STATUS (with note) ──────────────────────────────────────
// Update existing route to also save note
app.post('/api/referrals/:id/note', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    await dbRun('UPDATE referrals SET note = ? WHERE id = ?', [note || '', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── APPROVE REFERRAL (admin duyệt ref: note bắt buộc + cộng tiền) ────────────
app.post('/api/referrals/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note, commission } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Ghi chú là bắt buộc khi duyệt.' });
    }

    const ref = await dbGet('SELECT * FROM referrals WHERE id = ?', [id]);
    if (!ref) return res.status(404).json({ error: 'Không tìm thấy ref' });

    // Check if already approved (support old Vietnamese status strings)
    const APPROVED_STATUSES = ['approved', 'Đã kiếm được tiền', 'Đã duyệt'];
    if (APPROVED_STATUSES.includes(ref.status)) {
      return res.status(400).json({ error: 'Ref này đã được duyệt rồi.' });
    }

    const commAmount = commission || 100000;
    const now = new Date().toLocaleString('vi-VN');

    // Update referral status + note
    await dbRun(
      "UPDATE referrals SET status = 'approved', note = ?, commission = ? WHERE id = ?",
      [note.trim(), commAmount, id]
    );
    // Find inviter and credit them
    const inviter = await dbGet('SELECT * FROM users WHERE referralCode = ?', [ref.referralCode]);
    if (inviter) {
      const amtStr = `+${commAmount.toLocaleString('vi-VN')}đ`;
      const txNote = `Hoa hồng giới thiệu - ${ref.name} (${ref.phone}) - Ghi chú: ${note.trim()}`;
      await dbRun(
        `INSERT INTO transactions (phone, date, type, amount, status, note) VALUES (?, ?, ?, ?, ?, ?)`,
        [inviter.phone, now, 'Hoa hồng giới thiệu', amtStr, 'Thành công', txNote]
      );
      await recalculateUserStats(inviter.phone);

      // Create notification for inviter
      const notiMsg = `Đã cộng +${commAmount.toLocaleString('vi-VN')}đ vào ví vì mời thành công ${ref.name} (${ref.phone}).`;
      await dbRun(
        `INSERT INTO notifications (phone, message, read, created_at) VALUES (?, ?, 0, ?)`,
        [inviter.phone, notiMsg, now]
      );
    } res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── NORMALIZE OLD STATUS STRINGS → 'approved' / 'pending' ────────────────────
app.post('/api/referrals/normalize', requireAdmin, async (req, res) => {
  try {
    // Migrate "Đã kiếm được tiền" → 'approved'
    await dbRun("UPDATE referrals SET status = 'approved' WHERE status IN ('Đã kiếm được tiền', 'Đã duyệt')");
    // Migrate "Chưa đủ điều kiện" → 'pending' (chờ duyệt, có thể vẫn duyệt được)
    await dbRun("UPDATE referrals SET status = 'pending' WHERE status = 'Chờ duyệt'");
    const count = await dbGet('SELECT COUNT(*) as cnt FROM referrals');
    res.json({ success: true, total: count.cnt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USER BALANCE ADJUST (cộng/trừ tiền user) ─────────────────────────────────
app.post('/api/users/:phone/adjust', requireAdmin, async (req, res) => {
  try {
    const { phone } = req.params;
    const { amount, note, type } = req.body; // amount: signed integer, note required

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Ghi chú là bắt buộc.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) return res.status(404).json({ error: 'User không tồn tại.' });

    const now = new Date().toLocaleString('vi-VN');
    const amt = parseInt(amount);
    const amtStr = amt >= 0 ? `+${amt.toLocaleString('vi-VN')}đ` : `-${Math.abs(amt).toLocaleString('vi-VN')}đ`;
    const txType = type || (amt >= 0 ? 'Admin cộng tiền' : 'Admin trừ tiền');

    await dbRun(
      `INSERT INTO transactions (phone, date, type, amount, status, note) VALUES (?, ?, ?, ?, ?, ?)`,
      [phone, now, txType, amtStr, 'Thành công', note.trim()]
    );
    await recalculateUserStats(phone);

    const updated = await dbGet('SELECT * FROM users WHERE phone = ?', [phone]);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET USER TRANSACTIONS ──────────────────────────────────────────────────────
app.get('/api/users/:phone/transactions', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.phone !== req.params.phone) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }
  try {
    const { phone } = req.params;
    const txs = await dbAll('SELECT * FROM transactions WHERE phone = ? ORDER BY id DESC', [phone]);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET USER NOTIFICATIONS ────────────────────────────────────────────────────
app.get('/api/users/:phone/notifications', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.phone !== req.params.phone) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }
  try {
    const { phone } = req.params;
    const notis = await dbAll('SELECT * FROM notifications WHERE phone = ? ORDER BY id DESC', [phone]);
    res.json(notis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── MARK ALL NOTIFICATIONS AS READ ────────────────────────────────────────────
app.post('/api/users/:phone/notifications/read', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.phone !== req.params.phone) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }
  try {
    const { phone } = req.params;
    await dbRun('UPDATE notifications SET read = 1 WHERE phone = ?', [phone]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE ROOM (PUT) ──────────────────────────────────────────────────────────
app.put('/api/rooms/:id', requireAdminOrCtv, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { address, price, price1, room_type, description, thumbnail, category, text2, photos, videos, nearPlace, distanceText, actor_phone, actor_name } = req.body;

    // Build the updated text2 blob for manual rooms
    const existingRoom = await dbGet('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!existingRoom) return res.status(404).json({ error: 'Room not found' });

    let roomTitle = `phòng mã ${existingRoom.room_code || id}`;
    if (existingRoom.text2 && existingRoom.text2.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(existingRoom.text2);
        if (parsed.title) roomTitle = parsed.title;
      } catch (e) { }
    }

    let newText2 = existingRoom.text2 || '';
    // If it's a manual room JSON, update fields
    if (newText2.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(newText2);
        if (description !== undefined) parsed.text2 = description;
        if (category !== undefined) parsed.category = category;
        if (room_type !== undefined) parsed.areaText = room_type;
        if (thumbnail !== undefined) parsed.image = thumbnail;
        if (nearPlace !== undefined) parsed.nearPlace = nearPlace;
        if (distanceText !== undefined) parsed.distanceText = distanceText;
        if (price !== undefined) parsed.priceText = price;
        if (price1 !== undefined) parsed.priceRaw = price1;
        newText2 = JSON.stringify(parsed);
      } catch (e) {
        if (description) newText2 = description;
      }
    } else {
      if (description !== undefined) newText2 = description;
    }

    const photosStr = photos !== undefined ? JSON.stringify(photos) : null;
    const videosStr = videos !== undefined ? JSON.stringify(videos) : null;

    const shouldResetGeo = (address !== undefined && address !== existingRoom.address) ? 1 : 0;

    await dbRun(
      `UPDATE rooms SET 
        address = COALESCE(?, address), 
        price = COALESCE(?, price), 
        price1 = COALESCE(?, price1), 
        price2 = CASE WHEN ? IS NOT NULL THEN ? ELSE price2 END, 
        room_type = COALESCE(?, room_type), 
        text2 = ?, 
        thumbnail = COALESCE(?, thumbnail), 
        category = COALESCE(?, category),
        photos = CASE WHEN ? IS NOT NULL THEN ? ELSE photos END,
        videos = CASE WHEN ? IS NOT NULL THEN ? ELSE videos END,
        latitude = CASE WHEN ? = 1 THEN NULL ELSE latitude END,
        longitude = CASE WHEN ? = 1 THEN NULL ELSE longitude END
       WHERE id = ?`,
      [
        address, 
        price, 
        price1, 
        price1 !== undefined ? price1 : null, 
        price1 !== undefined ? price1 : null, 
        room_type, 
        newText2, 
        thumbnail, 
        category, 
        photosStr, photosStr, 
        videosStr, videosStr, 
        shouldResetGeo, shouldResetGeo, 
        id
      ]
    );

    const log_phone = req.user.phone;
    let log_name = 'CTV';
    const logUser = await dbGet('SELECT name FROM users WHERE phone = ?', [log_phone]);
    if (logUser && logUser.name) {
      log_name = logUser.name;
    }
    if (log_phone) {
      const logTime = new Date().toLocaleString('vi-VN');
      await dbRun(
        `INSERT INTO activity_logs (actor_phone, actor_name, action_type, room_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [log_phone, log_name, 'edit_room', id, `Chỉnh sửa thông tin phòng: ${roomTitle} (ID: ${id})`, logTime]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPLOAD MEDIA ───────────────────────────────────────────────────────────────
app.post('/api/upload', requireAdminOrCtv, upload.array('files', 20), (req, res) => {
  try {
    const files = req.files || [];
    const result = files.map(f => ({
      url: `/uploads/${f.filename}`,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    }));
    res.json({ success: true, files: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── COMMISSIONS SEARCH ─────────────────────────────────────────────────────────
app.get('/api/commissions', requireAdminOrCtv, async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    const results = [];

    if (!fs.existsSync(COMMISSION_DIR)) {
      return res.json({ results: [], error: 'Commission data directory not found' });
    }

    const files = fs.readdirSync(COMMISSION_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const raw = fs.readFileSync(join(COMMISSION_DIR, file), 'utf8');
      let data;
      try { data = JSON.parse(raw); } catch (e) { continue; }
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        const text1 = item.text1 || '';
        const text2 = item.text2 || '';
        const combined = (text1 + ' ' + text2).toLowerCase();

        // If no query, return first 50; otherwise filter
        if (!q || combined.includes(q)) {
          // Extract commission % from text1
          const commMatch = text1.match(/(\d+)%/);
          const commPct = commMatch ? parseInt(commMatch[1]) : 0;

          results.push({
            id: item.id,
            text1,
            text2,
            commissionPct: commPct,
            district: file.replace('.json', '')
          });

          if (!q && results.length >= 50) break;
        }
      }

      if (!q && results.length >= 50) break;
    }

    // Sort by commission % descending
    results.sort((a, b) => b.commissionPct - a.commissionPct);

    res.json({ results: results.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRAFFIC TRACKING ───────────────────────────────────────────────────────────
app.post('/api/track', async (req, res) => {
  try {
    const { path, visitor_id, referrer } = req.body;
    await dbRun(
      'INSERT INTO page_views (path, visitor_id, referrer) VALUES (?, ?, ?)',
      [path || '/', visitor_id || 'anon', referrer || '']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics', requireAdmin, async (req, res) => {
  try {
    const { range } = req.query; // 'today' | '7d' | '30d' | 'all'

    let dateFilter = '';
    if (range === 'today') {
      dateFilter = "AND date(created_at) = date('now', 'localtime')";
    } else if (range === '7d') {
      dateFilter = "AND created_at >= datetime('now', '-7 days')";
    } else if (range === '30d') {
      dateFilter = "AND created_at >= datetime('now', '-30 days')";
    }

    // Total pageviews in range
    const total = await dbGet(`SELECT COUNT(*) as cnt FROM page_views WHERE 1=1 ${dateFilter}`);
    // Unique visitors
    const unique = await dbGet(`SELECT COUNT(DISTINCT visitor_id) as cnt FROM page_views WHERE 1=1 ${dateFilter}`);
    // By day (last 30 days)
    const byDay = await dbAll(`
      SELECT date(created_at, 'localtime') as day, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
      FROM page_views
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY day ORDER BY day ASC
    `);
    // By hour today
    const byHour = await dbAll(`
      SELECT strftime('%H', created_at, 'localtime') as hour, COUNT(*) as views
      FROM page_views
      WHERE date(created_at, 'localtime') = date('now', 'localtime')
      GROUP BY hour ORDER BY hour ASC
    `);
    // Top pages
    const topPages = await dbAll(`
      SELECT path, COUNT(*) as views FROM page_views WHERE 1=1 ${dateFilter}
      GROUP BY path ORDER BY views DESC LIMIT 10
    `);
    // Total all time
    const totalAll = await dbGet('SELECT COUNT(*) as cnt FROM page_views');

    res.json({ total: total.cnt, unique: unique.cnt, totalAll: totalAll.cnt, byDay, byHour, topPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ALL ROOMS SEARCH (admin) ──────────────────────────────────────────────────
app.get('/api/admin/rooms/search', requireAdminOrCtv, async (req, res) => {
  try {
    const { q } = req.query;
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    if (q) {
      query += ' AND (address LIKE ? OR room_type LIKE ? OR text2 LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    query += ' ORDER BY created_at DESC LIMIT 200';
    const rooms = await dbAll(query, params);
    const uniqueRooms = deduplicateRooms(rooms);
    const roomIds = uniqueRooms.map(r => r.id);
    let distances = [];
    if (roomIds.length > 0) {
      const ph = roomIds.map(() => '?').join(',');
      distances = await dbAll(`SELECT * FROM room_distances WHERE room_id IN (${ph})`, roomIds);
    }
    const distMap = {};
    distances.forEach(d => {
      if (!distMap[d.room_id]) distMap[d.room_id] = [];
      distMap[d.room_id].push({
        landmark_name: d.landmark_name,
        landmark_category: d.landmark_category,
        distance: d.distance
      });
    });
    const addressMap = await getAddressMapForRooms(uniqueRooms);
    const result = uniqueRooms.map(r => formatRoomResponse(r, distMap, addressMap));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACTIVITY LOGS ENDPOINT
app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM activity_logs ORDER BY id DESC');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ZALO BOT MANAGEMENT APIs ---
const execPromise = promisify(exec);
const BOT_DIR = join(__dirname, '..', 'bot');
const CONFIG_JSON_PATH = join(BOT_DIR, 'config_bot.json');
const STATUS_JSON_PATH = join(BOT_DIR, 'bot_service_status.json');
const CONTROL_JSON_PATH = join(BOT_DIR, 'bot_service_control.json');

let botProcesses = {
  listener: null,
  sender: null
};

// Check if a process PID is running
async function isPidRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

// Kill a process PID cleanly (cross-platform)
async function killProcess(pid) {
  try {
    if (process.platform === 'win32') {
      await execPromise(`taskkill /F /PID ${pid}`);
    } else {
      process.kill(pid, 'SIGKILL');
    }
    return true;
  } catch (e) {
    return false; // Process already dead or access denied
  }
}

// Read last N lines of a file
function readLastLines(filePath, maxLines = 100) {
  try {
    if (!fs.existsSync(filePath)) return '';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    return lines.slice(-maxLines).join('\n');
  } catch (err) {
    return `Error reading logs: ${err.message}`;
  }
}

// 1. Get live status of processes and heartbeats
app.get('/api/bot/status', requireAdmin, async (req, res) => {
  try {
    const statusData = fs.existsSync(STATUS_JSON_PATH)
      ? JSON.parse(fs.readFileSync(STATUS_JSON_PATH, 'utf8'))
      : {};

    const controlData = fs.existsSync(CONTROL_JSON_PATH)
      ? JSON.parse(fs.readFileSync(CONTROL_JSON_PATH, 'utf8'))
      : {};

    const result = {};
    for (const service of ['listener', 'sender']) {
      let pid = null;
      let running = false;

      // Check in-memory process
      if (botProcesses[service]) {
        pid = botProcesses[service].pid;
        running = await isPidRunning(pid);
      }

      // Fallback: check saved PID file
      const pidPath = join(BOT_DIR, `${service}.pid`);
      if (!running && fs.existsSync(pidPath)) {
        const filePid = parseInt(fs.readFileSync(pidPath, 'utf8').trim(), 10);
        if (filePid && await isPidRunning(filePid)) {
          pid = filePid;
          running = true;
        }
      }

      result[service] = {
        running,
        pid,
        enabled: controlData[`${service}Enabled`] !== false,
        info: statusData[service] || {}
      };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Control service state: start, stop, or restart
app.post('/api/bot/control', requireAdmin, async (req, res) => {
  const { service, action } = req.body;
  if (!['listener', 'sender'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service' });
  }
  if (!['start', 'stop', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const pidPath = join(BOT_DIR, `${service}.pid`);
  const scriptPath = join(BOT_DIR, `${service}.py`);

  const stopService = async () => {
    // Check in-memory process
    if (botProcesses[service]) {
      try {
        await killProcess(botProcesses[service].pid);
      } catch (e) { }
      botProcesses[service] = null;
    }
    // Check PID file
    if (fs.existsSync(pidPath)) {
      try {
        const filePid = parseInt(fs.readFileSync(pidPath, 'utf8').trim(), 10);
        if (filePid) {
          await killProcess(filePid);
        }
      } catch (e) { }
      try { fs.unlinkSync(pidPath); } catch (e) { }
    }

    // Update service control state to disabled
    if (fs.existsSync(CONTROL_JSON_PATH)) {
      try {
        const control = JSON.parse(fs.readFileSync(CONTROL_JSON_PATH, 'utf8'));
        control[`${service}Enabled`] = false;
        control.updatedAt = new Date().toISOString();
        fs.writeFileSync(CONTROL_JSON_PATH, JSON.stringify(control, null, 2), 'utf8');
      } catch (e) { }
    }
  };

  const startService = async () => {
    await stopService(); // clean up any active process first

    // Update service control state to enabled
    if (fs.existsSync(CONTROL_JSON_PATH)) {
      try {
        const control = JSON.parse(fs.readFileSync(CONTROL_JSON_PATH, 'utf8'));
        control[`${service}Enabled`] = true;
        control.updatedAt = new Date().toISOString();
        fs.writeFileSync(CONTROL_JSON_PATH, JSON.stringify(control, null, 2), 'utf8');
      } catch (e) { }
    }

    const logPath = join(BOT_DIR, `${service}.log`);
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    logStream.write(`\n--- SERVICE RUN/RESTART BY ADMIN WEB PANEL AT ${new Date().toLocaleString()} ---\n`);
    logStream.close();

    // Start in a visible Command Prompt window on Windows
    const proc = spawn('cmd.exe', ['/c', 'start', `Zalo Bot ${service}`, 'python', '-u', `${service}.py`], {
      cwd: BOT_DIR,
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();

    botProcesses[service] = proc;
  };

  try {
    if (action === 'stop') {
      await stopService();
      res.json({ success: true, message: `Stopped ${service}` });
    } else if (action === 'start') {
      await startService();
      res.json({ success: true, message: `Started ${service}` });
    } else if (action === 'restart') {
      await startService();
      res.json({ success: true, message: `Restarted ${service}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get configuration parameters
app.get('/api/bot/config', requireAdmin, (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_JSON_PATH)) {
      return res.status(404).json({ error: 'Config file missing' });
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_JSON_PATH, 'utf8'));
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update configuration parameters
app.post('/api/bot/config', requireAdmin, (req, res) => {
  try {
    const newConfig = req.body;
    fs.writeFileSync(CONFIG_JSON_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
    res.json({ success: true, message: 'Updated bot configuration' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get recent execution logs
app.get('/api/bot/logs/:service', requireAdmin, (req, res) => {
  const { service } = req.params;
  if (!['listener', 'sender'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service' });
  }
  const logPath = join(BOT_DIR, `${service}.log`);
  try {
    const logs = readLastLines(logPath, 100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- BACKGROUND CRON SYNC WORKER ---
let isSyncing = false;

async function runCronSyncStep() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    const pendingRooms = await dbAll("SELECT id, address FROM rooms WHERE latitude IS NULL OR longitude IS NULL");
    if (pendingRooms.length > 0) {
      console.log(`[CRON-SYNC] Found ${pendingRooms.length} pending rooms needing geocoding...`);
      for (const r of pendingRooms) {
        try {
          console.log(`[CRON-SYNC] Recalculating landmarks for Room ID: ${r.id} (${r.address})...`);
          await recalculateRoomGeocodeAndDistances(r.id, r.address);
        } catch (e) {
          console.error(`[CRON-SYNC] Error processing Room ID ${r.id}:`, e);
        }
      }
    }
  } catch (err) {
    console.error(`[CRON-SYNC] Error running sync step:`, err);
  } finally {
    isSyncing = false;
  }
}

// Run every 10 seconds
setInterval(runCronSyncStep, 10000);
// Also run a step 3 seconds after startup
setTimeout(runCronSyncStep, 3000);

// --- STATIC ASSETS SERVING (Production Build serving) ---
const distDir = join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  console.log(`[SERVER] Serving production frontend build from: ${distDir}`);
  app.use(express.static(distDir));
  app.get('*any', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`API Backend Server running on port ${PORT}`);
});
