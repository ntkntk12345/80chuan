import React, { useState } from 'react';
import {
  MapPin,
  School,
  Check,
  MessageSquare,
  Phone,
  Map,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users2,
  Heart,
  Share2,
  Copy
} from 'lucide-react';
import { getNearestLandmarks, NO_IMAGE_PLACEHOLDER } from '../utils/helpers';


const DetailView = ({ room, setCurrentPage, isMobile, user }) => {
  if (!room) return <div>Không tìm thấy thông tin phòng.</div>;

  const [showAllLandmarks, setShowAllLandmarks] = useState(false);

  // Resolve photos and videos
  const mediaItems = React.useMemo(() => {
    const items = [];
    if (room.photos && room.photos.length > 0) {
      room.photos.forEach(p => {
        const url = typeof p === 'string' ? p : (p.url || '');
        if (url) items.push({ type: 'image', url });
      });
    }
    
    // Prepend the cover image if not already present in the photos list
    if (room.image) {
      const hasCover = items.some(item => item.url === room.image);
      if (!hasCover) {
        items.unshift({ type: 'image', url: room.image });
      }
    }

    if (room.videos && room.videos.length > 0) {
      room.videos.forEach(v => {
        const url = typeof v === 'string' ? v : (v.url || '');
        if (url) items.push({ type: 'video', url });
      });
    }
    if (items.length === 0) {
      items.push({ type: 'image', url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600" });
    }
    return items;
  }, [room.photos, room.videos, room.image]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const nextImg = () => {
    setActiveImgIdx((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const prevImg = () => {
    setActiveImgIdx((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  // Format distance helper
  const formatDistance = (dist) => {
    const num = parseFloat(dist);
    if (isNaN(num)) return '';
    if (num < 1.0) {
      return `${Math.round(num * 1000)}m`;
    }
    return `${num} km`;
  };

  // Resolve landmarks list (from DB distances first, then fallback to mock helpers)
  const resolvedLandmarks = React.useMemo(() => {
    if (room.customLandmarks && room.customLandmarks.length > 0) {
      return room.customLandmarks.map(cl => ({
        name: cl.name,
        distText: cl.distanceText ? (cl.distanceText.includes('Cách') ? cl.distanceText : `Cách ${cl.distanceText}`) : 'Lân cận',
        category: 'custom'
      }));
    }
    if (room.distances && room.distances.length > 0) {
      const sorted = [...room.distances].sort((a, b) => a.distance - b.distance);
      return sorted.map(d => ({
        name: d.landmark_name,
        distText: formatDistance(d.distance),
        category: d.landmark_category
      }));
    }
    return getNearestLandmarks(room.address, 10);
  }, [room.customLandmarks, room.distances, room.address]);

  const displayedLandmarks = showAllLandmarks ? resolvedLandmarks : resolvedLandmarks.slice(0, 3);

  // Resolve description: handle both plain text and JSON-stringified manual posts
  const resolvedDescription = React.useMemo(() => {
    const raw = room.original_text || room.text2 || '';
    if (raw && raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.text2 || parsed.description || '';
      } catch (e) {
        return raw;
      }
    }
    return raw;
  }, [room.original_text, room.text2]);


  // Specific checklists based on category
  const checklists = {
    'nha-nguyen-can': [],
    'phong-tro': [],
    'chung-cu': []
  };

  const currentChecklist = checklists[room.category] || checklists['phong-tro'];

  const handleCopyDescription = () => {
    if (resolvedDescription) {
      navigator.clipboard.writeText(resolvedDescription);
      alert('Đã copy thông tin mô tả phòng!');
    } else {
      alert('Không có thông tin mô tả để copy.');
    }
  };

  if (isMobile) {
    // Build share URL with room ID
    const roomShareUrl = (() => {
      const url = new URL(window.location.href);
      url.searchParams.set('room', room.session_id || room.id);
      return url.toString();
    })();

    const handleShare = () => {
      if (navigator.share) {
        navigator.share({
          title: room.title || 'Chi tiết phòng trọ',
          text: room.address,
          url: roomShareUrl
        }).catch(err => console.log(err));
      } else {
        navigator.clipboard.writeText(roomShareUrl);
        alert('Đã sao chép link phòng!');
      }
    };

    return (
      <div className="detail-mobile" style={{ paddingBottom: '140px' }}>
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="mobile-header-back" onClick={() => {
            const backCategory = sessionStorage.getItem('last_active_category') || room.category || 'phong-tro';
            setCurrentPage(backCategory);
            // Clear room param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('room');
            window.history.pushState({}, '', url.toString());
          }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="mobile-header-title">Chi tiết phòng trọ</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="mobile-header-back" style={{ color: 'var(--primary-red)' }} onClick={() => alert('Đã lưu phòng')}>
              <Heart size={20} color="var(--primary-red)" fill="var(--primary-red)" />
            </button>
            <button className="mobile-header-back" onClick={handleShare}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Gallery Carousel */}
        <div className="detail-mobile-gallery">
          {mediaItems[activeImgIdx]?.type === 'video' ? (
            <video 
              src={mediaItems[activeImgIdx].url} 
              controls 
              className="detail-mobile-gallery-img" 
              style={{ objectFit: 'contain', backgroundColor: '#000' }}
            />
          ) : (
            <img src={mediaItems[activeImgIdx]?.url} alt="" className="detail-mobile-gallery-img" />
          )}

          <button className="detail-mobile-gallery-nav prev" onClick={prevImg}>
            <ChevronLeft size={18} />
          </button>
          <button className="detail-mobile-gallery-nav next" onClick={nextImg}>
            <ChevronRight size={18} />
          </button>

          <span className="detail-mobile-gallery-count">
            {activeImgIdx + 1}/{mediaItems.length}
          </span>
        </div>

        {/* Thumbnails */}
        <div className="detail-mobile-thumbs">
          {mediaItems.map((item, idx) => (
            <div
              key={idx}
              className={`detail-mobile-thumb ${activeImgIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveImgIdx(idx)}
              style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px' }}>▶️</div>
                </>
              ) : (
                <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>

        {/* Info Block */}
        <div className="detail-mobile-info">
          <div className="detail-mobile-address-block">
            <h1 className="detail-mobile-address">Dạng phòng: {room.roomType || room.room_type || 'Trọ thường'}</h1>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--text-dark)' }}>
              <MapPin size={14} style={{ color: 'var(--primary-red)', flexShrink: 0, marginTop: '2px' }} />
              <span>{room.address}</span>
            </div>
            <div className="detail-mobile-subinfo" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <School size={14} style={{ color: 'var(--zalo-blue)' }} />
              <span>Gần {room.nearPlace || 'Trường đại học'} • Cách {room.distanceText ? (room.distanceText.includes('•') ? room.distanceText.split('•')[1]?.trim() : room.distanceText.replace('Cách', '').trim()) : '800m'}</span>
            </div>
          </div>

          <div className="detail-mobile-price-row">
            <span className="detail-mobile-price">{room.priceText}</span>
          </div>

          {/* Description Section */}
          <div className="detail-mobile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>Thông tin mô tả</h3>
              <button 
                onClick={handleCopyDescription}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-light)', 
                  border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', 
                  fontSize: '11px', color: 'var(--primary-red)', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Copy size={12} />
                Copy thông tin phòng
              </button>
            </div>
            <p className="detail-mobile-desc" style={{ whiteSpace: 'pre-line', marginTop: 0 }}>
              {resolvedDescription?.trim() || "Chưa có mô tả chi tiết."}
            </p>

            <div className="detail-checklist" style={{ marginTop: '12px' }}>
              {currentChecklist.map((item, idx) => (
                <div key={idx} className="detail-checklist-item" style={{ fontSize: '12px', gap: '8px', marginBottom: '6px' }}>
                  <Check size={12} style={{ color: 'var(--success-green)' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby places section */}
          <div className="detail-mobile-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
            <h3>Gần các địa điểm</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {displayedLandmarks.map((place, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
                    <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                    <span>{place.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>{place.distText}</span>
                </div>
              ))}
              {resolvedLandmarks.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Không có địa điểm nổi bật nào trong bán kính 3km</div>
              )}
              {resolvedLandmarks.length > 3 && (
                <button
                  onClick={() => setShowAllLandmarks(!showAllLandmarks)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                >
                  <span>{showAllLandmarks ? 'Thu gọn' : `Xem thêm (${resolvedLandmarks.length - 3} địa điểm)`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="detail-mobile-actions">
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
            💬 Liên hệ chốt phòng
          </div>
          <button
            className="btn-zalo-mobile"
            onClick={() => window.open(`https://zalo.me/${room.zaloNumber || '0876480130'}`, '_blank')}
          >
            {/* Custom Zalo icon SVG */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.86 2 10.62C2 13.31 3.53 15.69 5.89 17.19L5.04 20.65C4.94 21.06 5.34 21.41 5.72 21.21L9.69 19.16C10.43 19.33 11.2 19.42 12 19.42C17.52 19.42 22 15.56 22 10.8C22 6.04 17.52 2 12 2Z" />
            </svg>
            <span>Liên hệ Zalo</span>
          </button>
          <button
            className="btn-hotline-mobile"
            onClick={() => window.open(`tel:${room.zaloNumber || '0876480130'}`)}
          >
            <Phone size={16} />
            <span>Hotline</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Return Navigation */}
      <button
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
          marginBottom: '16px',
          transition: 'var(--transition-fast)'
        }}
        onClick={() => {
          const backCategory = sessionStorage.getItem('last_active_category') || room.category || 'phong-tro';
          setCurrentPage(backCategory);
          // Clear room param from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('room');
          window.history.pushState({}, '', url.toString());
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--primary-red)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} />
        <span>Trở lại danh sách</span>
      </button>

      {/* Main Details Layout */}
      <div className="detail-layout">
        {/* Left Column (Content) */}
        <div>
          {/* Gallery Carousel */}
          <div className="gallery-container">
            <div className="gallery-main-wrapper">
              {mediaItems[activeImgIdx]?.type === 'video' ? (
                <video 
                  src={mediaItems[activeImgIdx].url} 
                  controls 
                  className="gallery-main-img" 
                  style={{ objectFit: 'contain', backgroundColor: '#000' }}
                />
              ) : (
                <img src={mediaItems[activeImgIdx]?.url} alt={room.title} className="gallery-main-img" />
              )}

              <button className="gallery-nav-btn prev" onClick={prevImg}>
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-nav-btn next" onClick={nextImg}>
                <ChevronRight size={20} />
              </button>

              <span className="gallery-counter">
                {activeImgIdx + 1} / {mediaItems.length}
              </span>
            </div>

            {/* Gallery Thumbnails */}
            <div className="gallery-thumbs">
              {mediaItems.slice(0, 6).map((item, idx) => {
                const isActive = activeImgIdx === idx;
                const isLast = idx === 5;
                return (
                  <div
                    key={idx}
                    className={`gallery-thumb ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveImgIdx(idx)}
                    style={{ position: 'relative' }}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '16px' }}>▶️</div>
                      </>
                    ) : (
                      <img src={item.url} alt="" />
                    )}
                    {isLast && mediaItems.length > 6 && (
                      <div className="gallery-thumb-overlay">
                        +{mediaItems.length - 6}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Info */}
          <div className="detail-main-info">
            <h1 className="detail-title">Dạng phòng: {room.roomType || room.room_type || 'Trọ thường'}</h1>

            <div className="room-card-address" style={{ fontSize: '14px' }}>
              <MapPin size={16} style={{ color: 'var(--primary-red)' }} />
              <span>{room.address}</span>
            </div>

            <div className="room-card-distance" style={{ fontSize: '14px' }}>
              <School size={16} style={{ color: 'var(--zalo-blue)' }} />
              <span>Gần {room.nearPlace || 'Trường đại học lân cận'} • Cách khoảng {room.distanceText ? (room.distanceText.includes('•') ? room.distanceText.split('•')[1]?.trim() : room.distanceText.replace('Cách', '').trim()) : '800m'}</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">{room.priceText}</span>
            </div>

            <div className="detail-desc-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="detail-section-title" style={{ margin: 0 }}>Mô tả chi tiết</h2>
                <button 
                  onClick={handleCopyDescription}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-light)', 
                    border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', 
                    fontSize: '13px', color: 'var(--primary-red)', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-light)'; }}
                >
                  <Copy size={14} />
                  Copy thông tin phòng
                </button>
              </div>
              <p className="detail-desc-text" style={{ whiteSpace: 'pre-line', marginTop: 0 }}>
                {resolvedDescription?.trim() || "Chưa có mô tả chi tiết."}
              </p>

              <div className="detail-checklist">
                {currentChecklist.map((item, idx) => (
                  <div key={idx} className="detail-checklist-item">
                    <Check size={14} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar CTA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action box */}
          <div className="detail-cta-card">
            <button
              className="cta-btn-zalo"
              onClick={() => window.open(`https://zalo.me/${room.zaloNumber || '0876480130'}`, '_blank')}
            >
              <ZaloIcon size={22} />
              <span>Zalo</span>
            </button>
            <button
              className="cta-btn-call"
              onClick={() => window.open(`tel:${room.zaloNumber || '0876480130'}`)}
            >
              <Phone size={20} />
              <span>Gọi điện</span>
            </button>
            <button
              className="cta-btn-share"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onClick={() => {
              const roomShareUrl = (() => {
                const url = new URL(window.location.href);
                url.searchParams.set('room', room.session_id || room.id);
                return url.toString();
              })();
              if (navigator.share) {
                navigator.share({ title: room.title || 'Chi tiết phòng trọ', text: room.address, url: roomShareUrl })
                  .catch(err => console.log(err));
              } else {
                navigator.clipboard.writeText(roomShareUrl);
                alert(`Đã sao chép link phòng: ${roomShareUrl}`);
              }
              }}
            >
              <Share2 size={20} />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Finding Roommate Card */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--zalo-blue-light)',
                color: 'var(--zalo-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users2 size={20} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 800 }}>Tìm bạn ở ghép</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Kết nối với người có nhu cầu ở ghép cùng căn nhà này để tiết kiệm chi phí và cùng nhau xây dựng không gian sống thoải mái.
            </p>
            <button
              className="sidebar-support-btn"
              style={{ borderColor: 'var(--zalo-blue)', color: 'var(--zalo-blue)', fontWeight: 700 }}
              onClick={() => {
                if (user && user.role === 'admin') {
                  setCurrentPage('admin-dashboard');
                } else {
                  alert('Chỉ tài khoản Admin mới có quyền đăng tin. Tài khoản của bạn không có quyền đăng tin.');
                }
              }}
            >
              Đăng tin tìm bạn ở ghép
            </button>
          </div>

          {/* Nearby places */}
          <div className="nearby-places-card">
            <h3 className="nearby-places-title">Gần các địa điểm</h3>

            <div className="nearby-place-list">
              {displayedLandmarks.map((place, idx) => (
                <div key={idx} className="nearby-place-item">
                  <div className="nearby-place-info">
                    <MapPin size={14} />
                    <span>{place.name}</span>
                  </div>
                  <span className="nearby-place-dist">{place.distText}</span>
                </div>
              ))}
              {resolvedLandmarks.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '10px 0' }}>
                  Không tìm thấy địa điểm nổi bật nào trong bán kính 3km
                </div>
              )}

              {resolvedLandmarks.length > 3 && (
                <button
                  onClick={() => setShowAllLandmarks(!showAllLandmarks)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                >
                  <span>{showAllLandmarks ? 'Thu gọn' : `Xem thêm (${resolvedLandmarks.length - 3} địa điểm)`}</span>
                </button>
              )}
            </div>

            <div className="map-link">
              <Map size={14} />
              <span>Xem trên bản đồ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Zalo Icon (White speech bubble with "zalo" text inside)
const ZaloIcon = ({ size = 22 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    {/* Oval speech bubble with tail */}
    <path
      d="M12 2C6.48 2 2 5.86 2 10.62C2 13.31 3.53 15.69 5.89 17.19L5.04 20.65C4.94 21.06 5.34 21.41 5.72 21.21L9.69 19.16C10.43 19.33 11.2 19.42 12 19.42C17.52 19.42 22 15.56 22 10.8C22 6.04 17.52 2 12 2Z"
      fill="#FFFFFF"
    />
    <text
      x="12"
      y="12.5"
      fill="#0068ff"
      fontSize="5"
      fontWeight="900"
      textAnchor="middle"
      fontFamily="sans-serif"
    >
      zalo
    </text>
  </svg>
);

// Custom Message Icon (Speech bubble with three dots inside)
const MessageIcon = ({ size = 20 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export default DetailView;
