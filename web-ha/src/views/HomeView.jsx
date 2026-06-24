import React, { useState, useEffect, useMemo } from 'react';
import image47 from '../../images/image47.png';
import { getNearestLandmarks, NO_IMAGE_PLACEHOLDER } from '../utils/helpers';
import {
  Building2,
  Building,
  Warehouse,
  Store,
  KeyRound,
  Users2,
  ArrowRight,
  Heart,
  Copy,
  PlusCircle,
  Video,
  UserPlus,
  Share2,
  MapPin,
  Clock,
  ExternalLink,
  UserCircle,
  School,
  Check,
  Info,
  Search,
  Bell,
  Train,
  Bus,
  Plus,
  GraduationCap
} from 'lucide-react';

const HomeView = ({
  rooms,
  loadingRooms,
  setCurrentPage,
  user,
  savedRoomIds,
  toggleSaveRoom,
  setSelectedRoomId,
  navigateToRoom,
  onOpenLogin,
  isMobile,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  settings
}) => {
  const [activeCategory, setActiveCategory] = useState('phong-tro');
  const maxPriceLimit = (activeCategory === 'can-ho-dich-vu' || activeCategory === 'mat-bang-kinh-doanh' || activeCategory === 'nha-nguyen-can') ? 50 : 20;
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(maxPriceLimit);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);

  useEffect(() => {
    setPriceMin(0);
    setPriceMax(maxPriceLimit);
  }, [activeCategory, maxPriceLimit]);

  const [typedText1, setTypedText1] = useState('');
  const [typedText2, setTypedText2] = useState('');
  const [typedText3, setTypedText3] = useState('');

  const bannerText1 = "Nhận ngay 100.000đ";
  const bannerText2 = "khi chốt phòng thành công";
  const bannerText3 = "Giới thiệu khách thuê, sáng tạo video hoặc mời bạn bè tham gia để nhận hoa hồng hấp dẫn từ 80Land.";

  useEffect(() => {
    if (isMobile) return; // Skip typewriter on mobile to improve loading speed
    const fullText1 = bannerText1;
    const fullText2 = bannerText2;
    const fullText3 = bannerText3;

    let timer;
    let index1 = 0;
    let index2 = 0;
    let index3 = 0;

    const startTyping = () => {
      setTypedText1('');
      setTypedText2('');
      setTypedText3('');
      index1 = 0;
      index2 = 0;
      index3 = 0;

      const type = () => {
        if (index1 < fullText1.length) {
          setTypedText1(fullText1.substring(0, index1 + 1));
          index1++;
          timer = setTimeout(type, 40);
        } else if (index2 < fullText2.length) {
          setTypedText2(fullText2.substring(0, index2 + 1));
          index2++;
          timer = setTimeout(type, 40);
        } else if (index3 < fullText3.length) {
          setTypedText3(fullText3.substring(0, index3 + 1));
          index3++;
          timer = setTimeout(type, 20);
        } else {
          // Pause for 10 seconds before restarting
          timer = setTimeout(startTyping, 10000);
        }
      };

      type();
    };

    startTyping();

    return () => clearTimeout(timer);
  }, [isMobile]);

  const renderRoomTypeModal = () => {
    if (!showRoomTypeModal) return null;
    const categoriesList = [
      { label: 'Phòng trọ', value: 'phong-tro' },
      { label: 'Chung cư', value: 'chung-cu' },
      { label: 'Nhà nguyên căn', value: 'nha-nguyen-can' },
      { label: 'Căn hộ dịch vụ', value: 'can-ho-dich-vu' },
      { label: 'Mặt bằng kinh doanh', value: 'mat-bang-kinh-doanh' },
      { label: 'Pass phòng', value: 'pass-phong' }
    ];
    return (
      <div className="mobile-filter-modal-overlay" onClick={() => setShowRoomTypeModal(false)}>
        <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-filter-modal-header">
            <span>Chọn Loại phòng</span>
            <button className="mobile-filter-modal-close" onClick={() => setShowRoomTypeModal(false)}>×</button>
          </div>
          <div className="mobile-filter-modal-body">
            {categoriesList.map((type, idx) => (
              <div
                key={idx}
                className={`mobile-filter-modal-item ${activeCategory === type.value ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(type.value);
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

  if (isMobile) {
    // Filter rooms by active category and price range
    const mobileFilteredRooms = useMemo(() => {
      return rooms.filter(room => {
        if (room.category !== activeCategory) return false;
        if (room.priceRaw) {
          const minPriceRaw = priceMin * 1000000;
          const maxPriceRaw = priceMax >= maxPriceLimit ? Infinity : priceMax * 1000000;
          if (room.priceRaw < minPriceRaw || room.priceRaw > maxPriceRaw) return false;
        }
        return true;
      }).slice(0, 20);
    }, [rooms, activeCategory, priceMin, priceMax, maxPriceLimit]);

    return (
      <div className="home-mobile-layout">
        {/* Brand Row Header */}
        <div className="mobile-brand-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/ic.png" 
              alt="80Land Logo" 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '6px', 
                objectFit: 'cover' 
              }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 className="mobile-brand-title" style={{ fontSize: '20px' }}>80Land</h1>
              <p className="mobile-brand-sub" style={{ marginTop: '0px' }}>Tìm phòng nhanh</p>
            </div>
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

        {/* Promo Banner */}
        <div style={{ padding: '0 4px', margin: '8px 0' }}>
          <div style={{
            background: `url(${image47}) no-repeat center right / cover`,
            border: '1px solid #BAE6FD',
            borderRadius: '12px',
            padding: '20px 16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            minHeight: '100px'
          }}>
            <div style={{ zIndex: 1, flex: 1, paddingRight: '35%' }}>
              <span style={{
                background: 'var(--primary-red)',
                color: '#FFFFFF',
                fontSize: '8px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                width: 'fit-content',
                display: 'inline-block'
              }}>MỚI NHẤT</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.3, margin: '6px 0 0 0' }}>
                Nhận ngay <span style={{ color: 'var(--primary-red)' }}>100.000đ</span>
              </h3>
              <p style={{ fontSize: '10px', color: '#334155', marginTop: '2px', margin: '2px 0 0 0', fontWeight: 600 }}>
                khi chốt phòng thành công qua hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mobile-search-wrapper">
          <div className="mobile-search-bar" onClick={() => setCurrentPage(activeCategory)}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên, đường, khu vực..."
              className="mobile-search-input"
              readOnly
            />
          </div>
        </div>

        {/* Horizontal Filters Row matching image6.png exactly */}
        <div className="mobile-filter-badges-row">
          <div className="mobile-filter-badge" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--zalo-blue)' }}>
              <GraduationCap size={16} />
            </div>
            <span>Gần đại học</span>
          </div>
          <div className="mobile-filter-badge" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#F5F3FF', color: 'var(--purple-badge)' }}>
              <GraduationCap size={16} />
            </div>
            <span>Gần cao đẳng</span>
          </div>
          <div className="mobile-filter-badge" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#FFF0F1', color: 'var(--primary-red)' }}>
              <Plus size={16} strokeWidth={3} />
            </div>
            <span>Gần bệnh viện</span>
          </div>
          <div className="mobile-filter-badge" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#FFFBEB', color: 'var(--warning-orange)' }}>
              <Bus size={16} />
            </div>
            <span>Gần bến xe</span>
          </div>
          <div className="mobile-filter-badge" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-badge-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--success-green)' }}>
              <Train size={16} />
            </div>
            <span>Gần ga metro</span>
          </div>
        </div>

        {/* Unified Filter Card matching image6.png */}
        <div className="mobile-unified-filter-card">
          {/* Row 1: Khu vực */}
          <div className="mobile-filter-row" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-row-left">
              <MapPin size={16} />
              <span>Khu vực</span>
            </div>
            <div className="mobile-filter-row-right">
              <span>Chọn khu vực</span>
              <span className="arrow-icon">&gt;</span>
            </div>
          </div>

          {/* Row 2: Thành phố */}
          <div className="mobile-filter-row" onClick={() => setCurrentPage(activeCategory)}>
            <div className="mobile-filter-row-left">
              <MapPin size={16} />
              <span>Thành phố</span>
            </div>
            <div className="mobile-filter-row-right">
              <span>Chọn thành phố</span>
              <span className="arrow-icon">&gt;</span>
            </div>
          </div>

          {/* Row 3: Loại phòng */}
          <div className="mobile-filter-row" onClick={() => setShowRoomTypeModal(true)}>
            <div className="mobile-filter-row-left">
              <Building2 size={16} />
              <span>Loại phòng</span>
            </div>
            <div className="mobile-filter-row-right">
              <span style={{ textTransform: 'capitalize' }}>
                {activeCategory === 'phong-tro' ? 'Phòng trọ' : 
                 activeCategory === 'chung-cu' ? 'Chung cư' : 
                 activeCategory === 'nha-nguyen-can' ? 'Nhà nguyên căn' : 
                 activeCategory === 'can-ho-dich-vu' ? 'Căn hộ dịch vụ' : 
                 activeCategory === 'mat-bang-kinh-doanh' ? 'Mặt bằng kinh doanh' : 
                 activeCategory === 'pass-phong' ? 'Pass phòng' : 'Phòng trọ'}
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

        {/* Featured Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800 }}>
            {activeCategory === 'phong-tro' ? 'Phòng trọ' : 
             activeCategory === 'chung-cu' ? 'Chung cư' : 
             activeCategory === 'nha-nguyen-can' ? 'Nhà nguyên căn' : 
             activeCategory === 'can-ho-dich-vu' ? 'Căn hộ dịch vụ' : 
             activeCategory === 'mat-bang-kinh-doanh' ? 'Mặt bằng kinh doanh' : 
             activeCategory === 'pass-phong' ? 'Pass phòng' : 'Phòng'} nổi bật
          </h2>
          <span
            style={{ fontSize: '12px', color: 'var(--primary-red)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setCurrentPage(activeCategory)}
          >
            Xem tất cả &gt;
          </span>
        </div>

        {/* Rooms Grid */}
        <div className="mobile-room-grid">
          {loadingRooms ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              <span className="loading-spinner">⏳</span> Đang tải thông tin phòng...
            </div>
          ) : (
            <>
              {mobileFilteredRooms.map((room) => {
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
                      <img src={room.image || NO_IMAGE_PLACEHOLDER} alt={room.title} className="mobile-card-img" />
                      <span className={`mobile-card-badge ${room.badgeColor || 'red'}`}>
                        {room.badgeText || 'Mới'}
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

                    <div className="mobile-card-content">
                      <span style={{ fontSize: '8px', color: 'var(--success-green)', fontWeight: 800, border: '1px solid var(--success-green)', padding: '1px 4px', borderRadius: '3px', width: 'fit-content' }}>
                        Xác thực
                      </span>
                      <h3 className="mobile-card-title">
                        {room.title}
                      </h3>
                      <div className="mobile-card-address">
                        {room.address}
                      </div>
                      <div className="mobile-card-price">
                        {room.priceText}
                      </div>
                      <div className="mobile-card-specs">
                        {room.areaText} • {room.nearPlace || 'Cận'}
                      </div>
                    </div>

                    <div className="mobile-card-footer">
                      <span>{room.timeText || '1 ngày trước'}</span>
                      <button
                        className="mobile-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://zalo.me/${room.zaloNumber || '0876480130'}`, '_blank');
                        }}
                      >
                        Liên hệ Zalo
                      </button>
                    </div>
                  </div>
                );
              })}
              {mobileFilteredRooms.length === 0 && (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Không tìm thấy phòng phù hợp
                </div>
              )}
            </>
          )}
        </div>
        {renderRoomTypeModal()}
      </div>
    );
  }

  const categories = [
    { id: 'phong-tro', label: 'Phòng trọ', iconUrl: '/icon-phong-tro.png' },
    { id: 'chung-cu', label: 'Chung cư', iconUrl: '/icon-chung-cu.png' },
    { id: 'nha-nguyen-can', label: 'Nhà nguyên căn', iconUrl: '/icon-nha-nguyen-can.png' },
    { id: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ', iconUrl: '/icon-can-ho-dich-vu.png' },
    { id: 'mat-bang-kinh-doanh', label: 'Mặt bằng KD', iconUrl: '/icon-mat-bang-kd.png' },
    { id: 'pass-phong', label: 'Pass phòng', iconUrl: '/icon-pass-phong.png' },
    { id: 'o-ghep', label: 'Ở ghép', iconUrl: '/icon-o-ghep.png' }
  ];

  // Filters for Desktop rows (price >= 4M)
  const featuredPhongs = useMemo(() => rooms.filter(r => r.category === 'phong-tro' && r.priceRaw >= 4000000).slice(0, 12), [rooms]);
  const featuredChungCus = useMemo(() => rooms.filter(r => r.category === 'chung-cu' && r.priceRaw >= 4000000).slice(0, 4), [rooms]);
  const featuredNhaNguyenCans = useMemo(() => rooms.filter(r => r.category === 'nha-nguyen-can' && r.priceRaw >= 4000000).slice(0, 4), [rooms]);

  const renderDesktopCard = (room) => {
    const isSaved = savedRoomIds.includes(room.id);
    let displayName = '';
    let displayDist = '';
    if (room.nearPlace && room.distanceText) {
      displayName = room.nearPlace.trim();
      displayDist = room.distanceText.includes('•') ? room.distanceText.split('•')[1]?.trim() : room.distanceText;
    } else {
      const nearest = getNearestLandmarks(room.address)[0];
      if (nearest) {
        displayName = nearest.name.trim();
        displayDist = nearest.distText;
      }
    }

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
          <img src={room.image || NO_IMAGE_PLACEHOLDER} alt={room.title} className="room-card-image" />
          <button
            className={`room-card-favorite ${isSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveRoom(room.id);
            }}
          >
            <Heart size={16} fill={isSaved ? "var(--primary-red)" : "none"} />
          </button>
        </div>

        <div className="room-card-content" style={{ userSelect: 'text' }}>
          <h3 className="room-card-title" style={{ fontWeight: 400 }}>
            <strong style={{ fontWeight: 700 }}>
              {room.category === 'chung-cu' ? 'Tên chung cư' : room.category === 'mat-bang-kinh-doanh' ? 'Diện tích' : 'Dạng phòng'}:
            </strong>{' '}
            {room.category === 'chung-cu' 
              ? (room.buildingName || room.title) 
              : room.category === 'mat-bang-kinh-doanh' 
                ? (room.roomType || room.areaText || 'Chưa xác định') 
                : (room.roomType || 'Studio')}
          </h3>

          <div className="room-card-address">
            <MapPin size={12} style={{ color: 'var(--primary-red)', marginTop: '3px', flexShrink: 0 }} />
            <span>Địa chỉ: {room.address}</span>
          </div>

          <div className="room-card-price-row" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
            <span className="room-card-price" style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>Giá: {room.priceText}</span>
          </div>

          {(displayName && displayDist) && (
            <div className="room-card-distance">
              <School size={12} style={{ color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
              <span>Cách {displayName} • {displayDist}</span>
            </div>
          )}
        </div>

        <div className="room-card-footer">
          <span>{room.timeText || '10 ngày trước'}</span>
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
  };


  const handleCopyCode = () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    navigator.clipboard.writeText(user.referralCode);
    alert(`Đã sao chép mã giới thiệu: ${user.referralCode}`);
  };

  const handleShareCode = () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: 'Mã giới thiệu 80Land',
        text: `Tham gia cùng tôi trên 80Land! Nhập mã giới thiệu của tôi: ${user.referralCode}`,
        url: window.location.origin
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(user.referralCode);
      alert(`Đã sao chép liên kết giới thiệu cùng mã: ${user.referralCode}`);
    }
  };

  return (
    <div className="home-layout">
      {/* Left Column */}
      <div>
        {/* AI Banner */}
        <div 
          className="ai-banner"
          style={{
            background: `linear-gradient(90deg, #F0F5FF 0%, #F0F5FF 45%, rgba(240, 245, 255, 0.9) 60%, transparent 80%), url(${image47}) no-repeat right center / cover`,
            minHeight: '180px',
            border: '1px solid #BAE6FD',
            display: 'flex',
            alignItems: 'center',
            padding: '16px 28px'
          }}
        >
          <div className="ai-banner-content" style={{ maxWidth: '60%', zIndex: 2 }}>
            <span className="ai-banner-badge" style={{ background: 'var(--primary-red)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px' }}>MỚI NHẤT</span>
            <h1 className="ai-banner-title" style={{ minHeight: '84px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', margin: '8px 0' }}>
              <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '24px' }}>
                {typedText1.length <= 10 ? (
                  typedText1
                ) : (
                  <>
                    Nhận ngay{" "}
                    <span style={{ color: 'var(--primary-red)' }}>
                      {typedText1.substring(10)}
                    </span>
                  </>
                )}
                {typedText1.length < bannerText1.length && <span className="typewriter-cursor" />}
              </span>
              {typedText2 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '8px 20px',
                  borderRadius: '50px',
                  width: 'fit-content',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginTop: '4px'
                }}>
                  {typedText2}
                  {typedText1.length === bannerText1.length && typedText2.length < bannerText2.length && <span className="typewriter-cursor" style={{ backgroundColor: '#FFF' }} />}
                </span>
              )}
            </h1>
            <p className="ai-banner-desc" style={{ minHeight: '40px', margin: 0, fontWeight: 500, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
              {typedText3}
              {typedText2.length === bannerText2.length && typedText3.length < bannerText3.length && <span className="typewriter-cursor" />}
            </p>
          </div>
        </div>

        {/* Categories grid */}
        <div className="category-row">
          {categories.map((cat) => {
            return (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => {
                  setCurrentPage(cat.id);
                }}
              >
                <div className="category-icon-wrapper">
                  <img
                    src={cat.iconUrl}
                    alt={cat.label}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span className="category-card-name">{cat.label}</span>
              </div>
            );
          })}
        </div>


        {/* Section 1: Phòng trọ nổi bật */}
        <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('phong-tro')}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Phòng trọ nổi bật</h2>
          <div className="section-link">
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </div>
        </div>
        <div className="room-grid-4" style={{ marginBottom: '32px' }}>
          {loadingRooms ? (
            <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px 20px', color: '#64748B', fontWeight: 600 }}>
              <span className="loading-spinner">⏳</span> Đang tải thông tin phòng...
            </div>
          ) : (
            <>
              {featuredPhongs.map((room) => renderDesktopCard(room))}
              {featuredPhongs.length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px', color: '#64748B' }}>Chưa có phòng trọ nổi bật giá từ 4 triệu trở lên</div>
              )}
            </>
          )}
        </div>

        {/* Section 2: Chung cư nổi bật */}
        <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('chung-cu')}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Chung cư nổi bật</h2>
          <div className="section-link">
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </div>
        </div>
        <div className="room-grid-4" style={{ marginBottom: '32px' }}>
          {loadingRooms ? (
            <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px 20px', color: '#64748B', fontWeight: 600 }}>
              <span className="loading-spinner">⏳</span> Đang tải thông tin phòng...
            </div>
          ) : (
            <>
              {featuredChungCus.map((room) => renderDesktopCard(room))}
              {featuredChungCus.length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px', color: '#64748B' }}>Chưa có chung cư nổi bật giá từ 4 triệu trở lên</div>
              )}
            </>
          )}
        </div>

        {/* Section 3: Nhà nguyên căn nổi bật */}
        <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('nha-nguyen-can')}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Nhà nguyên căn nổi bật</h2>
          <div className="section-link">
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </div>
        </div>
        <div className="room-grid-4" style={{ marginBottom: '32px' }}>
          {loadingRooms ? (
            <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px 20px', color: '#64748B', fontWeight: 600 }}>
              <span className="loading-spinner">⏳</span> Đang tải thông tin phòng...
            </div>
          ) : (
            <>
              {featuredNhaNguyenCans.map((room) => renderDesktopCard(room))}
              {featuredNhaNguyenCans.length === 0 && (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px', color: '#64748B' }}>Chưa có nhà nguyên căn nổi bật giá từ 4 triệu trở lên</div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Right Column (Sidebar Panel) */}
      <div className="home-right-panel">
        {/* User Card */}
        {user ? (
          <div className="panel-card profile-panel">
            <div className="profile-avatar-container">
              <div className="profile-avatar-inner">
                <img src={user.avatar} alt={user.name} className="profile-panel-avatar" />
              </div>
            </div>
            <div className="profile-panel-name">
              Xin chào, <span className="profile-name-bold">{user.name}</span>
            </div>

            <div className="referral-box-wrapper">
              <svg viewBox="0 0 240 68" className="referral-box-bg">
                <path d="M 16,0 L 130,0 C 145,0 145,20 160,20 L 224,20 Q 240,20 240,36 L 240,52 Q 240,68 224,68 L 16,68 Q 0,68 0,52 L 0,16 Q 0,0 16,0 Z" fill="#F1F5F9" />
              </svg>
              <div className="referral-box-content">
                <span className="referral-label">Mã giới thiệu của bạn</span>
                <span className="referral-code">{user.referralCode}</span>
                <div className="referral-actions">
                  <button className="copy-btn" onClick={handleCopyCode} title="Sao chép">
                    <Copy size={14} />
                  </button>
                  <button className="share-btn" onClick={handleShareCode} title="Chia sẻ">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel-card profile-panel" style={{ padding: '20px' }}>
            <div className="profile-avatar-container" style={{ boxShadow: 'none', background: 'none', padding: '0', width: 'auto', height: 'auto', margin: '0 auto 12px' }}>
              <div className="profile-panel-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', border: 'none', margin: '0 auto' }}>
                <UserCircle size={40} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div className="profile-panel-name" style={{ color: 'var(--zalo-blue)', textAlign: 'center', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }} onClick={onOpenLogin}>
              Đăng nhập / Đăng ký
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Mã giới thiệu của bạn</span>
              <span style={{ fontSize: '12px', color: 'var(--primary-red)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>Bạn đăng ký tài khoản để có mã nha</span>
              <button 
                onClick={onOpenLogin}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--primary-red) 0%, #BE123C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Lấy mã giới thiệu
              </button>
            </div>
          </div>
        )}


        {/* Commission Wallet Card */}
        <div className="panel-card wallet-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="wallet-panel-title" style={{ marginBottom: 0 }}>Ví hoa hồng</span>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginLeft: '6px' }}>
                <circle cx="12" cy="12" r="10" fill="url(#goldGrad)" stroke="#D97706" strokeWidth="1" />
                <circle cx="12" cy="12" r="8" fill="none" stroke="#FBBF24" strokeWidth="0.75" />
                <text x="12" y="15.5" fontSize="11" fontWeight="900" fill="#B45309" textAnchor="middle" fontFamily="sans-serif">$</text>
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="30%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Info size={16} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div className="wallet-panel-amount">
              {user ? `${(user.walletBalance || 0).toLocaleString('vi-VN')}đ` : '0đ'}
            </div>
            <Info size={14} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginTop: '-4px' }} />
          </div>

          <div className="wallet-panel-pending">
            <Clock size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} />
            <span style={{ verticalAlign: 'middle' }}>Chờ duyệt: {user ? `${(user.pendingCommissions || 0).toLocaleString('vi-VN')}đ` : '0đ'}</span>
          </div>

          <button
            className="wallet-panel-btn"
            onClick={() => {
              if (!user) onOpenLogin();
              else setCurrentPage('wallet');
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M19 5v6a4 4 0 0 1-4 4H5" />
              <polyline points="9 11 5 15 9 19" />
            </svg>
            <span>Rút tiền</span>
          </button>

          <svg viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', bottom: '6px', right: '6px', opacity: 0.25, pointerEvents: 'none' }}>
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Affiliate Campaign List */}
        <div className="panel-card">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Kiếm tiền cùng 80Land</h3>
          <div className="earn-channels-list">
            <div
              className="earn-channel-item"
              onClick={() => setCurrentPage('kiem-tien-tiktok')}
            >
              <div className="earn-channel-icon">
                <img src="/ic-video.png" alt="Sáng tạo video" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="earn-channel-info">
                <span className="earn-channel-title">Sáng tạo video</span>
                <span className="earn-channel-subtitle" style={{ color: '#10B981', fontWeight: 'bold' }}>Nhận tiền không giới hạn</span>
              </div>
              <ArrowRight size={14} className="earn-channel-arrow" />
            </div>

            <div
              className="earn-channel-item"
              onClick={() => setCurrentPage('kiem-tien-referral')}
            >
              <div className="earn-channel-icon">
                <img src="/ic-referral.png" alt="Giới thiệu khách thuê" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="earn-channel-info">
                <span className="earn-channel-title">Giới thiệu khách thuê</span>
                <span className="earn-channel-subtitle">Hoa hồng đến 25%</span>
              </div>
              <ArrowRight size={14} className="earn-channel-arrow" />
            </div>

            <div
              className="earn-channel-item"
              onClick={() => setCurrentPage('kiem-tien-invite')}
            >
              <div className="earn-channel-icon">
                <img src="/ic-invite.png" alt="Mời bạn bè" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="earn-channel-info">
                <span className="earn-channel-title">Mời bạn bè</span>
                <span className="earn-channel-subtitle" style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>Thưởng {((settings && settings.referral_commission) || 300000).toLocaleString('vi-VN')}đ</span>
              </div>
              <ArrowRight size={14} className="earn-channel-arrow" />
            </div>
          </div>

          <button
            className="earn-detail-btn"
            onClick={() => setCurrentPage('kiem-tien')}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

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



export default HomeView;
