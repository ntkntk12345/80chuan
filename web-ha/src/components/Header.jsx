import React, { useState, useEffect, useRef } from 'react';
import { Heart, Bell, ChevronDown, LogIn, CheckCheck } from 'lucide-react';

const Header = ({ 
  currentPage, 
  setCurrentPage, 
  user, 
  savedRoomsCount, 
  onOpenLogin, 
  onLogout,
  notifications = [],
  unreadNotificationsCount = 0,
  onMarkAllAsRead
}) => {
  const [showNotis, setShowNotis] = useState(false);
  const notiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNotis(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    if (currentPage === 'home') {
      return [];
    }
    
    const crumbs = [];
    
    if (currentPage === 'phong-tro') {
      crumbs.push({ id: 'phong-tro', label: 'Phòng trọ' });
    } else if (currentPage === 'phong-tro-detail') {
      crumbs.push({ id: 'phong-tro', label: 'Phòng trọ' });
      crumbs.push({ id: 'phong-tro-detail', label: 'Xem chi tiết phòng' });
    } else if (currentPage === 'chung-cu') {
      crumbs.push({ id: 'chung-cu', label: 'Chung cư' });
    } else if (currentPage === 'chung-cu-detail') {
      crumbs.push({ id: 'chung-cu', label: 'Chung cư' });
      crumbs.push({ id: 'chung-cu-detail', label: 'Xem chi tiết căn hộ' });
    } else if (currentPage === 'nha-nguyen-can') {
      crumbs.push({ id: 'nha-nguyen-can', label: 'Nhà nguyên căn' });
    } else if (currentPage === 'nha-nguyen-can-detail') {
      crumbs.push({ id: 'nha-nguyen-can', label: 'Nhà nguyên căn' });
      crumbs.push({ id: 'nha-nguyen-can-detail', label: 'Xem chi tiết' });
    } else if (currentPage === 'can-ho-dich-vu') {
      crumbs.push({ id: 'can-ho-dich-vu', label: 'Căn hộ dịch vụ' });
    } else if (currentPage === 'mat-bang-kinh-doanh') {
      crumbs.push({ id: 'mat-bang-kinh-doanh', label: 'Mặt bằng kinh doanh' });
    } else if (currentPage === 'pass-phong') {
      crumbs.push({ id: 'pass-phong', label: 'Pass phòng' });
    } else if (currentPage === 'o-ghep') {
      crumbs.push({ id: 'o-ghep', label: 'Ở ghép' });
    } else if (currentPage === 'wallet') {
      crumbs.push({ id: 'wallet', label: 'Ví của tôi' });
    } else if (currentPage === 'kiem-tien') {
      crumbs.push({ id: 'kiem-tien', label: 'Kiếm tiền' });
    } else if (currentPage === 'kiem-tien-tiktok') {
      crumbs.push({ id: 'kiem-tien', label: 'Kiếm tiền' });
      crumbs.push({ id: 'kiem-tien-tiktok', label: 'Sáng tạo video TikTok' });
    } else if (currentPage === 'kiem-tien-referral') {
      crumbs.push({ id: 'kiem-tien', label: 'Kiếm tiền' });
      crumbs.push({ id: 'kiem-tien-referral', label: 'Giới thiệu khách thuê' });
    } else if (currentPage === 'kiem-tien-invite') {
      crumbs.push({ id: 'kiem-tien', label: 'Kiếm tiền' });
      crumbs.push({ id: 'kiem-tien-invite', label: 'Mời bạn bè tham gia' });
    } else if (currentPage === 'profile') {
      crumbs.push({ id: 'profile', label: 'Cá nhân' });
    } else if (currentPage === 'admin-dashboard') {
      crumbs.push({ id: 'admin-dashboard', label: 'Quản lý Admin' });
    }
    
    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="header">
      <div className="header-breadcrumbs">
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <span style={{ margin: '0 4px', color: '#94A3B8' }}>&gt;</span>}
            <span 
              className={idx === crumbs.length - 1 ? 'header-breadcrumb-active' : 'header-breadcrumb-item'}
              onClick={() => idx < crumbs.length - 1 && setCurrentPage(crumb.id)}
            >
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="header-actions">
        <button className="header-btn" onClick={() => setCurrentPage('saved-rooms')}>
          <Heart size={18} />
          <span>Phòng đã lưu</span>
          {savedRoomsCount > 0 && (
            <span className="header-btn-badge">{savedRoomsCount}</span>
          )}
        </button>

        <div ref={notiRef} style={{ position: 'relative' }}>
          <button className="header-btn" onClick={() => setShowNotis(!showNotis)}>
            <Bell size={18} />
            <span>Thông báo</span>
            {unreadNotificationsCount > 0 && (
              <span className="header-btn-badge">{unreadNotificationsCount}</span>
            )}
          </button>

          {showNotis && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <h3>Thông báo</h3>
                {unreadNotificationsCount > 0 && (
                  <button onClick={() => { onMarkAllAsRead?.(); }} className="mark-read-btn">
                    <CheckCheck size={14} style={{ marginRight: '4px' }} />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="notifications-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">Không có thông báo mới</div>
                ) : (
                  notifications.map((noti) => (
                    <div key={noti.id} className={`notification-item ${noti.read ? 'read' : 'unread'}`}>
                      {!noti.read && <span className="unread-dot" />}
                      <div className="notification-content">
                        <p className="notification-message">{noti.message}</p>
                        <span className="notification-time">{noti.created_at}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="header-user" onClick={() => setCurrentPage('profile')}>
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
              alt={user.name} 
              className="header-user-avatar"
            />
            <div className="header-user-info">
              <span className="header-user-name">{user.name}</span>
              <span className="header-user-role">Mã CTV: {user.referralCode}</span>
            </div>
            <ChevronDown size={14} style={{ color: '#64748B', marginLeft: '4px' }} />
          </div>
        ) : (
          <button className="header-btn" onClick={onOpenLogin} style={{ color: 'var(--zalo-blue)', fontWeight: 600 }}>
            <LogIn size={18} />
            <span>Đăng nhập / Đăng ký</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
