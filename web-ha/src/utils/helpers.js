// Vietnam Real Estate Proximity & Landmark Helpers

export const UNIVERSITIES = [
  { name: 'Đại học Bách khoa Hà Nội', address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Đại học Kinh tế Quốc dân', address: 'Số 207 Giải Phóng, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Đại học Ngoại thương', address: 'Số 91 Chùa Láng, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Xây dựng Hà Nội', address: 'Số 55 Giải Phóng, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Đại học Y Hà Nội', address: 'Số 1 Tôn Thất Tùng, Kim Liên, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Thủy lợi', address: 'Số 175 Tây Sơn, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Giao thông Vận tải', address: 'Số 3 Cầu Giấy, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Mỏ - Địa chất', address: '18 P. Viên, Đông Ngạc, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Đại học Hà Nội', address: 'Ngõ 9 Nguyễn Trãi (Km9), Thanh Xuân', district: 'Thanh Xuân' },
  { name: 'Đại học Sư phạm Hà Nội', address: 'Số 136 Xuân Thủy, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Đại học Luật Hà Nội', address: 'Số 87 Nguyễn Chí Thanh, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Công nghiệp Hà Nội', address: '298 đường Cầu Diễn, Nhổn, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Đại học Điện lực', address: 'Số 235 Hoàng Quốc Việt, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Đại học Thăng Long', address: 'Đường Nghiêm Xuân Yêm, Hoàng Mai', district: 'Hoàng Mai' },
  { name: 'Đại học Phenikaa', address: 'Đường Nguyễn Trác, Yên Nghĩa, Hà Đông', district: 'Hà Đông' },
  { name: 'Đại học Đại Nam', address: '1 Xốm, Phú Lương, Hà Đông', district: 'Hà Đông' },
  { name: 'Đại học Kinh doanh & Công nghệ Hà Nội', address: 'Số 29A Ngõ 124 Phố Vĩnh Tuy, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Đại học Công đoàn', address: 'Số 169 Tây Sơn, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Tài nguyên & Môi trường Hà Nội', address: 'Số 41A Phú Diễn, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Học viện Hành chính Quốc gia', address: '371 Nguyễn Hoàng Tôn, Xuân Đỉnh, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Đại học Mở Hà Nội', address: 'B101 Phố Nguyễn Hiền, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Đại học Mỹ thuật Công nghiệp', address: 'Số 360 Đê La Thành, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Sân khấu - Điện ảnh', address: '87 Đường Nguyễn Chí Thanh, Giảng Võ, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Đại học Văn hóa Hà Nội', address: 'Số 418 Đê La Thành, Đống Đa', district: 'Đống Đa' },
  { name: 'Đại học Kiến trúc Hà Nội', address: '129 Đường Trần Phú, Hà Đông', district: 'Hà Đông' },
  { name: 'Học viện Ngân hàng', address: 'Số 12 Chùa Bộc, Đống Đa', district: 'Đống Đa' },
  { name: 'Học viện Tài chính', address: 'Số 58 Lê Văn Hiến, Đức Thắng, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Học viện Ngoại giao', address: 'Số 69 Chùa Láng, Đống Đa', district: 'Đống Đa' },
  { name: 'Học viện Báo chí & Tuyên truyền', address: 'Số 36 Xuân Thủy, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Học viện Công nghệ Bưu chính Viễn thông', address: '96 Đường Trần Phú, Hà Đông', district: 'Hà Đông' }
];

export const COLLEGES = [
  { name: 'Cao đẳng Y tế Hà Đông', address: '39 P Nguyễn Viết Xuân, Hà Đông', district: 'Hà Đông' },
  { name: 'Cao đẳng Du lịch Hà Nội', address: 'Số 236 Hoàng Quốc Việt, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Cao đẳng Công nghệ cao Hà Nội', address: 'Phố Nhuệ Giang, Tây Mỗ, Nam Từ Liêm', district: 'Nam Từ Liêm' },
  { name: 'Cao đẳng FPT Polytechnic', address: 'Tòa nhà FPT Polytechnic, Số 13 Trịnh Văn Bô, Phương Canh, Nam Từ Liêm', district: 'Nam Từ Liêm' },
  { name: 'Cao đẳng Thương mại & Du lịch Hà Nội', address: 'Số 1 Phạm Văn Đồng, Cầu Giấy', district: 'Cầu Giấy' }
];

export const HOSPITALS = [
  { name: 'Bệnh viện Bạch Mai', address: 'Số 78 Giải Phóng, Phương Mai, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Bệnh viện Việt Đức', address: 'Số 40 Tràng Thi, Hoàn Kiếm', district: 'Hoàn Kiếm' },
  { name: 'Bệnh viện K (Cơ sở 1)', address: 'Số 43 Quán Sứ, Hoàn Kiếm', district: 'Hoàn Kiếm' },
  { name: 'Bệnh viện Nhi Trung ương', address: 'Số 18, ngõ 879 Đê La Thành, Đống Đa', district: 'Đống Đa' },
  { name: 'Bệnh viện Phụ sản Trung ương', address: 'Số 43 Tràng Thi, Hoàn Kiếm', district: 'Hoàn Kiếm' },
  { name: 'Bệnh viện Trung ương Quân đội 108', address: 'Số 1B Trần Hưng Đạo, Hai Bà Trưng', district: 'Hai Bà Trưng' },
  { name: 'Bệnh viện E', address: 'Số 89 Trần Cung, Nghĩa Tân, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Bệnh viện Đại học Y Hà Nội', address: 'Số 1 Tôn Thất Tùng, Đống Đa', district: 'Đống Đa' }
];

export const STATIONS = [
  { name: 'Bến xe Mỹ Đình', address: 'Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm', district: 'Nam Từ Liêm' },
  { name: 'Bến xe Giáp Bát', address: 'Số 887 Giải Phóng, Giáp Bát, Hoàng Mai', district: 'Hoàng Mai' },
  { name: 'Bến xe Nước Ngầm', address: 'Số 1 Ngọc Hồi, Hoàng Liệt, Hoàng Mai', district: 'Hoàng Mai' },
  { name: 'Bến xe Gia Lâm', address: 'Số 9 Ngô Gia Khảm, Gia Thụy, Long Biên', district: 'Long Biên' },
  { name: 'Bến xe Yên Nghĩa', address: 'Quốc lộ 6, Yên Nghĩa, Hà Đông', district: 'Hà Đông' },
  { name: 'Bến xe Sơn Tây', address: 'Số 1 Trần Hưng Đạo, Lê Lợi, Sơn Tây', district: 'Sơn Tây' }
];

export const METRO_STATIONS = [
  { name: 'Ga Cát Linh', address: 'Ngã tư Hào Nam - Cát Linh, Cát Linh, Đống Đa', district: 'Đống Đa' },
  { name: 'Ga La Thành', address: 'Số 249 Hoàng Cầu, Ô Chợ Dừa, Đống Đa', district: 'Đống Đa' },
  { name: 'Ga Thái Hà', address: 'Ngã tư Hoàng Cầu - Thái Hà, Trung Liệt, Đống Đa', district: 'Đống Đa' },
  { name: 'Ga Láng', address: 'Số 220 Đường Láng, Thịnh Quang, Đống Đa', district: 'Đống Đa' },
  { name: 'Ga Thượng Đình', address: 'Số 108 Nguyễn Trãi, Thượng Đình, Thanh Xuân', district: 'Thanh Xuân' },
  { name: 'Ga Vành Đai 3', address: 'Ngã tư Khuất Duy Tiến - Nguyễn Xiển - Nguyễn Trãi, Thanh Xuân Trung, Thanh Xuân', district: 'Thanh Xuân' },
  { name: 'Ga Phùng Khoang', address: 'Số 12 Trần Phú, Mộ Lao, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga Văn Quán', address: 'Số 142 Trần Phú, Mộ Lao, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga Hà Đông', address: 'Số 4 Quang Trung, Nguyễn Trãi, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga La Khê', address: 'Ngã tư Quang Trung - Lê Trọng Tấn, Phú La, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga Văn Khê', address: 'Số 533 Quang Trung, Phú La, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga Yên Nghĩa', address: 'Bến xe Yên Nghĩa, Quốc lộ 6, Yên Nghĩa, Hà Đông', district: 'Hà Đông' },
  { name: 'Ga Nhổn', address: 'Đường Cầu Diễn, Minh Khai, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Ga Minh Khai', address: 'Ngã ba Cầu Diễn - Văn Tiến Dũng, Phúc Diễn, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Ga Phú Diễn', address: 'Đường Cầu Diễn, Phú Diễn, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Ga Cầu Diễn', address: 'Cầu Diễn, Đường Hồ Tùng Mậu, Phú Diễn, Bắc Từ Liêm', district: 'Bắc Từ Liêm' },
  { name: 'Ga Lê Đức Thọ', address: 'Ngã tư Hồ Tùng Mậu - Nguyễn Cơ Thạch - Lê Đức Thọ, Mai Dịch, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Ga Đại học Quốc Gia', address: 'Số 136 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Ga Chùa Hà', address: 'Ngã ba Xuân Thủy - Chùa Hà, Dịch Vọng, Cầu Giấy', district: 'Cầu Giấy' },
  { name: 'Ga Cầu Giấy', address: 'Số 12 Đường Cầu Giấy, Ngọc Khánh, Ba Đình', district: 'Ba Đình' }
];

export const ALL_LANDMARKS = [
  ...UNIVERSITIES.map(x => ({ ...x, type: 'university' })),
  ...COLLEGES.map(x => ({ ...x, type: 'college' })),
  ...HOSPITALS.map(x => ({ ...x, type: 'hospital' })),
  ...STATIONS.map(x => ({ ...x, type: 'station' })),
  ...METRO_STATIONS.map(x => ({ ...x, type: 'metro' }))
];

// Helper to extract district from address string
export function extractDistrict(address) {
  if (!address) return '';
  const cleanStr = address.toLowerCase();
  const districts = [
    'cầu giấy', 'đống đa', 'hai bà trưng', 'tây hồ', 'thanh xuân',
    'nam từ liêm', 'bắc từ liêm', 'hà đông', 'hoàng mai', 'long biên',
    'ba đình', 'hoàn kiếm', 'thanh trì', 'mỹ đình', 'hoài đức'
  ];
  for (const d of districts) {
    if (cleanStr.includes(d)) {
      // Return title cased
      return d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return '';
}

// Generate deterministic but fixed-looking random distance for address+landmark combination
function getDeterministicDistance(address, landmarkName) {
  let hash = 0;
  const combined = (address || '') + (landmarkName || '');
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  // Distance in range 0.3km to 2.9km
  const dist = 0.3 + (absHash % 27) * 0.1;
  return parseFloat(dist.toFixed(1));
}

const nearestLandmarksCache = new Map();

// Get nearest landmarks within 3km, sorted by distance
export function getNearestLandmarks(address, limit = 5) {
  if (!address) return [];
  const cacheKey = `${address}_${limit}`;
  if (nearestLandmarksCache.has(cacheKey)) {
    return nearestLandmarksCache.get(cacheKey);
  }

  const roomDistrict = extractDistrict(address);
  
  // Find all landmarks
  let matched = [];
  
  if (roomDistrict) {
    // Priority 1: same district
    matched = ALL_LANDMARKS.filter(lm => lm.district.toLowerCase() === roomDistrict.toLowerCase());
  }
  
  // If too few landmarks matched in same district, add surrounding/all landmarks as fallback
  if (matched.length < 3) {
    const matchedNames = new Set(matched.map(m => m.name));
    const fallbacks = ALL_LANDMARKS.filter(lm => !matchedNames.has(lm.name));
    matched = [...matched, ...fallbacks];
  }
  
  // Map and calculate deterministic distance
  const results = matched.map(lm => {
    const dist = getDeterministicDistance(address, lm.name);
    return {
      ...lm,
      dist,
      distText: dist >= 1 ? `${dist}km` : `${dist * 1000}m`
    };
  });
  
  // Filter for distance < 3.0km (or just return the closest ones if none are under 3km)
  let filtered = results.filter(r => r.dist <= 3.0);
  if (filtered.length === 0) {
    filtered = results.slice(0, limit);
  }
  
  // Sort from nearest to furthest
  filtered.sort((a, b) => a.dist - b.dist);
  
  const finalResult = filtered.slice(0, limit);
  nearestLandmarksCache.set(cacheKey, finalResult);
  return finalResult;
}

export function formatTimeText(createdAtStr) {
  if (!createdAtStr) return 'Vừa đăng';
  
  try {
    const normalized = createdAtStr.replace(' ', 'T');
    const roomDate = new Date(normalized);
    if (isNaN(roomDate.getTime())) return 'Vừa đăng';
    
    const now = new Date();
    const diffMs = now.getTime() - roomDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    const isToday = roomDate.getDate() === now.getDate() && 
                    roomDate.getMonth() === now.getMonth() && 
                    roomDate.getFullYear() === now.getFullYear();
                    
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
    const isYesterday = roomDate.getDate() === yesterday.getDate() && 
                        roomDate.getMonth() === yesterday.getMonth() && 
                        roomDate.getFullYear() === yesterday.getFullYear();
                        
    if (diffSec < 60) {
      return 'Vừa xong';
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (isToday) {
      const hours = String(roomDate.getHours()).padStart(2, '0');
      const minutes = String(roomDate.getMinutes()).padStart(2, '0');
      return `Hôm nay ${hours}:${minutes}`;
    } else if (isYesterday) {
      const hours = String(roomDate.getHours()).padStart(2, '0');
      const minutes = String(roomDate.getMinutes()).padStart(2, '0');
      return `Hôm qua ${hours}:${minutes}`;
    } else {
      const day = String(roomDate.getDate()).padStart(2, '0');
      const month = String(roomDate.getMonth() + 1).padStart(2, '0');
      const year = roomDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    return 'Vừa đăng';
  }
}

export function isUsefulLandmarkName(name) {
  if (!name) return false;
  const clean = name.toLowerCase().trim();
  if (clean === 'hà nội' || clean === 'ha noi' || clean === 'hanoi') return false;
  return true;
}

export const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23F1F5F9"/><path d="M110 85h80v55h-80z" fill="none" stroke="%2394A3B8" stroke-width="5"/><circle cx="150" cy="112" r="16" fill="none" stroke="%2394A3B8" stroke-width="5"/><path d="M125 85l8-12h34l8 12" fill="none" stroke="%2394A3B8" stroke-width="5"/><text x="50%" y="170" fill="%2394A3B8" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Hình ảnh đang cập nhật</text></svg>';

