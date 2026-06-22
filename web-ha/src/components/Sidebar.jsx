import React from 'react';
import { 
  Home, 
  Building2, 
  Building, 
  Warehouse, 
  Store, 
  KeyRound, 
  Users2, 
  Wallet, 
  DollarSign, 
  Heart,
  User,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, onContactSupport, user }) => {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'phong-tro', label: 'Phòng trọ', icon: Building2 },
    { id: 'chung-cu', label: 'Chung cư', icon: Building },
    { id: 'nha-nguyen-can', label: 'Nhà nguyên căn', icon: Warehouse },
    { id: 'can-ho-dich-vu', label: 'Hộ kinh doanh', icon: Building2 },
    { id: 'mat-bang-kinh-doanh', label: 'Mặt bằng kinh doanh', icon: Store },
    { id: 'pass-phong', label: 'Pass phòng', icon: KeyRound },
    { id: 'o-ghep', label: 'Ở ghép', icon: Users2 }
  ];

  const personalItems = [
    { id: 'saved-rooms', label: 'Phòng đã lưu', icon: Heart },
    { id: 'wallet', label: 'Ví của tôi', icon: Wallet, badge: 'Mới' },
    { id: 'kiem-tien', label: 'Kiếm tiền', icon: DollarSign, badge: 'Mới' },
    ...(user && (user.role === 'admin' || user.role === 'ctv') ? [{ id: 'admin-dashboard', label: user.role === 'admin' ? 'Quản lý Admin' : 'Kênh CTV', icon: ShieldAlert }] : []),
    { id: 'profile', label: 'Cá nhân', icon: User }
  ];

  return (
    <div className="sidebar" style={{ fontFamily: 'var(--font-main)' }}>
      <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '20px 24px', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
        <img 
          src="/ic.png" 
          alt="80Land Logo" 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '8px', 
            objectFit: 'cover'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="sidebar-logo-brand">80Land</span>
          <span className="sidebar-logo-sub" style={{ marginTop: '0px' }}>Tìm phòng nhanh</span>
        </div>
      </div>

      <div className="sidebar-menu-container">
        {/* Main Categories Section */}
        <div className="sidebar-section">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || 
              (item.id === 'phong-tro' && currentPage === 'phong-tro-detail') ||
              (item.id === 'chung-cu' && currentPage === 'chung-cu-detail') ||
              (item.id === 'nha-nguyen-can' && currentPage === 'nha-nguyen-can-detail');
            return (
              <div
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage(item.id);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* CÁ NHÂN Section - Always visible, no toggle */}
        <div className="sidebar-section" style={{ marginTop: '12px' }}>
          <span className="sidebar-section-title" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#1E293B', opacity: 0.95, letterSpacing: '1px', paddingLeft: '12px', marginBottom: '8px', display: 'block' }}>
            Cá nhân
          </span>
          {personalItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id ||
              (item.id === 'kiem-tien' && currentPage.startsWith('kiem-tien'));
            return (
              <div
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
