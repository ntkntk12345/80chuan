import React, { useState } from 'react';
import image40 from '../../images/image40.jpg';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Gift,
  Link2,
  MessageCircle,
  Share2,
  Users,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';

const FriendInviteView = ({ user, setCurrentPage, onOpenLogin, isMobile, settings, onUserUpdate }) => {
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const referralCode = user ? user.referralCode : 'A12345';
  const userPhone = user ? user.phone : 'user';

  const [referrals, setReferrals] = useState([]);
  const [userStats, setUserStats] = useState({
    walletBalance: 0,
    totalEarned: 0,
    totalReferrals: 0,
    activeReferrals: 0
  });

  React.useEffect(() => {
    const fetchData = () => {
      fetch(`/api/users/${userPhone}`)
        .then(res => {
          if (res.ok) return res.json();
          return null;
        })
        .then(data => {
          if (data && data.role) {
            setUserStats(data);
            if (onUserUpdate) onUserUpdate(data);
          } else {
            if (onUserUpdate) onUserUpdate(null);
          }
        })
        .catch(err => console.error('Error fetching user stats:', err));

      fetch('/api/referrals')
        .then(res => {
          if (!res.ok) return [];
          return res.json();
        })
        .then(data => {
          setReferrals(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error fetching referrals from SQLite:', err);
          setReferrals([]);
        });
    };
    
    fetchData();

    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, [userPhone]);

  const filteredReferrals = referrals.filter(r => r.referralCode === referralCode);
  const totalReferrals = filteredReferrals.length;
  const activeReferrals = filteredReferrals.filter(r => r.status === 'Đã kiếm được tiền' || r.status.includes('Đã kiếm')).length;
  const totalEarned = filteredReferrals.reduce((sum, r) => sum + (parseFloat(r.commission) || 0), 0);

  const requireUser = () => {
    if (user) {
      return true;
    }
    onOpenLogin();
    return false;
  };

  const handleCopyCode = () => {
    if (!requireUser()) {
      return;
    }
    navigator.clipboard.writeText(referralCode);
    alert(`Đã sao chép mã giới thiệu: ${referralCode}`);
  };

  const handleShare = (channel) => {
    if (!requireUser()) {
      return;
    }
    const shareUrl = `https://80landtimphong.vn/register?ref=${referralCode}`;
    if (channel === 'Link') {
      navigator.clipboard.writeText(shareUrl);
      alert(`Đã sao chép link giới thiệu: ${shareUrl}`);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert(`Đã sao chép link liên kết giới thiệu cho ${channel}!`);
    }
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const handleMoreChannels = () => {
      if (navigator.share) {
        navigator.share({
          title: 'Mời bạn bè cùng 80Land',
          text: `Tham gia cùng 80Land và nhận ngay hoa hồng khi chốt phòng thành công! Mã giới thiệu của mình: ${referralCode}`,
          url: `https://80landtimphong.vn/register?ref=${referralCode}`,
        }).catch(console.error);
      } else {
        setIsShareSheetOpen(true);
      }
    };

    return (
      <div className="invite-mobile-container">
        {/* Header */}
        <div className="mobile-header" style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <button className="mobile-header-back" onClick={() => setCurrentPage('kiem-tien')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-dark)', padding: '4px' }}>
            <ArrowLeft size={20} />
          </button>
          <span className="mobile-header-title" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', flex: 1, marginRight: '24px' }}>Mời bạn bè</span>
          <div style={{ width: '20px' }} />
        </div>

        {/* Content Body */}
        <div style={{ paddingBottom: '30px' }}>
          {/* Promo Hero Banner */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <img 
                src={image40} 
                alt="Mời bạn bè cùng 80Land" 
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
              />
            </div>
          </div>

          {/* Mã giới thiệu của bạn */}
          <div className="mockup-code-card">
            <div className="mockup-code-info">
              <span className="mockup-code-label">Mã giới thiệu của bạn</span>
              {user ? (
                <strong className="mockup-code-value">{referralCode}</strong>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--primary-red)', fontWeight: 'bold', marginTop: '4px' }}>
                  Bạn đăng ký tài khoản để có mã nha
                </span>
              )}
            </div>
            {user ? (
              <button 
                type="button" 
                onClick={handleCopyCode} 
                className="mockup-copy-btn"
              >
                <Copy size={14} /> Sao chép
              </button>
            ) : (
              <button 
                type="button" 
                onClick={onOpenLogin} 
                className="mockup-copy-btn"
                style={{ backgroundColor: 'var(--primary-red)', boxShadow: '0 4px 10px rgba(230, 30, 37, 0.2)' }}
              >
                Lấy mã
              </button>
            )}
          </div>

          {/* Chia sẻ nhanh */}
          <div className="mockup-share-section">
            <h3 className="mockup-share-title">Chia sẻ nhanh</h3>
            <div className="mockup-share-row" style={{ justifyContent: 'space-around' }}>
              <button type="button" className="mockup-share-item" onClick={() => handleShare('Facebook')}>
                <div className="mockup-share-circle facebook">
                  <Share2 size={20} fill="#1877F2" />
                </div>
                <span className="mockup-share-label">Facebook</span>
              </button>

              <button type="button" className="mockup-share-item" onClick={() => handleShare('Zalo')}>
                <div className="mockup-share-circle zalo">Zalo</div>
                <span className="mockup-share-label">Zalo</span>
              </button>

              <button type="button" className="mockup-share-item" onClick={() => handleShare('Link')}>
                <div className="mockup-share-circle">
                  <Link2 size={20} />
                </div>
                <span className="mockup-share-label">Sao chép link</span>
              </button>
            </div>
          </div>


          {/* Tổng quan thu nhập & giới thiệu */}
          <div className="mockup-overview-section">
            <h3 className="mockup-section-title">Tổng quan thu nhập &amp; giới thiệu</h3>
            
            <div className="mockup-overview-grid">
              {/* Card 1: Số dư khả dụng (Tall, Blue) */}
              <div className="mockup-card-tall">
                <div>
                  <span className="mockup-card-tall-title">
                    Số dư khả dụng 
                    <ShieldCheck size={12} />
                  </span>
                  <div className="mockup-card-tall-val">
                    {user ? `${(userStats?.walletBalance || 0).toLocaleString('vi-VN')}đ` : '0đ'}
                  </div>
                  <span className="mockup-card-tall-desc">Số tiền có thể rút ngay</span>
                </div>
                
                <div className="mockup-card-tall-btns">
                  <button 
                    type="button" 
                    className="mockup-card-tall-btn white"
                    onClick={() => (user ? setCurrentPage('wallet') : onOpenLogin())}
                  >
                    Rút tiền
                  </button>
                  <button 
                    type="button" 
                    className="mockup-card-tall-btn outline"
                    onClick={() => (user ? setCurrentPage('wallet') : onOpenLogin())}
                  >
                    Lịch sử giao dịch
                  </button>
                </div>
              </div>

              {/* Card 2: Tổng thu nhập (Green) */}
              <div className="mockup-card-sm green">
                <div className="mockup-card-sm-info">
                  <span className="mockup-card-sm-title">Tổng thu nhập</span>
                  <div className="mockup-card-sm-val">
                    {user ? `${(userStats?.totalEarned || 0).toLocaleString('vi-VN')}đ` : '0đ'}
                  </div>
                  <span className="mockup-card-sm-desc">Tổng số tiền đã kiếm được</span>
                </div>
                <div className="mockup-card-sm-icon">💰</div>
              </div>

              {/* Card 3: Tổng số người đăng ký (Orange) */}
              <div className="mockup-card-sm orange">
                <div className="mockup-card-sm-info">
                  <span className="mockup-card-sm-title">Tổng số người đăng ký</span>
                  <div className="mockup-card-sm-val">
                    {user ? userStats.totalReferrals : '0'}
                  </div>
                  <span className="mockup-card-sm-desc">Người đã đăng ký qua mã giới thiệu</span>
                </div>
                <div className="mockup-card-sm-icon">👥</div>
              </div>

              {/* Card 4: Số người đã kiếm được tiền (Purple) */}
              <div className="mockup-card-sm purple">
                <div className="mockup-card-sm-info">
                  <span className="mockup-card-sm-title">Số người đã kiếm được tiền</span>
                  <div className="mockup-card-sm-val">
                    {user ? userStats.activeReferrals : '0'}
                  </div>
                  <span className="mockup-card-sm-desc">Người đã đủ điều kiện kiếm hoa hồng</span>
                </div>
                <div className="mockup-card-sm-icon">🏆</div>
              </div>
            </div>
          </div>

          {/* Người đăng ký gần đây */}
          <div className="mockup-registrants-section">
            <div className="mockup-registrants-header">
              <h3>Người đăng ký gần đây</h3>
              <button type="button" onClick={() => (user ? setCurrentPage('wallet') : onOpenLogin())}>
                Xem tất cả &gt;
              </button>
            </div>
            
            <div className="mockup-registrants-table-container">
              <table className="mockup-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên người đăng ký</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((item, idx) => {
                      const statusColor = item.status === 'Đã kiếm được tiền' || item.status.includes('Đã kiếm') ? 'green' : 'orange';
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{item.date}</td>
                          <td>
                            <span className={`mockup-badge ${statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Chưa có người đăng ký nào bằng mã của bạn
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sharing Bottom Sheet Modal Fallback */}
        {isShareSheetOpen && (
          <div className="sharing-bottom-sheet-overlay" onClick={() => setIsShareSheetOpen(false)}>
            <div className="sharing-bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sharing-sheet-handle"></div>
              <h3 className="sharing-sheet-title">Chia sẻ nhanh qua</h3>
              
              <div className="sharing-grid">
                <button 
                  type="button" 
                  className="sharing-option-btn" 
                  onClick={() => {
                    handleShare('Zalo');
                    setIsShareSheetOpen(false);
                  }}
                >
                  <div className="sharing-icon-wrapper zalo" style={{ backgroundColor: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', width: '48px', height: '48px', borderRadius: '50%' }}>
                    <MessageCircle size={22} />
                  </div>
                  <span className="sharing-option-lbl">Zalo</span>
                </button>

                <button 
                  type="button" 
                  className="sharing-option-btn" 
                  onClick={() => {
                    handleShare('Facebook');
                    setIsShareSheetOpen(false);
                  }}
                >
                  <div className="sharing-icon-wrapper facebook" style={{ backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', width: '48px', height: '48px', borderRadius: '50%' }}>
                    <Share2 size={22} />
                  </div>
                  <span className="sharing-option-lbl">Facebook</span>
                </button>

                <button 
                  type="button" 
                  className="sharing-option-btn" 
                  onClick={() => {
                    handleShare('Messenger');
                    setIsShareSheetOpen(false);
                  }}
                >
                  <div className="sharing-icon-wrapper messenger" style={{ background: 'linear-gradient(135deg, #00B2FE 0%, #006AFF 30%, #9F01EA 70%, #FF007F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', width: '48px', height: '48px', borderRadius: '50%' }}>
                    <MessageCircle size={22} />
                  </div>
                  <span className="sharing-option-lbl">Messenger</span>
                </button>

                <button 
                  type="button" 
                  className="sharing-option-btn" 
                  onClick={() => {
                    handleShare('Link');
                    setIsShareSheetOpen(false);
                  }}
                >
                  <div className="sharing-icon-wrapper copy" style={{ backgroundColor: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', width: '48px', height: '48px', borderRadius: '50%' }}>
                    <Link2 size={22} />
                  </div>
                  <span className="sharing-option-lbl">Sao chép</span>
                </button>
              </div>

              <button 
                type="button" 
                className="sharing-sheet-close-btn" 
                onClick={() => setIsShareSheetOpen(false)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '16px', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="earn-page invite-page">
      <button
        className="earn-page-back"
        type="button"
        onClick={() => setCurrentPage('kiem-tien')}
      >
        <ArrowLeft size={16} />
        <span>Trở lại cổng kiếm tiền</span>
      </button>

      {/* Hero Banner Section */}
      <section className="invite-hero-new">
        <div className="invite-hero-new-copy">
          <span className="invite-eyebrow">
            <Sparkles size={16} />
            Chương trình giới thiệu bạn bè
          </span>
          <h1>
            Mời bạn bè tham gia cùng <span className="text-red">80Land</span>
          </h1>
          <p className="invite-tagline">
            Càng nhiều bạn tham gia – Thu nhập càng tăng!
          </p>
          <p className="invite-desc">
            Giới thiệu 80Land đến bạn bè, người thân và nhận ngay hoa hồng hấp dẫn khi họ có đơn đầu tiên.
          </p>

          <div className="invite-benefits-row">
            <div className="invite-benefit-card">
              <div className="invite-benefit-icon orange">
                <Gift size={20} />
              </div>
              <div className="invite-benefit-text">
                <strong>{(settings?.referral_commission || 300000).toLocaleString('vi-VN')}đ / mỗi bạn</strong>
                <span>Hoa hồng hấp dẫn</span>
              </div>
            </div>
            <div className="invite-benefit-card">
              <div className="invite-benefit-icon purple">
                <Users size={20} />
              </div>
              <div className="invite-benefit-text">
                <strong>Không giới hạn số lượng</strong>
                <span>Mời càng nhiều, nhận càng nhiều</span>
              </div>
            </div>
            <div className="invite-benefit-card">
              <div className="invite-benefit-icon green">
                <ShieldCheck size={20} />
              </div>
              <div className="invite-benefit-text">
                <strong>Thanh toán minh bạch</strong>
                <span>Nhận tiền nhanh chóng</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Illustration Area */}
        <div className="invite-hero-new-illustration">
          <img src="/invite-illustration.png" alt="Mời bạn bè" />
        </div>

        {/* User Stats/Wallet Card */}
        <div className="invite-hero-new-card">
          <span className="card-label">Thu nhập của bạn</span>
          <strong className="card-amount">{user ? `${(userStats?.totalEarned || 0).toLocaleString('vi-VN')}đ` : '0đ'}</strong>
          <span className="card-subtext">{user ? `(${userStats.totalReferrals} bạn bè)` : '(Đăng nhập để xem)'}</span>
          <button
            type="button"
            className="card-action-btn"
            onClick={() => (user ? setCurrentPage('wallet') : onOpenLogin())}
          >
            Xem chi tiết <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Guide/Steps Section */}
      <section className="invite-guide-section">
        <h2 className="invite-section-title">HƯỚNG DẪN THAM GIA</h2>

        <div className="invite-steps-flow-new">
          {/* Step 1 */}
          <div className="invite-flow-step-new">
            <span className="step-badge-new green">1</span>
            <div className="step-icon-box green">
              <Users size={24} />
            </div>
            <div className="step-info-box">
              <h3>Lấy mã giới thiệu</h3>
              <p>Vào mục "Cá nhân" để lấy mã giới thiệu của bạn.</p>
            </div>
          </div>

          <ArrowRight className="step-flow-arrow-new" size={24} />

          {/* Step 2 */}
          <div className="invite-flow-step-new">
            <span className="step-badge-new blue">2</span>
            <div className="step-icon-box blue">
              <Share2 size={24} />
            </div>
            <div className="step-info-box">
              <h3>Chia sẻ đến bạn bè</h3>
              <p>Gửi mã giới thiệu qua Facebook, Zalo, SMS hoặc bất kỳ kênh nào.</p>
            </div>
          </div>

          <ArrowRight className="step-flow-arrow-new" size={24} />

          {/* Step 3 */}
          <div className="invite-flow-step-new">
            <span className="step-badge-new orange">3</span>
            <div className="step-icon-box orange">
              <ClipboardList size={24} />
            </div>
            <div className="step-info-box">
              <h3>Bạn bè đăng ký &amp; có đơn</h3>
              <p>Bạn bè nhập mã của bạn khi đăng ký và có đơn đầu tiên trên 80Land.</p>
            </div>
          </div>

          <ArrowRight className="step-flow-arrow-new" size={24} />

          {/* Step 4 */}
          <div className="invite-flow-step-new">
            <span className="step-badge-new purple">4</span>
            <div className="step-icon-box purple">
              <Gift size={24} />
            </div>
            <div className="step-info-box">
              <h3>Bạn nhận hoa hồng</h3>
              <p>Bạn nhận ngay {(settings?.referral_commission || 300000).toLocaleString('vi-VN')}đ khi bạn bè có đơn đầu tiên thành công.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid columns: Instructions & Share */}
      <section className="invite-details-grid-new">
        {/* Left Column: Instruction + Phone Mockup */}
        <div className="invite-details-card-new left-card">
          <h2 className="card-main-title-new green-title">CÁCH LẤY MÃ GIỚI THIỆU</h2>
          <div className="invite-instruction-row-new">
            <div className="instruction-text-list-new">
              <div className="instruction-item-new">
                <span className="instruction-index-new">1</span>
                <p>Đăng nhập tài khoản 80Land của bạn.</p>
              </div>
              <div className="instruction-item-new">
                <span className="instruction-index-new">2</span>
                <p>Chọn mục Cá nhân ở menu bên trái.</p>
              </div>
              <div className="instruction-item-new">
                <span className="instruction-index-new">3</span>
                <p>Mã giới thiệu của bạn sẽ hiển thị tại mục "Mã giới thiệu".</p>
              </div>
              <div className="instruction-item-new">
                <span className="instruction-index-new">4</span>
                <p>Sao chép mã và chia sẻ đến bạn bè.</p>
              </div>
            </div>

            {/* Mock Phone (Real App CTV Screen Layout) */}
            <div className="invite-phone-mock-new">
              <div className="phone-screen-header-new">
                <ArrowLeft size={14} className="phone-back-icon" />
                <span>Cá nhân</span>
              </div>
              
              <div className="phone-profile-block-new">
                <img
                  src={user ? user.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt="Avatar"
                  className="phone-avatar-img"
                />
                <div className="phone-profile-info">
                  <strong className="phone-user-name">{user ? user.name : "Nguyễn Văn A"}</strong>
                  <span className="phone-user-role">Mã CTV: {referralCode}</span>
                </div>
              </div>

              <div className="phone-code-box-new">
                <span className="phone-code-label">Mã giới thiệu của bạn</span>
                <div className="phone-code-value-row">
                  <strong className="phone-code-value">{referralCode}</strong>
                  <button type="button" onClick={handleCopyCode} className="phone-copy-btn-new">
                    Sao chép
                  </button>
                </div>
              </div>

              <div className="phone-menu-list-new">
                <div className="phone-menu-item-new highlight">
                  <span>Tổng hoa hồng đã nhận</span>
                  <span className="menu-val-green">{user ? `${(userStats?.totalEarned || 0).toLocaleString('vi-VN')}đ` : '0đ'} &gt;</span>
                </div>
                <div className="phone-menu-item-new">
                  <span>Thông tin cá nhân</span>
                  <span>&gt;</span>
                </div>
                <div className="phone-menu-item-new">
                  <span>Lịch sử giao dịch</span>
                  <span>&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Share box */}
        <div className="invite-details-card-new right-card">
          <h2 className="card-main-title-new">CHIA SẺ DỄ DÀNG</h2>
          <span className="card-sub-desc-new">Chia sẻ mã giới thiệu của bạn qua các kênh yêu thích</span>
          
          <div className="invite-share-container-new">
            <div className="share-buttons-group-new">
              <button type="button" className="social-btn-new facebook" onClick={() => handleShare('Facebook')}>
                <Share2 size={16} /> Chia sẻ Facebook
              </button>
              <button type="button" className="social-btn-new zalo" onClick={() => handleShare('Zalo')}>
                <MessageCircle size={16} /> Chia sẻ Zalo
              </button>
              <button type="button" className="social-btn-new link" onClick={() => handleShare('Link')}>
                <Link2 size={16} /> Chia sẻ link
              </button>
            </div>

            <div className="share-box-with-gift">
              <div className="copy-link-input-box-new">
                <span className="link-lbl-new">Mã giới thiệu của bạn</span>
                <div className="link-value-row-new">
                  <strong className="link-value-new">{referralCode}</strong>
                  <button type="button" className="link-copy-btn-new" onClick={() => handleShare('Link')}>
                    Sao chép
                  </button>
                </div>
              </div>

              {/* 3D Gift Box cropped from mockup */}
              <div className="invite-gift-illus-box">
                <img src="/invite-gift.png" alt="Quà tặng giới thiệu" className="gift-illus-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes & Bottom CTA Section */}
      <section className="invite-bottom-row-new">
        {/* Important Notes */}
        <div className="invite-notes-card-new">
          <h2 className="notes-card-title">
            <Info size={18} className="notes-info-icon" />
            LƯU Ý QUAN TRỌNG
          </h2>
          <ul className="notes-list-new">
            <li>
              <CheckCircle2 size={14} className="notes-check-icon" />
              <span>Bạn bè phải đăng ký tài khoản bằng mã giới thiệu của bạn.</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="notes-check-icon" />
              <span>Bạn bè cần có đơn đầu tiên thành công để bạn nhận hoa hồng.</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="notes-check-icon" />
              <span>Hoa hồng sẽ được thanh toán vào Ví của bạn sau khi đơn được xác nhận.</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="notes-check-icon" />
              <span>Chương trình áp dụng cho tất cả hình thức thuê phòng trên 80Land.</span>
            </li>
          </ul>
        </div>

        {/* Final CTA Card with cheering characters */}
        <div className="invite-final-cta-new-card">
          <div className="cta-left-content">
            <h2>SẴN SÀNG MỜI BẠN NGAY?</h2>
            <p>Càng mời nhiều bạn – Thu nhập càng lớn!</p>
            <button type="button" className="cta-action-btn-new" onClick={handleCopyCode}>
              Lấy mã giới thiệu ngay <ArrowRight size={16} />
            </button>
          </div>
          
          {/* Cheering characters cropped from mockup */}
          <div className="cta-characters-box">
            <img src="/invite-cta-characters.png" alt="Mời bạn bè tham gia" className="cta-characters-img" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FriendInviteView;
