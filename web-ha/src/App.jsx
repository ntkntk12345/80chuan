import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthModals from './components/AuthModals';
import MobileBottomNav from './components/MobileBottomNav';
import { getNearestLandmarks, formatTimeText, isUsefulLandmarkName, NO_IMAGE_PLACEHOLDER } from './utils/helpers';

// Import Views
import HomeView from './views/HomeView';
import ListingView from './views/ListingView';
import DetailView from './views/DetailView';
import EarnHubView from './views/EarnHubView';
import TikTokCampaignView from './views/TikTokCampaignView';
import ClientReferralView from './views/ClientReferralView';
import FriendInviteView from './views/FriendInviteView';
import WalletView from './views/WalletView';
import ProfileView from './views/ProfileView';
import AdminDashboardView from './views/AdminDashboardView';
import PolicyView from './views/PolicyView';
import AboutView from './views/AboutView';

const DEFAULT_USERS = [
  {
    phone: 'BichHa80land',
    password: 'BichHa80land010201@!',
    name: 'Quản trị viên',
    referralCode: 'ADMIN80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    walletBalance: 99999999,
    totalEarned: 0,
    pendingCommissions: 0,
    totalReferrals: 0,
    activeReferrals: 0
  }
];

const App = () => {
  // Responsive check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Traffic tracking
  useEffect(() => {
    try {
      let vid = localStorage.getItem('_visitor_id');
      if (!vid) {
        vid = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('_visitor_id', vid);
      }
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname + window.location.search, visitor_id: vid, referrer: document.referrer })
      }).catch(() => {});
    } catch(e) {}
  }, []);


  // Navigation State
  const [currentPage, _setCurrentPage] = useState('home');
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const setCurrentPage = (page) => {
    _setCurrentPage(page);
    const isDetailView = ['phong-tro-detail', 'chung-cu-detail', 'nha-nguyen-can-detail'].includes(page);
    if (!isDetailView) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.pushState({}, '', url.toString());
      }
    }
  };

  // Helper: navigate to room detail + update URL
  const navigateToRoom = (roomId, category) => {
    // Look up the room first using id or session_id
    const room = rooms.find(r => String(r.id) === String(roomId) || (r.session_id && String(r.session_id) === String(roomId)));
    if (!room) return;

    // Use session_id as the primary stable identifier if available, otherwise fallback to id
    const urlParamId = (room.session_id && room.session_id !== 'manual') ? room.session_id : String(room.id);
    setSelectedRoomId(urlParamId);

    const detailPage = category === 'chung-cu' ? 'chung-cu-detail'
      : category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail'
      : 'phong-tro-detail';
    setCurrentPage(detailPage);
    
    const url = new URL(window.location.href);
    url.searchParams.set('room', urlParamId);
    window.history.pushState({}, '', url.toString());
  };

  // Helper: clear room param from URL
  const clearRoomParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
  };

  // Settings State
  const [settings, setSettings] = useState({
    min_withdrawal: 50000,
    referral_commission: 300000,
    tiktok_base_reward: 30000,
    tiktok_max_reward: 800000,
    tiktok_reward_tiers: [],
    admin_fb_link: 'https://facebook.com/admin',
    admin_zalo_link: 'https://zalo.me/0876480130',
    zalo_monetization_link: 'https://zalo.me/0876480130'
  });

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            min_withdrawal: parseInt(data.min_withdrawal) || 50000,
            referral_commission: parseInt(data.referral_commission) || 300000,
            tiktok_base_reward: parseInt(data.tiktok_base_reward) || 30000,
            tiktok_max_reward: parseInt(data.tiktok_max_reward) || 800000,
            tiktok_reward_tiers: typeof data.tiktok_reward_tiers === 'string' 
              ? JSON.parse(data.tiktok_reward_tiers) 
              : data.tiktok_reward_tiers || [],
            admin_fb_link: data.admin_fb_link || 'https://facebook.com/admin',
            admin_zalo_link: data.admin_zalo_link || 'https://zalo.me/0876480130',
            zalo_monetization_link: data.zalo_monetization_link || 'https://zalo.me/0876480130'
          });
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Initialize users database in localStorage if not exists
  useEffect(() => {
    if (!localStorage.getItem('users_db')) {
      localStorage.setItem('users_db', JSON.stringify(DEFAULT_USERS));
    }
    // Clear stale mock transaction data — real data comes from SQLite
    localStorage.removeItem('transactions_db');
    // Capture referral parameter from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('pending_referral_code', refCode);
    }
  }, []);

  // User Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Sync state across tabs / admin updates
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {}
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync user stats with SQLite on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) {
          fetch(`/api/users/${parsed.phone}`)
            .then(res => {
              if (res.ok) return res.json();
              if (res.status === 404) {
                localStorage.removeItem('currentUser');
                setUser(null);
                throw new Error('User session invalid or database reset. User not found in database.');
              }
              throw new Error('Sync failed');
            })
            .then(data => {
              setUser(data);
            })
            .catch(err => {
              console.error('Error syncing user stats with SQLite:', err);
            });
        }
      } catch (e) {}
    }
  }, []);
  // Notifications State & Logic
  const [notifications, setNotifications] = useState([]);
  const [showMobileNoti, setShowMobileNoti] = useState(false);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    fetch(`/api/users/${user.phone}/notifications`)
      .then(res => res.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    fetch(`/api/users/${user.phone}/notifications/read`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
        }
      })
      .catch(err => console.error('Error marking notifications as read:', err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Bookmark State - load from localStorage, default empty
  const [savedRoomIds, setSavedRoomIds] = useState(() => {
    try {
      const saved = localStorage.getItem('savedRoomIds');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  // Trigger support chat modal
  const handleSupportChat = () => {
    alert('Kết nối đến tổng đài viên Zalo: 0876 480 130');
    window.open('https://zalo.me/0876480130', '_blank');
  };

  const handleToggleSave = (roomId) => {
    setSavedRoomIds((prev) => {
      const next = prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId];
      try { localStorage.setItem('savedRoomIds', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };



  const handleOpenLogin = () => {
    setAuthType('login');
    setIsAuthOpen(true);
  };

  // Mock Database for properties matching the screenshot design details exactly
  const mockRooms = [
    {
      id: 1,
      category: 'phong-tro',
      title: 'Studio full nội thất cửa sổ thoáng',
      address: 'Ngõ 120 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
      nearPlace: 'ĐH Bách Khoa Hà Nội',
      distanceText: 'Cách ĐH Bách Khoa Hà Nội • 800m',
      priceText: '5 triệu/tháng',
      priceRaw: 5000000,
      areaText: '25m²',
      badgeText: 'Mới đăng',
      badgeColor: 'red',
      timeText: '10 ngày trước',
      imageCount: 8,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
      original_text: 'Phòng trọ studio full nội thất sang xịn nằm tại ngõ lớn Trần Đại Nghĩa. Phòng thiết kế gác lửng thông minh giúp tăng diện tích sử dụng, đầy đủ trang thiết bị giường tủ đệm sẵn dọn vào ở.'
    },
    {
      id: 2,
      category: 'phong-tro',
      title: 'Duplex ban công lớn máy giặt riêng',
      address: 'Ngõ 89 Chùa Láng, Đống Đa, Hà Nội',
      nearPlace: 'ĐH Ngoại Thương',
      distanceText: 'Cách ĐH Ngoại Thương • 1.2km',
      priceText: '6 triệu/tháng',
      priceRaw: 6000000,
      areaText: '35m²',
      badgeText: 'Tặng 500K',
      badgeColor: 'blue',
      timeText: '2 giờ trước',
      imageCount: 10,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
      original_text: 'Căn hộ Duplex khép kín cực đẹp nằm tại ngõ 89 Chùa Láng, Đống Đa. Phòng có ban công kính rộng rãi đón ánh sáng tự nhiên, máy giặt riêng tiện lợi, đầy đủ tiện nghi điều hòa, tủ lạnh, giường tủ gỗ sang trọng.'
    },
    {
      id: 3,
      category: 'phong-tro',
      title: 'Phòng khép kín full nội thất',
      address: 'Ngõ 98 Trần Duy Hưng, Cầu Giấy, Hà Nội',
      nearPlace: 'ĐH Giao Thông Vận Tải',
      distanceText: 'Cách Big C Thăng Long • 1km',
      priceText: '7.5 triệu/tháng',
      priceRaw: 7500000,
      areaText: '28m²',
      badgeText: 'Hợp xịt ben',
      badgeColor: 'green',
      timeText: '5 giờ trước',
      imageCount: 7,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      category: 'phong-tro',
      title: 'Phòng rộng rãi, ở được 3-4 người',
      address: 'Ngõ 35 Xuân Thủy, Cầu Giấy, Hà Nội',
      nearPlace: 'ĐH Sư Phạm Hà Nội',
      distanceText: 'Cách HV Ngân Hàng • 900m',
      priceText: '4.8 triệu/tháng',
      priceRaw: 4800000,
      areaText: '32m²',
      badgeText: 'Giá tốt',
      badgeColor: 'green',
      timeText: '1 ngày trước',
      imageCount: 6,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 5,
      category: 'phong-tro',
      title: 'Studio ban công lớn, full đồ',
      address: 'Số 32/12 Mỹ Đình, Nam Từ Liêm, Hà Nội',
      nearPlace: 'Sân vận động Mỹ Đình',
      distanceText: 'Cách Sân vận động Mỹ Đình • 1.1km',
      priceText: '3.2 triệu/tháng',
      priceRaw: 3200000,
      areaText: '22m²',
      badgeText: 'Gần bạn nhất',
      badgeColor: 'orange',
      timeText: '1 ngày trước',
      imageCount: 8,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600'
    },
    // Chung Cư (image25)
    {
      id: 6,
      category: 'chung-cu',
      title: 'Vinhomes Ocean Park Studio view hồ',
      address: 'Huyện Gia Lâm, Hà Nội',
      nearPlace: 'ĐH Bách Khoa',
      distanceText: 'Cách ĐH Bách Khoa • 13km',
      priceText: '6.5 triệu/tháng',
      priceRaw: 6500000,
      areaText: 'Studio',
      badgeText: 'Nổi bật',
      badgeColor: 'blue',
      timeText: 'Đăng 10 ngày trước',
      imageCount: 12,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 7,
      category: 'chung-cu',
      title: 'Masteri Waterfront căn hộ 2PN',
      address: 'Quận Gia Lâm, Hà Nội',
      nearPlace: 'ĐH Ngoại Thương',
      distanceText: 'Cách ĐH Ngoại Thương • 12km',
      priceText: '7.5 triệu/tháng',
      priceRaw: 7500000,
      areaText: '2PN',
      badgeText: 'Giá tốt',
      badgeColor: 'green',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 9,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 8,
      category: 'chung-cu',
      title: 'Vinhomes Smart City căn hộ 2PN',
      address: 'Quận Nam Từ Liêm, Hà Nội',
      nearPlace: 'ĐH Quốc Gia',
      distanceText: 'Cách ĐH Quốc Gia • 10km',
      priceText: '5.8 triệu/tháng',
      priceRaw: 5800000,
      areaText: '2PN',
      badgeText: 'Được quan tâm',
      badgeColor: 'purple',
      timeText: 'Đăng 5 giờ trước',
      imageCount: 11,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 9,
      category: 'chung-cu',
      title: 'Sunshine Riverside Căn hộ 3PN',
      address: 'Quận Tây Hồ, Hà Nội',
      nearPlace: 'ĐH Mỏ Địa Chất',
      distanceText: 'Cách ĐH Mỏ Địa Chất • 11km',
      priceText: '8.2 triệu/tháng',
      priceRaw: 8200000,
      areaText: '3PN',
      badgeText: 'Mới đăng',
      badgeColor: 'orange',
      timeText: 'Đăng 1 ngày trước',
      imageCount: 15,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'
    },
    // Nhà nguyên căn (image15)
    {
      id: 10,
      category: 'nha-nguyen-can',
      title: 'Nhà nguyên căn 3 tầng, ngõ 120 Trần Đại Nghĩa',
      address: 'Hai Bà Trưng, Hà Nội',
      nearPlace: 'ĐH Bách Khoa Hà Nội',
      priceText: '18 triệu/tháng',
      priceRaw: 18000000,
      areaText: '3 tầng • 3 PN',
      badgeText: 'Mới đăng',
      badgeColor: 'red',
      timeText: 'Đăng 1 ngày trước',
      imageCount: 12,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 11,
      category: 'nha-nguyen-can',
      title: 'Nhà 2 tầng, ngõ 245 Lạc Nghiệp',
      address: 'Hai Bà Trưng, Hà Nội',
      nearPlace: 'Bạch Mai',
      priceText: '12 triệu/tháng',
      priceRaw: 12000000,
      areaText: '2 tầng • 2 PN',
      badgeText: 'Giá tốt',
      badgeColor: 'green',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 9,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
    },
    // Căn hộ dịch vụ (image2)
    {
      id: 12,
      category: 'can-ho-dich-vu',
      title: 'CHDV Tây Hồ đầy đủ tiện ích',
      address: '299 Đường Âu Cơ, Tây Hồ, Hà Nội',
      nearPlace: 'ĐH Nội Vụ',
      priceText: '23tr/tháng',
      priceRaw: 23000000,
      areaText: '100m²',
      badgeText: 'Mới',
      badgeColor: 'red',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 8,
      zaloNumber: '0876480130',
      image: '' // Testing fallback placeholder layout (image2)
    },
    {
      id: 13,
      category: 'can-ho-dich-vu',
      title: 'CHDV Cầu Giấy tiện nghi cao cấp',
      address: '18 Ngõ 165 Cầu Giấy, Hà Nội',
      nearPlace: 'ĐH Giao Thông Vận Tải',
      priceText: '22tr/tháng',
      priceRaw: 22000000,
      areaText: '90m²',
      badgeText: 'Mới',
      badgeColor: 'red',
      timeText: 'Đăng 3 giờ trước',
      imageCount: 7,
      zaloNumber: '0876480130',
      image: ''
    },
    // Mặt bằng kinh doanh (image4)
    {
      id: 14,
      category: 'mat-bang-kinh-doanh',
      title: 'MBKD số 12 phố Thái Hà',
      address: '12 Thái Hà, Đống Đa, Hà Nội',
      nearPlace: 'ĐH Thủy Lợi',
      priceText: '25 triệu/tháng',
      priceRaw: 25000000,
      areaText: '80m²',
      badgeText: 'Mới',
      badgeColor: 'red',
      timeText: 'Đăng 1 giờ trước',
      imageCount: 6,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 15,
      category: 'mat-bang-kinh-doanh',
      title: 'MBKD phố Chùa Láng ngã tư sầm uất',
      address: '58 Chùa Láng, Đống Đa, Hà Nội',
      nearPlace: 'ĐH Ngoại Thương',
      priceText: '30 triệu/tháng',
      priceRaw: 30000000,
      areaText: '60m²',
      badgeText: 'Mới',
      badgeColor: 'red',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 9,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'
    },
    // Pass phòng (image27)
    {
      id: 16,
      category: 'pass-phong',
      title: 'Studio pass phòng tặng ngay 200k',
      address: 'Ngõ 120 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
      nearPlace: 'ĐH Bách Khoa',
      priceText: '5 triệu/tháng',
      priceRaw: 5000000,
      areaText: '25m²',
      badgeText: 'TẶNG 200K',
      badgeColor: 'orange',
      timeText: '10 ngày trước',
      imageCount: 8,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
    },
    // Ở ghép - Chung cư (image8)
    {
      id: 17,
      category: 'o-ghep',
      subCategory: 'chung-cu',
      title: 'Studio chung cư Vinhomes Ocean Park',
      address: 'Vinhomes Ocean Park, Gia Lâm, Hà Nội',
      priceText: '3.5 triệu/tháng',
      priceRaw: 3500000,
      areaText: '25 m²',
      gender: 'Nữ',
      badgeText: '1 bạn nữ ở ghép',
      badgeColor: 'purple',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 6,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
    },
    // Ở ghép - Phòng trọ (image20)
    {
      id: 18,
      category: 'o-ghep',
      subCategory: 'phong-tro',
      title: 'Dạng phòng: Studio Cầu Giấy',
      address: 'Cầu Giấy, Hà Nội',
      priceText: '2.3 triệu/tháng',
      priceRaw: 2300000,
      areaText: 'Studio',
      gender: 'Nữ',
      badgeText: '1 bạn nữ ở ghép',
      badgeColor: 'purple',
      timeText: 'Đăng 1 giờ trước',
      imageCount: 5,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 19,
      category: 'o-ghep',
      subCategory: 'phong-tro',
      title: 'Dạng phòng: Các xép, giường tầng Đống Đa',
      address: 'Đống Đa, Hà Nội',
      priceText: '2.5 triệu/tháng',
      priceRaw: 2500000,
      areaText: 'Giường tầng',
      gender: 'Nam',
      badgeText: '1 bạn nam ở ghép',
      badgeColor: 'blue',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 8,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
    },
    // Ở ghép - Nhà nguyên căn (image26)
    {
      id: 20,
      category: 'o-ghep',
      subCategory: 'nha-nguyen-can',
      title: 'Nhà nguyên căn 3 tầng Tây Hồ',
      address: 'Đặng Thai Mai, Tây Hồ, Hà Nội',
      priceText: '6.5 triệu/tháng',
      priceRaw: 6500000,
      areaText: '120 m²',
      gender: 'Nam/Nữ',
      badgeText: '2 bạn ở ghép',
      badgeColor: 'blue',
      timeText: 'Đăng 2 giờ trước',
      imageCount: 12,
      zaloNumber: '0876480130',
      image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Xóa cache rooms_db cũ nếu còn tồn tại
  useEffect(() => {
    localStorage.removeItem('rooms_db');
  }, []);

  const mapRoomData = (r) => {
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
      } catch (e) {}
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
      image = r.photos[0].url || r.photos[0];
    } else if (r.videos && r.videos.length > 0 && r.videos[0].thumb) {
      image = r.videos[0].thumb;
    } else {
      image = NO_IMAGE_PLACEHOLDER;
    }

    // Find closest landmark
    let nearPlace = '';
    let distanceText = '';
    if (isManual && manualData) {
      if (manualData.customLandmarks && manualData.customLandmarks.length > 0) {
        const firstCl = manualData.customLandmarks[0];
        nearPlace = firstCl.name || '';
        distanceText = firstCl.distanceText ? `Cách ${firstCl.name} • ${firstCl.distanceText}` : '';
      } else {
        nearPlace = manualData.nearPlace || '';
        distanceText = manualData.distanceText || '';
      }
    } else if (r.distances && r.distances.length > 0) {
      const sortedDist = [...r.distances].sort((a, b) => a.distance - b.distance);
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
      title: isManual && manualData ? manualData.title : (r.room_code ? `Phòng trọ mã ${r.room_code}` : (r.room_type ? `Dạng phòng: ${r.room_type}` : 'Phòng trọ khép kín')),
      address,
      nearPlace,
      distanceText,
      priceText,
      priceRaw: isManual && manualData ? (manualData.priceRaw || 0) : (num || 0),
      areaText: isManual && manualData ? (manualData.areaText || 'Chưa cập nhật') : (r.room_type || 'Chưa cập nhật'),
      badgeText: isManual && manualData ? (manualData.badgeText || 'Mới đăng') : 'Mới đăng',
      badgeColor: isManual && manualData ? (manualData.badgeColor || 'red') : 'red',
      timeText: formatTimeText(r.created_at),
      imageCount: isManual && manualData ? 1 : (r.photos ? r.photos.length : 0),
      videoCount: isManual && manualData ? 0 : (r.videos ? r.videos.length : 0),
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

  const refreshRooms = (shouldDeepLink = false) => {
    setLoadingRooms(true);
    // Fetch page 1 first for fast initial render (300 rooms)
    fetch(`/api/rooms?t=${Date.now()}&limit=300&page=1`)
      .then(res => res.json())
      .then(response => {
        const data = Array.isArray(response) ? response : (response.data || []);
        const hasMore = response.hasMore;
        const total = response.total || 0;

        if (data.length > 0) {
          const mapped = data.map(mapRoomData);
          setRooms(mapped);

          if (shouldDeepLink) {
            const urlParams = new URLSearchParams(window.location.search);
            const roomIdParam = urlParams.get('room');
            if (roomIdParam) {
              const targetRoom = mapped.find(r => String(r.session_id) === roomIdParam || String(r.id) === roomIdParam);
              if (targetRoom) {
                setSelectedRoomId(roomIdParam);
                const detailPage = targetRoom.category === 'chung-cu' ? 'chung-cu-detail'
                  : targetRoom.category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail'
                  : 'phong-tro-detail';
                setCurrentPage(detailPage);
              } else {
                // Specific direct fetch for the deep-linked room since it's not in the first page
                const isNumericId = /^\d+$/.test(roomIdParam);
                const queryParam = isNumericId ? `id=${roomIdParam}` : `session_id=${roomIdParam}`;
                fetch(`/api/rooms?${queryParam}`)
                  .then(r => r.json())
                  .then(resp => {
                    const respData = Array.isArray(resp) ? resp : (resp.data || []);
                    if (respData.length > 0) {
                      const roomObj = mapRoomData(respData[0]);
                      setRooms(prev => {
                        if (prev.some(r => r.id === roomObj.id)) return prev;
                        return [roomObj, ...prev];
                      });
                      setSelectedRoomId(roomIdParam);
                      const detailPage = roomObj.category === 'chung-cu' ? 'chung-cu-detail'
                        : roomObj.category === 'nha-nguyen-can' ? 'nha-nguyen-can-detail'
                        : 'phong-tro-detail';
                      setCurrentPage(detailPage);
                    }
                  })
                  .catch(err => console.error('Error fetching deep linked room:', err));
              }
            }
          }

          // Background: fetch remaining pages in parallel batches
          if (hasMore && total > 300) {
            const totalPages = Math.ceil(total / 300);
            const pagesToFetch = [];
            for (let p = 2; p <= totalPages; p++) {
              pagesToFetch.push(p);
            }

            const concurrency = 6;
            let index = 0;

            const fetchNextBatch = () => {
              if (index >= pagesToFetch.length) return;

              const promises = [];
              for (let i = 0; i < concurrency && index < pagesToFetch.length; i++) {
                const pageNum = pagesToFetch[index++];
                promises.push(
                  fetch(`/api/rooms?limit=300&page=${pageNum}`)
                    .then(r => r.json())
                    .then(resp => {
                      const pageData = Array.isArray(resp) ? resp : (resp.data || []);
                      return pageData.map(mapRoomData);
                    })
                    .catch(err => {
                      console.error(`Error loading page ${pageNum}:`, err);
                      return [];
                    })
                );
              }

              Promise.all(promises).then(results => {
                const allNewRooms = results.flat();
                if (allNewRooms.length > 0) {
                  setRooms(prev => {
                    const existingIds = new Set(prev.map(r => r.id));
                    const newRooms = allNewRooms.filter(r => !existingIds.has(r.id));
                    return newRooms.length > 0 ? [...prev, ...newRooms] : prev;
                  });
                }
                // Continue fetching next batch
                fetchNextBatch();
              });
            };

            setTimeout(fetchNextBatch, 300);
          }
        } else {
          setRooms([]);
        }
      })
      .catch(err => {
        console.error('Error fetching SQLite rooms:', err);
        setRooms([]);
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  };

  const handleFiltersChange = (filters) => {
    // If there is an active filter or search query, fetch matching rooms from the server immediately
    if (filters.q || filters.district || filters.landmark || filters.roomType || filters.gender) {
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('page', '1');
      if (filters.category && filters.category !== 'saved-rooms' && filters.category !== 'viewed-rooms') {
        params.append('category', filters.category);
        params.append('status', 'approved');
      }
      if (filters.q) params.append('q', filters.q);
      if (filters.district) params.append('district', filters.district);
      if (filters.landmark) params.append('landmark', filters.landmark);
      if (filters.roomType) params.append('type', filters.roomType);

      fetch(`/api/rooms?${params.toString()}`)
        .then(res => res.json())
        .then(response => {
          const data = Array.isArray(response) ? response : (response.data || []);
          if (data.length > 0) {
            const mapped = data.map(mapRoomData);
            setRooms(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              const newRooms = mapped.filter(r => !existingIds.has(r.id));
              return newRooms.length > 0 ? [...newRooms, ...prev] : prev;
            });
          }
        })
        .catch(err => console.error('Error fetching filtered rooms:', err));
    }
  };

  useEffect(() => {
    refreshRooms(true);
  }, []);


  // Selected property helper
  const selectedRoom = rooms.find((r) => 
    (r.session_id && String(r.session_id) === String(selectedRoomId)) || 
    String(r.id) === String(selectedRoomId)
  );

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('home');
  };

  const renderView = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeView
            rooms={rooms}
            loadingRooms={loadingRooms}
            setCurrentPage={setCurrentPage}
            user={user}
            savedRoomIds={savedRoomIds}
            toggleSaveRoom={handleToggleSave}
            setSelectedRoomId={setSelectedRoomId}
            navigateToRoom={navigateToRoom}
            onOpenLogin={handleOpenLogin}
            isMobile={isMobile}
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setShowMobileNoti(true)}
            settings={settings}
          />
        );

      case 'chinh-sach-bao-mat':
        return (
          <PolicyView
            isMobile={isMobile}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'gioi-thieu':
        return (
          <AboutView
            isMobile={isMobile}
            setCurrentPage={setCurrentPage}
          />
        );

      // Categories listings
      case 'phong-tro':
      case 'chung-cu':
      case 'nha-nguyen-can':
      case 'can-ho-dich-vu':
      case 'mat-bang-kinh-doanh':
      case 'pass-phong':
      case 'o-ghep':
      case 'saved-rooms':
      case 'viewed-rooms':
        const listingRooms =
          currentPage === 'saved-rooms' ? rooms.filter(r => savedRoomIds.includes(r.id)) :
            currentPage === 'viewed-rooms' ? rooms.slice(0, 3) :
              rooms;
        return (
          <ListingView
            category={currentPage}
            rooms={listingRooms}
            loadingRooms={loadingRooms}
            savedRoomIds={savedRoomIds}
            toggleSaveRoom={handleToggleSave}
            setSelectedRoomId={setSelectedRoomId}
            setCurrentPage={setCurrentPage}
            navigateToRoom={navigateToRoom}
            isMobile={isMobile}
            user={user}
            settings={settings}
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setShowMobileNoti(true)}
            onFiltersChange={handleFiltersChange}
          />
        );

      // Detail Views
      case 'phong-tro-detail':
      case 'chung-cu-detail':
      case 'nha-nguyen-can-detail':
        return <DetailView room={selectedRoom} setCurrentPage={setCurrentPage} isMobile={isMobile} user={user} />;

      // Admin Dashboard
      case 'admin-dashboard':
        if (!user || (user.role !== 'admin' && user.role !== 'ctv')) {
          setCurrentPage('home');
          return null;
        }
        return (
          <AdminDashboardView
            rooms={rooms}
            setRooms={setRooms}
            setCurrentPage={setCurrentPage}
            isMobile={isMobile}
            settings={settings}
            fetchSettings={fetchSettings}
            refreshRooms={refreshRooms}
            user={user}
          />
        );

      // Affiliate Campaigns portal
      case 'kiem-tien':
        return (
          <EarnHubView 
            setCurrentPage={setCurrentPage} 
            isMobile={isMobile} 
            settings={settings} 
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setShowMobileNoti(true)}
          />
        );
      case 'kiem-tien-tiktok':
        return <TikTokCampaignView setCurrentPage={setCurrentPage} isMobile={isMobile} settings={settings} />;
      case 'kiem-tien-referral':
        return <ClientReferralView setCurrentPage={setCurrentPage} isMobile={isMobile} />;
      case 'kiem-tien-invite':
        return <FriendInviteView user={user} setCurrentPage={setCurrentPage} onOpenLogin={handleOpenLogin} isMobile={isMobile} settings={settings} onUserUpdate={handleUserUpdate} />;

      // Wallet dashboard
      case 'wallet':
        return <WalletView user={user} onOpenLogin={handleOpenLogin} isMobile={isMobile} setCurrentPage={setCurrentPage} settings={settings} onUserUpdate={handleUserUpdate} />;

      // Profile Dashboard & Official disclosures
      case 'profile':
        return (
          <ProfileView
            user={user}
            setCurrentPage={setCurrentPage}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            isMobile={isMobile}
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setShowMobileNoti(true)}
          />
        );

      default:
        return <div style={{ padding: '40px', textAlign: 'center' }}>Đang phát triển...</div>;
    }
  };

  return (
    <div className={`app-container ${isMobile ? 'is-mobile' : ''}`}>
      {/* Persistent left sidebar */}
      {!isMobile && (
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onContactSupport={handleSupportChat}
          user={user}
        />
      )}

      {/* Main Work Area */}
      <div className={`main-content ${isMobile ? 'mobile-main' : ''}`}>
        {!isMobile && (
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            user={user}
            savedRoomsCount={savedRoomIds.length}
            onOpenLogin={handleOpenLogin}
            onLogout={handleLogout}
            notifications={notifications}
            unreadNotificationsCount={unreadNotificationsCount}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}

        <div className={`content-body ${isMobile ? 'mobile-body' : ''}`}>
          {renderView()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Auth Modals Overlay */}
      <AuthModals
        isOpen={isAuthOpen}
        type={authType}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          alert(`Đăng nhập thành công! Chào mừng ${userData.name}`);
        }}
      />

      {/* Mobile Notifications Drawer/Sheet */}
      {isMobile && showMobileNoti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }} onClick={() => setShowMobileNoti(false)}>
          <div style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Thông báo</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {unreadNotificationsCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead} 
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--zalo-blue)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Đọc tất cả
                  </button>
                )}
                <button 
                  onClick={() => setShowMobileNoti(false)} 
                  style={{
                    border: 'none',
                    background: '#F1F5F9',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map((noti) => (
                  <div key={noti.id} style={{
                    padding: '14px 12px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    backgroundColor: noti.read ? 'transparent' : 'rgba(0, 104, 255, 0.03)'
                  }}>
                    {!noti.read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--zalo-blue)',
                        borderRadius: '50%',
                        marginTop: '5px',
                        flexShrink: 0
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        lineHeight: 1.4,
                        color: 'var(--text-dark)',
                        fontWeight: noti.read ? '500' : '700',
                        textAlign: 'left'
                      }}>{noti.message}</p>
                      <span style={{
                        display: 'block',
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        textAlign: 'left'
                      }}>{noti.created_at}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
