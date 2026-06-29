import React, { useState } from 'react';
import { getNearestLandmarks, formatTimeText, NO_IMAGE_PLACEHOLDER } from '../utils/helpers';
import {
  Plus,
  Trash2,
  Building2,
  Users2,
  KeyRound,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  TrendingUp,
  Sliders,
  Settings,
  RefreshCw
} from 'lucide-react';

const SUGGESTED_IMAGES = [
  {
    name: 'Phòng Studio Đèn Ấm',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Phòng Chung Cư Hiện Đại',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Phòng Master Ban Công',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Nhà Nguyên Căn Ngoại Thất',
    url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=600'
  }
];

const CATEGORY_LABELS = {
  'phong-tro': 'Phòng trọ',
  'chung-cu': 'Chung cư',
  'nha-nguyen-can': 'Nhà nguyên căn',
  'can-ho-dich-vu': 'Căn hộ dịch vụ',
  'mat-bang-kinh-doanh': 'Mặt bằng kinh doanh',
  'pass-phong': 'Pass phòng',
  'o-ghep': 'Ở ghép'
};

const AdminDashboardView = ({ rooms, setRooms, setCurrentPage, isMobile, settings, fetchSettings, refreshRooms, user }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'excel' | 'settings' | 'ctv' | 'transactions' | 'ref-friends' | 'commission' | 'traffic' | 'user-accounts' | 'ctv-accounts' | 'all-rooms'
  const [addFlowStep, setAddFlowStep] = useState('choose'); // 'choose' | 'form'
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);


  const [adminRooms, setAdminRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [listingsTab, setListingsTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [listingSearchQuery, setListingSearchQuery] = useState('');

  const filteredAdminRooms = React.useMemo(() => {
    if (!listingSearchQuery.trim()) return adminRooms;
    const q = listingSearchQuery.toLowerCase().trim();
    return adminRooms.filter(room => {
      const addr = (room.address || '').toLowerCase();
      const title = (room.title || '').toLowerCase();
      const type = (room.room_type || '').toLowerCase();
      const idStr = String(room.id);
      const codeStr = (room.room_code || '').toLowerCase();
      const text2Str = (room.text2 || '').toLowerCase();
      return addr.includes(q) || title.includes(q) || type.includes(q) || idStr.includes(q) || codeStr.includes(q) || text2Str.includes(q);
    });
  }, [adminRooms, listingSearchQuery]);

  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [searchReferral, setSearchReferral] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchTransaction, setSearchTransaction] = useState('');
  const [txSubTab, setTxSubTab] = useState('pending'); // 'pending' | 'history'
  const [activeQrCodeUrl, setActiveQrCodeUrl] = useState(null); // { url, bankName, accountNum, accountName, displayAmount, description }

  // ── REF/FRIENDS state ────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [refApproveModal, setRefApproveModal] = useState(null); // { ref, note }
  const [refNote, setRefNote] = useState('');
  const [refCommission, setRefCommission] = useState(100000);

  // ── COMMISSION state ─────────────────────────────────────────────
  const [commQuery, setCommQuery] = useState('');
  const [commResults, setCommResults] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  const [commExpanded, setCommExpanded] = useState(null);

  // ── TRAFFIC state ────────────────────────────────────────────────
  const [trafficData, setTrafficData] = useState(null);
  const [trafficRange, setTrafficRange] = useState('7d');
  const [trafficLoading, setTrafficLoading] = useState(false);

  // ── USER ACCOUNTS state ──────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTxs, setUserTxs] = useState([]);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'subtract'
  const [adjustLoading, setAdjustLoading] = useState(false);

  // ── CTV ACCOUNTS state ───────────────────────────────────────────
  const [ctvName, setCtvName] = useState('');
  const [ctvPhone, setCtvPhone] = useState('');
  const [ctvPassword, setCtvPassword] = useState('');
  const [ctvUsers, setCtvUsers] = useState([]);

  // ── ALL ROOMS state ──────────────────────────────────────────────
  const [allRooms, setAllRooms] = useState([]);
  const [loadingAllRooms, setLoadingAllRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [editRoomModal, setEditRoomModal] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editRoomType, setEditRoomType] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('phong-tro');
  const [editSaving, setEditSaving] = useState(false);


  // ── BOT MANAGEMENT STATE ─────────────────────────────────────────
  const [botStatus, setBotStatus] = useState({ listener: { running: false }, sender: { running: false } });
  const [botConfig, setBotConfig] = useState(null);
  const [botLogs, setBotLogs] = useState('');
  const [activeLogService, setActiveLogService] = useState('listener');
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [botModal, setBotModal] = useState(null); // null | { type: 'add' | 'edit', index: number, role: 'listener' | 'sender' }
  const [newAccName, setNewAccName] = useState('');
  const [newAccImei, setNewAccImei] = useState('');
  const [newAccCookies, setNewAccCookies] = useState('');
  const [controlLoading, setControlLoading] = useState({ listener: false, sender: false });
  const [botConfigSaving, setBotConfigSaving] = useState(false);

  const fetchBotStatus = () => {
    fetch('/api/bot/status')
      .then(res => res.json())
      .then(data => setBotStatus(data))
      .catch(err => console.error('Error fetching bot status:', err));
  };

  const fetchBotConfig = () => {
    fetch('/api/bot/config')
      .then(res => res.json())
      .then(data => setBotConfig(data))
      .catch(err => console.error('Error fetching bot config:', err));
  };

  const fetchBotLogs = (service) => {
    fetch(`/api/bot/logs/${service || activeLogService}`)
      .then(res => res.json())
      .then(data => setBotLogs(data.logs || ''))
      .catch(err => console.error('Error fetching bot logs:', err));
  };

  const handleBotControl = (service, action) => {
    setControlLoading(prev => ({ ...prev, [service]: true }));
    fetch('/api/bot/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, action })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Lỗi: ' + data.error);
        } else {
          fetchBotStatus();
          setTimeout(() => {
            fetchBotStatus();
            fetchBotLogs(service);
          }, 1500);
        }
      })
      .catch(err => alert('Có lỗi xảy ra: ' + err.message))
      .finally(() => setControlLoading(prev => ({ ...prev, [service]: false })));
  };

  const handleOpenBotModal = (type, index = -1, role = 'sender') => {
    if (type === 'add') {
      setNewAccName('');
      setNewAccImei('');
      setNewAccCookies('');
      setBotModal({ type: 'add', index: -1, role });
    } else {
      const acc = botConfig.ACCOUNTS[index];
      setNewAccName(acc.name || (index === 0 ? 'Listener Account' : `Sender Account ${index}`));
      setNewAccImei(acc.imei || '');
      setNewAccCookies(JSON.stringify(acc.session_cookies || {}, null, 2));
      setBotModal({ type: 'edit', index, role: index === 0 ? 'listener' : 'sender' });
    }
  };

  const handleSaveBotAccount = () => {
    if (!newAccImei.trim() || !newAccCookies.trim()) {
      alert('Vui lòng nhập đầy đủ IMEI và Session Cookies!');
      return;
    }

    let parsedCookies;
    try {
      parsedCookies = JSON.parse(newAccCookies);
    } catch (e) {
      alert('Session Cookies phải là định dạng JSON hợp lệ!');
      return;
    }

    const updatedAccounts = [...(botConfig?.ACCOUNTS || [])];
    const newAccObj = {
      name: newAccName.trim() || (botModal.role === 'listener' ? 'Listener Zalo' : `Sender Zalo ${botModal.index > 0 ? botModal.index : updatedAccounts.length}`),
      imei: newAccImei.trim(),
      session_cookies: parsedCookies
    };

    if (botModal.type === 'add') {
      if (botModal.role === 'listener') {
        if (updatedAccounts.length > 0) {
          updatedAccounts[0] = newAccObj;
        } else {
          updatedAccounts.push(newAccObj);
        }
      } else {
        updatedAccounts.push(newAccObj);
      }
    } else {
      updatedAccounts[botModal.index] = newAccObj;
    }

    const newConfig = {
      ...botConfig,
      ACCOUNTS: updatedAccounts
    };

    setBotConfigSaving(true);
    fetch('/api/bot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Lỗi: ' + data.error);
        } else {
          alert('Đã cập nhật cấu hình tài khoản!');
          setBotModal(null);
          fetchBotConfig();
        }
      })
      .catch(err => alert('Có lỗi xảy ra: ' + err.message))
      .finally(() => setBotConfigSaving(false));
  };

  const handleDeleteBotAccount = (index) => {
    if (index === 0) {
      alert('Không thể xóa tài khoản Listener mặc định! Vui lòng chọn sửa tài khoản này.');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn XÓA tài khoản Sender này?')) {
      const updatedAccounts = botConfig.ACCOUNTS.filter((_, idx) => idx !== index);
      const newConfig = {
        ...botConfig,
        ACCOUNTS: updatedAccounts
      };

      fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert('Lỗi: ' + data.error);
          } else {
            alert('Đã xóa tài khoản Sender!');
            fetchBotConfig();
          }
        })
        .catch(err => alert('Có lỗi xảy ra: ' + err.message));
    }
  };

  React.useEffect(() => {
    let interval = null;
    if (activeTab === 'bot-management') {
      fetchBotStatus();
      fetchBotConfig();
      fetchBotLogs(activeLogService);

      if (autoRefreshLogs) {
        interval = setInterval(() => {
          fetchBotStatus();
          fetchBotLogs(activeLogService);
        }, 3000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, autoRefreshLogs, activeLogService]);

  // ── UPLOAD state (for add listing) ──────────────────────────────
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{url, mimetype, originalName}]
  const [thumbnailIdx, setThumbnailIdx] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);




  // Settings form state
  const [minWithdrawal, setMinWithdrawal] = useState(settings?.min_withdrawal || 50000);
  const [referralCommission, setReferralCommission] = useState(settings?.referral_commission || 300000);
  const [tiktokBaseReward, setTiktokBaseReward] = useState(settings?.tiktok_base_reward || 30000);
  const [tiktokMaxReward, setTiktokMaxReward] = useState(settings?.tiktok_max_reward || 800000);
  const [tiktokTiers, setTiktokTiers] = useState(settings?.tiktok_reward_tiers || []);
  const [adminFbLink, setAdminFbLink] = useState(settings?.admin_fb_link || 'https://facebook.com/admin');
  const [adminZaloLink, setAdminZaloLink] = useState(settings?.admin_zalo_link || 'https://zalo.me/0876480130');
  const [zaloMonetizationLink, setZaloMonetizationLink] = useState(settings?.zalo_monetization_link || 'https://zalo.me/0876480130');



  // Settings helper functions
  const handleAddTier = () => {
    setTiktokTiers(prev => [...prev, { views: '', reward: 0 }]);
  };

  const handleUpdateTier = (index, field, value) => {
    setTiktokTiers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveTier = (index) => {
    setTiktokTiers(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const payload = {
      min_withdrawal: minWithdrawal,
      referral_commission: referralCommission,
      tiktok_base_reward: tiktokBaseReward,
      tiktok_max_reward: tiktokMaxReward,
      tiktok_reward_tiers: tiktokTiers,
      admin_fb_link: adminFbLink,
      admin_zalo_link: adminZaloLink,
      zalo_monetization_link: zaloMonetizationLink
    };

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save settings');
        return res.json();
      })
      .then(() => {
        fetchSettings(); // Refresh settings in parent App.jsx
        alert('Cấu hình hệ thống đã được lưu thành công!');
        setActiveTab('list');
      })
      .catch(err => {
        console.error(err);
        alert('Có lỗi xảy ra khi lưu cấu hình!');
      });
  };

  // Excel Tab State
  const [excelCategory, setExcelCategory] = useState('phong-tro');
  const [tsvText, setTsvText] = useState('');
  const [importMethod, setImportMethod] = useState('merge'); // 'merge' | 'overwrite'

  // Form State
  const [category, setCategory] = useState('phong-tro');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [nearPlace, setNearPlace] = useState('');
  const [distanceText, setDistanceText] = useState('Cách trường gần nhất • 800m');
  const [priceRaw, setPriceRaw] = useState('');
  const [priceText, setPriceText] = useState('');
  const [areaText, setAreaText] = useState('');
  const [badgeText, setBadgeText] = useState('Mới đăng');
  const [badgeColor, setBadgeColor] = useState('red');
  const [zaloNumber, setZaloNumber] = useState('0876480130');
  const [image, setImage] = useState(SUGGESTED_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [customLandmarks, setCustomLandmarks] = useState(false);
  const [customLandmarksList, setCustomLandmarksList] = useState([{ name: '', distanceText: '' }]);

  // Ở ghép specific fields
  const [subCategory, setSubCategory] = useState('phong-tro');
  const [gender, setGender] = useState('Nam/Nữ');

  // Pass phòng specific fields
  const [passIncentive, setPassIncentive] = useState('TẶNG 200K');

  // Sync category resets for CTV
  React.useEffect(() => {
    if (user && user.role === 'ctv') {
      setCategory('o-ghep');
    }
  }, [user]);

  // Tab-switch reset effect
  React.useEffect(() => {
    if (activeTab === 'add') {
      setAddFlowStep('choose');
      setUploadedFiles([]);
    }
  }, [activeTab]);

  // Sync settings prop when changes
  React.useEffect(() => {
    if (settings) {
      setMinWithdrawal(settings.min_withdrawal);
      setReferralCommission(settings.referral_commission);
      setTiktokBaseReward(settings.tiktok_base_reward);
      setTiktokMaxReward(settings.tiktok_max_reward);
      setTiktokTiers(settings.tiktok_reward_tiers || []);
      setAdminFbLink(settings.admin_fb_link || 'https://facebook.com/admin');
      setAdminZaloLink(settings.admin_zalo_link || 'https://zalo.me/0876480130');
      setZaloMonetizationLink(settings.zalo_monetization_link || 'https://zalo.me/0876480130');
    }
  }, [settings]);

  // Auto-calculate nearest landmark and distance on address change
  React.useEffect(() => {
    if (!address || address.trim() === '') return;
    const nearest = getNearestLandmarks(address)[0];
    if (nearest) {
      setNearPlace(nearest.name);
      setDistanceText(`Cách ${nearest.name} • ${nearest.distText}`);
    }
  }, [address]);

  // Stats calculation
  const totalCount = rooms.length;
  const oghepCount = rooms.filter(r => r.category === 'o-ghep').length;
  const passCount = rooms.filter(r => r.category === 'pass-phong').length;
  const otherCount = totalCount - oghepCount - passCount;

  const mapRoomRow = (r) => {
    let isManual = false;
    let manualData = null;
    const textSource = (r.original_text && String(r.original_text).trim().startsWith('{')) ? r.original_text : (r.text2 || r.original_text || '');
    if (textSource && textSource.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(textSource);
        if (parsed && parsed.isManual) {
          isManual = true;
          manualData = parsed;
        }
      } catch (e) { }
    }

    // Determine category
    const category = r.category || (isManual && manualData && manualData.category) || 'phong-tro';

    // Format priceText
    let priceText = 'Liên hệ';
    const num = parseInt(r.price1 || r.price);
    if (isManual && manualData && manualData.priceText) {
      priceText = manualData.priceText;
    } else if (!isNaN(num)) {
      if (num >= 1000000) {
        priceText = `${num / 1000000} triệu/tháng`;
      } else {
        priceText = num.toLocaleString('vi-VN') + ' đ/tháng';
      }
    } else if (r.price) {
      priceText = r.price.includes('triệu') || r.price.includes('tr') ? r.price : `${r.price}/tháng`;
    }

    // Find cover image from photos/videos
    let image = '';
    if (isManual && manualData && manualData.image) {
      image = manualData.image;
    } else if (r.photos && r.photos.length > 0) {
      const p = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
      image = p[0]?.url || p[0] || '';
    } else if (r.videos && r.videos.length > 0) {
      const v = typeof r.videos === 'string' ? JSON.parse(r.videos) : r.videos;
      if (v[0]?.thumb) image = v[0].thumb;
    }
    if (!image) {
      image = NO_IMAGE_PLACEHOLDER;
    }

    // Find closest landmark
    let nearPlace = '';
    let distanceText = '';
    if (isManual && manualData) {
      nearPlace = manualData.nearPlace || '';
      distanceText = manualData.distanceText || '';
    } else if (r.distances && r.distances.length > 0) {
      const dists = typeof r.distances === 'string' ? JSON.parse(r.distances) : r.distances;
      const sortedDist = [...dists].sort((a, b) => a.distance - b.distance);
      const closest = sortedDist[0];
      nearPlace = closest.landmark_name;

      const distNum = parseFloat(closest.distance);
      const distTextVal = distNum < 1.0 ? `${Math.round(distNum * 1000)}m` : `${distNum} km`;
      distanceText = `Cách ${closest.landmark_name} • ${distTextVal}`;
    } else if (r.address) {
      const nearest = getNearestLandmarks(r.address)[0];
      if (nearest) {
        nearPlace = nearest.name;
        distanceText = `Cách ${nearest.name} • ${nearest.distText}`;
      }
    }

    let address = r.address || 'Hà Nội';
    if (address && !address.toLowerCase().includes('hà nội')) {
      address = address + ', Hà Nội';
    }

    return {
      id: r.id,
      session_id: r.session_id,
      category,
      title: (() => {
        if (isManual && manualData) return manualData.title;
        let prefix = 'Phòng trọ';
        let defaultSuffix = 'khép kín';
        
        if (category === 'chung-cu') {
          prefix = 'Chung cư';
          defaultSuffix = 'cao cấp';
        } else if (category === 'nha-nguyen-can') {
          prefix = 'Nhà nguyên căn';
          defaultSuffix = 'giá tốt';
        } else if (category === 'can-ho-dich-vu') {
          prefix = 'Căn hộ dịch vụ';
          defaultSuffix = 'full đồ';
        } else if (category === 'mat-bang-kinh-doanh') {
          prefix = 'Mặt bằng kinh doanh';
          defaultSuffix = 'tiện nghi';
        } else if (category === 'pass-phong') {
          prefix = 'Pass phòng';
          defaultSuffix = 'nhanh';
        } else if (category === 'o-ghep') {
          prefix = 'Ở ghép';
          defaultSuffix = 'tìm bạn';
        }

        if (r.room_code) {
          return `${prefix} mã ${r.room_code}`;
        }
        if (r.room_type) {
          if (category === 'mat-bang-kinh-doanh' && r.room_type.toLowerCase().includes('m2')) {
            return `${prefix} diện tích ${r.room_type}`;
          }
          return `${prefix} ${r.room_type}`;
        }
        return defaultSuffix ? `${prefix} ${defaultSuffix}` : prefix;
      })(),
      address,
      nearPlace,
      distanceText,
      priceText,
      priceRaw: isManual && manualData ? (manualData.priceRaw || 0) : (num || 0),
      areaText: isManual && manualData ? (manualData.areaText || 'Chưa cập nhật') : (r.room_type || 'Chưa cập nhật'),
      badgeText: isManual && manualData ? (manualData.badgeText || 'Mới đăng') : 'Mới đăng',
      badgeColor: isManual && manualData ? (manualData.badgeColor || 'red') : 'red',
      timeText: formatTimeText(r.created_at),
      imageCount: isManual && manualData ? 1 : (r.photos ? (typeof r.photos === 'string' ? JSON.parse(r.photos).length : r.photos.length) : 0),
      videoCount: isManual && manualData ? 0 : (r.videos ? (typeof r.videos === 'string' ? JSON.parse(r.videos).length : r.videos.length) : 0),
      zaloNumber: isManual && manualData ? (manualData.zaloNumber || '0876480130') : '0876480130',
      image,
      original_text: isManual && manualData ? (manualData.text2 || manualData.description || '') : textSource,
      room_type: isManual && manualData ? (manualData.areaText || 'Trọ thường') : (r.room_type || 'Trọ thường'),
      roomType: isManual && manualData ? (manualData.areaText || 'Trọ thường') : (r.room_type || 'Trọ thường'),
      text1: r.text1,
      text2: r.text2,
      room_code: r.room_code,
      photos: r.photos,
      videos: r.videos,
      distances: r.distances || [],
      price1: r.price1,
      price2: r.price2,
      latitude: r.latitude,
      longitude: r.longitude,
      status: r.status || 'approved',
      subCategory: isManual && manualData ? manualData.subCategory : undefined,
      gender: isManual && manualData ? manualData.gender : undefined,
      passIncentive: isManual && manualData ? manualData.passIncentive : undefined,
      customLandmarks: isManual && manualData ? manualData.customLandmarks : undefined
    };
  };

  const fetchAdminRooms = (status) => {
    setLoadingRooms(true);
    fetch(`/api/admin/rooms?status=${status}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(mapRoomRow);
          setAdminRooms(mapped);
        } else {
          setAdminRooms([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingRooms(false));
  };

  const fetchReferrals = () => {
    setLoadingReferrals(true);
    fetch('/api/referrals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReferrals(data);
        } else {
          setReferrals([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingReferrals(false));
  };

  const fetchTransactions = () => {
    setLoadingTransactions(true);
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingTransactions(false));
  };

  const handleUpdateReferralStatus = (id, newStatus, newCommission) => {
    fetch(`/api/referrals/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, commission: newCommission })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return fetch('/api/sync-referrals', { method: 'POST' });
      })
      .then(() => {
        alert('Cập nhật trạng thái CTV thành công!');
        fetchReferrals();
      })
      .catch(() => alert('Lỗi khi cập nhật trạng thái CTV!'));
  };

  const handleUpdateTransactionStatus = (id, newStatus) => {
    fetch(`/api/transactions/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        alert('Cập nhật trạng thái giao dịch thành công!');
        fetchTransactions();
      })
      .catch(() => alert('Lỗi khi cập nhật trạng thái giao dịch!'));
  };

  const fetchLogs = () => {
    setLoadingLogs(true);
    fetch('/api/admin/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingLogs(false));
  };

  React.useEffect(() => {
    setListingSearchQuery('');
    if (activeTab === 'list') {
      fetchAdminRooms(listingsTab);
    } else if (activeTab === 'ctv') {
      fetchReferrals();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'ref-friends') {
      fetchAllUsers();
      fetchReferrals();
    } else if (activeTab === 'traffic') {
      fetchTraffic(trafficRange);
    } else if (activeTab === 'user-accounts') {
      fetchAllUsers();
    } else if (activeTab === 'ctv-accounts') {
      fetchAllUsers();
    } else if (activeTab === 'all-rooms') {
      fetchAllRooms('');
    } else if (activeTab === 'activity-logs') {
      fetchLogs();
    }
  }, [listingsTab, activeTab]);

  // ── NEW HANDLERS ────────────────────────────────────────────────

  const fetchAllUsers = () => {
    setLoadingUsers(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setAllUsers(Array.isArray(data) ? data : []); setCtvUsers((Array.isArray(data) ? data : []).filter(u => u.role === 'ctv')); })
      .catch(() => setAllUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  const handleApproveRef = () => {
    if (!refApproveModal) return;
    if (!refNote.trim()) { alert('Vui lòng nhập ghi chú!'); return; }
    fetch(`/api/referrals/${refApproveModal.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: refNote, commission: refCommission })
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { alert(d.error); return; }
        alert('Đã duyệt thành công! Tiền đã được cộng vào ví người mời.');
        setRefApproveModal(null);
        setRefNote('');
        fetchReferrals();
        fetchAllUsers();
      })
      .catch(() => alert('Lỗi khi duyệt!'));
  };

  const searchCommissions = () => {
    setCommLoading(true);
    fetch(`/api/commissions?q=${encodeURIComponent(commQuery)}`)
      .then(r => r.json())
      .then(d => setCommResults(d.results || []))
      .catch(() => setCommResults([]))
      .finally(() => setCommLoading(false));
  };

  React.useEffect(() => {
    if (activeTab === 'commission') searchCommissions();
  }, [activeTab]);

  const fetchTraffic = (range) => {
    setTrafficLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => setTrafficData(d))
      .catch(() => setTrafficData(null))
      .finally(() => setTrafficLoading(false));
  };

  React.useEffect(() => {
    if (activeTab === 'traffic') fetchTraffic(trafficRange);
  }, [trafficRange]);

  const fetchUserTxs = (phone) => {
    fetch(`/api/users/${phone}/transactions`)
      .then(r => r.json())
      .then(d => setUserTxs(Array.isArray(d) ? d : []))
      .catch(() => setUserTxs([]));
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserTxs([]);
    setAdjustAmount('');
    setAdjustNote('');
    fetchUserTxs(user.phone);
  };

  const handleAdjustBalance = () => {
    if (!selectedUser) return;
    if (!adjustNote.trim()) { alert('Vui lòng nhập ghi chú!'); return; }
    const rawAmt = parseInt(adjustAmount);
    if (isNaN(rawAmt) || rawAmt <= 0) { alert('Nhập số tiền hợp lệ!'); return; }
    const signedAmt = adjustType === 'subtract' ? -rawAmt : rawAmt;
    setAdjustLoading(true);
    fetch(`/api/users/${selectedUser.phone}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: signedAmt, note: adjustNote, type: adjustType === 'subtract' ? 'Admin trừ tiền' : 'Admin cộng tiền' })
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { alert(d.error); return; }
        alert('Đã cập nhật số dư thành công!');
        setSelectedUser(d.user);
        fetchUserTxs(selectedUser.phone);
        setAdjustAmount('');
        setAdjustNote('');
        fetchAllUsers();
      })
      .catch(() => alert('Lỗi khi cập nhật số dư!'))
      .finally(() => setAdjustLoading(false));
  };

  const handleCreateCtv = () => {
    if (!ctvPhone.trim() || !ctvPassword.trim() || !ctvName.trim()) { alert('Vui lòng nhập đủ thông tin!'); return; }
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: ctvPhone, password: ctvPassword, name: ctvName, role: 'ctv', referralCode: `CTV${Date.now()}`, walletBalance: 0, totalEarned: 0, pendingCommissions: 0, totalReferrals: 0, activeReferrals: 0 })
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { alert(d.error); return; }
        alert(`Đã tạo tài khoản CTV: ${ctvPhone} / ${ctvPassword}`);
        setCtvName(''); setCtvPhone(''); setCtvPassword('');
        fetchAllUsers();
      })
      .catch(() => alert('Lỗi khi tạo CTV!'));
  };

  const fetchAllRooms = (q) => {
    setLoadingAllRooms(true);
    fetch(`/api/admin/rooms/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setAllRooms(Array.isArray(d) ? d : []))
      .catch(() => setAllRooms([]))
      .finally(() => setLoadingAllRooms(false));
  };

  const openEditRoom = (room) => {
    // Parse text2 if JSON
    let desc = room.text2 || '';
    if (desc.trim().startsWith('{')) {
      try { const p = JSON.parse(desc); desc = p.text2 || p.description || ''; } catch (e) { }
    }
    setEditRoomModal(room);
    setEditAddress(room.address || '');
    setEditPrice(room.price1 ? String(room.price1) : '');
    setEditRoomType(room.room_type || '');
    setEditDesc(desc);
    setEditCategory(room.category || 'phong-tro');
  };

  const handleSaveRoom = () => {
    if (!editRoomModal) return;
    setEditSaving(true);
    const priceNum = parseInt(editPrice) || 0;
    const priceText = priceNum >= 1000000 ? `${priceNum / 1000000} triệu/tháng` : `${priceNum.toLocaleString('vi-VN')}đ/tháng`;

    // Auto-recalculate nearest landmark and distance on edit address change
    let nearPlace = '';
    let distanceText = '';
    const nearest = getNearestLandmarks(editAddress)[0];
    if (nearest) {
      nearPlace = nearest.name;
      distanceText = `Cách ${nearest.name} • ${nearest.distText}`;
    }

    fetch(`/api/rooms/${editRoomModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: editAddress,
        price: priceText,
        price1: priceNum,
        room_type: editRoomType,
        description: editDesc,
        category: editCategory,
        nearPlace,
        distanceText,
        actor_phone: user?.phone,
        actor_name: user?.name
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { alert(d.error); return; }
        alert('Đã lưu thông tin phòng!');
        setEditRoomModal(null);
        fetchAllRooms(roomSearch);
        if (refreshRooms) refreshRooms();
      })
      .catch(() => alert('Lỗi khi lưu!'))
      .finally(() => setEditSaving(false));
  };

  const handleUploadFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadLoading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(r => r.json())
      .then(d => {
        if (d.files && d.files.length > 0) {
          setUploadedFiles(prev => {
            const next = [...prev, ...d.files];
            // If the current image is the default preset, set the first uploaded image as cover
            const firstImg = d.files.find(f => f.mimetype.startsWith('image'));
            if (firstImg) {
              setImage(firstImg.url);
            }
            return next;
          });
        }
      })
      .catch(() => alert('Lỗi upload file!'))
      .finally(() => setUploadLoading(false));
  };

  const handleDeleteUploadedFile = (idx) => {
    const fileToDelete = uploadedFiles[idx];
    setUploadedFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // If we deleted the active cover image, pick another image from the list as cover, or default preset if empty
      if (image === fileToDelete.url) {
        const nextImg = next.find(f => f.mimetype.startsWith('image'));
        setImage(nextImg ? nextImg.url : SUGGESTED_IMAGES[0].url);
      }
      return next;
    });
  };

  const handleSelectPresetImage = (url) => {
    setImage(url);
    // Check if it is already in uploadedFiles
    if (!uploadedFiles.some(f => f.url === url)) {
      setUploadedFiles(prev => [...prev, { url, mimetype: 'image/jpeg', originalName: 'Gợi ý' }]);
    }
  };



  const handleApproveRoom = (id) => {
    fetch(`/api/rooms/${id}/approve`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error();
        alert('Đã duyệt tin đăng thành công!');
        fetchAdminRooms(listingsTab);
        if (refreshRooms) refreshRooms();
      })
      .catch(() => alert('Lỗi khi duyệt tin đăng!'));
  };

  const handleRejectRoom = (id) => {
    fetch(`/api/rooms/${id}/reject`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error();
        alert('Đã từ chối tin đăng thành công!');
        fetchAdminRooms(listingsTab);
        if (refreshRooms) refreshRooms();
      })
      .catch(() => alert('Lỗi khi từ chối tin đăng!'));
  };

  const handleDeleteListing = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
      fetch(`/api/rooms/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          alert('Đã xóa tin đăng thành công!');
          fetchAdminRooms(listingsTab);
          fetchAllRooms(roomSearch);
          if (refreshRooms) refreshRooms();
        })
        .catch(() => alert('Lỗi khi xóa tin đăng!'));
    }
  };

  const handlePriceRawChange = (e) => {
    const rawVal = e.target.value;
    setPriceRaw(rawVal);

    // Auto-generate Price Text based on raw number
    if (rawVal) {
      const num = parseFloat(rawVal);
      if (num >= 1000000) {
        const tr = num / 1000000;
        setPriceText(`${tr} triệu/tháng`);
      } else {
        setPriceText(`${num.toLocaleString('vi-VN')} đ/tháng`);
      }
    } else {
      setPriceText('');
    }
  };

  // Excel Functions & Helpers
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    let str = priceStr.toString().toLowerCase().trim();
    str = str.replace(/[đ\s]/g, '');

    if (str.includes('triệu') || str.includes('tr')) {
      let val = parseFloat(str.replace('triệu', '').replace('tr', '').replace(',', '.'));
      return val * 1000000;
    }
    if (str.includes('tỷ')) {
      let val = parseFloat(str.replace('tỷ', '').replace(',', '.'));
      return val * 1000000000;
    }
    let directNum = parseFloat(str.replace(',', '.'));
    if (!isNaN(directNum)) {
      if (directNum < 100) {
        return directNum * 1000000;
      }
      return directNum;
    }
    return 0;
  };

  const formatPriceText = (priceRaw) => {
    if (!priceRaw) return '';
    const num = parseFloat(priceRaw);
    if (num >= 1000000) {
      const tr = num / 1000000;
      return `${tr.toString().replace('.', ',')} triệu/tháng`;
    }
    return `${num.toLocaleString('vi-VN')} đ/tháng`;
  };

  const getReferrals = () => {
    const saved = localStorage.getItem('referral_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { referralCode: 'A12345', name: 'Trần Minh Đức', phone: '0987654321', date: '18/05/2025 10:30', status: 'Đã kiếm được tiền', commission: 300000 },
      { referralCode: 'A12345', name: 'Nguyễn Thu Hà', phone: '0912345678', date: '18/05/2025 09:15', status: 'Đã kiếm được tiền', commission: 300000 },
      { referralCode: 'A12345', name: 'Lê Văn Nam', phone: '0901234567', date: '17/05/2025 21:45', status: 'Chưa đủ điều kiện', commission: 0 },
      { referralCode: 'A12345', name: 'Phạm Quỳnh Anh', phone: '0934567890', date: '17/05/2025 16:20', status: 'Đã kiếm được tiền', commission: 300000 },
      { referralCode: 'A12345', name: 'Hoàng Quốc Bảo', phone: '0978901234', date: '16/05/2025 14:10', status: 'Chưa đủ điều kiện', commission: 0 }
    ];
  };

  const recalculateAllUsersStats = (allTx) => {
    const users = JSON.parse(localStorage.getItem('users_db') || '[]');
    const updatedUsers = users.map(u => {
      if (u.role === 'admin') return u;

      const userTx = allTx.filter(t => t.phone === u.phone);
      let totalEarned = 0;
      let totalWithdrawn = 0;

      userTx.forEach(t => {
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

      const saved = localStorage.getItem('referral_list');
      let totalRefs = u.totalReferrals;
      let activeRefs = u.activeReferrals;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter(r => r.referralCode === u.referralCode);
          totalRefs = filtered.length;
          activeRefs = filtered.filter(r => r.status === 'Đã kiếm được tiền' || r.status.includes('Đã kiếm')).length;
        } catch (e) { }
      }

      return {
        ...u,
        walletBalance,
        totalEarned,
        totalReferrals: totalRefs,
        activeReferrals: activeRefs
      };
    });

    localStorage.setItem('users_db', JSON.stringify(updatedUsers));

    const current = localStorage.getItem('currentUser');
    if (current) {
      try {
        const curUser = JSON.parse(current);
        const matchingUpdated = updatedUsers.find(u => u.phone === curUser.phone);
        if (matchingUpdated) {
          localStorage.setItem('currentUser', JSON.stringify(matchingUpdated));
        }
      } catch (e) { }
    }
  };

  const syncReferralCommissionsToTransactions = (referrals, currentTxList) => {
    let updated = [...currentTxList];
    let changed = false;

    const users = JSON.parse(localStorage.getItem('users_db') || '[]');

    referrals.forEach(ref => {
      if (ref.status === 'Đã kiếm được tiền' || (parseFloat(ref.commission) > 0)) {
        const comm = parseFloat(ref.commission) || 300000;
        const inviter = users.find(u => u.referralCode === ref.referralCode);
        const phone = inviter ? inviter.phone : 'user';

        const exists = updated.some(t =>
          t.phone === phone &&
          t.type === 'Hoa hồng giới thiệu' &&
          t.amount === `+${comm.toLocaleString('vi-VN')}đ` &&
          t.date.split(' ')[0] === ref.date.split(' ')[0]
        );

        if (!exists) {
          updated.push({
            phone,
            date: ref.date,
            type: 'Hoa hồng giới thiệu',
            amount: `+${comm.toLocaleString('vi-VN')}đ`,
            status: 'Thành công'
          });
          changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem('transactions_db', JSON.stringify(updated));
    }
    return updated;
  };

  const handleExcelExport = () => {
    if (excelCategory === 'transactions_db') {
      fetch('/api/transactions')
        .then(res => res.json())
        .then(transactions => {
          const headers = ['Số điện thoại', 'Thời gian', 'Loại giao dịch', 'Số tiền', 'Trạng thái'];
          const rows = transactions.map(tx => [
            tx.phone || '',
            tx.date || '',
            tx.type || '',
            tx.amount || '',
            tx.status || ''
          ]);
          const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
          setTsvText(tsv);
          alert('Đã xuất danh sách lịch sử giao dịch. Bạn có thể sao chép dữ liệu trong ô văn bản phía dưới!');
        })
        .catch(err => {
          console.error(err);
          alert('Không thể xuất lịch sử giao dịch từ SQLite!');
        });
      return;
    }

    if (excelCategory === 'referral_list') {
      fetch('/api/referrals')
        .then(res => res.json())
        .then(referrals => {
          const headers = ['Mã giới thiệu', 'Người đăng ký', 'Số điện thoại', 'Ngày đăng ký', 'Trạng thái', 'Hoa hồng tạm tính'];
          const rows = referrals.map(ref => [
            ref.referralCode || '',
            ref.name || '',
            ref.phone || '',
            ref.date || '',
            ref.status || '',
            ref.commission !== undefined ? ref.commission : ''
          ]);
          const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
          setTsvText(tsv);
          alert('Đã xuất danh sách CTV. Bạn có thể sao chép dữ liệu trong ô văn bản phía dưới!');
        })
        .catch(err => {
          console.error(err);
          alert('Không thể xuất danh sách CTV từ SQLite!');
        });
      return;
    }

    // Fetch all rooms from database to perform category export
    fetch(`/api/rooms?status=all&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const allMapped = data.map(mapRoomRow);
        const catRooms = allMapped.filter(r => r.category === excelCategory);
        let headers = [];
        let rows = [];

        if (excelCategory === 'phong-tro') {
          headers = ['Thông tin chi tiết', 'Dạng phòng', 'Địa chỉ', 'Giá', 'Gần địa điểm nào', 'Mô tả chi tiết'];
          rows = catRooms.map(r => [
            r.title || '',
            r.areaText || '',
            r.address || '',
            r.priceRaw || '',
            r.nearPlace || '',
            (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
          ]);
        } else if (excelCategory === 'chung-cu') {
          headers = ['Thông tin chi tiết', 'Tên chung cư', 'Dạng phòng', 'Địa chỉ', 'Giá', 'Gần địa điểm nào', 'Mô tả chi tiết'];
          rows = catRooms.map(r => [
            r.title || '',
            r.buildingName || r.title || '',
            r.areaText || '',
            r.address || '',
            r.priceRaw || '',
            r.nearPlace || '',
            (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
          ]);
        } else if (excelCategory === 'nha-nguyen-can') {
          headers = ['Thông tin chi tiết', 'Nhà .. tầng', 'Địa chỉ', 'Số tầng', 'Số phòng', 'Giá', 'Gần địa điểm nào', 'Mô tả chi tiết'];
          rows = catRooms.map(r => {
            let floors = r.floors || 1;
            let roomsCount = r.rooms || 1;
            if (r.areaText && r.areaText.includes('tầng')) {
              const matchF = r.areaText.match(/(\d+)\s*tầng/);
              if (matchF) floors = matchF[1];
              const matchR = r.areaText.match(/(\d+)\s*PN/);
              if (matchR) roomsCount = matchR[1];
            }
            return [
              r.title || '',
              r.houseFloorsText || `Nhà ${floors} tầng`,
              r.address || '',
              floors,
              roomsCount,
              r.priceRaw || '',
              r.nearPlace || '',
              (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
            ];
          });
        } else if (excelCategory === 'o-ghep') {
          headers = ['Dạng', 'Thông tin chi tiết', 'Dạng phòng', 'Địa chỉ', 'Giá đã chia', 'Giới tính', 'Gần địa điểm nào', 'Số điện thoại bạn cùng phòng', 'Mô tả chi tiết'];
          rows = catRooms.map(r => {
            let subCatLabel = 'Phòng trọ';
            if (r.subCategory === 'chung-cu') subCatLabel = 'Chung cư';
            else if (r.subCategory === 'nha-nguyen-can') subCatLabel = 'Nhà nguyên căn';
            return [
              subCatLabel,
              r.title || '',
              r.areaText || '',
              r.address || '',
              r.priceRaw || '',
              r.gender || 'Nam/Nữ',
              r.nearPlace || '',
              r.zaloNumber || '0876480130',
              (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
            ];
          });
        } else if (excelCategory === 'can-ho-dich-vu') {
          headers = ['Thông tin chi tiết', 'Địa chỉ', 'Diện tích', 'Giá', 'Gần địa điểm nào', 'Mô tả chi tiết'];
          rows = catRooms.map(r => [
            r.title || '',
            r.address || '',
            r.areaText || '',
            r.priceRaw || '',
            r.nearPlace || '',
            (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
          ]);
        } else if (excelCategory === 'mat-bang-kinh-doanh') {
          headers = ['Thông tin chi tiết', 'Địa chỉ', 'Diện tích', 'Giá', 'Kinh doanh mảng nào', 'Gần địa điểm nào', 'Mô tả chi tiết'];
          rows = catRooms.map(r => [
            r.title || '',
            r.address || '',
            r.areaText || '',
            r.priceRaw || '',
            r.bizCategory || '',
            r.nearPlace || '',
            (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
          ]);
        } else if (excelCategory === 'pass-phong') {
          headers = ['Tặng bao nhiêu', 'Dạng', 'Thông tin chi tiết', 'Dạng phòng', 'Địa chỉ', 'Giá', 'Gần địa điểm nào', 'Số điện thoại bạn pass phòng', 'Mô tả chi tiết'];
          rows = catRooms.map(r => {
            let subCatLabel = 'Phòng trọ';
            if (r.subCategory === 'chung-cu') subCatLabel = 'Chung cư';
            else if (r.subCategory === 'nha-nguyen-can') subCatLabel = 'Nhà nguyên căn';
            return [
              r.passIncentive || r.badgeText || '',
              subCatLabel,
              r.title || '',
              r.areaText || '',
              r.address || '',
              r.priceRaw || '',
              r.nearPlace || '',
              r.zaloNumber || '0876480130',
              (r.original_text || '').replace(/\r?\n/g, ' ').replace(/\t/g, ' ')
            ];
          });
        }

        const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
        setTsvText(tsv);
        alert(`Đã xuất dữ liệu phân mục ${CATEGORY_LABELS[excelCategory] || (excelCategory === 'referral_list' ? 'CTV giới thiệu' : excelCategory)}. Bạn có thể sao chép dữ liệu trong ô văn bản phía dưới!`);
      })
      .catch(err => {
        console.error(err);
        alert('Không thể xuất danh sách tin đăng từ SQLite!');
      });
  };

  const handleExcelImport = () => {
    if (!tsvText.trim()) {
      alert('Vui lòng dán dữ liệu dạng bảng (TSV) từ Excel vào ô nhập liệu!');
      return;
    }

    const lines = tsvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert('Không tìm thấy dòng dữ liệu nào!');
      return;
    }

    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (
      firstLineLower.includes('thông tin') ||
      firstLineLower.includes('địa chỉ') ||
      firstLineLower.includes('giá') ||
      firstLineLower.includes('tên') ||
      firstLineLower.includes('mã giới thiệu') ||
      firstLineLower.includes('dạng') ||
      firstLineLower.includes('tặng') ||
      firstLineLower.includes('loại giao dịch') ||
      firstLineLower.includes('số điện thoại')
    ) {
      startIndex = 1;
    }

    const parsedItems = [];
    let errorCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split('\t').map(c => c.trim());
      if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

      if (excelCategory === 'transactions_db') {
        if (cols.length < 4) {
          errorCount++;
          continue;
        }
        const phone = cols[0];
        const date = cols[1];
        const type = cols[2];
        const amountStr = cols[3];
        const status = cols[4] || 'Thành công';

        parsedItems.push({
          phone,
          date,
          type,
          amount: amountStr,
          status
        });
        continue;
      }

      if (excelCategory === 'referral_list') {
        if (cols.length < 4) {
          errorCount++;
          continue;
        }
        const refCode = cols[0];
        const name = cols[1];
        const phone = cols[2];
        const date = cols[3];
        const status = cols[4] || 'Chưa đủ điều kiện';
        const commission = cols[5] ? parsePrice(cols[5]) : 0;

        parsedItems.push({
          referralCode: refCode,
          name,
          phone,
          date,
          status,
          commission
        });
        continue;
      }

      let newRoom = {
        category: excelCategory,
        timeText: 'Vừa đăng',
        imageCount: 8,
        zaloNumber: '0876480130'
      };

      if (excelCategory === 'phong-tro') {
        if (cols.length < 4) {
          errorCount++;
          continue;
        }
        const title = cols[0];
        const areaText = cols[1];
        const address = cols[2];
        const priceVal = parsePrice(cols[3]);
        const near = cols[4] || '';
        const description = cols[5] || '';

        newRoom.title = title;
        newRoom.areaText = areaText;
        newRoom.address = address;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.nearPlace = near;
        newRoom.text2 = description;
        newRoom.badgeText = 'Mới đăng';
        newRoom.badgeColor = 'red';
        newRoom.image = NO_IMAGE_PLACEHOLDER;
      }
      else if (excelCategory === 'chung-cu') {
        if (cols.length < 5) {
          errorCount++;
          continue;
        }
        const title = cols[0];
        const buildingName = cols[1];
        const areaText = cols[2];
        const address = cols[3];
        const priceVal = parsePrice(cols[4]);
        const near = cols[5] || '';
        const description = cols[6] || '';

        newRoom.title = title;
        newRoom.buildingName = buildingName;
        newRoom.areaText = areaText;
        newRoom.address = address;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.nearPlace = near;
        newRoom.text2 = description;
        newRoom.badgeText = 'Nổi bật';
        newRoom.badgeColor = 'blue';
        newRoom.image = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600';
      }
      else if (excelCategory === 'nha-nguyen-can') {
        if (cols.length < 6) {
          errorCount++;
          continue;
        }
        const title = cols[0];
        const houseFloorsText = cols[1];
        const address = cols[2];
        const floors = parseInt(cols[3]) || 1;
        const roomsCount = parseInt(cols[4]) || 1;
        const priceVal = parsePrice(cols[5]);
        const near = cols[6] || '';
        const description = cols[7] || '';

        newRoom.title = title;
        newRoom.houseFloorsText = houseFloorsText;
        newRoom.address = address;
        newRoom.floors = floors;
        newRoom.rooms = roomsCount;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.nearPlace = near;
        newRoom.text2 = description;
        newRoom.areaText = `${floors} tầng • ${roomsCount} PN`;
        newRoom.badgeText = 'Nhà đẹp';
        newRoom.badgeColor = 'green';
        newRoom.image = 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=600';
      }
      else if (excelCategory === 'o-ghep') {
        if (cols.length < 7) {
          errorCount++;
          continue;
        }
        const subCatRaw = cols[0];
        const title = cols[1];
        const areaText = cols[2];
        const address = cols[3];
        const priceVal = parsePrice(cols[4]);
        const gender = cols[5] || 'Nam/Nữ';
        const near = cols[6] || '';
        const phoneNum = cols[7] || '0876480130';
        const description = cols[8] || '';

        let subCat = 'phong-tro';
        if (subCatRaw.toLowerCase().includes('chung cư') || subCatRaw.toLowerCase().includes('cc')) {
          subCat = 'chung-cu';
        } else if (subCatRaw.toLowerCase().includes('nguyên căn') || subCatRaw.toLowerCase().includes('nhà')) {
          subCat = 'nha-nguyen-can';
        }

        newRoom.subCategory = subCat;
        newRoom.title = title;
        newRoom.areaText = areaText;
        newRoom.address = address;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.gender = gender;
        newRoom.nearPlace = near;
        newRoom.zaloNumber = phoneNum;
        newRoom.text2 = description;
        newRoom.badgeText = `1 bạn ${gender.toLowerCase()} ở ghép`;
        newRoom.badgeColor = gender === 'Nữ' ? 'purple' : gender === 'Nam' ? 'blue' : 'orange';
        newRoom.image = NO_IMAGE_PLACEHOLDER;
      }
      else if (excelCategory === 'can-ho-dich-vu') {
        if (cols.length < 4) {
          errorCount++;
          continue;
        }
        const title = cols[0];
        const address = cols[1];
        const areaText = cols[2];
        const priceVal = parsePrice(cols[3]);
        const near = cols[4] || '';
        const description = cols[5] || '';

        newRoom.title = title;
        newRoom.address = address;
        newRoom.areaText = areaText;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.nearPlace = near;
        newRoom.text2 = description;
        newRoom.badgeText = 'Kinh doanh';
        newRoom.badgeColor = 'orange';
        newRoom.image = NO_IMAGE_PLACEHOLDER;
      }
      else if (excelCategory === 'mat-bang-kinh-doanh') {
        if (cols.length < 5) {
          errorCount++;
          continue;
        }
        const title = cols[0];
        const address = cols[1];
        const areaText = cols[2];
        const priceVal = parsePrice(cols[3]);
        const bizCategory = cols[4];
        const near = cols[5] || '';
        const description = cols[6] || '';

        newRoom.title = title;
        newRoom.address = address;
        newRoom.areaText = areaText;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.bizCategory = bizCategory;
        newRoom.nearPlace = near;
        newRoom.text2 = description;
        newRoom.badgeText = bizCategory ? `Mặt bằng: ${bizCategory}` : 'Giá tốt';
        newRoom.badgeColor = 'red';
        newRoom.image = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600';
      }
      else if (excelCategory === 'pass-phong') {
        if (cols.length < 7) {
          errorCount++;
          continue;
        }
        const passIncentive = cols[0];
        const subCatRaw = cols[1];
        const title = cols[2];
        const areaText = cols[3];
        const address = cols[4];
        const priceVal = parsePrice(cols[5]);
        const near = cols[6] || '';
        const phoneNum = cols[7] || '0876480130';
        const description = cols[8] || '';

        let subCat = 'phong-tro';
        if (subCatRaw.toLowerCase().includes('chung cư') || subCatRaw.toLowerCase().includes('cc')) {
          subCat = 'chung-cu';
        } else if (subCatRaw.toLowerCase().includes('nguyên căn') || subCatRaw.toLowerCase().includes('nhà')) {
          subCat = 'nha-nguyen-can';
        }

        newRoom.passIncentive = passIncentive;
        newRoom.subCategory = subCat;
        newRoom.title = title;
        newRoom.areaText = areaText;
        newRoom.address = address;
        newRoom.priceRaw = priceVal;
        newRoom.priceText = formatPriceText(priceVal);
        newRoom.nearPlace = near;
        newRoom.zaloNumber = phoneNum;
        newRoom.text2 = description;
        newRoom.badgeText = passIncentive || 'Pass nhanh';
        newRoom.badgeColor = 'orange';
        newRoom.image = NO_IMAGE_PLACEHOLDER;
      }

      if (!newRoom.nearPlace && newRoom.address) {
        const nearestLm = getNearestLandmarks(newRoom.address)[0];
        if (nearestLm) {
          newRoom.nearPlace = nearestLm.name;
          newRoom.distanceText = `Cách ${nearestLm.name.trim()} • ${nearestLm.distText}`;
        }
      } else if (newRoom.nearPlace) {
        newRoom.distanceText = `Gần ${newRoom.nearPlace}`;
      }

      parsedItems.push(newRoom);
    }

    if (parsedItems.length === 0) {
      alert(`Không thể nạp dòng nào. Vui lòng kiểm tra lại cấu trúc cột hoặc số lượng cột nhập vào (Lỗi: ${errorCount} dòng thiếu cột).`);
      return;
    }

    if (excelCategory === 'referral_list') {
      fetch('/api/referrals/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list: parsedItems,
          method: importMethod
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to import referrals');
          return res.json();
        })
        .then(() => fetch('/api/sync-referrals', { method: 'POST' }))
        .then(() => {
          window.dispatchEvent(new Event('storage'));
          alert(`Nạp thành công ${parsedItems.length} CTV giới thiệu vào hệ thống! (Phương thức: ${importMethod === 'overwrite' ? 'Ghi đè' : 'Gộp'}). Lỗi: ${errorCount} dòng.`);
          setTsvText('');
        })
        .catch(err => {
          console.error(err);
          alert('Có lỗi xảy ra khi nạp CTV vào SQLite!');
        });
      return;
    }

    if (excelCategory === 'transactions_db') {
      fetch('/api/transactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list: parsedItems,
          method: importMethod
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to import transactions');
          return res.json();
        })
        .then(() => {
          window.dispatchEvent(new Event('storage'));
          alert(`Nạp thành công ${parsedItems.length} giao dịch vào hệ thống! (Phương thức: ${importMethod === 'overwrite' ? 'Ghi đè' : 'Gộp'}). Lỗi: ${errorCount} dòng.`);
          setTsvText('');
        })
        .catch(err => {
          console.error(err);
          alert('Có lỗi xảy ra khi nạp giao dịch vào SQLite!');
        });
      return;
    }

    if (excelCategory !== 'referral_list' && excelCategory !== 'transactions_db') {
      fetch('/api/rooms/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list: parsedItems,
          category: excelCategory,
          method: importMethod
        })
      })
        .then(res => {
          if (!res.ok) throw new Error();
          alert(`Nạp thành công ${parsedItems.length} tin đăng của phân mục ${CATEGORY_LABELS[excelCategory] || excelCategory}! (Phương thức: ${importMethod === 'overwrite' ? 'Ghi đè' : 'Gộp'}). Lỗi: ${errorCount} dòng.`);
          setTsvText('');
          if (refreshRooms) refreshRooms();
          setListingsTab('approved');
          fetchAdminRooms('approved');
        })
        .catch(() => alert('Có lỗi xảy ra khi nạp tin đăng vào SQLite!'));
      return;
    }
  };

  const handleClearCategory = () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu của phân mục "${CATEGORY_LABELS[excelCategory] || (excelCategory === 'referral_list' ? 'CTV giới thiệu' : excelCategory === 'transactions_db' ? 'Lịch sử giao dịch' : excelCategory)}"? Thao tác này không thể hoàn tác!`)) {
      if (excelCategory === 'referral_list') {
        fetch('/api/referrals/clear', { method: 'POST' })
          .then(() => {
            window.dispatchEvent(new Event('storage'));
            alert('Đã xóa toàn bộ danh sách CTV giới thiệu.');
          })
          .catch(err => {
            console.error(err);
            alert('Lỗi khi xóa danh sách CTV!');
          });
      } else if (excelCategory === 'transactions_db') {
        fetch('/api/transactions/clear', { method: 'POST' })
          .then(() => {
            window.dispatchEvent(new Event('storage'));
            alert('Đã xóa toàn bộ lịch sử giao dịch.');
          })
          .catch(err => {
            console.error(err);
            alert('Lỗi khi xóa lịch sử giao dịch!');
          });
      } else {
        fetch('/api/rooms/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            list: [],
            category: excelCategory,
            method: 'overwrite'
          })
        })
          .then(res => {
            if (!res.ok) throw new Error();
            alert(`Đã xóa toàn bộ tin đăng thuộc phân mục ${CATEGORY_LABELS[excelCategory] || excelCategory}.`);
            setTsvText('');
            if (refreshRooms) refreshRooms();
            fetchAdminRooms(listingsTab);
          })
          .catch(() => alert('Lỗi khi xóa tin đăng!'));
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title || !address || !priceRaw || !priceText || !areaText) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    // Auto set badge for Ở ghép or Pass phòng if user didn't change default
    let finalBadgeText = badgeText;
    let finalBadgeColor = badgeColor;
    if (category === 'o-ghep') {
      finalBadgeText = `1 bạn ${gender.toLowerCase()} ở ghép`;
      finalBadgeColor = gender === 'Nữ' ? 'purple' : gender === 'Nam' ? 'blue' : 'orange';
    } else if (category === 'pass-phong') {
      finalBadgeText = passIncentive || 'TẶNG 200K';
      finalBadgeColor = 'orange';
    }

    // Photos payload
    const photos = uploadedFiles
      .filter(f => f.mimetype && f.mimetype.startsWith('image'))
      .map(f => ({ url: f.url }));
    // If no photos uploaded but we have `image`, use `image`
    if (photos.length === 0 && image) {
      photos.push({ url: image });
    }

    // Videos payload
    const videos = uploadedFiles
      .filter(f => f.mimetype && f.mimetype.startsWith('video'))
      .map(f => ({ url: f.url, thumb: '' }));

    const finalNearPlace = customLandmarks && customLandmarksList.length > 0 && customLandmarksList[0].name
      ? customLandmarksList[0].name
      : (nearPlace || 'Khu vực trung tâm');

    const finalDistanceText = customLandmarks && customLandmarksList.length > 0 && customLandmarksList[0].name
      ? `Cách ${customLandmarksList[0].name} • ${customLandmarksList[0].distanceText || '800m'}`
      : (distanceText || 'Cách khu trung tâm • 1km');

    const roomPayload = {
      category,
      title,
      address,
      nearPlace: finalNearPlace,
      distanceText: finalDistanceText,
      priceRaw: parseFloat(priceRaw),
      priceText,
      areaText,
      badgeText: finalBadgeText,
      badgeColor: finalBadgeColor,
      zaloNumber: zaloNumber || '0876480130',
      image: image || NO_IMAGE_PLACEHOLDER,
      photos,
      videos,
      text2: description,
      ...(category === 'o-ghep' && { subCategory, gender }),
      ...(category === 'pass-phong' && { passIncentive }),
      customLandmarks: customLandmarks ? customLandmarksList.filter(lm => lm.name.trim()) : undefined,
      actor_phone: user?.phone,
      actor_name: user?.name
    };

    fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        alert('Đăng tin thành công! Tin đăng mới đã được hiển thị trên hệ thống.');
        if (refreshRooms) refreshRooms();

        // Reset Form
        setTitle('');
        setAddress('');
        setNearPlace('');
        setDistanceText('Cách trường gần nhất • 800m');
        setPriceRaw('');
        setPriceText('');
        setAreaText('');
        setBadgeText('Mới đăng');
        setImage(SUGGESTED_IMAGES[0].url);
        setDescription('');
        setUploadedFiles([]);
        setCustomLandmarks(false);
        setCustomLandmarksList([{ name: '', distanceText: '' }]);

        // Switch to listing list
        setListingsTab('approved');
        setActiveTab('list');
        fetchAdminRooms('approved');
      })
      .catch(() => alert('Có lỗi xảy ra khi đăng tin vào cơ sở dữ liệu!'));
  };

  return (
    <div style={{ paddingBottom: '80px', fontFamily: 'var(--font-main)' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '8px',
              padding: 0
            }}
          >
            <ArrowLeft size={14} />
            <span>Về Trang chủ</span>
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            {user?.role === 'admin' ? 'Trang Quản lý Admin' : 'Kênh Cộng Tác Viên'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {user?.role === 'admin'
              ? 'Hệ thống quản lý tin đăng, thêm phòng ở ghép và pass phòng.'
              : 'Đăng tin tìm người ở ghép, pass phòng, cho thuê & chỉnh sửa thông tin phòng.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`form-submit-btn ${activeTab === 'list' ? '' : 'form-submit-btn-outline'}`}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'list' ? 'var(--primary-red)' : 'transparent', color: activeTab === 'list' ? '#FFFFFF' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
            onClick={() => setActiveTab('list')}
          >
            Danh sách tin đăng
          </button>
          <button
            className={`form-submit-btn ${activeTab === 'add' ? '' : 'form-submit-btn-outline'}`}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'add' ? 'var(--primary-red)' : 'transparent', color: activeTab === 'add' ? '#FFFFFF' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
            onClick={() => {
              setActiveTab('add');
              if (user && user.role === 'ctv') {
                setCategory('o-ghep');
              }
            }}
          >
            <Plus size={16} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
            Đăng tin mới
          </button>

          {(!user || user.role === 'admin') && (
            <>
              <button
                className={`form-submit-btn ${activeTab === 'ctv' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'ctv' ? 'var(--primary-red)' : 'transparent', color: activeTab === 'ctv' ? '#FFFFFF' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('ctv')}
              >
                <Users2 size={16} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
                Danh sách CTV
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'transactions' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'transactions' ? 'var(--primary-red)' : 'transparent', color: activeTab === 'transactions' ? '#FFFFFF' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('transactions')}
              >
                <DollarSign size={16} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
                Giao dịch & Rút tiền
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'settings' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'settings' ? 'var(--primary-red)' : 'transparent', color: activeTab === 'settings' ? '#FFFFFF' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
                Cấu hình hệ thống
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'ref-friends' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'ref-friends' ? '#7C3AED' : 'transparent', color: activeTab === 'ref-friends' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('ref-friends')}
              >
                👥 Ref / Bạn Bè
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'traffic' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'traffic' ? '#0284C7' : 'transparent', color: activeTab === 'traffic' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('traffic')}
              >
                📊 Traffic
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'user-accounts' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'user-accounts' ? '#D97706' : 'transparent', color: activeTab === 'user-accounts' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('user-accounts')}
              >
                🏦 Tài Khoản User
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'ctv-accounts' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'ctv-accounts' ? '#DB2777' : 'transparent', color: activeTab === 'ctv-accounts' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('ctv-accounts')}
              >
                👔 Thêm CTV
              </button>
              <button
                className={`form-submit-btn ${activeTab === 'bot-management' ? '' : 'form-submit-btn-outline'}`}
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'bot-management' ? '#4F46E5' : 'transparent', color: activeTab === 'bot-management' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => setActiveTab('bot-management')}
              >
                🤖 Quản lý Bot
              </button>
            </>
          )}

          <button
            className={`form-submit-btn ${activeTab === 'all-rooms' ? '' : 'form-submit-btn-outline'}`}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'all-rooms' ? '#0F172A' : 'transparent', color: activeTab === 'all-rooms' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
            onClick={() => setActiveTab('all-rooms')}
          >
            🏘️ Tất Cả Phòng
          </button>
          <button
            className={`form-submit-btn ${activeTab === 'commission' ? '' : 'form-submit-btn-outline'}`}
            style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'commission' ? '#059669' : 'transparent', color: activeTab === 'commission' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
            onClick={() => setActiveTab('commission')}
          >
            💰 Hoa Hồng
          </button>

          {(!user || user.role === 'admin') && (
            <button
              className={`form-submit-btn ${activeTab === 'activity-logs' ? '' : 'form-submit-btn-outline'}`}
              style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', backgroundColor: activeTab === 'activity-logs' ? '#0284C7' : 'transparent', color: activeTab === 'activity-logs' ? '#fff' : 'var(--text-dark)', borderColor: '#CBD5E1' }}
              onClick={() => setActiveTab('activity-logs')}
            >
              📜 Nhật ký CTV
            </button>
          )}
        </div>

      </div>

      {/* Stats Counter Boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#1E40AF', letterSpacing: '0.5px' }}>Tổng tin đăng</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#1E3A8A' }}>{totalCount}</span>
            <Building2 size={24} style={{ color: '#3B82F6', opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', padding: '16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#6B21A8', letterSpacing: '0.5px' }}>Tìm Ở Ghép</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#581C87' }}>{oghepCount}</span>
            <Users2 size={24} style={{ color: '#A855F7', opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#9A3412', letterSpacing: '0.5px' }}>Pass Phòng</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#7C2D12' }}>{passCount}</span>
            <KeyRound size={24} style={{ color: '#F97316', opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.5px' }}>Các mục khác</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#14532D' }}>{otherCount}</span>
            <TrendingUp size={24} style={{ color: '#22C55E', opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Tab: LIST OF LISTINGS */}
      {activeTab === 'list' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {/* Sub-tabs for post approvals: Pending, Approved, Rejected */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '8px'
            }}>
              {[
                { key: 'pending', label: 'Chờ duyệt', color: '#D97706', bgColor: '#FEF3C7' },
                { key: 'approved', label: 'Đã duyệt', color: '#16A34A', bgColor: '#DCFCE7' },
                { key: 'rejected', label: 'Từ chối', color: '#DC2626', bgColor: '#FEE2E2' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setListingsTab(tab.key)}
                  style={{
                    border: 'none',
                    background: listingsTab === tab.key ? '#FFFFFF' : 'transparent',
                    color: listingsTab === tab.key ? 'var(--text-dark)' : 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: listingsTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tab.color
                  }} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={listingSearchQuery}
                onChange={(e) => setListingSearchQuery(e.target.value)}
                placeholder="Tìm theo ID, địa chỉ, loại phòng, CTV..."
                style={{
                  padding: '8px 14px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  width: '260px',
                  maxWidth: '100%',
                  outline: 'none',
                  fontFamily: 'var(--font-main)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-red)'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Tìm thấy {filteredAdminRooms.length} tin đăng {listingsTab === 'pending' ? 'đang chờ duyệt' : listingsTab === 'approved' ? 'đã duyệt' : 'bị từ chối'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loadingRooms ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                Đang tải danh sách tin đăng...
              </div>
            ) : filteredAdminRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
                {adminRooms.length === 0 ? 'Không có tin đăng nào thuộc trạng thái này.' : 'Không tìm thấy kết quả phù hợp.'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '60px' }}>ID</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '100px' }}>Ảnh mẫu</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Tiêu đề / Địa chỉ</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '130px' }}>Danh mục</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '120px' }}>Giá thuê</th>
                    {(!user || user.role === 'admin') && <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '140px', textAlign: 'center' }}>Phê duyệt</th>}
                    {(!user || user.role === 'admin') && <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '80px', textAlign: 'center' }}>Xóa</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminRooms.map((room) => (
                    <tr key={room.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{room.id}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <img
                          src={room.image || NO_IMAGE_PLACEHOLDER}
                          alt=""
                          style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#E2E8F0' }}
                        />
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>{room.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} style={{ color: 'var(--primary-red)' }} />
                          <span>{room.address}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: room.category === 'o-ghep' ? '#FAF5FF' : room.category === 'pass-phong' ? '#FFF7ED' : '#F1F5F9',
                          color: room.category === 'o-ghep' ? '#6B21A8' : room.category === 'pass-phong' ? '#C2410C' : '#334155'
                        }}>
                          {CATEGORY_LABELS[room.category] || room.category}
                        </span>
                      </td>
                      <td className="admin-room-price" style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: 'var(--primary-red)', fontFamily: 'var(--font-main)' }}>
                        {room.priceText}
                      </td>
                      {(!user || user.role === 'admin') && (
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {listingsTab === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveRoom(room.id)}
                                  style={{
                                    border: 'none',
                                    backgroundColor: '#DCFCE7',
                                    color: '#16A34A',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectRoom(room.id)}
                                  style={{
                                    border: 'none',
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            {listingsTab === 'approved' && (
                              <>
                                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 800 }}>Đã duyệt ✓</span>
                                <button
                                  onClick={() => handleRejectRoom(room.id)}
                                  style={{
                                    border: '1px solid #FCA5A5',
                                    background: 'none',
                                    color: '#DC2626',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                  }}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            {listingsTab === 'rejected' && (
                              <>
                                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800 }}>Đã từ chối ✗</span>
                                <button
                                  onClick={() => handleApproveRoom(room.id)}
                                  style={{
                                    border: '1px solid #86EFAC',
                                    background: 'none',
                                    color: '#16A34A',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                  }}
                                >
                                  Duyệt lại
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      {(!user || user.role === 'admin') && (
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteListing(room.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: CTV LIST */}
      {activeTab === 'ctv' && (!user || user.role === 'admin') && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Quản lý CTV & Giới thiệu</h3>
            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo SĐT, mã CTV..."
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px', width: '250px', margin: 0 }}
                value={searchReferral}
                onChange={(e) => setSearchReferral(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loadingReferrals ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                Đang tải danh sách CTV...
              </div>
            ) : referrals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Không có dữ liệu CTV nào.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Mã Giới Thiệu</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Người đăng ký (Ref)</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Số điện thoại</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Ngày đăng ký</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '220px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '180px' }}>Hoa hồng</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals
                    .filter(ref => {
                      const q = searchReferral.toLowerCase();
                      return (
                        (ref.referralCode || '').toLowerCase().includes(q) ||
                        (ref.name || '').toLowerCase().includes(q) ||
                        (ref.phone || '').toLowerCase().includes(q) ||
                        (ref.status || '').toLowerCase().includes(q)
                      );
                    })
                    .map((ref) => (
                      <tr key={ref.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: 'var(--primary-red)' }}>
                          {ref.referralCode}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700 }}>
                          {ref.name}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {ref.phone}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {ref.date}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <select
                            value={ref.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const newComm = newStatus === 'Đã kiếm được tiền' ? (settings?.referral_commission || 300000) : 0;
                              handleUpdateReferralStatus(ref.id, newStatus, newComm);
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              backgroundColor: ref.status === 'Đã kiếm được tiền' ? '#DCFCE7' : '#FEF3C7',
                              color: ref.status === 'Đã kiếm được tiền' ? '#16A34A' : '#D97706'
                            }}
                          >
                            <option value="Chưa đủ điều kiện">Chưa đủ điều kiện</option>
                            <option value="Đã kiếm được tiền">Đã kiếm được tiền</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 800, color: 'var(--primary-red)' }}>
                          {ref.status === 'Đã kiếm được tiền' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={ref.commission}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setReferrals(prev => prev.map(item => item.id === ref.id ? { ...item, commission: val } : item));
                                }}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleUpdateReferralStatus(ref.id, ref.status, val);
                                }}
                                style={{
                                  width: '90px',
                                  padding: '4px 6px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '4px',
                                  color: 'var(--primary-red)'
                                }}
                              />
                              <span>đ</span>
                            </div>
                          ) : (
                            '0đ'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: TRANSACTIONS & WITHDRAWALS */}
      {activeTab === 'transactions' && (!user || user.role === 'admin') && (() => {
        // Pending withdrawals: chờ duyệt
        const pendingWithdrawals = transactions.filter(tx => tx.type === 'Rút tiền' && (tx.status === 'Đang xử lý' || tx.status === 'Yêu cầu'));

        // All withdrawals: tất cả đơn rút tiền (kể cả đã duyệt/từ chối)
        const allWithdrawals = transactions.filter(tx => tx.type === 'Rút tiền');

        // All history: tất cả giao dịch với search filter
        const filteredHistory = transactions.filter(tx => {
          const q = searchTransaction.toLowerCase();
          if (!q) return true;
          return (
            (tx.phone || '').toLowerCase().includes(q) ||
            (tx.type || '').toLowerCase().includes(q) ||
            (tx.status || '').toLowerCase().includes(q) ||
            (tx.amount || '').toLowerCase().includes(q) ||
            (tx.date || '').toLowerCase().includes(q)
          );
        });

        const currentList = txSubTab === 'pending' ? pendingWithdrawals : txSubTab === 'withdrawals' ? allWithdrawals : filteredHistory;

        return (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {/* Sub-Tab Navigation Toggles */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '16px 24px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid var(--border-light)',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setTxSubTab('pending')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: txSubTab === 'pending' ? '#DC2626' : 'transparent',
                  color: txSubTab === 'pending' ? '#FFFFFF' : 'var(--text-dark)',
                  transition: 'all 0.2s',
                  boxShadow: txSubTab === 'pending' ? '0 2px 6px rgba(220,38,38,0.3)' : 'none'
                }}
              >
                ⏳ Chờ duyệt ({pendingWithdrawals.length})
              </button>
              <button
                onClick={() => setTxSubTab('withdrawals')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: txSubTab === 'withdrawals' ? '#2563EB' : 'transparent',
                  color: txSubTab === 'withdrawals' ? '#FFFFFF' : 'var(--text-dark)',
                  transition: 'all 0.2s',
                  boxShadow: txSubTab === 'withdrawals' ? '0 2px 6px rgba(37,99,235,0.3)' : 'none'
                }}
              >
                💸 Đơn rút tiền ({allWithdrawals.length})
              </button>
              <button
                onClick={() => setTxSubTab('history')}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: txSubTab === 'history' ? '#16A34A' : 'transparent',
                  color: txSubTab === 'history' ? '#FFFFFF' : 'var(--text-dark)',
                  transition: 'all 0.2s',
                  boxShadow: txSubTab === 'history' ? '0 2px 6px rgba(22,163,74,0.3)' : 'none'
                }}
              >
                📋 Lịch sử GD ({transactions.length})
              </button>
            </div>

            {/* Header for Title + Search */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              borderBottom: '1px solid var(--border-light)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                {txSubTab === 'pending' && '⏳ Yêu cầu rút tiền chờ duyệt'}
                {txSubTab === 'withdrawals' && '💸 Tất cả đơn rút tiền'}
                {txSubTab === 'history' && '📋 Lịch sử tất cả giao dịch'}
              </h3>
              {(txSubTab === 'history' || txSubTab === 'withdrawals') && (
                <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm SĐT, loại GD, giá trị..."
                    className="form-input"
                    style={{ padding: '7px 12px', fontSize: '13px', width: isMobile ? '100%' : '240px', margin: 0 }}
                    value={searchTransaction}
                    onChange={(e) => setSearchTransaction(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Table or Empty State */}
            <div style={{ overflowX: 'auto' }}>
              {loadingTransactions ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  Đang tải dữ liệu giao dịch...
                </div>
              ) : currentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {txSubTab === 'pending' && 'Không có yêu cầu rút tiền nào đang chờ duyệt.'}
                  {txSubTab === 'withdrawals' && 'Chưa có đơn rút tiền nào.'}
                  {txSubTab === 'history' && 'Không tìm thấy giao dịch nào.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Số điện thoại</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Thời gian</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Loại giao dịch</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Số tiền</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Tài khoản nhận</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                      {(txSubTab === 'pending' || txSubTab === 'withdrawals') && (
                        <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '200px' }}>Hành động</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((tx) => {
                      let bankDetails = null;
                      if (tx.note) {
                        try {
                          const parsed = JSON.parse(tx.note);
                          if (parsed && parsed.accountNum) {
                            bankDetails = parsed;
                          }
                        } catch (e) { }
                      }
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '8px 12px', fontSize: '12.5px', fontWeight: 700 }}>
                            {tx.phone}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                            {tx.date}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '12.5px', fontWeight: 600 }}>
                            {tx.type}
                          </td>
                          <td style={{
                            padding: '8px 12px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: tx.amount.startsWith('+') ? 'var(--success-green)' : 'var(--primary-red)'
                          }}>
                            {tx.amount}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '12.5px' }}>
                            {bankDetails ? (
                              <div style={{ lineHeight: '1.3' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '12px' }}>{bankDetails.bankName}</div>
                                <div style={{ fontSize: '11px' }}>STK: <span style={{ fontWeight: 600, color: 'var(--zalo-blue)' }}>{bankDetails.accountNum}</span></div>
                                <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{bankDetails.accountName}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>{tx.note || '—'}</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              backgroundColor: tx.status === 'Thành công' ? '#DCFCE7' : tx.status === 'Từ chối' ? '#FEE2E2' : '#FEF3C7',
                              color: tx.status === 'Thành công' ? '#16A34A' : tx.status === 'Từ chối' ? '#DC2626' : '#D97706'
                            }}>
                              {tx.status}
                            </span>
                          </td>
                          {(txSubTab === 'pending' || txSubTab === 'withdrawals') && (() => {
                            const isPending = tx.status === 'Đang xử lý' || tx.status === 'Yêu cầu';
                            return (
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'Thành công')}
                                        style={{
                                          border: 'none',
                                          backgroundColor: '#DCFCE7',
                                          color: '#16A34A',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        Duyệt
                                      </button>
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'Từ chối')}
                                        style={{
                                          border: 'none',
                                          backgroundColor: '#FEE2E2',
                                          color: '#DC2626',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        Từ chối
                                      </button>
                                    </>
                                  )}
                                  {bankDetails && (
                                    <button
                                      onClick={() => {
                                        const amountVal = tx.amount.replace(/\D/g, '');
                                        const desc = `Thanh toan CTV ${tx.phone} rut tien`;
                                        const qrUrl = `https://img.vietqr.io/image/${bankDetails.bankCode}-${bankDetails.accountNum}-compact2.jpg?amount=${amountVal}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(bankDetails.accountName)}`;
                                        setActiveQrCodeUrl({
                                          url: qrUrl,
                                          bankName: bankDetails.bankName,
                                          accountNum: bankDetails.accountNum,
                                          accountName: bankDetails.accountName,
                                          displayAmount: tx.amount.replace(/[-+]/g, ''),
                                          description: desc
                                        });
                                      }}
                                      style={{
                                        border: 'none',
                                        backgroundColor: '#EBF3FF',
                                        color: 'var(--zalo-blue)',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Mã VietQR
                                    </button>
                                  )}
                                  {!isPending && !bankDetails && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>—</span>}
                                </div>
                              </td>
                            );
                          })()}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab: ADD NEW LISTING */}
      {activeTab === 'add' && addFlowStep === 'choose' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          padding: isMobile ? '20px' : '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
            BẠN MUỐN ĐĂNG TIN THỂ LOẠI NÀO?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '28px' }}>
            Vui lòng chọn đúng danh mục để hệ thống tối ưu hóa biểu mẫu hiển thị và trường dữ liệu phù hợp.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Card 1: Pass phòng */}
            <div
              onClick={() => {
                setCategory('pass-phong');
                setAddFlowStep('form');
              }}
              style={{
                border: '1px solid #FED7AA',
                backgroundColor: '#FFF7ED',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(249, 115, 22, 0.1)';
                e.currentTarget.style.borderColor = '#F97316';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#FED7AA';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FFEDD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#EA580C'
              }}>
                <RefreshCw size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#C2410C', marginBottom: '8px' }}>
                Pass phòng (Chuyển nhượng)
              </h4>
              <p style={{ fontSize: '12.5px', color: '#7C2D12', lineHeight: '1.5', margin: 0 }}>
                Nhượng lại phòng trọ đang thuê, tặng/chiết khấu tiền cọc hoặc giảm tiền thuê tháng đầu cho người thuê sau.
              </p>
            </div>

            {/* Card 2: Ở ghép */}
            <div
              onClick={() => {
                setCategory('o-ghep');
                setAddFlowStep('form');
              }}
              style={{
                border: '1px solid #E9D5FF',
                backgroundColor: '#FAF5FF',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(168, 85, 247, 0.1)';
                e.currentTarget.style.borderColor = '#A855F7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#E9D5FF';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#9333EA'
              }}>
                <Users2 size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#6B21A8', marginBottom: '8px' }}>
                Tìm người ở ghép
              </h4>
              <p style={{ fontSize: '12.5px', color: '#4A044E', lineHeight: '1.5', margin: 0 }}>
                Tìm bạn cùng chia sẻ không gian sống và chi phí phòng trọ, chung cư, chung cư mini, nhà nguyên căn.
              </p>
            </div>

            {/* Card 3: Khác (Cho phép Admin/CTV) */}
            {(!user || user.role === 'admin' || user.role === 'ctv') && (
              <div
                onClick={() => {
                  setCategory('phong-tro');
                  setAddFlowStep('form');
                }}
                style={{
                  border: '1px solid #BAE6FD',
                  backgroundColor: '#F0F9FF',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.borderColor = '#0EA5E9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#BAE6FD';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#0284C7'
                }}>
                  <Building2 size={28} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0369A1', marginBottom: '8px' }}>
                  Đăng tin cho thuê khác (Admin/CTV)
                </h4>
                <p style={{ fontSize: '12.5px', color: '#0C4A6E', lineHeight: '1.5', margin: 0 }}>
                  Đăng các tin phòng trọ thường, chung cư mini, căn hộ dịch vụ, nhà nguyên căn, hoặc mặt bằng kinh doanh.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add' && addFlowStep === 'form' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          padding: isMobile ? '20px' : '32px'
        }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setAddFlowStep('choose')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-red)',
              cursor: 'pointer',
              marginBottom: '16px',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại chọn danh mục</span>
          </button>

          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            {category === 'pass-phong' ? 'Đăng tin mới: Pass phòng (Chuyển nhượng)' : category === 'o-ghep' ? 'Đăng tin mới: Tìm người ở ghép' : `Đăng tin mới: Cho thuê (${CATEGORY_LABELS[category] || category})`}
          </h3>

          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>

              {/* Category selector inside form for generic Admin rentals */}
              {category !== 'o-ghep' && category !== 'pass-phong' && (
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Chọn phân loại cho thuê <span style={{ color: 'red' }}>*</span></label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="phong-tro">Phòng trọ</option>
                    <option value="chung-cu">Chung cư</option>
                    <option value="nha-nguyen-can">Nhà nguyên căn</option>
                    <option value="can-ho-dich-vu">Căn hộ dịch vụ</option>
                    <option value="mat-bang-kinh-doanh">Mặt bằng kinh doanh</option>
                  </select>
                </div>
              )}

              {/* Title */}
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Tiêu đề tin đăng <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={category === 'pass-phong' ? "Ví dụ: Pass phòng trọ khép kín full đồ ban công thoáng..." : category === 'o-ghep' ? "Ví dụ: Tìm bạn nữ ở ghép phòng trọ Cầu Giấy..." : "Ví dụ: Studio full nội thất ban công rộng..."}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Địa chỉ chi tiết <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Số nhà, ngõ, đường, quận/huyện, Hà Nội"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Checkbox for custom landmarks */}
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="custom-landmarks-checkbox"
                  checked={customLandmarks}
                  onChange={(e) => setCustomLandmarks(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="custom-landmarks-checkbox" style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-dark)' }}>
                  Tùy chỉnh thủ công vị trí gần nhất (nếu định vị tự động không chính xác)
                </label>
              </div>

              {/* Custom landmarks list */}
              {customLandmarks ? (
                <div style={{ gridColumn: isMobile ? 'auto' : 'span 2', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>📍 Danh sách địa điểm gần nhất</h5>
                    <button
                      type="button"
                      onClick={() => setCustomLandmarksList(prev => [...prev, { name: '', distanceText: '' }])}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#0284C7', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ➕ Thêm địa điểm
                    </button>
                  </div>
                  {customLandmarksList.map((lm, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: idx === customLandmarksList.length - 1 ? 0 : '8px' }}>
                      <input
                        type="text"
                        placeholder="Tên địa điểm (Vd: ĐH Bách Khoa HN)"
                        value={lm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomLandmarksList(prev => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], name: val };
                            return next;
                          });
                        }}
                        style={{ flex: 1, padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        placeholder="Khoảng cách (Vd: 800m, 1.2 km)"
                        value={lm.distanceText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomLandmarksList(prev => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], distanceText: val };
                            return next;
                          });
                        }}
                        style={{ width: '180px', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                      />
                      {customLandmarksList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCustomLandmarksList(prev => prev.filter((_, i) => i !== idx))}
                          style={{ padding: '8px 10px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Price Raw & price text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Giá tiền thuê (số đ) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ví dụ: 3500000"
                    required
                    value={priceRaw}
                    onChange={handlePriceRawChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Giá hiển thị (chữ) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tự sinh: 3.5 triệu/tháng"
                    required
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                  />
                </div>
              </div>

              {/* AreaText / Zalo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Diện tích / Mô tả diện tích <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: 25m² hoặc 2 phòng ngủ"
                    required
                    value={areaText}
                    onChange={(e) => setAreaText(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Số điện thoại liên hệ Zalo <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập SĐT chốt phòng"
                    required
                    value={zaloNumber}
                    onChange={(e) => setZaloNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* DYNAMIC PART FOR o-ghep (Ở ghép) */}
              {category === 'o-ghep' && (
                <div style={{
                  gridColumn: isMobile ? 'auto' : 'span 2',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '16px'
                }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: '#6B21A8' }}>Loại hình nhà ghép <span style={{ color: 'red' }}>*</span></label>
                    <select
                      className="form-input"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      style={{ cursor: 'pointer', borderColor: '#D8B4FE' }}
                    >
                      <option value="phong-tro">Phòng trọ</option>
                      <option value="chung-cu">Chung cư</option>
                      <option value="nha-nguyen-can">Nhà nguyên căn</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: '#6B21A8' }}>Giới tính yêu cầu <span style={{ color: 'red' }}>*</span></label>
                    <select
                      className="form-input"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ cursor: 'pointer', borderColor: '#D8B4FE' }}
                    >
                      <option value="Nam">Chỉ tuyển Nam</option>
                      <option value="Nữ">Chỉ tuyển Nữ</option>
                      <option value="Nam/Nữ">Không yêu cầu giới tính (Nam/Nữ)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* DYNAMIC PART FOR pass-phong (Pass phòng) */}
              {category === 'pass-phong' && (
                <div style={{
                  gridColumn: isMobile ? 'auto' : 'span 2',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#C2410C' }}>Quà tặng / Chiết khấu Pass phòng <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: TẶNG 200K, TẶNG 1 THÁNG TIỀN PHÒNG..."
                      required
                      style={{ borderColor: '#FDBA74' }}
                      value={passIncentive}
                      onChange={(e) => setPassIncentive(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Custom badge setting for admin's other categories */}
              {category !== 'o-ghep' && category !== 'pass-phong' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <div className="form-group">
                    <label className="form-label">Nhãn hiển thị (Badge)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Mới đăng, Giá tốt..."
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Màu nhãn hiển thị</label>
                    <select
                      className="form-input"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="red">Đỏ (Mới)</option>
                      <option value="blue">Xanh dương (Nổi bật)</option>
                      <option value="green">Xanh lá (Giá tốt)</option>
                      <option value="orange">Cam (Ưu đãi)</option>
                      <option value="purple">Tím (Premium)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Detailed Description */}
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Mô tả chi tiết</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Nhập mô tả chi tiết phòng trọ, trang thiết bị, tiện ích..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                />
              </div>

              {/* Premium Multi-media Upload Area */}
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Tải lên Ảnh / Video căn hộ <span style={{ color: 'red' }}>*</span></label>

                {/* File Upload Box */}
                <div
                  onClick={() => document.getElementById('media-upload-input').click()}
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#F8FAFC',
                    transition: 'all 0.2s ease',
                    marginBottom: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-red)';
                    e.currentTarget.style.backgroundColor = '#FFF5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <input
                    id="media-upload-input"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleUploadFiles}
                  />
                  <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', marginBottom: '12px' }}>
                    <ImageIcon size={24} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 4px 0' }}>
                    Click để tải lên ảnh hoặc video
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Hỗ trợ tải lên nhiều tệp (ảnh và video tối đa 50MB)
                  </p>
                </div>

                {/* Upload Loader */}
                {uploadLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-red)', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                    <div className="spinner" style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(230, 30, 37, 0.2)',
                      borderTopColor: 'var(--primary-red)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>Đang upload tệp lên máy chủ...</span>
                  </div>
                )}

                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>

                {/* Uploaded Gallery Grid */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      DANH SÁCH TỆP ĐÃ TẢI LÊN ({uploadedFiles.length} tệp, click ảnh để chọn làm ảnh bìa):
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                      {uploadedFiles.map((file, idx) => {
                        const isImage = file.mimetype && file.mimetype.startsWith('image');
                        const isCover = image === file.url;

                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              aspectRatio: '4/3',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isCover ? '3px solid var(--primary-red)' : '1px solid var(--border-color)',
                              boxShadow: 'var(--shadow-sm)',
                              backgroundColor: '#000000',
                              cursor: isImage ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (isImage) {
                                setImage(file.url);
                              }
                            }}
                          >
                            {isImage ? (
                              <img
                                src={file.url}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', padding: '4px' }}>
                                <span style={{ fontSize: '18px' }}>🎥</span>
                                <span style={{ fontSize: '9px', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                                  {file.originalName || 'Video'}
                                </span>
                              </div>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUploadedFile(idx);
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                border: 'none',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '12px',
                                zIndex: 2,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            >
                              ✕
                            </button>

                            {/* Cover Badge */}
                            {isCover && (
                              <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                right: '0',
                                backgroundColor: 'var(--primary-red)',
                                color: '#FFFFFF',
                                fontSize: '9px',
                                fontWeight: 800,
                                textAlign: 'center',
                                padding: '2px 0',
                                zIndex: 1
                              }}>
                                ẢNH BÌA
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested image presets */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    💡 Ý TƯỞNG ẢNH ĐẸP GỢI Ý (CLICK ĐỂ THÊM VÀO TIN):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
                    {SUGGESTED_IMAGES.map((img, idx) => {
                      const isAddedAndCover = image === img.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPresetImage(img.url)}
                          style={{
                            border: isAddedAndCover ? '2px solid var(--primary-red)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            backgroundColor: isAddedAndCover ? 'rgba(230, 30, 37, 0.04)' : '#FFFFFF',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <img src={img.url} alt="" style={{ width: '32px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {img.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="form-submit-btn form-submit-btn-outline"
                style={{ width: 'auto', padding: '12px 28px', color: 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn hủy và trở lại danh sách?')) {
                    setAddFlowStep('choose');
                    setActiveTab('list');
                  }
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="form-submit-btn form-submit-btn-red"
                style={{ width: 'auto', padding: '12px 36px', backgroundColor: 'var(--primary-red)' }}
              >
                Đăng tin ngay
              </button>
            </div>

          </form>
        </div>
      )}


      {activeTab === 'settings' && (!user || user.role === 'admin') && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          padding: isMobile ? '20px' : '32px'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>
              Cấu hình thông số Hệ thống
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Thay đổi hạn mức rút tiền, tiền hoa hồng giới thiệu, và cài đặt các mốc view/thưởng cho chiến dịch TikTok.
            </p>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>

              {/* Wallet settings */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} style={{ color: 'var(--success-green)' }} />
                  Cấu hình Ví & Rút tiền
                </h4>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Số tiền rút tối thiểu (đ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Hoa hồng giới thiệu bạn bè (đ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={referralCommission}
                    onChange={(e) => setReferralCommission(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              {/* TikTok campaign settings */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} style={{ color: 'var(--primary-red)' }} />
                  Cấu hình Cơ chế TikTok
                </h4>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Tiền cứng mỗi video (đ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tiktokBaseReward}
                    onChange={(e) => setTiktokBaseReward(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Thưởng xu hướng tối đa (đ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tiktokMaxReward}
                    onChange={(e) => setTiktokMaxReward(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              {/* Admin contact settings */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Settings size={16} style={{ color: 'var(--zalo-blue)' }} />
                  Thông tin liên hệ Admin
                </h4>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Link Facebook Admin</label>
                  <input
                    type="url"
                    className="form-input"
                    value={adminFbLink}
                    onChange={(e) => setAdminFbLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Link Zalo Admin</label>
                  <input
                    type="url"
                    className="form-input"
                    value={adminZaloLink}
                    onChange={(e) => setAdminZaloLink(e.target.value)}
                    placeholder="https://zalo.me/..."
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Link Zalo Kiếm Tiền Video Sáng Tạo</label>
                  <input
                    type="url"
                    className="form-input"
                    value={zaloMonetizationLink}
                    onChange={(e) => setZaloMonetizationLink(e.target.value)}
                    placeholder="https://zalo.me/g/..."
                    required
                  />
                </div>
              </div>

            </div>

            {/* TikTok Tiers Section */}
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Bảng thưởng xu hướng (Cộng thêm theo mốc view)</span>
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    backgroundColor: 'var(--success-green)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Thêm mốc mới
                </button>
              </h4>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Mốc view đạt được</th>
                      <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '200px' }}>Tiền thưởng cộng thêm (đ)</th>
                      <th style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '80px', textAlign: 'center' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiktokTiers.map((tier, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px 16px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                            value={tier.views}
                            onChange={(e) => handleUpdateTier(index, 'views', e.target.value)}
                            placeholder="Ví dụ: 10.000 - dưới 30.000 view"
                            required
                          />
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          <input
                            type="number"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                            value={tier.reward}
                            onChange={(e) => handleUpdateTier(index, 'reward', parseInt(e.target.value) || 0)}
                            placeholder="Ví dụ: 100000"
                            required
                          />
                        </td>
                        <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '6px'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tiktokTiers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Chưa cấu hình mốc view nào. Hãy nhấn "Thêm mốc mới"!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="form-submit-btn form-submit-btn-outline"
                style={{ width: 'auto', padding: '12px 28px', color: 'var(--text-dark)', borderColor: '#CBD5E1' }}
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn hủy các thay đổi chưa lưu?')) {
                    fetchSettings(); // reload
                    setActiveTab('list');
                  }
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="form-submit-btn form-submit-btn-red"
                style={{ width: 'auto', padding: '12px 36px', backgroundColor: 'var(--primary-red)' }}
              >
                Lưu cấu hình hệ thống
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: REF / BẠN BÈ
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'ref-friends' && (!user || user.role === 'admin') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>👥 Quản lý Ref / Bạn Bè</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Duyệt ref để cộng tiền hoa hồng cho người mời. Ghi chú là <strong>bắt buộc</strong> khi duyệt.</p>
            </div>
            <button
              onClick={() => {
                if (!window.confirm('Normalize toàn bộ status cũ (Đã kiếm được tiền → approved, Chưa đủ ĐK → pending)?\nHành động này sẽ cập nhật DB.')) return;
                fetch('/api/referrals/normalize', { method: 'POST' })
                  .then(r => r.json())
                  .then(d => { alert(`Normalize thành công ${d.total} ref!`); fetchReferrals(); })
                  .catch(() => alert('Lỗi!'));
              }}
              style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', color: '#475569' }}
            >
              🔄 Normalize DB
            </button>
          </div>

          {loadingReferrals ? <div>Đang tải...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Người đăng ký (User A)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>SĐT</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Người mời</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ngày</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Hoa hồng</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Trạng thái DB</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ghi chú</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {referrals.map(ref => {
                    const inviter = allUsers.find(u => u.referralCode === ref.referralCode);
                    // Support cả status mới ('approved') lẫn status cũ tiếng Việt
                    const isApproved = ref.status === 'approved' || ref.status === 'Đã kiếm được tiền' || ref.status === 'Đã duyệt';
                    const isPending = ref.status === 'Chờ duyệt' || ref.status === 'pending' || (!isApproved && ref.status !== 'Chưa đủ điều kiện' && ref.status !== 'rejected');
                    const isIneligible = ref.status === 'Chưa đủ điều kiện' || ref.status === 'rejected';

                    // Badge style
                    let badgeBg = '#FEF3C7', badgeColor = '#92400E', badgeText = '⏳ Chờ duyệt';
                    if (isApproved) { badgeBg = '#D1FAE5'; badgeColor = '#065F46'; badgeText = '✅ Đã duyệt'; }
                    else if (isIneligible) { badgeBg = '#F1F5F9'; badgeColor = '#64748B'; badgeText = '❌ Chưa đủ ĐK'; }

                    return (
                      <tr key={ref.id} style={{ borderBottom: '1px solid #F1F5F9', background: isApproved ? '#F0FDF4' : isIneligible ? '#F8FAFC' : 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ref.name}</td>
                        <td style={{ padding: '10px 12px', color: '#64748B' }}>{ref.phone}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {inviter ? <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{inviter.name} ({inviter.phone})</span> : <span style={{ color: '#94A3B8' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '12px' }}>{ref.date}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>{ref.commission ? ref.commission.toLocaleString('vi-VN') + 'đ' : '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: badgeBg, color: badgeColor }}>
                            {badgeText}
                          </span>
                          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>{ref.status}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '12px', maxWidth: '200px' }}>
                          {ref.note || <span style={{ color: '#CBD5E1' }}>Chưa có</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {!isApproved ? (
                            <button
                              onClick={() => { setRefApproveModal(ref); setRefNote(''); setRefCommission(100000); }}
                              style={{ background: '#7C3AED', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                            >
                              Duyệt
                            </button>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Đã xong</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {referrals.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Chưa có ref nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Approve Modal */}
          {refApproveModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>✅ Duyệt Ref</h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                  Duyệt cho <strong>{refApproveModal.name}</strong> ({refApproveModal.phone}). Người mời sẽ được cộng tiền vào ví.
                </p>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Số tiền hoa hồng (đ) *</label>
                <input
                  type="number"
                  value={refCommission}
                  onChange={e => setRefCommission(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                />
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Ghi chú <span style={{ color: '#EF4444' }}>*</span> (bắt buộc)</label>
                <textarea
                  value={refNote}
                  onChange={e => setRefNote(e.target.value)}
                  placeholder="Vd: Phòng 301 Trần Thái Tông - Khách A thuê tháng 7..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '20px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setRefApproveModal(null)} style={{ padding: '10px 20px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                  <button onClick={handleApproveRef} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#7C3AED', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✅ Xác nhận duyệt</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'commission' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>💰 Hoa Hồng - Danh Sách Phòng</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Tất cả phòng trên trang. Mỗi phòng hiển thị nội dung text gốc (text1 + text2). Tổng: <strong>{rooms.length}</strong> phòng.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <input
              value={commQuery}
              onChange={e => setCommQuery(e.target.value)}
              placeholder="Tìm theo địa chỉ, ID phòng, mã phòng, nội dung..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {(() => {
            const filteredCommRooms = rooms.filter(room => {
              if (!commQuery.trim()) return true;
              const q = commQuery.toLowerCase();
              const t2 = (room.text2 || room.original_text || '').toLowerCase();
              const addr = (room.address || '').toLowerCase();
              const id = String(room.id || '');
              const code = (room.room_code || '').toLowerCase();
              return t2.includes(q) || addr.includes(q) || id.includes(q) || code.includes(q);
            });

            return (
              <>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                  Hiển thị {filteredCommRooms.length} / {rooms.length} phòng
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredCommRooms.map((room) => {
                    let text1 = room.text1 || '';
                    let text2 = room.text2 || room.original_text || '';

                    if (text2.trim().startsWith('{')) {
                      try {
                        const parsed = JSON.parse(text2);
                        if (parsed.isManual) {
                          // Manual room: build text1 from metadata summary
                          const parts = [];
                          if (parsed.title) parts.push('\u{1f4cc} ' + parsed.title);
                          if (room.address) parts.push('\u{1f3e0} Địa chỉ: ' + room.address);
                          if (parsed.priceText) parts.push('\u{1f4b0} Giá: ' + parsed.priceText);
                          if (parsed.areaText) parts.push('\u{1f4d0} Loại phòng: ' + parsed.areaText);
                          if (parsed.category) parts.push('\u{1f3f7}\ufe0f Danh mục: ' + (CATEGORY_LABELS[parsed.category] || parsed.category));
                          if (parsed.nearPlace) parts.push('\u{1f4cd} Gần: ' + parsed.nearPlace);
                          if (parsed.distanceText) parts.push('\u{1f4cf} ' + parsed.distanceText);
                          if (parsed.zaloNumber) parts.push('\u{1f4de} Zalo: ' + parsed.zaloNumber);
                          text1 = parts.join('\n');
                          text2 = parsed.text2 || parsed.description || '';
                        } else {
                          // Batdongsan room: use raw text1/text2
                          text1 = parsed.text1 || text1 || '';
                          text2 = parsed.text2 || text2;
                        }
                      } catch (e) { }
                    }

                    const isExpanded = commExpanded === room.id;
                    const roomLabel = room.room_code ? `Phòng ${room.room_code}` : `Phòng #${room.id}`;
                    const catLabel = CATEGORY_LABELS[room.category] || room.category || 'Phòng trọ';
                    const preview = text2.substring(0, 100).trim();

                    return (
                      <div
                        key={room.id}
                        style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', cursor: 'pointer', background: isExpanded ? '#F8FAFC' : '#fff' }}
                          onClick={() => setCommExpanded(isExpanded ? null : room.id)}
                        >
                          <div style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', borderRadius: '6px', padding: '4px 10px', fontWeight: 800, fontSize: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {roomLabel}
                          </div>
                          <div style={{ backgroundColor: room.category === 'pass-phong' ? '#FFF7ED' : room.category === 'o-ghep' ? '#F5F3FF' : '#F0FDF4', color: room.category === 'pass-phong' ? '#C2410C' : room.category === 'o-ghep' ? '#6B21A8' : '#166534', borderRadius: '6px', padding: '4px 10px', fontWeight: 700, fontSize: '11px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {catLabel}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, wordBreak: 'break-word' }}>
                              {room.address && <span style={{ fontWeight: 600, color: '#1E293B' }}>{room.address} — </span>}
                              {preview}{preview.length < text2.length ? '...' : ''}
                            </div>
                          </div>
                          <span style={{ fontSize: '14px', color: '#94A3B8', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: text1 ? '1fr 1fr' : '1fr', gap: '12px', borderTop: '1px solid #F1F5F9' }}>
                            {text1 && (
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#EF4444', marginBottom: '6px', marginTop: '12px', textTransform: 'uppercase' }}>Text 1 (Gốc / Hoa hồng)</div>
                                <pre style={{ fontSize: '12px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#431407', maxHeight: '300px', overflowY: 'auto', margin: 0 }}>{text1}</pre>
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284C7', marginBottom: '6px', marginTop: '12px', textTransform: 'uppercase' }}>Text 2 (Nội dung phòng)</div>
                              <pre style={{ fontSize: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#0C4A6E', maxHeight: '300px', overflowY: 'auto', margin: 0 }}>{text2 || '(Không có nội dung)'}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredCommRooms.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Không tìm thấy phòng nào phù hợp</div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: TRAFFIC
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'traffic' && (!user || user.role === 'admin') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>📊 Lượt Truy Cập</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['today', '7d', '30d', 'all'].map(r => (
                <button key={r} onClick={() => setTrafficRange(r)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', background: trafficRange === r ? '#0284C7' : '#fff', color: trafficRange === r ? '#fff' : '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
                  {r === 'today' ? 'Hôm nay' : r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
                </button>
              ))}
              <button onClick={() => fetchTraffic(trafficRange)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px' }}>🔄</button>
            </div>
          </div>

          {trafficLoading && <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Đang tải dữ liệu...</div>}

          {trafficData && !trafficLoading && (
            <div>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Lượt xem (kỳ)', val: trafficData.total?.toLocaleString('vi-VN') || 0, icon: '👁️', color: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
                  { label: 'Unique Visitors', val: trafficData.unique?.toLocaleString('vi-VN') || 0, icon: '🧑', color: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
                  { label: 'Tổng lượt xem', val: trafficData.totalAll?.toLocaleString('vi-VN') || 0, icon: '📈', color: '#FFF7ED', border: '#FFEDD5', text: '#9A3412' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.color, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: s.text }}>{s.val}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: s.text, opacity: 0.7, textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* By Day Chart (simple bars) */}
              {trafficData.byDay?.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>📅 Theo ngày (30 ngày gần nhất)</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px', overflowX: 'auto' }}>
                    {(() => {
                      const max = Math.max(...trafficData.byDay.map(d => d.views), 1);
                      return trafficData.byDay.map((d, i) => (
                        <div key={i} title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                          style={{ flex: '0 0 auto', width: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <div style={{ width: '100%', background: '#0284C7', borderRadius: '3px 3px 0 0', height: `${Math.max(4, (d.views / max) * 80)}px`, cursor: 'pointer', opacity: 0.85 }} />
                          <div style={{ fontSize: '8px', color: '#94A3B8', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{d.day?.slice(5)}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* By Hour today */}
              {trafficData.byHour?.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>⏰ Hôm nay theo giờ</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                    {(() => {
                      const max = Math.max(...trafficData.byHour.map(d => d.views), 1);
                      return Array.from({ length: 24 }, (_, h) => {
                        const hStr = String(h).padStart(2, '0');
                        const found = trafficData.byHour.find(d => d.hour === hStr);
                        const views = found ? found.views : 0;
                        return (
                          <div key={h} title={`${hStr}h: ${views} views`}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <div style={{ width: '100%', background: views > 0 ? '#059669' : '#E2E8F0', borderRadius: '2px 2px 0 0', height: `${Math.max(2, (views / max) * 60)}px` }} />
                            <div style={{ fontSize: '7px', color: '#94A3B8' }}>{h % 4 === 0 ? hStr : ''}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Top pages */}
              {trafficData.topPages?.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>🔗 Top trang được xem</h3>
                  {trafficData.topPages.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < trafficData.topPages.length - 1 ? '1px solid #F1F5F9' : 'none', fontSize: '13px' }}>
                      <span style={{ color: '#334155' }}>{p.path}</span>
                      <span style={{ fontWeight: 700, color: '#0284C7' }}>{p.views} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!trafficData && !trafficLoading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Chưa có dữ liệu traffic. Đảm bảo tracking đã được tích hợp.</div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: TÀI KHOẢN USER
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'user-accounts' && (!user || user.role === 'admin') && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '280px 1fr' : '1fr', gap: '20px' }}>
          {/* User list */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>🏦 Danh sách User</h2>
            {loadingUsers ? <div>Đang tải...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allUsers.filter(u => u.role !== 'ctv').map(u => (
                  <div key={u.phone} onClick={() => handleSelectUser(u)}
                    style={{ padding: '12px 14px', border: `2px solid ${selectedUser?.phone === u.phone ? '#D97706' : '#E2E8F0'}`, borderRadius: '10px', cursor: 'pointer', background: selectedUser?.phone === u.phone ? '#FFFBEB' : '#fff', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{u.phone} · {u.role}</div>
                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '13px', marginTop: '4px' }}>
                      {(u.walletBalance || 0).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User detail */}
          {selectedUser && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Chi tiết: {selectedUser.name}</h2>
                <button onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>

              {/* Balance summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Số dư hiện tại', val: (selectedUser.walletBalance || 0).toLocaleString('vi-VN') + 'đ', color: '#059669' },
                  { label: 'Tổng đã kiếm', val: (selectedUser.totalEarned || 0).toLocaleString('vi-VN') + 'đ', color: '#0284C7' },
                  { label: 'Tổng ref', val: selectedUser.totalReferrals || 0, color: '#7C3AED' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Adjust balance */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>⚡ Cộng / Trừ Tiền</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button onClick={() => setAdjustType('add')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${adjustType === 'add' ? '#059669' : '#E2E8F0'}`, background: adjustType === 'add' ? '#D1FAE5' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>+ Cộng tiền</button>
                  <button onClick={() => setAdjustType('subtract')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `2px solid ${adjustType === 'subtract' ? '#EF4444' : '#E2E8F0'}`, background: adjustType === 'subtract' ? '#FEE2E2' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>- Trừ tiền</button>
                </div>
                <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Nhập số tiền (VNĐ)" style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }} />
                <textarea value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Ghi chú bắt buộc: lý do cộng/trừ tiền..." rows={2} style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', resize: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
                <button onClick={handleAdjustBalance} disabled={adjustLoading} style={{ width: '100%', padding: '10px', background: adjustType === 'add' ? '#059669' : '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  {adjustLoading ? 'Đang xử lý...' : adjustType === 'add' ? '+ Cộng tiền' : '- Trừ tiền'}
                </button>
              </div>

              {/* Transaction log */}
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>📋 Lịch sử giao dịch</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                {userTxs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Chưa có giao dịch nào</div>
                ) : userTxs.map((tx, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 14px', borderBottom: i < userTxs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{tx.type}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{tx.date}</div>
                      {tx.note && <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '2px', fontStyle: 'italic' }}>📝 {tx.note}</div>}
                    </div>
                    <div style={{ fontWeight: 800, color: tx.amount?.startsWith('+') ? '#059669' : '#EF4444', fontSize: '14px' }}>{tx.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: CTV ACCOUNTS
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'ctv-accounts' && (!user || user.role === 'admin') && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>👔 Quản lý CTV</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>CTV có thể đăng nhập và chỉ xem được tab Hoa Hồng.</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '360px 1fr', gap: '24px' }}>
            {/* Create form */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>➕ Tạo tài khoản CTV mới</h3>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tên CTV</label>
              <input value={ctvName} onChange={e => setCtvName(e.target.value)} placeholder="Nguyễn Văn A" style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', boxSizing: 'border-box' }} />
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Username (số điện thoại/mã)</label>
              <input value={ctvPhone} onChange={e => setCtvPhone(e.target.value)} placeholder="ctv001" style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', boxSizing: 'border-box' }} />
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Mật khẩu</label>
              <input value={ctvPassword} onChange={e => setCtvPassword(e.target.value)} placeholder="••••••••" type="text" style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', boxSizing: 'border-box' }} />
              <button onClick={handleCreateCtv} style={{ width: '100%', padding: '10px', background: '#DB2777', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                👔 Tạo tài khoản CTV
              </button>
            </div>

            {/* CTV list */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Danh sách CTV ({ctvUsers.length})</h3>
              {loadingUsers ? <div>Đang tải...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ctvUsers.map(u => (
                    <div key={u.phone} style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>👤 {u.phone}</div>
                      </div>
                      <span style={{ background: '#FDF4FF', color: '#A855F7', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>CTV</span>
                    </div>
                  ))}
                  {ctvUsers.length === 0 && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Chưa có CTV nào</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: TẤT CẢ PHÒNG
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'all-rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>🏘️ Tất Cả Phòng ({allRooms.length})</h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              value={roomSearch}
              onChange={e => setRoomSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchAllRooms(roomSearch)}
              placeholder="Tìm theo địa chỉ, loại phòng... (Enter)"
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
            />
            <button onClick={() => fetchAllRooms(roomSearch)} disabled={loadingAllRooms}
              style={{ padding: '10px 20px', background: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              🔍 Tìm
            </button>
            <button onClick={() => { setRoomSearch(''); fetchAllRooms(''); }}
              style={{ padding: '10px 16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              Xem tất cả
            </button>
            <button onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn cập nhật lại tọa độ và khoảng cách cho TẤT CẢ các phòng?\nQuá trình này sẽ chạy ngầm trên server và có thể mất vài phút. Vui lòng không bấm liên tục.')) {
                  fetch('/api/admin/recalculate-all', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => alert(data.message || 'Đã gửi yêu cầu cập nhật!'))
                    .catch(err => alert('Có lỗi xảy ra: ' + err.message));
                }
              }}
              style={{ padding: '10px 16px', background: '#DB2777', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
              🔄 Cập nhật tọa độ
            </button>
          </div>

          {loadingAllRooms ? <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Đang tải...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Địa chỉ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Giá</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Loại phòng</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Ngày tạo</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {allRooms.map(room => (
                    <tr key={room.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', color: '#94A3B8', fontSize: '11px' }}>#{room.id}</td>
                      <td style={{ padding: '10px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.address}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>{room.price}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{room.room_type || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                          background: room.status === 'approved' ? '#D1FAE5' : room.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: room.status === 'approved' ? '#065F46' : room.status === 'rejected' ? '#991B1B' : '#92400E'
                        }}>
                          {room.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94A3B8', fontSize: '11px' }}>{room.created_at?.split('T')[0] || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button onClick={() => openEditRoom(room)}
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                            ✏️ Sửa
                          </button>
                          {(!user || user.role === 'admin') && (
                            <button onClick={() => handleDeleteListing(room.id)}
                              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                              🗑️ Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allRooms.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>Không tìm thấy phòng nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Room Modal */}
          {editRoomModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '540px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '16px' }}>✏️ Sửa phòng #{editRoomModal.id}</h3>
                  <button onClick={() => setEditRoomModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>

                {[
                  { label: 'Địa chỉ', val: editAddress, set: setEditAddress, placeholder: 'Số nhà, ngõ, đường, quận...' },
                  { label: 'Giá (số, VNĐ)', val: editPrice, set: setEditPrice, placeholder: 'VD: 5000000' },
                  { label: 'Loại phòng / Dạng phòng', val: editRoomType, set: setEditRoomType, placeholder: 'VD: Trọ thường, Studio, 1N1K...' },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                ))}

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Danh mục</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', background: '#fff' }}>
                    <option value="phong-tro">Phòng trọ</option>
                    <option value="chung-cu">Chung cư</option>
                    <option value="nha-nguyen-can">Nhà nguyên căn</option>
                    <option value="can-ho-dich-vu">Căn hộ dịch vụ</option>
                    <option value="mat-bang-kinh-doanh">Mặt bằng kinh doanh</option>
                    <option value="pass-phong">Pass phòng</option>
                    <option value="o-ghep">Ở ghép</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Mô tả chi tiết</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={5} placeholder="Nhập mô tả đầy đủ..."
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditRoomModal(null)} style={{ padding: '10px 20px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                  <button onClick={handleSaveRoom} disabled={editSaving} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: '#0F172A', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                    {editSaving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: BOT MANAGEMENT
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'bot-management' && (!user || user.role === 'admin') && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>🤖 Quản lý Zalo Bot & Tiến trình</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Bật/Tắt tiến trình Listener, Sender, xem log trực tiếp và cấu hình tài khoản.</p>

          {/* Service Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            {['listener', 'sender'].map(service => {
              const status = botStatus[service] || { running: false };
              const isRunning = status.running;
              const info = status.info || {};
              return (
                <div key={service} style={{
                  background: isRunning ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${isRunning ? '#DCFCE7' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'capitalize' }}>
                      {service === 'listener' ? '📡 Bot Listener (Nhận tin)' : '📤 Bot Sender (Gửi tin)'}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isRunning ? '#D1FAE5' : '#E2E8F0',
                      color: isRunning ? '#065F46' : '#64748B'
                    }}>
                      {isRunning ? 'Đang chạy' : 'Đã dừng'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    <div>⚡ <strong>PID:</strong> {status.pid || '—'}</div>
                    <div>⏱️ <strong>Last Heartbeat:</strong> {info.lastHeartbeatAt ? new Date(info.lastHeartbeatAt).toLocaleTimeString() : '—'}</div>
                    <div>💼 <strong>Last Work:</strong> {info.lastWorkAt ? new Date(info.lastWorkAt).toLocaleTimeString() : '—'}</div>
                    <div>🔄 <strong>Restarts:</strong> {info.restartCount || 0}</div>
                    {info.lastError && (
                      <div style={{ color: '#EF4444', background: '#FEE2E2', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                        ⚠️ {info.lastError}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleBotControl(service, isRunning ? 'stop' : 'start')}
                      disabled={controlLoading[service]}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isRunning ? '#EF4444' : '#10B981',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {controlLoading[service] ? 'Đang xử lý...' : isRunning ? '🛑 Dừng' : '▶️ Khởi động'}
                    </button>
                    <button
                      onClick={() => handleBotControl(service, 'restart')}
                      disabled={controlLoading[service]}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        background: '#fff',
                        color: '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🔄 Restart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accounts Configuration */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800 }}>🔑 Danh sách Tài khoản Zalo</h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Tài khoản đầu tiên (Index 0) luôn được dùng làm tài khoản Listener.</p>
              </div>
              <button
                onClick={() => handleOpenBotModal('add', -1, 'sender')}
                style={{ padding: '8px 16px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
              >
                ➕ Thêm tài khoản Sender
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Index</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tên tài khoản</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Vai trò</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>IMEI</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Trạng thái Cookie</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {botConfig?.ACCOUNTS?.map((acc, index) => {
                    const hasCookies = acc.session_cookies && Object.keys(acc.session_cookies).length > 0;
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#64748B' }}>{index}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{acc.name || (index === 0 ? 'Mặc định Listener' : `Sender Account ${index}`)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: index === 0 ? '#EFF6FF' : '#FAF5FF',
                            color: index === 0 ? '#1D4ED8' : '#7C3AED'
                          }}>
                            {index === 0 ? '📡 Listener' : '📤 Sender'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#475569' }}>
                          {acc.imei ? `${acc.imei.slice(0, 8)}...${acc.imei.slice(-8)}` : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            color: hasCookies ? '#059669' : '#EF4444',
                            fontWeight: 700
                          }}>
                            {hasCookies ? '✓ Đã cài đặt' : '✗ Trống'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenBotModal('edit', index)}
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                          >
                            ✏️ Sửa
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => handleDeleteBotAccount(index)}
                              style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                            >
                              🗑️ Xóa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(!botConfig?.ACCOUNTS || botConfig.ACCOUNTS.length === 0) && (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Chưa có tài khoản nào được cấu hình</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs Viewer */}
          <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['listener', 'sender'].map(service => (
                  <button
                    key={service}
                    onClick={() => setActiveLogService(service)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeLogService === service ? '#3B82F6' : '#1E293B',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {service === 'listener' ? '📡 Log Listener' : '📤 Log Sender'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  id="auto-refresh-logs"
                  checked={autoRefreshLogs}
                  onChange={e => setAutoRefreshLogs(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="auto-refresh-logs" style={{ cursor: 'pointer', userSelect: 'none' }}>Tự động cuộn & cập nhật log</label>
                <button
                  onClick={() => fetchBotLogs(activeLogService)}
                  style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', marginLeft: '8px' }}
                >
                  🔄 Tải lại
                </button>
              </div>
            </div>

            <pre style={{
              background: '#020617',
              color: '#10B981',
              padding: '16px',
              borderRadius: '8px',
              height: '320px',
              overflowY: 'auto',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '12px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              border: '1px solid #1E293B',
              margin: 0
            }}>
              {botLogs || 'Chưa có nhật ký ghi nhận...'}
            </pre>
          </div>

          {/* Account Edit Modal */}
          {botModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '540px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '16px' }}>
                    {botModal.type === 'add' ? '➕ Thêm tài khoản' : '✏️ Sửa tài khoản'} ({botModal.role === 'listener' ? 'Listener' : 'Sender'})
                  </h3>
                  <button onClick={() => setBotModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tên gợi nhớ</label>
                  <input value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="Zalo gửi tin 1"
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>IMEI Thiết bị</label>
                  <input value={newAccImei} onChange={e => setNewAccImei(e.target.value)} placeholder="d4fea45c-17ab-4512-9fdb-aeb366ed175b-b78..."
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Session Cookies (JSON String)</label>
                  <textarea value={newAccCookies} onChange={e => setNewAccCookies(e.target.value)} rows={8} placeholder='{ "_zlang": "vn", "zpsid": "..." }'
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setBotModal(null)} style={{ padding: '10px 20px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                  <button onClick={handleSaveBotAccount} disabled={botConfigSaving} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: '#4F46E5', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                    {botConfigSaving ? 'Đang lưu...' : '💾 Lưu tài khoản'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: ACTIVITY LOGS */}
      {activeTab === 'activity-logs' && (!user || user.role === 'admin') && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>📜 Nhật Ký Hoạt Động CTV</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Theo dõi thời gian, tài khoản CTV nào đã thêm phòng mới hoặc sửa đổi thông tin phòng.</p>

          <div style={{ overflowX: 'auto' }}>
            {loadingLogs ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Đang tải nhật ký...</div>
            ) : logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Chưa ghi nhận hoạt động nào</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', width: '180px' }}>Thời gian</th>
                    <th style={{ padding: '12px 14px', width: '220px' }}>Tài khoản CTV</th>
                    <th style={{ padding: '12px 14px', width: '120px' }}>Hành động</th>
                    <th style={{ padding: '12px 14px' }}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontWeight: 600 }}>{log.created_at}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#1E293B' }}>{log.actor_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>SĐT: {log.actor_phone}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: log.action_type === 'add_room' ? '#D1FAE5' : '#E0F2FE',
                          color: log.action_type === 'add_room' ? '#065F46' : '#0369A1'
                        }}>
                          {log.action_type === 'add_room' ? 'Thêm phòng' : 'Sửa phòng'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 500 }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      {activeQrCodeUrl && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative',
            border: '1px solid #E2E8F0',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Quét mã VietQR chuyển tiền
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>
              Mở ứng dụng ngân hàng và quét mã để thanh toán tức thì
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px dashed #E2E8F0',
              marginBottom: '20px',
              position: 'relative'
            }}>
              <img
                src={activeQrCodeUrl.url}
                alt="VietQR code"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', maxWidth: '280px' }}
              />
            </div>

            <div style={{
              textAlign: 'left',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '13px',
              lineHeight: '1.6',
              border: '1px solid #E2E8F0',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Ngân hàng:</span>
                <strong style={{ color: '#0F172A' }}>{activeQrCodeUrl.bankName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Số tài khoản:</span>
                <strong style={{ color: 'var(--zalo-blue)', cursor: 'pointer' }} onClick={() => {
                  navigator.clipboard.writeText(activeQrCodeUrl.accountNum);
                  alert('Đã sao chép số tài khoản!');
                }}>
                  {activeQrCodeUrl.accountNum} 📋
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Người thụ hưởng:</span>
                <strong style={{ color: '#0F172A', textTransform: 'uppercase' }}>{activeQrCodeUrl.accountName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Số tiền:</span>
                <strong style={{ color: 'var(--primary-red)' }}>{activeQrCodeUrl.displayAmount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', paddingTop: '2px' }}>
                <span style={{ color: '#64748B', marginBottom: '4px' }}>Nội dung chuyển khoản:</span>
                <div style={{
                  backgroundColor: '#F1F5F9',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#334155',
                  wordBreak: 'break-all',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }} onClick={() => {
                  navigator.clipboard.writeText(activeQrCodeUrl.description);
                  alert('Đã sao chép nội dung chuyển khoản!');
                }}>
                  <span>{activeQrCodeUrl.description}</span>
                  <span>📋</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveQrCodeUrl(null)}
              style={{
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardView;
