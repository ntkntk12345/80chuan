import React from 'react';
import { Bell, ChevronRight, Gift, Clock, Wallet, ShieldCheck, Rocket } from 'lucide-react';
import EarnBannerShell from '../components/EarnBannerShell';
import image40 from '../../images/image40.jpg';

const EarnHubView = ({ setCurrentPage, isMobile, settings, unreadNotificationsCount = 0, onOpenNotifications }) => {
  if (isMobile) {
    return (
      <div className="detail-mobile" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 60px)' }}>
        {/* Header */}
        <div className="mobile-header" style={{ justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '12px 16px' }}>
          <div style={{ width: '40px' }} /> {/* Spacer to center the title */}
          <span className="mobile-header-title" style={{ fontSize: '16px', fontWeight: 800 }}>Kiếm tiền</span>
          <button className="mobile-header-back" onClick={onOpenNotifications} style={{ marginRight: '-4px', background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={22} style={{ color: 'var(--text-dark)' }} />
              {unreadNotificationsCount > 0 && (
                <span className="header-btn-badge" style={{ top: '-4px', right: '-4px', width: '14px', height: '14px', fontSize: '8px', border: '1.5px solid #FFFFFF', backgroundColor: 'var(--primary-red)', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', fontWeight: 'bold' }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Top Banner Card (Replaced with imported image40, no text overlay) */}
        <div style={{ padding: '12px 12px 4px' }}>
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid var(--border-color)'
          }}>
            <img 
              src={image40} 
              alt="Kiếm tiền cùng 80Land" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
            />
          </div>
        </div>

        {/* Features Icon Circles Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '16px 12px 8px', 
          textAlign: 'center', 
          gap: '4px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', marginBottom: '8px' }}>
              <Gift size={20} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Thu nhập</span>
            <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 700, lineHeight: 1.2, marginTop: '2px' }}>không giới hạn</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', marginBottom: '8px' }}>
              <Clock size={20} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Linh hoạt</span>
            <span style={{ fontSize: '9px', color: '#64748B', lineHeight: 1.2, marginTop: '2px' }}>thời gian</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginBottom: '8px' }}>
              <Wallet size={20} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Rút tiền</span>
            <span style={{ fontSize: '9px', color: '#64748B', lineHeight: 1.2, marginTop: '2px' }}>mọi lúc</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', marginBottom: '8px' }}>
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Minh bạch</span>
            <span style={{ fontSize: '9px', color: '#64748B', lineHeight: 1.2, marginTop: '2px' }}>rõ ràng</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '8px' }}>
              <Rocket size={20} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', lineHeight: 1.2 }}>Hỗ trợ 24/7</span>
            <span style={{ fontSize: '9px', color: '#64748B', lineHeight: 1.2, marginTop: '2px' }}>siêu nhanh</span>
          </div>
        </div>

        {/* Campaign Cards List (Vertical Rows) - Only 2 sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
          {/* Card 1: Sáng tạo video */}
          <div 
            onClick={() => setCurrentPage('kiem-tien-tiktok')}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            className="mobile-earn-campaign-card"
          >
            <img src="/ic-video.png" alt="Sáng tạo video" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Sáng tạo video</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Đăng video lên nền tảng, nhận thưởng hấp dẫn
              </p>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>

          {/* Card 2: Giới thiệu khách thuê */}
          <div 
            onClick={() => setCurrentPage('kiem-tien-referral')}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            className="mobile-earn-campaign-card"
          >
            <img src="/ic-referral.png" alt="Giới thiệu khách thuê" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Giới thiệu khách thuê</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Giới thiệu khách thuê thành công, nhận hoa hồng hấp dẫn
              </p>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>

          {/* Card 3: Mời bạn bè */}
          <div 
            onClick={() => setCurrentPage('kiem-tien-invite')}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            className="mobile-earn-campaign-card"
          >
            <img src="/ic-invite.png" alt="Mời bạn bè" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Mời bạn bè</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Giới thiệu bạn bè tham gia, nhận hoa hồng {(settings?.referral_commission || 300000).toLocaleString('vi-VN')}đ / lượt mời thành công
              </p>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        </div>

        {/* Sticky Bottom CTA Card */}
        <div style={{ padding: '0 12px 32px' }}>
          <div 
            onClick={() => setCurrentPage('kiem-tien-tiktok')}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="/moneybag-3d.png" 
                alt="Money Bag" 
                style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0 }} 
              />
              <div>
                <div style={{ fontSize: '11px', color: '#E0E7FF', fontWeight: 600 }}>Tổng thu nhập có thể đạt</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FCD34D', marginTop: '2px' }}>
                  {((settings?.tiktok_base_reward || 30000) + (settings?.tiktok_max_reward || 800000)).toLocaleString('vi-VN')}đ <span style={{ fontSize: '11px', color: '#E0E7FF', fontWeight: 500 }}>/ mỗi video</span>
                </div>
              </div>
            </div>
            
            <button style={{
              backgroundColor: '#FFFFFF',
              color: '#4F46E5',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <span>Xem ngay</span>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>&gt;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view fallback
  return (
    <div className="earn-page">
      <div className="earn-page-header">
        <img src="/wallet-3d.png" alt="" className="earn-page-header-icon" />
        <div>
          <h1>Kiếm tiền</h1>
          <p>Khám phá các cách kiếm tiền cùng 80Land – Thu nhập không giới hạn!</p>
        </div>
      </div>

      <EarnBannerShell
        src="/bannerkiemtien.jpg"
        alt="Các cách kiếm tiền cùng 80Land"
        aspectRatio="1512 / 1040"
        className="earn-hub-design"
      >
        {/* Số tiền trong ô trắng — thẻ 1–2 đã có sẵn trên ảnh */}
        <span className="earn-hub-val earn-hub-val--amount earn-hub-val--c1-a">{(settings?.tiktok_base_reward || 30000).toLocaleString('vi-VN')}đ</span>
        <span className="earn-hub-val earn-hub-val--amount earn-hub-val--c1-b">{(settings?.tiktok_max_reward || 800000).toLocaleString('vi-VN')}đ</span>
        <span className="earn-hub-val earn-hub-val--amount earn-hub-val--amount-green earn-hub-val--c1-c">
          {((settings?.tiktok_base_reward || 30000) + (settings?.tiktok_max_reward || 800000)).toLocaleString('vi-VN')}đ
        </span>
        <button
          type="button"
          className="earn-hub-hit earn-hub-hit--card1"
          aria-label="Xem chi tiết Sáng tạo video TikTok"
          onClick={() => setCurrentPage('kiem-tien-tiktok')}
        />

        <span className="earn-hub-val earn-hub-val--amount earn-hub-val--amount-orange earn-hub-val--c2-a">
          800.000đ
        </span>
        <span className="earn-hub-val earn-hub-val--amount earn-hub-val--amount-orange earn-hub-val--c2-b">
          1.000.000đ
        </span>
        <button
          type="button"
          className="earn-hub-hit earn-hub-hit--card2"
          aria-label="Xem chi tiết Giới thiệu khách thuê"
          onClick={() => setCurrentPage('kiem-tien-referral')}
        />
        <button
          type="button"
          className="earn-hub-hit earn-hub-hit--card3"
          aria-label="Xem chi tiết Mời bạn bè"
          onClick={() => setCurrentPage('kiem-tien-invite')}
        />
      </EarnBannerShell>
    </div>
  );
};
export default EarnHubView;
