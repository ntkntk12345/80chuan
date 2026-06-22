import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Trash2,
  Grid,
  List,
  ChevronRight,
  ChevronDown,
  School,
  Building2,
  Warehouse,
  Briefcase,
  Car,
  Check,
  Heart,
  MessageCircle,
  HelpCircle,
  Users2,
  GraduationCap,
  Plus,
  Bus,
  Train,
  Bell,
  UserCircle,
  KeyRound,
  Camera,
  Play,
  Clock
} from 'lucide-react';
import {
  UNIVERSITIES,
  COLLEGES,
  HOSPITALS,
  STATIONS,
  METRO_STATIONS,
  getNearestLandmarks
} from '../utils/helpers';




const ListingView = ({
  category,
  rooms,
  loadingRooms,
  savedRoomIds,
  toggleSaveRoom,
  setSelectedRoomId,
  setCurrentPage,
  navigateToRoom,
  isMobile,
  user,
  settings,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onFiltersChange
}) => {
  // Category translation/subtitles
  const categoryMeta = {
    'phong-tro': {
      title: 'Phòng trọ',
      subtitle: 'Tìm thấy {count} phòng trọ phù hợp',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: true
    },
    'chung-cu': {
      title: 'Chung cư',
      subtitle: 'Tìm thấy {count} chung cư tại Hà Nội',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: true
    },
    'nha-nguyen-can': {
      title: 'Nhà nguyên căn',
      subtitle: 'Tìm nhà nguyên căn phù hợp với nhu cầu của bạn',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: true
    },
    'can-ho-dich-vu': {
      title: 'Căn hộ dịch vụ',
      subtitle: 'Tìm căn hộ dịch vụ phù hợp để kinh doanh cho thuê hiệu quả và bền vững',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, ga metro, khoảng giá...',
      showUniListBtn: true
    },
    'mat-bang-kinh-doanh': {
      title: 'Mặt bằng kinh doanh',
      subtitle: 'Tìm mặt bằng phù hợp để kinh doanh hiệu quả',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: false
    },
    'pass-phong': {
      title: 'Pass phòng',
      subtitle: 'Tìm thấy {count} pass phòng phù hợp',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: true
    },
    'o-ghep': {
      title: 'Ở ghép',
      subtitle: 'Tìm người ở ghép phù hợp, tiết kiệm chi phí',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: false
    },
    'saved-rooms': {
      title: 'Phòng đã lưu',
      subtitle: 'Tìm thấy {count} tin đăng đã lưu',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: false
    },
    'viewed-rooms': {
      title: 'Tin đã xem',
      subtitle: 'Bạn đã xem {count} tin đăng gần đây',
      searchPlaceholder: 'Tìm theo địa chỉ, khu vực, gần trường học, bệnh viện, khoảng giá...',
      showUniListBtn: false
    }
  };

  const meta = categoryMeta[category] || categoryMeta['phong-tro'];

  // State-based filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [activeSavedTab, setActiveSavedTab] = useState('all');

  // Sync local search query with parent searchQuery (e.g. on reset/change)
  useEffect(() => {
    if (localSearchQuery !== searchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Debounce localSearchQuery update to searchQuery
  useEffect(() => {
    if (localSearchQuery === searchQuery) return;
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchQuery, searchQuery]);

  useEffect(() => {
    let index = 0;
    const fullText = meta.searchPlaceholder || '';
    setAnimatedPlaceholder('');
    if (!fullText) return;

    let currentText = '';
    let blinkInterval;

    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText.charAt(index);
        setAnimatedPlaceholder(currentText + '|');
        index++;
      } else {
        clearInterval(typeInterval);
        // Start blinking cursor at the end
        let showCursor = true;
        let blinkCount = 0;
        blinkInterval = setInterval(() => {
          showCursor = !showCursor;
          setAnimatedPlaceholder(fullText + (showCursor ? '|' : ' '));
          blinkCount++;
          if (blinkCount >= 8) {
            clearInterval(blinkInterval);
            setAnimatedPlaceholder(fullText);
          }
        }, 400);
      }
    }, 45);

    return () => {
      clearInterval(typeInterval);
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [meta.searchPlaceholder]);
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [roomType, setRoomType] = useState('');
  const [gender, setGender] = useState(''); // Only for o-ghep
  const maxPriceLimit = (category === 'can-ho-dich-vu' || category === 'mat-bang-kinh-doanh' || category === 'nha-nguyen-can') ? 50 : 20;
  const midPriceValue = maxPriceLimit / 2;

  const [priceMin, setPriceMin] = useState(0); // Min price limit
  const [priceMax, setPriceMax] = useState(maxPriceLimit); // Max price limit
  const [sort, setSort] = useState('newest');

  // Landmark distance filter states
  const [selectedLandmarkFilter, setSelectedLandmarkFilter] = useState('');
  const [showLandmarkModal, setShowLandmarkModal] = useState(false);

  // Helper formatting functions
  const formatPrice = (val) => {
    if (!val) return 'Liên hệ';
    const num = parseInt(val);
    if (isNaN(num)) return val;
    if (num >= 1000000) {
      return `${num / 1000000} triệu/tháng`;
    }
    return num.toLocaleString('vi-VN') + ' đ/tháng';
  };

  const formatDistanceValue = (dist) => {
    if (dist === undefined || dist === null) return '';
    const num = parseFloat(dist);
    if (num < 1.0) {
      return `${Math.round(num * 1000)}m`;
    }
    return `${num} km`;
  };

  const renderAdminContactBanner = () => {
    if (category !== 'pass-phong' && category !== 'o-ghep') return null;

    const isOghep = category === 'o-ghep';
    const bannerText = isOghep
      ? 'Bạn có nhu cầu tìm bạn Ở GHÉP? Nhắn tin cho Admin để được hỗ trợ kết nối nhanh nhất!'
      : 'Bạn có nhu cầu PASS PHÒNG? Nhắn tin cho Admin để được duyệt tin và hỗ trợ đăng bài!';

    const fbLink = settings?.admin_fb_link || 'https://facebook.com/admin';
    const zaloLink = settings?.admin_zalo_link || 'https://zalo.me/0876480130';

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
          border: '1px solid #FDA4AF',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(244, 63, 94, 0.08)',
          fontFamily: 'var(--font-main)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            backgroundColor: 'var(--primary-red)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(230, 30, 37, 0.3)'
          }}>
            💬
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#9F1239', letterSpacing: '0.3px' }}>
              HỖ TRỢ ĐĂNG TIN
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#BE123C', fontWeight: 500, lineHeight: '1.4' }}>
              {bannerText}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: isMobile ? 'center' : 'flex-end',
          flexWrap: 'wrap'
        }}>
          <a
            href={fbLink}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-contact-btn fb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook Admin</span>
          </a>

          <a
            href={zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-contact-btn zalo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0068FF',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 104, 255, 0.25)',
            }}
          >
            <ZaloIconCard size={16} />
            <span>Zalo Admin</span>
          </a>
        </div>
      </div>
    );
  };

  const getDisplayDistanceText = (room, selectedLandmark) => {
    const normalizeString = (str) => {
      if (!str) return '';
      return str.normalize('NFC').toLowerCase().trim();
    };

    let activeLandmark = selectedLandmark || selectedUniTag || selectedLandmarkFilter;

    // If no active landmark from tags/dropdown, try to detect one from searchQuery text
    if (!activeLandmark && searchQuery) {
      const queryLower = normalizeString(searchQuery);
      const landmarkKeywords = [
        { name: 'Đại học Bách khoa Hà Nội', keywords: ['bách khoa', 'bach khoa', 'hust'] },
        { name: 'Đại học Ngoại thương', keywords: ['ngoại thương', 'ngoai thuong', 'ftu'] },
        { name: 'Đại học Kinh tế Quốc dân', keywords: ['kinh tế quốc dân', 'kinh te quoc dan', 'neu'] },
        { name: 'Đại học Quốc gia Hà Nội', keywords: ['quốc gia', 'quoc gia', 'vnu'] },
        { name: 'Đại học Sư phạm Hà Nội', keywords: ['sư phạm', 'su pham', 'hnue'] },
        { name: 'Đại học Thương mại', keywords: ['thương mại', 'thuong mai', 'tmu'] },
        { name: 'Đại học Giao thông Vận tải', keywords: ['giao thông', 'giao thong', 'gtvt'] },
        { name: 'Bến xe Nước Ngầm', keywords: ['nước ngầm', 'nuoc ngam'] },
        { name: 'Bến xe Giáp Bát', keywords: ['giáp bát', 'giap bat'] },
        { name: 'Bến xe Mỹ Đình', keywords: ['mỹ đình', 'my dinh'] },
        { name: 'Học viện Báo chí & Tuyên truyền', keywords: ['báo chí', 'bao chi', 'ajc'] },
        { name: 'Đại học Phenikaa', keywords: ['phenikaa', 'phenika'] },
        { name: 'Đại học Xây dựng Hà Nội', keywords: ['xây dựng', 'xay dung', 'nuce'] },
        { name: 'Đại học Y Hà Nội', keywords: ['y hà nội', 'y ha noi', 'hmu'] },
        { name: 'Học viện Ngân hàng', keywords: ['ngân hàng', 'ngan hang', 'bav'] }
      ];
      const found = landmarkKeywords.find(item =>
        item.keywords.some(keyword => queryLower.includes(normalizeString(keyword)))
      );
      if (found) {
        activeLandmark = found.name;
      }
    }

    if (activeLandmark) {
      // 1. Try to find in room.distances from DB
      const match = room.distances?.find(d => normalizeString(d.landmark_name) === normalizeString(activeLandmark));
      if (match) {
        return `Cách ${match.landmark_name} • ${formatDistanceValue(match.distance)}`;
      }

      // 2. Fallback check for mock rooms matching by nearPlace name
      if (room.nearPlace) {
        const normNear = normalizeString(room.nearPlace).replace('đh', 'đại học');
        const normActive = normalizeString(activeLandmark).replace('đh', 'đại học');
        if (normNear.includes(normActive) || normActive.includes(normNear)) {
          return room.distanceText || '';
        }
      }
    }
    return room.distanceText || '';
  };

  // Specific filters
  const [selectedUniTag, setSelectedUniTag] = useState(null); // Filter by university tag
  const [showUniList, setShowUniList] = useState(false); // Toggle university index view (image17)
  const [activeLandmarkType, setActiveLandmarkType] = useState('university');

  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      "phòng trọ dưới 4 triệu",
      "chung cư Cầu Giấy 5 triệu",
      "đại học bách khoa hà nội",
      "phòng trọ chùa láng giá rẻ",
      "nhà nguyên căn đống đa"
    ];
  });

  useEffect(() => {
    localStorage.setItem('search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Sub-category tabs for o-ghep
  const [oghepSubCategory, setOghepSubCategory] = useState('chung-cu'); // 'phong-tro' | 'chung-cu' | 'nha-nguyen-can'

  // Pagination states
  const [listingPage, setListingPage] = useState(() => {
    const saved = sessionStorage.getItem(`listing_page_${category}`);
    return saved ? parseInt(saved, 10) : 1;
  });
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    sessionStorage.setItem(`listing_page_${category}`, listingPage);
  }, [listingPage, category]);

  const prevFiltersRef = React.useRef({
    category,
    searchQuery,
    city,
    district,
    roomType,
    gender,
    priceMin,
    priceMax,
    sort,
    selectedLandmarkFilter,
    selectedUniTag,
    oghepSubCategory
  });

  // Reset pagination to page 1 whenever any filter actually changes
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasChanged =
      prev.category !== category ||
      prev.searchQuery !== searchQuery ||
      prev.city !== city ||
      prev.district !== district ||
      prev.roomType !== roomType ||
      prev.gender !== gender ||
      prev.priceMin !== priceMin ||
      prev.priceMax !== priceMax ||
      prev.sort !== sort ||
      prev.selectedLandmarkFilter !== selectedLandmarkFilter ||
      prev.selectedUniTag !== selectedUniTag ||
      prev.oghepSubCategory !== oghepSubCategory;

    if (hasChanged) {
      setListingPage(1);
    }

    // Update ref for next render comparison
    prevFiltersRef.current = {
      category,
      searchQuery,
      city,
      district,
      roomType,
      gender,
      priceMin,
      priceMax,
      sort,
      selectedLandmarkFilter,
      selectedUniTag,
      oghepSubCategory
    };
  }, [category, searchQuery, city, district, roomType, gender, priceMin, priceMax, sort, selectedLandmarkFilter, selectedUniTag, oghepSubCategory]);

  // Restore scroll position only when loading completes and rooms are present
  useEffect(() => {
    if (!loadingRooms && rooms.length > 0) {
      const savedScroll = sessionStorage.getItem(`scroll_pos_${category}`);
      if (savedScroll) {
        const timer = setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [category, loadingRooms, rooms.length]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_pos_${category}`, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [category]);

  // Mobile Modal states
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  const landmarkLists = {
    university: UNIVERSITIES,
    college: COLLEGES,
    hospital: HOSPITALS,
    station: STATIONS,
    metro: METRO_STATIONS
  };
  const activeLandmarks = landmarkLists[activeLandmarkType] || UNIVERSITIES;

  const universities = useMemo(() => {
    return UNIVERSITIES.map(uni => ({
      ...uni,
      count: rooms.filter(room =>
        room.distances && room.distances.some(d => d.landmark_name === uni.name)
      ).length
    }));
  }, [rooms]);

  const handleSelectUni = (uniName) => {
    const uni = UNIVERSITIES.find(u => u.name === uniName);
    if (uni) {
      handleSelectLandmark(uni);
    }
  };


  // Sync category resets
  useEffect(() => {
    const prevCategory = sessionStorage.getItem('last_active_category');
    if (prevCategory === category) {
      return;
    }
    sessionStorage.setItem('last_active_category', category);
    setSearchQuery('');
    setDistrict('');
    setRoomType('');
    setGender('');
    setPriceMin(0);
    setPriceMax((category === 'can-ho-dich-vu' || category === 'mat-bang-kinh-doanh' || category === 'nha-nguyen-can') ? 50 : 20);
    setSelectedUniTag(null);
    setShowUniList(false);
    setSelectedLandmarkFilter('');
  }, [category]);

  // Trigger backend fetch when filters or searchQuery changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        category,
        q: searchQuery,
        district,
        roomType,
        gender,
        priceMin,
        priceMax,
        landmark: selectedUniTag || selectedLandmarkFilter
      });
    }
  }, [category, searchQuery, district, roomType, gender, priceMin, priceMax, selectedUniTag, selectedLandmarkFilter, onFiltersChange]);

  // Click outside listener to close search history dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.filter-search-wrapper')) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter logic
  const getFilteredRooms = () => {
    const normalizeString = (str) => {
      if (str === null || str === undefined || str === '') return '';
      return String(str).normalize('NFC').toLowerCase().trim();
    };

    const stripAccents = (str) => {
      if (str === null || str === undefined || str === '') return '';
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .trim();
    };

    return rooms.filter(room => {
      // 1. Category match
      if (category !== 'saved-rooms' && category !== 'viewed-rooms' && room.category !== category) return false;

      // 2. Sub-category check for o-ghep
      if (category === 'o-ghep') {
        if (room.subCategory !== oghepSubCategory) return false;
      }

      // 3. Search text query
      if (searchQuery) {
        const query = normalizeString(searchQuery);

        // 3a. District Constraint
        const districts = [
          'cầu giấy', 'đống đa', 'hai bà trưng', 'tây hồ', 'thanh xuân',
          'nam từ liêm', 'bắc từ liêm', 'hà đông', 'hoàng mai', 'long biên',
          'ba đình', 'hoàn kiếm', 'thanh trì', 'mỹ đình', 'hoài đức'
        ];
        const queryDistrict = districts.find(d => query.includes(normalizeString(d)));
        if (queryDistrict && !normalizeString(room.address).includes(normalizeString(queryDistrict))) {
          return false;
        }

        // 3b. Category Constraint
        if (query.includes(normalizeString('chung cư')) || query.includes(normalizeString('căn hộ'))) {
          if (room.category !== 'chung-cu' && !normalizeString(room.title).includes(normalizeString('chung cư')) && !normalizeString(room.title).includes(normalizeString('căn hộ'))) return false;
        } else if (query.includes(normalizeString('nhà nguyên căn')) || query.includes(normalizeString('nhà riêng'))) {
          if (room.category !== 'nha-nguyen-can') return false;
        } else if (query.includes(normalizeString('mặt bằng')) || query.includes(normalizeString('kinh doanh')) || query.includes(normalizeString('cửa hàng'))) {
          if (room.category !== 'mat-bang-kinh-doanh') return false;
        } else if (query.includes(normalizeString('phòng trọ')) || query.includes(normalizeString('nhà trọ'))) {
          if (room.category !== 'phong-tro') return false;
        } else if (query.includes(normalizeString('ở ghép')) || query.includes(normalizeString('ghép'))) {
          if (room.category !== 'o-ghep') return false;
        } else if (query.includes(normalizeString('chdv')) || query.includes(normalizeString('dịch vụ'))) {
          if (room.category !== 'can-ho-dich-vu') return false;
        }

        // 3c. Price Constraint
        const hasPriceIndicator = /\b(?:triệu|trieu)\b/i.test(query) || /\b\d+(?:\.\d+)?\s*(?:triệu|trieu|tr\b)/i.test(query);
        if (hasPriceIndicator) {
          const numberMatch = query.match(/\d+(\.\d+)?/);
          if (numberMatch) {
            const queryPriceRaw = parseFloat(numberMatch[0]) * 1000000;
            let matchesPrice = false;
            if (query.includes(normalizeString('dưới')) || query.includes(normalizeString('nhỏ hơn')) || query.includes('<')) {
              matchesPrice = room.priceRaw <= queryPriceRaw;
            } else if (query.includes(normalizeString('trên')) || query.includes(normalizeString('lớn hơn')) || query.includes('>')) {
              matchesPrice = room.priceRaw >= queryPriceRaw;
            } else {
              matchesPrice = Math.abs(room.priceRaw - queryPriceRaw) <= 500000;
            }
            if (!matchesPrice) return false;
          }
        }

        // 3d. General fallback check (if query contains other words not covered above)
        const inTitleRaw = normalizeString(room.title).includes(query);
        const inAddressRaw = normalizeString(room.address).includes(query);
        const inIdRaw = room.id ? normalizeString(room.id).includes(query) : false;

        if (!inTitleRaw && !inAddressRaw && !inIdRaw) {
          let cleanQuery = query;
          districts.forEach(d => { cleanQuery = cleanQuery.replace(normalizeString(d), ''); });
          const keywords = ['chung cư', 'căn hộ', 'nhà nguyên căn', 'nhà riêng', 'mặt bằng', 'kinh doanh', 'cửa hàng', 'phòng trọ', 'nhà trọ', 'ở ghép', 'ghép', 'chdv', 'dịch vụ', 'triệu', 'tr', 'dưới', 'trên'];
          keywords.forEach(k => { cleanQuery = cleanQuery.replace(normalizeString(k), ''); });

          const cleanQueryNoNumbers = cleanQuery.replace(/\d+(\.\d+)?/g, '').replace(/\s+/g, ' ').trim();
          let matched = false;

          if (cleanQueryNoNumbers.length > 1) {
            const inTitle = normalizeString(room.title).includes(cleanQueryNoNumbers);
            const inAddress = normalizeString(room.address).includes(cleanQueryNoNumbers);
            const inNearPlace = room.nearPlace ? normalizeString(room.nearPlace).includes(cleanQueryNoNumbers) : false;
            const inDistanceText = room.distanceText ? normalizeString(room.distanceText).includes(cleanQueryNoNumbers) : false;
            const inRoomType = room.roomType ? normalizeString(room.roomType).includes(cleanQueryNoNumbers) : false;

            if (inTitle || inAddress || inNearPlace || inDistanceText || inRoomType) {
              matched = true;
            }
          }

          if (!matched) {
            // Token-based fallback: check if ALL meaningful words exist ANYWHERE in the data
            const tokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);
            if (tokens.length > 0) {
              const allTokensMatch = tokens.every(token => {
                return normalizeString(room.title).includes(token) ||
                  normalizeString(room.address).includes(token) ||
                  (room.nearPlace && normalizeString(room.nearPlace).includes(token)) ||
                  (room.roomType && normalizeString(room.roomType).includes(token));
              });
              if (!allTokensMatch) return false;
            } else if (cleanQuery.trim().length > 0) {
              return false;
            }
          }
        }
      }

      // 4. City filter
      if (city && !normalizeString(room.address).includes(normalizeString(city))) return false;

      // 5. District filter (ignored if matching by landmark tag or dropdown filter)
      if (district && !selectedUniTag && !selectedLandmarkFilter && !normalizeString(room.address).includes(normalizeString(district))) return false;

      // 6. Room type filter
      if (roomType) {
        const queryType = roomType.toLowerCase().trim(); // 'studio', 'duplex', '1pn', '2pn', '3pn'
        const rType = stripAccents(room.roomType || room.room_type || '');
        const rTitle = stripAccents(room.title || '');

        let isMatch = false;
        if (queryType === 'studio') {
          isMatch = rType.includes('studio') || rType.includes('vskk') || rType.includes('khep kin') || rType.includes('kk') || rType.includes('don') ||
                    rTitle.includes('studio') || rTitle.includes('vskk') || rTitle.includes('khep kin') || rTitle.includes('kk') || rTitle.includes('don');
        } else if (queryType === 'duplex') {
          isMatch = rType.includes('duplex') || rType.includes('gac xep') || rType.includes('loft') || rType.includes('mezzanine') ||
                    rTitle.includes('duplex') || rTitle.includes('gac xep') || rTitle.includes('loft') || rTitle.includes('mezzanine');
        } else if (queryType === '1pn') {
          isMatch = rType.includes('1pn') || rType.includes('1n1k') || rType.includes('1n1b') || rType.includes('1nb') || rType.includes('1 ngu') || rType.includes('1 phong') ||
                    rTitle.includes('1pn') || rTitle.includes('1n1k') || rTitle.includes('1n1b') || rTitle.includes('1nb') || rTitle.includes('1 ngu') || rTitle.includes('1 phong');
        } else if (queryType === '2pn') {
          isMatch = rType.includes('2pn') || rType.includes('2n1k') || rType.includes('2n1b') || rType.includes('2nb') || rType.includes('2 ngu') || rType.includes('2 phong') || rType.includes('duplex') ||
                    rTitle.includes('2pn') || rTitle.includes('2n1k') || rTitle.includes('2n1b') || rTitle.includes('2nb') || rTitle.includes('2 ngu') || rTitle.includes('2 phong') || rTitle.includes('duplex');
        } else if (queryType === '3pn') {
          isMatch = rType.includes('3pn') || rType.includes('3n1k') || rType.includes('3 ngu') || rType.includes('3 phong') ||
                    rTitle.includes('3pn') || rTitle.includes('3n1k') || rTitle.includes('3 ngu') || rTitle.includes('3 phong');
        }
        if (!isMatch) return false;
      }

      // 7. Gender filter (for o-ghep)
      if (category === 'o-ghep' && gender) {
        if (gender === 'Nữ' && !room.gender?.includes('Nữ')) return false;
        if (gender === 'Nam' && !room.gender?.includes('Nam')) return false;
      }

      // 8. University tag filter
      if (selectedUniTag) {
        const matchesLandmark = room.distances && room.distances.some(d => normalizeString(d.landmark_name) === normalizeString(selectedUniTag));
        if (!normalizeString(room.address).includes(normalizeString(selectedUniTag)) &&
          !normalizeString(room.title).includes(normalizeString(selectedUniTag)) &&
          !matchesLandmark) {
          return false;
        }
      }

      // 9. Price slider (dual range min to max)
      if (priceMin > 0 || priceMax < maxPriceLimit) {
        const minPriceRaw = priceMin * 1000000;
        const maxPriceRaw = priceMax >= maxPriceLimit ? Infinity : priceMax * 1000000;
        if (room.priceRaw < minPriceRaw || room.priceRaw > maxPriceRaw) return false;
      }

      // 10. Selected Landmark Filter
      if (selectedLandmarkFilter) {
        if (!room.distances || !room.distances.some(d => normalizeString(d.landmark_name) === normalizeString(selectedLandmarkFilter))) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sort === 'newest') return b.id - a.id;
      if (sort === 'price-asc') return a.priceRaw - b.priceRaw;
      if (sort === 'price-desc') return b.priceRaw - a.priceRaw;
      return 0;
    });
  };

  const filteredRooms = useMemo(() => {
    return getFilteredRooms();
  }, [rooms, category, searchQuery, city, district, roomType, gender, priceMin, priceMax, sort, selectedLandmarkFilter, selectedUniTag, oghepSubCategory]);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE) || 1;
  const currentRooms = useMemo(() => {
    return filteredRooms.slice((listingPage - 1) * ITEMS_PER_PAGE, listingPage * ITEMS_PER_PAGE);
  }, [filteredRooms, listingPage]);

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = listingPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }

    return pages;
  };

  const handleSelectLandmark = (lm) => {
    setSelectedUniTag(lm.name);
    setCity('Hà Nội');
    setDistrict(lm.district);
    setShowUniList(false);
  };

  const getSortedHistory = () => {
    const historyList = Array.isArray(searchHistory) ? searchHistory : [];
    return Array.from(new Set(historyList.filter(item => typeof item === 'string' && item.trim() !== '')));
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && localSearchQuery.trim()) {
      const q = localSearchQuery.trim();
      setSearchQuery(q);
      setSearchHistory(prev => {
        const historyList = Array.isArray(prev) ? prev : [];
        return [q, ...historyList.filter(h => h !== q)].slice(0, 10);
      });
      setShowHistoryDropdown(false);
    }
  };


  const handleClearAll = () => {
    setSearchQuery('');
    setLocalSearchQuery('');
    setDistrict('');
    setRoomType('');
    setGender('');
    setPriceMin(0);
    setPriceMax(maxPriceLimit);
    setSelectedUniTag(null);
    setSelectedLandmarkFilter('');
  };

  const renderDistrictModal = () => {
    if (!showDistrictModal) return null;
    const districtsList = [
      { name: 'Tất cả', count: rooms.length },
      { name: 'Cầu Giấy', count: rooms.filter(r => r.address?.toLowerCase().includes('cầu giấy')).length },
      { name: 'Đống Đa', count: rooms.filter(r => r.address?.toLowerCase().includes('đống đa')).length },
      { name: 'Hai Bà Trưng', count: rooms.filter(r => r.address?.toLowerCase().includes('hai bà trưng')).length },
      { name: 'Tây Hồ', count: rooms.filter(r => r.address?.toLowerCase().includes('tây hồ')).length },
      { name: 'Thanh Xuân', count: rooms.filter(r => r.address?.toLowerCase().includes('thanh xuân')).length },
      { name: 'Nam Từ Liêm', count: rooms.filter(r => r.address?.toLowerCase().includes('nam từ liêm')).length },
      { name: 'Bắc Từ Liêm', count: rooms.filter(r => r.address?.toLowerCase().includes('bắc từ liêm')).length },
      { name: 'Hà Đông', count: rooms.filter(r => r.address?.toLowerCase().includes('hà đông')).length },
      { name: 'Hoàng Mai', count: rooms.filter(r => r.address?.toLowerCase().includes('hoàng mai')).length },
      { name: 'Long Biên', count: rooms.filter(r => r.address?.toLowerCase().includes('long biên')).length },
      { name: 'Ba Đình', count: rooms.filter(r => r.address?.toLowerCase().includes('ba đình')).length },
      { name: 'Hoàn Kiếm', count: rooms.filter(r => r.address?.toLowerCase().includes('hoàn kiếm')).length },
      { name: 'Thanh Trì', count: rooms.filter(r => r.address?.toLowerCase().includes('thanh trì')).length },
      { name: 'Mỹ Đình', count: rooms.filter(r => r.address?.toLowerCase().includes('mỹ đình')).length },
      { name: 'Hoài Đức', count: rooms.filter(r => r.address?.toLowerCase().includes('hoài đức')).length },
    ];

    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowDistrictModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Quận/Huyện</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowDistrictModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body">
            {districtsList.map((dist, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${district === (dist.name === 'Tất cả' ? '' : dist.name) ? 'active' : ''}`}
                onClick={() => {
                  setDistrict(dist.name === 'Tất cả' ? '' : dist.name);
                  setShowDistrictModal(false);
                }}
              >
                <span>{dist.name}</span>
                <span className="count-badge">{dist.count} phòng</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCityModal = () => {
    if (!showCityModal) return null;
    const citiesList = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'];
    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowCityModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Thành phố</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowCityModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body">
            {citiesList.map((c, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${city === c ? 'active' : ''}`}
                onClick={() => {
                  setCity(c);
                  setShowCityModal(false);
                }}
              >
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRoomTypeModal = () => {
    if (!showRoomTypeModal) return null;
    const roomTypesList = [
      { label: 'Tất cả', value: '' },
      { label: 'Studio', value: 'Studio' },
      { label: 'Duplex', value: 'Duplex' },
      { label: '1 Phòng ngủ', value: '1PN' },
      { label: '2 Phòng ngủ', value: '2PN' },
      { label: '3 Phòng ngủ', value: '3PN' }
    ];
    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowRoomTypeModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Dạng phòng</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowRoomTypeModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body">
            {roomTypesList.map((type, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${roomType === type.value ? 'active' : ''}`}
                onClick={() => {
                  setRoomType(type.value);
                  setShowRoomTypeModal(false);
                }}
              >
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGenderModal = () => {
    if (!showGenderModal) return null;
    const gendersList = [
      { label: 'Tất cả', value: '' },
      { label: 'Chỉ Nam', value: 'Nam' },
      { label: 'Chỉ Nữ', value: 'Nữ' }
    ];
    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowGenderModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Giới tính</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowGenderModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body">
            {gendersList.map((g, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${gender === g.value ? 'active' : ''}`}
                onClick={() => {
                  setGender(g.value);
                  setShowGenderModal(false);
                }}
              >
                <span>{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLandmarkModal = () => {
    if (!showLandmarkModal) return null;
    const landmarksList = [
      { name: 'Tất cả địa điểm', value: '' },
      { name: 'ĐH Bách Khoa Hà Nội', value: 'Đại học Bách Khoa Hà Nội' },
      { name: 'ĐH Quốc gia Hà Nội', value: 'Đại học Quốc gia Hà Nội' },
      { name: 'ĐH Ngoại thương', value: 'Đại học Ngoại thương' },
      { name: 'ĐH Thương mại', value: 'Đại học Thương mại' },
      { name: 'ĐH Kinh tế Quốc dân', value: 'Đại học Kinh tế Quốc dân' },
      { name: 'ĐH Xây dựng Hà Nội', value: 'Đại học Xây dựng Hà Nội' },
      { name: 'ĐH Điện lực', value: 'Đại học Điện lực' },
      { name: 'ĐH Phenikaa', value: 'Đại học Phenikaa' },
      { name: 'ĐH Đại Nam', value: 'Đại học Đại Nam' },
      { name: 'ĐH FPT Hà Nội', value: 'Đại học FPT Hà Nội' },
      { name: 'Keangnam Landmark 72', value: 'Keangnam Landmark 72' },
      { name: 'Lotte Center Hà Nội', value: 'Lotte Center Hà Nội' },
      { name: 'Aeon Mall Hà Đông', value: 'Aeon Mall Hà Đông' },
      { name: 'Aeon Mall Long Biên', value: 'Aeon Mall Long Biên' },
      { name: 'Vincom Mega Mall Royal City', value: 'Vincom Mega Mall Royal City' },
      { name: 'Vincom Mega Mall Times City', value: 'Vincom Mega Mall Times City' },
      { name: 'Ga Cát Linh', value: 'Ga Cát Linh' },
      { name: 'Ga La Thành', value: 'Ga La Thành' },
      { name: 'Ga Hà Đông', value: 'Ga Hà Đông' },
      { name: 'Ga Nhổn', value: 'Ga Nhổn' }
    ];

    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowLandmarkModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Địa điểm lân cận</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowLandmarkModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {landmarksList.map((lm, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${selectedLandmarkFilter === lm.value ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLandmarkFilter(lm.value);
                  setShowLandmarkModal(false);
                }}
              >
                <span>{lm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    if (showUniList) {
      // University index view matching image22.jpg
      return (
        <div className="detail-mobile">
          <div className="mobile-header">
            <button className="mobile-header-back" onClick={() => setShowUniList(false)}>
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span className="mobile-header-title">Đại học</span>
            <div className="mobile-header-right"></div>
          </div>

          {/* Filtering Selectors for University view */}
          <div className="mobile-selects-row">
            <div className="mobile-select-item" onClick={() => setShowDistrictModal(true)}>
              <span>Khu vực</span>
              <span style={{ color: 'var(--text-muted)' }}>{district || 'Chọn khu vực'} &gt;</span>
            </div>
            <div className="mobile-select-item" onClick={() => setShowCityModal(true)}>
              <span>Thành phố</span>
              <span style={{ color: 'var(--text-muted)' }}>{city || 'Chọn thành phố'} &gt;</span>
            </div>
            <div className="mobile-select-item" onClick={() => setShowRoomTypeModal(true)}>
              <span>Loại phòng</span>
              <span style={{ color: 'var(--text-muted)' }}>{roomType || 'Tất cả'} &gt;</span>
            </div>
          </div>

          {/* Price Range Slider */}
          <div style={{ padding: '8px 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-dark)' }}>Khoảng giá (đ/tháng)</span>
              <span style={{ color: 'var(--primary-red)' }}>{priceMax >= maxPriceLimit ? 'Tất cả' : `Dưới ${priceMax} triệu`}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0 đ</span>
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary-red)' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{maxPriceLimit} triệu+</span>
            </div>
          </div>

          {/* Uni List Section */}
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              <span>Danh sách các trường đại học</span>
              <span style={{ color: 'var(--text-muted)' }}>28 kết quả</span>
            </div>

            {/* Search Input for Uni */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm trường đại học..."
                style={{ width: '100%', padding: '10px 12px 10px 38px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
            </div>

            <div className="uni-list">
              {universities.map((uni, idx) => (
                <div key={idx} className="uni-item" onClick={() => handleSelectUni(uni.name)} style={{ padding: '12px', marginBottom: '8px' }}>
                  <div className="uni-info" style={{ gap: '10px' }}>
                    <div className="uni-logo-wrapper" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                      {uni.name.substring(8, 10).toUpperCase()}
                    </div>
                    <div className="uni-details">
                      <span className="uni-name" style={{ fontSize: '13px' }}>{uni.name}</span>
                      <span className="uni-address" style={{ fontSize: '11px' }}>{uni.address}</span>
                    </div>
                  </div>
                  <div className="uni-count-arrow">
                    <span className="uni-count" style={{ fontSize: '11px' }}>{uni.count} phòng</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {renderDistrictModal()}
          {renderCityModal()}
          {renderRoomTypeModal()}
          {renderGenderModal()}
        </div>
      );
    }

    // Regular mobile Listing Page
    if (category === 'saved-rooms') {
      const savedFilteredRooms = rooms.filter(room => {
        if (activeSavedTab !== 'all' && room.category !== activeSavedTab) return false;
        return true;
      });

      return (
        <div className="home-mobile-layout" style={{ paddingBottom: '90px' }}>
          {/* Header */}
          <div className="mobile-header">
            <button className="mobile-header-back" onClick={() => setCurrentPage('home')}>
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span className="mobile-header-title">Phòng đã lưu</span>
            <button className="mobile-header-back" onClick={() => alert('Tính năng tìm kiếm phòng đã lưu đang phát triển!')}>
              <Search size={20} />
            </button>
          </div>

          {/* Category Tabs Row */}
          <div className="mobile-saved-tabs-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 12px', WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'phong-tro', label: 'Phòng trọ' },
              { id: 'chung-cu', label: 'Chung cư' },
              { id: 'nha-nguyen-can', label: 'Nhà nguyên căn' },
              { id: 'can-ho-dich-vu', label: 'Hộ kinh doanh' },
              { id: 'mat-bang-kinh-doanh', label: 'Mặt bằng kinh doanh' }
            ].map(tab => (

              <button
                key={tab.id}
                onClick={() => setActiveSavedTab(tab.id)}
                className={`mobile-saved-tab-pill ${activeSavedTab === tab.id ? 'active' : ''}`}
                style={{
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  backgroundColor: activeSavedTab === tab.id ? '#581C87' : '#F1F5F9',
                  color: activeSavedTab === tab.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horizontal Saved Cards List */}
          <div className="mobile-saved-cards-list" style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedFilteredRooms.map(room => {
              const isSaved = savedRoomIds.includes(room.id);
              const catLabels = {
                'phong-tro': 'Phòng trọ',
                'chung-cu': 'Chung cư',
                'nha-nguyen-can': 'Nhà nguyên căn',
                'can-ho-dich-vu': 'Hộ kinh doanh',
                'mat-bang-kinh-doanh': 'Mặt bằng KD',
                'pass-phong': 'Pass phòng',
                'o-ghep': 'Ở ghép'
              };
              const catBadgeClasses = {
                'phong-tro': 'badge-phong-tro',
                'chung-cu': 'badge-chung-cu',
                'nha-nguyen-can': 'badge-nha-nguyen-can',
                'can-ho-dich-vu': 'badge-can-ho-dich-vu',
                'mat-bang-kinh-doanh': 'badge-mat-bang-kd',
                'pass-phong': 'badge-pass-phong',
                'o-ghep': 'badge-o-ghep'
              };


              return (
                <div
                  key={room.id}
                  className="mobile-saved-horizontal-card"
                  onClick={() => {
                    if (navigateToRoom) {
                      navigateToRoom(room.id, room.category);
                    } else {
                      setSelectedRoomId(room.id);
                      setCurrentPage(room.category === 'chung-cu' ? 'chung-cu-detail' : room.category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail' : 'phong-tro-detail');
                    }
                  }}
                >
                  <div className="saved-card-img-col">
                    <img src={room.image} alt={room.title} className="saved-card-img" />
                    <span className={`saved-card-cat-badge ${catBadgeClasses[room.category] || 'badge-default'}`}>
                      {catLabels[room.category] || 'Khác'}
                    </span>
                    <div className="saved-card-media-indicators">
                      <span className="media-indicator"><Camera size={10} style={{ marginRight: '2px' }} /> {room.imageCount !== undefined ? room.imageCount : 8}</span>
                      <span className="media-indicator"><Play size={10} style={{ marginRight: '2px' }} /> {room.videoCount !== undefined ? room.videoCount : 3}</span>
                    </div>
                  </div>

                  <div className="saved-card-info-col">
                    <div className="saved-card-title-row">
                      <h3 className="saved-card-title">{room.title}</h3>
                      <button
                        type="button"
                        className="saved-card-fav-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveRoom(room.id);
                        }}
                      >
                        <Heart size={16} fill="var(--primary-red)" color="var(--primary-red)" />
                      </button>
                    </div>

                    <div className="saved-card-address-row">
                      <MapPin size={12} className="icon-grey" />
                      <span>{room.address.split(',').slice(-2).join(',').trim()}</span>
                    </div>

                    <div className="saved-card-price">{room.priceText}</div>

                    <div className="saved-card-specs-row">
                      <span className="spec-item">📐 {room.areaText}</span>
                      <span className="spec-item">🏢 Tầng {room.id % 5 + 1}</span>
                    </div>

                    <div className="saved-card-date-row">
                      <Clock size={10} className="icon-grey" style={{ marginRight: '3px' }} />
                      <span>Lưu ngày {(() => {
                        const now = new Date();
                        const dd = String(now.getDate()).padStart(2, '0');
                        const mm = String(now.getMonth() + 1).padStart(2, '0');
                        const yyyy = now.getFullYear();
                        return `${dd}/${mm}/${yyyy}`;
                      })()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {savedFilteredRooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Chưa lưu phòng nào thuộc danh mục này
              </div>
            )}
          </div>

          {/* Bottom Purple Status Banner */}
          <div
            className="mobile-saved-bottom-banner"
            onClick={() => setCurrentPage('home')}
          >
            <div className="banner-left">
              <span className="banner-bell-icon">🔔</span>
              <div className="banner-text-content">
                <span className="banner-title-text">Bạn có {savedFilteredRooms.length} tin phòng đã lưu</span>
                <span className="banner-sub-text">Tiếp tục tìm phòng phù hợp với nhu cầu của bạn.</span>
              </div>
            </div>
            <div className="banner-right">&gt;</div>
          </div>
        </div>
      );
    }

    return (
      <div className="home-mobile-layout">
        {/* Brand Row Header or Simple page header */}
        <div className="mobile-brand-row">
          <div>
            <h1 className="mobile-brand-title">80Land</h1>
            <p className="mobile-brand-sub">Tìm phòng nhanh</p>
          </div>
          <div className="mobile-brand-actions">
            <button className="mobile-brand-btn" onClick={() => setCurrentPage('saved-rooms')}>
              <Heart size={20} />
              {savedRoomIds.length > 0 && <span className="header-btn-badge">{savedRoomIds.length}</span>}
            </button>
            <button className="mobile-brand-btn" onClick={onOpenNotifications}>
              <Bell size={20} />
              {unreadNotificationsCount > 0 && <span className="header-btn-badge">{unreadNotificationsCount}</span>}
            </button>
            <button className="mobile-brand-btn" onClick={() => setCurrentPage('profile')}>
              {user ? (
                <img src={user.avatar} alt={user.name} className="mobile-brand-avatar" />
              ) : (
                <UserCircle size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Tabs for category groups */}
        {category === 'can-ho-dich-vu' || category === 'mat-bang-kinh-doanh' ? (
          <div className="mobile-main-tabs">
            <button
              className={`mobile-main-tab ${category === 'can-ho-dich-vu' ? 'active' : ''}`}
              onClick={() => setCurrentPage('can-ho-dich-vu')}
            >
              <img src="/icon-can-ho-dich-vu.png" alt="CĂN HỘ DỊCH VỤ" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>CĂN HỘ DỊCH VỤ</span>
            </button>
            <button
              className={`mobile-main-tab ${category === 'mat-bang-kinh-doanh' ? 'active' : ''}`}
              onClick={() => setCurrentPage('mat-bang-kinh-doanh')}
            >
              <img src="/icon-mat-bang-kd.png" alt="MẶT BẰNG KD" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>MẶT BẰNG KD</span>
            </button>
          </div>
        ) : category === 'pass-phong' || category === 'o-ghep' ? (
          <div className="mobile-main-tabs">
            <button
              className={`mobile-main-tab ${category === 'pass-phong' ? 'active' : ''}`}
              onClick={() => setCurrentPage('pass-phong')}
            >
              <img src="/icon-pass-phong.png" alt="PASS PHÒNG" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>PASS PHÒNG</span>
            </button>
            <button
              className={`mobile-main-tab ${category === 'o-ghep' ? 'active' : ''}`}
              onClick={() => setCurrentPage('o-ghep')}
            >
              <img src="/icon-o-ghep.png" alt="Ở GHÉP" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              <span>Ở GHÉP</span>
            </button>
          </div>
        ) : null}


        {/* Ở ghép sub-tabs selection */}
        {category === 'o-ghep' && (
          <div style={{ display: 'flex', gap: '8px', padding: '4px 12px' }}>
            <button
              onClick={() => setOghepSubCategory('phong-tro')}
              style={{
                flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border-color)',
                backgroundColor: oghepSubCategory === 'phong-tro' ? 'var(--primary-red-light)' : '#FFFFFF',
                color: oghepSubCategory === 'phong-tro' ? 'var(--primary-red)' : 'var(--text-dark)'
              }}
            >
              Phòng trọ
            </button>
            <button
              onClick={() => setOghepSubCategory('chung-cu')}
              style={{
                flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border-color)',
                backgroundColor: oghepSubCategory === 'chung-cu' ? 'var(--primary-red-light)' : '#FFFFFF',
                color: oghepSubCategory === 'chung-cu' ? 'var(--primary-red)' : 'var(--text-dark)'
              }}
            >
              Chung cư
            </button>
            <button
              onClick={() => setOghepSubCategory('nha-nguyen-can')}
              style={{
                flex: 1, padding: '8px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--border-color)',
                backgroundColor: oghepSubCategory === 'nha-nguyen-can' ? 'var(--primary-red-light)' : '#FFFFFF',
                color: oghepSubCategory === 'nha-nguyen-can' ? 'var(--primary-red)' : 'var(--text-dark)'
              }}
            >
              Nhà nguyên căn
            </button>
          </div>
        )}

        {renderAdminContactBanner() && (
          <div style={{ padding: '0 12px' }}>
            {renderAdminContactBanner()}
          </div>
        )}

        {/* Search Wrapper */}
        <div className="mobile-search-wrapper">
          <div className="mobile-search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder={animatedPlaceholder || "Tìm kiếm địa chỉ, khu vực..."}
              className="mobile-search-input"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Filters badges */}
        {meta.showUniListBtn && (
          <div className="mobile-filter-badges-row">
            <div className={`mobile-filter-badge ${showUniList ? 'active' : ''}`} onClick={() => setShowUniList(true)}>
              <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--zalo-blue)' }}>
                <GraduationCap size={16} />
              </div>
              <span>Gần đại học</span>
            </div>
            <div className="mobile-filter-badge" onClick={() => setShowUniList(true)}>
              <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#F5F3FF', color: 'var(--purple-badge)' }}>
                <GraduationCap size={16} />
              </div>
              <span>Gần cao đẳng</span>
            </div>
            <div className="mobile-filter-badge" onClick={() => alert('Lọc theo bệnh viện')}>
              <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#FFF0F1', color: 'var(--primary-red)' }}>
                <Plus size={16} strokeWidth={3} />
              </div>
              <span>Gần bệnh viện</span>
            </div>
            <div className="mobile-filter-badge" onClick={() => alert('Lọc theo bến xe')}>
              <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#FFFBEB', color: 'var(--warning-orange)' }}>
                <Bus size={16} />
              </div>
              <span>Gần bến xe</span>
            </div>
            <div className="mobile-filter-badge" onClick={() => alert('Lọc theo ga metro')}>
              <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--success-green)' }}>
                <Train size={16} />
              </div>
              <span>Gần ga metro</span>
            </div>
          </div>
        )}

        {/* Unified Filter Card matching image6.png exactly */}
        <div className="mobile-unified-filter-card">
          {/* Row 1: Khu vực */}
          <div className="mobile-filter-row" onClick={() => setShowDistrictModal(true)}>
            <div className="mobile-filter-row-left">
              <MapPin size={16} />
              <span>Khu vực</span>
            </div>
            <div className="mobile-filter-row-right">
              <span style={{ color: district ? 'var(--primary-red)' : '#64748B' }}>
                {district || 'Chọn khu vực'}
              </span>
              <span className="arrow-icon">&gt;</span>
            </div>
          </div>

          {/* Row 2: Thành phố */}
          <div className="mobile-filter-row" onClick={() => setShowCityModal(true)}>
            <div className="mobile-filter-row-left">
              <MapPin size={16} />
              <span>Thành phố</span>
            </div>
            <div className="mobile-filter-row-right">
              <span style={{ color: 'var(--text-dark)' }}>{city || 'Chọn thành phố'}</span>
              <span className="arrow-icon">&gt;</span>
            </div>
          </div>

          {/* Row 3: Dạng phòng / Giới tính */}
          {category === 'o-ghep' ? (
            <div className="mobile-filter-row" onClick={() => setShowGenderModal(true)}>
              <div className="mobile-filter-row-left">
                <Users2 size={16} />
                <span>Giới tính</span>
              </div>
              <div className="mobile-filter-row-right">
                <span style={{ color: gender ? 'var(--primary-red)' : '#64748B' }}>
                  {gender || 'Tất cả'}
                </span>
                <span className="arrow-icon">&gt;</span>
              </div>
            </div>
          ) : (
            <div className="mobile-filter-row" onClick={() => setShowRoomTypeModal(true)}>
              <div className="mobile-filter-row-left">
                <Building2 size={16} />
                <span>Loại phòng</span>
              </div>
              <div className="mobile-filter-row-right">
                <span style={{ color: roomType ? 'var(--primary-red)' : '#64748B' }}>
                  {roomType || 'Tất cả'}
                </span>
                <span className="arrow-icon">&gt;</span>
              </div>
            </div>
          )}

          {/* Row 3.5: Gần địa điểm */}
          <div className="mobile-filter-row" onClick={() => setShowLandmarkModal(true)}>
            <div className="mobile-filter-row-left">
              <School size={16} />
              <span>Gần địa điểm</span>
            </div>
            <div className="mobile-filter-row-right">
              <span style={{ color: selectedLandmarkFilter ? 'var(--primary-red)' : '#64748B' }}>
                {selectedLandmarkFilter ? selectedLandmarkFilter.replace('Đại học', 'ĐH') : 'Tất cả địa điểm'}
              </span>
              <span className="arrow-icon">&gt;</span>
            </div>
          </div>

          {/* Row 4: Khoảng giá slider */}
          <div className="mobile-price-slider-section">
            <span className="mobile-price-slider-title">Khoảng giá (đ/tháng)</span>
            <div className="mobile-price-slider-controls">
              <div className="mobile-price-box">
                {priceMin === 0 ? '0 đ' : `${priceMin} triệu`}
              </div>

              <div className="mobile-double-slider-wrapper">
                <div className="mobile-slider-track" />
                <div
                  className="mobile-slider-track-highlight"
                  style={{
                    left: `${(priceMin / maxPriceLimit) * 100}%`,
                    right: `${100 - (priceMax / maxPriceLimit) * 100}%`
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="1"
                  value={priceMin}
                  onChange={(e) => {
                    const val = Math.min(parseInt(e.target.value), priceMax - 1);
                    setPriceMin(val);
                  }}
                  className="mobile-double-slider-input"
                  style={{ zIndex: priceMin > (maxPriceLimit / 2) ? 5 : 3 }}
                />
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="1"
                  value={priceMax}
                  onChange={(e) => {
                    const val = Math.max(parseInt(e.target.value), priceMin + 1);
                    setPriceMax(val);
                  }}
                  className="mobile-double-slider-input"
                />
              </div>

              <div className="mobile-price-box">
                {priceMax >= maxPriceLimit ? `${maxPriceLimit} triệu+` : `${priceMax} triệu`}
              </div>
            </div>
          </div>
        </div>

        {/* Sorting and result count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800 }}>{filteredRooms.length} kết quả</span>
          <select
            style={{ fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', outline: 'none' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </div>

        {/* Filter tags row */}
        {selectedUniTag && (
          <div style={{ padding: '0 12px 8px' }}>
            <span className="filter-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
              {selectedUniTag}
              <span onClick={() => setSelectedUniTag(null)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>×</span>
            </span>
          </div>
        )}

        {/* Room listing vertical grid */}
        <div className="mobile-room-grid">
          {loadingRooms ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              <span className="loading-spinner">⏳</span> Đang tải thông tin phòng...
            </div>
          ) : (
            <>
              {currentRooms.map((room) => {
                const isSaved = savedRoomIds.includes(room.id);
                return (
                  <div
                    key={room.id}
                    className="mobile-card-vertical"
                    onClick={() => {
                      if (navigateToRoom) {
                        navigateToRoom(room.id, room.category);
                      } else {
                        setSelectedRoomId(room.id);
                        setCurrentPage(room.category === 'chung-cu' ? 'chung-cu-detail' : room.category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail' : 'phong-tro-detail');
                      }
                    }}
                  >
                    <div className="mobile-card-img-wrapper">
                      <img src={room.image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300"} alt={room.title} className="mobile-card-img" />
                      <span className={`mobile-card-badge ${room.badgeColor || 'red'}`}>
                        {room.badgeText || 'Hot'}
                      </span>
                      <button
                        className="mobile-card-favorite"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveRoom(room.id);
                        }}
                      >
                        <Heart size={14} fill={isSaved ? "var(--primary-red)" : "none"} color={isSaved ? "var(--primary-red)" : "#64748B"} />
                      </button>
                    </div>

                    <div className="mobile-card-content" style={{ userSelect: 'text' }}>
                      <h3 className="mobile-card-title" style={{ fontSize: '13px', fontWeight: 700, margin: '4px 0' }}>
                        <strong style={{ fontWeight: 800 }}>
                          {room.category === 'chung-cu' ? 'Tên chung cư' : 'Dạng phòng'}:
                        </strong>{' '}
                        {room.category === 'chung-cu' ? (room.buildingName || room.title) : (room.roomType || 'Studio')}
                      </h3>
                      <div className="mobile-card-address" style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} style={{ color: 'var(--primary-red)', flexShrink: 0 }} />
                        <span>Địa chỉ: {room.address}</span>
                      </div>
                      <div className="mobile-card-price" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-red)', margin: '4px 0' }}>
                        Giá: {formatPrice(room.price1 || room.priceRaw || room.priceText)}
                      </div>
                      {getDisplayDistanceText(room, selectedLandmarkFilter) && (
                        <div className="mobile-card-specs" style={{ fontSize: '11px', color: '#64748B' }}>
                          {getDisplayDistanceText(room, selectedLandmarkFilter)}
                        </div>
                      )}
                      {category === 'o-ghep' && room.gender && (
                        <div style={{ fontSize: '10px', color: 'var(--zalo-blue)', fontWeight: 700, marginTop: '2px' }}>
                          Đối tác: {room.gender}
                        </div>
                      )}
                    </div>


                    <div className="mobile-card-footer">
                      <span>{room.timeText || 'Vừa đăng'}</span>
                      <button
                        className="mobile-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://zalo.me/${room.zaloNumber || '0876480130'}`, '_blank');
                        }}
                      >
                        {category === 'o-ghep' ? 'Nhắn Zalo' : 'Liên hệ'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredRooms.length === 0 && (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Không tìm thấy phòng phù hợp
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Pagination Controls for Mobile */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <span
              className="pagination-btn"
              onClick={() => {
                if (listingPage > 1) {
                  setListingPage(listingPage - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{
                opacity: listingPage === 1 ? 0.5 : 1,
                cursor: listingPage === 1 ? 'not-allowed' : 'pointer',
                pointerEvents: listingPage === 1 ? 'none' : 'auto'
              }}
            >
              &lt;
            </span>
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return <span key={`dots-mobile-${idx}`} className="pagination-dots">...</span>;
              }
              return (
                <span
                  key={`page-mobile-${page}`}
                  className={`pagination-btn ${listingPage === page ? 'active' : ''}`}
                  onClick={() => {
                    setListingPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {page}
                </span>
              );
            })}
            <span
              className="pagination-btn"
              onClick={() => {
                if (listingPage < totalPages) {
                  setListingPage(listingPage + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{
                opacity: listingPage === totalPages ? 0.5 : 1,
                cursor: listingPage === totalPages ? 'not-allowed' : 'pointer',
                pointerEvents: listingPage === totalPages ? 'none' : 'auto'
              }}
            >
              &gt;
            </span>
          </div>
        )}

        {renderDistrictModal()}
        {renderCityModal()}
        {renderRoomTypeModal()}
        {renderGenderModal()}
        {renderLandmarkModal()}
      </div>
    );
  }

  return (
    <div>
      {/* Category Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{meta.title}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {meta.subtitle.replace('{count}', filteredRooms.length)}
          </p>
        </div>
        <div className="results-sorting">
          <select
            className="filter-select"
            style={{ minWidth: '160px', padding: '6px 28px 6px 12px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      {/* Filter panel */}
      <div className="filter-bar">
        {/* Ở ghép category sub-tabs selector (image8, image20, image26) */}
        {category === 'o-ghep' && (
          <div className="wallet-tabs" style={{ margin: '-10px 0 10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div
              className={`wallet-tab ${oghepSubCategory === 'phong-tro' ? 'active' : ''}`}
              onClick={() => setOghepSubCategory('phong-tro')}
            >
              Phòng trọ
            </div>
            <div
              className={`wallet-tab ${oghepSubCategory === 'chung-cu' ? 'active' : ''}`}
              onClick={() => setOghepSubCategory('chung-cu')}
            >
              Chung cư
            </div>
            <div
              className={`wallet-tab ${oghepSubCategory === 'nha-nguyen-can' ? 'active' : ''}`}
              onClick={() => setOghepSubCategory('nha-nguyen-can')}
            >
              Nhà nguyên căn
            </div>
          </div>
        )}

        {renderAdminContactBanner()}

        {/* Row 1: Full-Width Search Input with dropdown chevron and history */}
        <div className="filter-row-1">
          <div className="filter-search-wrapper" style={{ position: 'relative' }}>
            <Search size={20} className="filter-search-icon" />
            <input
              type="text"
              className="filter-search-input-v2"
              placeholder={animatedPlaceholder}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              onFocus={() => setShowHistoryDropdown(true)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHistoryDropdown(!showHistoryDropdown);
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronDown size={18} />
            </button>

            {showHistoryDropdown && (
              <div
                className="search-history-dropdown"
                style={{
                  position: 'absolute',
                  top: '105%',
                  left: 0,
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 1000,
                  maxHeight: '240px',
                  overflowY: 'auto',
                  padding: '8px 0'
                }}
              >
                <div style={{ padding: '4px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                  Lịch sử tìm kiếm
                </div>
                {getSortedHistory().length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>Chưa có lịch sử tìm kiếm</div>
                ) : (
                  getSortedHistory().map((item, idx) => (
                    <div
                      key={idx}
                      className="history-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#334155',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => {
                        setSearchQuery(item);
                        setShowHistoryDropdown(false);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={12} style={{ color: '#94A3B8' }} />
                        <span>{item}</span>
                      </div>
                      <span
                        style={{
                          color: '#94A3B8',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '0 4px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchHistory(prev => prev.filter(h => h !== item));
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>


        {/* Row 2: Quick Filter Buttons (Horizontal Row of 5 Cards) */}
        {/* Row 2: Quick Filter Buttons (Horizontal Row of 5 Cards) */}
        {meta.showUniListBtn && (
          <div className="filter-row-2">
            <button
              className={`quick-card-btn ${showUniList && activeLandmarkType === 'university' ? 'active' : ''}`}
              onClick={() => {
                if (showUniList && activeLandmarkType === 'university') {
                  setShowUniList(false);
                } else {
                  setActiveLandmarkType('university');
                  setShowUniList(true);
                }
              }}
            >
              <GraduationCap size={22} className="icon-navy" />
              <span>Đại học</span>
            </button>
            <button
              className={`quick-card-btn ${showUniList && activeLandmarkType === 'college' ? 'active' : ''}`}
              onClick={() => {
                if (showUniList && activeLandmarkType === 'college') {
                  setShowUniList(false);
                } else {
                  setActiveLandmarkType('college');
                  setShowUniList(true);
                }
              }}
            >
              <GraduationCap size={22} className="icon-navy" />
              <span>Cao đẳng</span>
            </button>
            <button
              className={`quick-card-btn ${showUniList && activeLandmarkType === 'hospital' ? 'active' : ''}`}
              onClick={() => {
                if (showUniList && activeLandmarkType === 'hospital') {
                  setShowUniList(false);
                } else {
                  setActiveLandmarkType('hospital');
                  setShowUniList(true);
                }
              }}
            >
              <Plus size={22} className="icon-blue" strokeWidth={3} />
              <span>Bệnh viện</span>
            </button>
            <button
              className={`quick-card-btn ${showUniList && activeLandmarkType === 'station' ? 'active' : ''}`}
              onClick={() => {
                if (showUniList && activeLandmarkType === 'station') {
                  setShowUniList(false);
                } else {
                  setActiveLandmarkType('station');
                  setShowUniList(true);
                }
              }}
            >
              <Bus size={22} className="icon-red" />
              <span>Bến xe</span>
            </button>
            <button
              className={`quick-card-btn ${showUniList && activeLandmarkType === 'metro' ? 'active' : ''}`}
              onClick={() => {
                if (showUniList && activeLandmarkType === 'metro') {
                  setShowUniList(false);
                } else {
                  setActiveLandmarkType('metro');
                  setShowUniList(true);
                }
              }}
            >
              <Train size={22} className="icon-green" />
              <span>Ga metro</span>
            </button>
          </div>
        )}


        {/* Row 3: Dropdowns and Range Slider */}
        <div className="filter-row-3">
          <div className="filter-col">
            <span className="filter-col-label">Thành phố</span>
            <select
              className="filter-select-v2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!!selectedUniTag}
              style={{ backgroundColor: selectedUniTag ? '#F1F5F9' : '#FFFFFF', cursor: selectedUniTag ? 'not-allowed' : 'pointer' }}
            >
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>

          <div className="filter-col">
            <span className="filter-col-label">Khu vực (Quận/Huyện)</span>
            <select
              className="filter-select-v2"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!!selectedUniTag}
              style={{ backgroundColor: selectedUniTag ? '#F1F5F9' : '#FFFFFF', cursor: selectedUniTag ? 'not-allowed' : 'pointer' }}
            >
              <option value="">Chọn khu vực</option>
              <option value="Cầu Giấy">Cầu Giấy</option>
              <option value="Đống Đa">Đống Đa</option>
              <option value="Hai Bà Trưng">Hai Bà Trưng</option>
              <option value="Tây Hồ">Tây Hồ</option>
              <option value="Thanh Xuân">Thanh Xuân</option>
              <option value="Nam Từ Liêm">Nam Từ Liêm</option>
              <option value="Bắc Từ Liêm">Bắc Từ Liêm</option>
              <option value="Hà Đông">Hà Đông</option>
              <option value="Hoàng Mai">Hoàng Mai</option>
              <option value="Long Biên">Long Biên</option>
              <option value="Ba Đình">Ba Đình</option>
              <option value="Hoàn Kiếm">Hoàn Kiếm</option>
              <option value="Thanh Trì">Thanh Trì</option>
              <option value="Mỹ Đình">Mỹ Đình</option>
              <option value="Hoài Đức">Hoài Đức</option>
            </select>
          </div>

          <div className="filter-col">
            <span className="filter-col-label">Gần địa điểm</span>
            <select
              className="filter-select-v2"
              value={selectedLandmarkFilter}
              onChange={(e) => setSelectedLandmarkFilter(e.target.value)}
            >
              <option value="">Tất cả địa điểm</option>
              <option value="Đại học Bách Khoa Hà Nội">ĐH Bách Khoa Hà Nội</option>
              <option value="Đại học Quốc gia Hà Nội">ĐH Quốc gia Hà Nội</option>
              <option value="Đại học Ngoại thương">ĐH Ngoại thương</option>
              <option value="Đại học Thương mại">ĐH Thương mại</option>
              <option value="Đại học Kinh tế Quốc dân">ĐH Kinh tế Quốc dân</option>
              <option value="Đại học Xây dựng Hà Nội">ĐH Xây dựng Hà Nội</option>
              <option value="Đại học Điện lực">ĐH Điện lực</option>
              <option value="Đại học Phenikaa">ĐH Phenikaa</option>
              <option value="Đại học Đại Nam">ĐH Đại Nam</option>
              <option value="Đại học FPT Hà Nội">ĐH FPT Hà Nội</option>
              <option value="Keangnam Landmark 72">Keangnam Landmark 72</option>
              <option value="Lotte Center Hà Nội">Lotte Center Hà Nội</option>
              <option value="Aeon Mall Hà Đông">Aeon Mall Hà Đông</option>
              <option value="Aeon Mall Long Biên">Aeon Mall Long Biên</option>
              <option value="Vincom Mega Mall Royal City">Vincom Mega Mall Royal City</option>
              <option value="Vincom Mega Mall Times City">Vincom Mega Mall Times City</option>
              <option value="Ga Cát Linh">Ga Cát Linh</option>
              <option value="Ga La Thành">Ga La Thành</option>
              <option value="Ga Hà Đông">Ga Hà Đông</option>
              <option value="Ga Nhổn">Ga Nhổn</option>
            </select>
          </div>


          {/* Conditional column for room type/gender filter, hidden for can-ho-dich-vu, saved-rooms, and viewed-rooms */}
          {category !== 'can-ho-dich-vu' && category !== 'saved-rooms' && category !== 'viewed-rooms' && (
            <div className="filter-col">
              <span className="filter-col-label">
                {category === 'o-ghep' ? 'Giới tính' : 'Dạng phòng'}
              </span>
              {category === 'o-ghep' ? (
                <select className="filter-select-v2" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              ) : (
                <select className="filter-select-v2" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  <option value="">Chọn dạng phòng</option>
                  <option value="Studio">Studio</option>
                  <option value="Duplex">Duplex</option>
                  <option value="1PN">1 Phòng ngủ</option>
                  <option value="2PN">2 Phòng ngủ</option>
                  <option value="3PN">3 Phòng ngủ</option>
                </select>
              )}
            </div>
          )}

          <div className="filter-col col-slider">
            <span className="filter-col-label">Khoảng giá thuê (triệu/tháng)</span>
            <div className="slider-wrapper-v2">
              {/* Tooltips showing dynamic values */}
              <div
                className="slider-tooltip"
                style={{ left: `${(priceMin / maxPriceLimit) * 100}%` }}
              >
                {priceMin}tr
              </div>
              <div
                className="slider-tooltip"
                style={{ left: `${(priceMax / maxPriceLimit) * 100}%` }}
              >
                {priceMax >= maxPriceLimit ? `${maxPriceLimit}tr+` : `${priceMax}tr`}
              </div>

              {/* Dual Range Custom Track */}
              <div
                className="slider-custom-track"
                style={{
                  background: `linear-gradient(to right, #E2E8F0 ${(priceMin / maxPriceLimit) * 100}%, var(--primary-red) ${(priceMin / maxPriceLimit) * 100}%, var(--primary-red) ${(priceMax / maxPriceLimit) * 100}%, #E2E8F0 ${(priceMax / maxPriceLimit) * 100}%)`
                }}
              />

              {/* Min Price Slider Input */}
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="1"
                value={priceMin}
                onChange={(e) => {
                  const val = Math.min(parseInt(e.target.value), priceMax - 1);
                  setPriceMin(val);
                }}
                className="slider-input-v2 slider-input-min"
              />

              {/* Max Price Slider Input */}
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="1"
                value={priceMax}
                onChange={(e) => {
                  const val = Math.max(parseInt(e.target.value), priceMin + 1);
                  setPriceMax(val);
                }}
                className="slider-input-v2 slider-input-max"
              />

              {/* State-aware Indicator Dots */}
              <div className="slider-track-markers">
                <span className={`marker-dot marker-dot-start ${priceMin <= 0 && priceMax >= 0 ? 'active' : ''}`}></span>
                <span className={`marker-dot marker-dot-middle ${priceMin <= midPriceValue && priceMax >= midPriceValue ? 'active' : ''}`}></span>
                <span className={`marker-dot marker-dot-end ${priceMin <= maxPriceLimit && priceMax >= maxPriceLimit ? 'active' : ''}`}></span>
              </div>
            </div>
            <div className="slider-labels-v2">
              <span className="slider-label-item text-left">0 triệu</span>
              <span className="slider-label-item text-center">1 - {midPriceValue} triệu</span>
              <span className="slider-label-item text-right">{maxPriceLimit} triệu+</span>
            </div>
          </div>
        </div>

        {/* Selected tag filters row */}
        {(selectedUniTag || selectedLandmarkFilter || searchQuery || district || roomType || gender || (priceMin > 0 || priceMax < maxPriceLimit)) && (
          <div className="active-tags-row">
            {selectedLandmarkFilter && (
              <span className="filter-tag">
                Gần: {selectedLandmarkFilter}
                <span className="filter-tag-close" onClick={() => setSelectedLandmarkFilter('')}>×</span>
              </span>
            )}
            {selectedUniTag && (
              <span className="filter-tag">
                {selectedUniTag}
                <span className="filter-tag-close" onClick={() => { setSelectedUniTag(null); setDistrict(''); }}>×</span>
              </span>
            )}
            {searchQuery && (
              <span className="filter-tag">
                Tìm kiếm: "{searchQuery}"
                <span className="filter-tag-close" onClick={() => setSearchQuery('')}>×</span>
              </span>
            )}
            {district && (
              <span className="filter-tag">
                Quận: {district}
                <span className="filter-tag-close" onClick={() => setDistrict('')}>×</span>
              </span>
            )}
            {roomType && (
              <span className="filter-tag">
                Loại: {roomType}
                <span className="filter-tag-close" onClick={() => setRoomType('')}>×</span>
              </span>
            )}
            {gender && (
              <span className="filter-tag">
                Giới tính: {gender}
                <span className="filter-tag-close" onClick={() => setGender('')}>×</span>
              </span>
            )}
            {(priceMin > 0 || priceMax < maxPriceLimit) && (
              <span className="filter-tag">
                Giá: {priceMin} - {priceMax >= maxPriceLimit ? `${maxPriceLimit}+` : priceMax} triệu
                <span className="filter-tag-close" onClick={() => { setPriceMin(0); setPriceMax(maxPriceLimit); }}>×</span>
              </span>
            )}
            <span className="clear-all-tags" onClick={handleClearAll}>
              <Trash2 size={12} />
              <span>Xóa tất cả</span>
            </span>
          </div>
        )}
      </div>

      {/* University list index overlay view (image17) */}
      {/* Landmark list index overlay view */}
      {showUniList ? (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Danh sách {activeLandmarkType === 'university' ? 'các trường đại học' : activeLandmarkType === 'college' ? 'các trường cao đẳng' : activeLandmarkType === 'hospital' ? 'các bệnh viện' : activeLandmarkType === 'station' ? 'các bến xe' : 'các ga metro'}
          </h2>
          <div className="uni-list">
            {activeLandmarks.map((uni, idx) => (
              <div key={idx} className="uni-item" onClick={() => handleSelectLandmark(uni)}>
                <div className="uni-info">
                  <div className="uni-logo-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', color: 'var(--zalo-blue)', borderRadius: '50%', width: '32px', height: '32px', flexShrink: 0 }}>
                    {activeLandmarkType === 'university' || activeLandmarkType === 'college' ? (
                      <GraduationCap size={16} />
                    ) : activeLandmarkType === 'hospital' ? (
                      <Plus size={16} strokeWidth={3} />
                    ) : activeLandmarkType === 'station' ? (
                      <Bus size={16} />
                    ) : (
                      <Train size={16} />
                    )}
                  </div>
                  <div className="uni-details" style={{ marginLeft: '12px' }}>
                    <span className="uni-name" style={{ fontWeight: 700, display: 'block', fontSize: '14px', color: '#1E293B' }}>{uni.name}</span>
                    <span className="uni-address" style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{uni.address}</span>
                  </div>
                </div>
                <div className="uni-count-arrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="uni-count" style={{ fontSize: '12px', color: '#64748B' }}>
                    {rooms.filter(room =>
                      room.distances && room.distances.some(d => d.landmark_name === uni.name)
                    ).length} phòng gần đây
                  </span>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (
        /* Regular rooms grid results */
        <div>
          {loadingRooms ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="loading-spinner" style={{ fontSize: '24px' }}>⏳</span>
              <h3 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Đang tải thông tin phòng...</h3>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <HelpCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              <h3 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Không tìm thấy kết quả phù hợp</h3>
              <p style={{ fontSize: '13px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn xem sao.</p>
              <button
                className="sidebar-support-btn"
                style={{ width: 'auto', marginTop: '8px', padding: '8px 20px' }}
                onClick={handleClearAll}
              >
                Nhập lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className={category === 'o-ghep' ? 'room-grid-3' : 'room-grid-4'}>
                {currentRooms.map((room) => {
                  const isSaved = savedRoomIds.includes(room.id);
                  const hasImg = room.image && !room.image.includes('placeholder');

                  return (
                    <div
                      key={room.id}
                      className="room-card"
                      onClick={() => {
                        if (navigateToRoom) {
                          navigateToRoom(room.id, room.category);
                        } else {
                          setSelectedRoomId(room.id);
                          setCurrentPage(room.category === 'chung-cu' ? 'chung-cu-detail' : room.category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail' : 'phong-tro-detail');
                        }
                      }}
                    >
                      <div className="room-card-image-wrapper">
                        {hasImg ? (
                          <img src={room.image} alt={room.title} className="room-card-image" />
                        ) : (
                          <div className="room-card-image-placeholder" style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F8FAFC',
                            color: 'var(--text-muted)'
                          }}>
                            {/* House Placeholder (image2) */}
                            <Building2 size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                          </div>
                        )}

                        <span className={`room-card-badge ${room.badgeColor}`}>
                          {room.badgeText}
                        </span>

                        <button
                          className={`room-card-favorite ${isSaved ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveRoom(room.id);
                          }}
                        >
                          <Heart size={16} fill={isSaved ? "var(--primary-red)" : "none"} />
                        </button>
                        <div className="room-card-verify">
                          <Check size={12} strokeWidth={3} />
                          <span>Xác thực</span>
                        </div>
                        <span className="room-card-img-count">{room.imageCount !== undefined ? room.imageCount : 8} ảnh</span>
                      </div>

                      <div className="room-card-content">

                        <h3 className="room-card-title" style={{ fontWeight: 400 }}>
                          <strong style={{ fontWeight: 700 }}>Dạng phòng:</strong> {room.roomType || (room.title.toLowerCase().includes('studio') ? 'Studio' : room.title.toLowerCase().includes('duplex') ? 'Duplex' : room.title.toLowerCase().includes('chung cư') ? 'Chung cư' : room.title.toLowerCase().includes('nhà nguyên căn') ? 'Nhà nguyên căn' : 'Phòng khép kín')}
                        </h3>

                        <div className="room-card-address">
                          <MapPin size={12} style={{ color: 'var(--primary-red)', marginTop: '3px', flexShrink: 0 }} />
                          <span>Địa chỉ: {room.address}</span>
                        </div>

                        <div className="room-card-price-row" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                          <span className="room-card-price" style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>Giá: {formatPrice(room.price1 || room.priceRaw || room.priceText)}</span>
                        </div>

                        {getDisplayDistanceText(room, selectedLandmarkFilter) && (
                          <div className="room-card-distance" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <School size={12} style={{ color: '#64748B', flexShrink: 0 }} />
                            <span>{getDisplayDistanceText(room, selectedLandmarkFilter)}</span>
                          </div>
                        )}

                        {category === 'o-ghep' && room.gender && (
                          <div className="room-card-distance">
                            <Users2 size={12} style={{ color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <span>Yêu cầu: {room.gender} roommate</span>
                          </div>
                        )}
                      </div>

                      <div className="room-card-footer">
                        <span>{room.timeText || 'Đăng 2 giờ trước'}</span>
                        <button
                          className="room-card-zalo-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://zalo.me/${room.zaloNumber || '0876480130'}`, '_blank');
                          }}
                        >
                          <ZaloIconCard size={14} />
                          <span>Liên hệ Zalo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <span
                    className="pagination-btn"
                    onClick={() => {
                      if (listingPage > 1) {
                        setListingPage(listingPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    style={{
                      opacity: listingPage === 1 ? 0.5 : 1,
                      cursor: listingPage === 1 ? 'not-allowed' : 'pointer',
                      pointerEvents: listingPage === 1 ? 'none' : 'auto'
                    }}
                  >
                    &lt;
                  </span>
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return <span key={`dots-${idx}`} className="pagination-dots">...</span>;
                    }
                    return (
                      <span
                        key={`page-${page}`}
                        className={`pagination-btn ${listingPage === page ? 'active' : ''}`}
                        onClick={() => {
                          setListingPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {page}
                      </span>
                    );
                  })}
                  <span
                    className="pagination-btn"
                    onClick={() => {
                      if (listingPage < totalPages) {
                        setListingPage(listingPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    style={{
                      opacity: listingPage === totalPages ? 0.5 : 1,
                      cursor: listingPage === totalPages ? 'not-allowed' : 'pointer',
                      pointerEvents: listingPage === totalPages ? 'none' : 'auto'
                    }}
                  >
                    &gt;
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Ở ghép call to action footer banner */}
      {category === 'o-ghep' && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF0F1 0%, #FFE4E6 100%)',
          border: '1px solid #FFE4E6',
          padding: '24px 32px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Bạn muốn tìm người ở ghép?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Đăng tin ngay trên 80Land để tìm người phù hợp nhanh chóng!
            </p>
          </div>
          <button
            className="form-submit-btn form-submit-btn-red"
            style={{ width: 'auto', padding: '12px 28px' }}
            onClick={() => {
              if (user && user.role === 'admin') {
                setCurrentPage('admin-dashboard');
              } else {
                alert('Chỉ tài khoản Admin mới có quyền đăng tin. Tài khoản của bạn không có quyền đăng tin.');
              }
            }}
          >
            Đăng tin ở ghép
          </button>
        </div>
      )}
    </div>
  );
};

// Mock PlusCircle fallback icon for verified tag
const PlusCircle = ({ size, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Custom Zalo Icon for cards (color transitions with currentColor and CSS fill rules)
const ZaloIconCard = ({ size = 14 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M12 2C6.48 2 2 5.86 2 10.62C2 13.31 3.53 15.69 5.89 17.19L5.04 20.65C4.94 21.06 5.34 21.41 5.72 21.21L9.69 19.16C10.43 19.33 11.2 19.42 12 19.42C17.52 19.42 22 15.56 22 10.8C22 6.04 17.52 2 12 2Z"
      fill="currentColor"
    />
    <text
      x="12"
      y="12.5"
      fontSize="5"
      fontWeight="900"
      textAnchor="middle"
      fontFamily="sans-serif"
      className="zalo-text-card"
    >
      zalo
    </text>
  </svg>
);

export default ListingView;
