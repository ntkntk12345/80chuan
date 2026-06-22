import React from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Zap, 
  Award, 
  CreditCard, 
  Users, 
  ArrowRight, 
  Search, 
  Link2, 
  UserCheck, 
  FileText, 
  Gift, 
  CheckCircle,
  Smartphone
} from 'lucide-react';

import EarnBannerShell from '../components/EarnBannerShell';
import referralDesignImage from '../../images/image24-hd.png';

const ClientReferralView = ({ setCurrentPage, isMobile }) => {
  const handleContactAdmin = () => {
    window.open('https://zalo.me/0876480130', '_blank', 'noopener,noreferrer');
  };

  // --- DESKTOP LAYOUT ---
  if (!isMobile) {
    return (
      <div className="earn-page">
        <button
          className="earn-page-back"
          type="button"
          onClick={() => setCurrentPage('kiem-tien')}
        >
          <ArrowLeft size={16} />
          <span>Trở lại cổng kiếm tiền</span>
        </button>

        <EarnBannerShell
          src={referralDesignImage}
          alt="Giới thiệu khách thuê cùng 80Land"
          aspectRatio="1080 / 720"
          className="client-referral-design"
        >
          <button
            type="button"
            className="client-referral-contact-hit"
            aria-label="Nhắn Zalo cho Admin"
            onClick={handleContactAdmin}
          />
        </EarnBannerShell>
      </div>
    );
  }

  return (
    <div className="referral-view-container" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="referral-header">
        <button 
          className="referral-back-btn" 
          onClick={() => setCurrentPage('kiem-tien')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="referral-header-title">Giới thiệu khách thuê</h1>
        <button 
          className="referral-help-btn" 
          onClick={() => alert('Liên hệ hotline Zalo: 0876 480 130 để được hỗ trợ!')}
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="referral-hero-banner">
        <div className="referral-hero-content">
          <h2 className="referral-hero-title">Giới thiệu khách thuê<br />cùng <span className="text-red">80Land</span></h2>
          <p className="referral-hero-subtitle">Hoa hồng hấp dẫn –<br />Thu nhập không giới hạn!</p>
          
          <div className="referral-commission-badge">
            <span className="badge-lbl">Hoa hồng lên đến</span>
            <span className="badge-val">25%</span>
          </div>
        </div>

        <div className="referral-hero-illustration">
          {/* Custom CSS Illustrated 3D-like Building Overlay */}
          <div className="illustration-building-wrapper">
            <div className="mini-building">
              <div className="building-face side"></div>
              <div className="building-face front">
                <span className="window"></span>
                <span className="window"></span>
                <span className="window"></span>
                <span className="window"></span>
              </div>
            </div>
            <div className="growth-arrow">➔</div>
          </div>
          
          {/* Floating benefit badges */}
          <div className="floating-badge badge-income">
            <span className="badge-icon">💰</span>
            <span className="badge-text">Thu nhập<br />không giới hạn</span>
          </div>
          <div className="floating-badge badge-support">
            <span className="badge-icon">🎧</span>
            <span className="badge-text">Hỗ trợ 24/7<br />siêu nhanh</span>
          </div>
          
          {/* Gold Coin Stack visual representation */}
          <div className="coins-stack">
            <div className="coin"></div>
            <div className="coin"></div>
            <div className="coin"></div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Horizontal Badges Grid */}
      <div className="referral-pillars-grid">
        <div className="pillar-item">
          <div className="pillar-icon"><CheckCircle size={18} /></div>
          <div className="pillar-info">
            <span className="pillar-title">Không cần vốn</span>
            <span className="pillar-desc">Không rủi ro</span>
          </div>
        </div>
        <div className="pillar-item">
          <div className="pillar-icon"><Clock size={18} /></div>
          <div className="pillar-info">
            <span className="pillar-title">Linh hoạt thời gian</span>
            <span className="pillar-desc">Làm ở bất cứ đâu</span>
          </div>
        </div>
        <div className="pillar-item">
          <div className="pillar-icon"><DollarSign size={18} /></div>
          <div className="pillar-info">
            <span className="pillar-title">Thu nhập cao</span>
            <span className="pillar-desc">Không giới hạn</span>
          </div>
        </div>
        <div className="pillar-item">
          <div className="pillar-icon"><Zap size={18} /></div>
          <div className="pillar-info">
            <span className="pillar-title">Hỗ trợ 24/7</span>
            <span className="pillar-desc">siêu nhanh</span>
          </div>
        </div>
      </div>

      {/* Section: CTV Benefits */}
      <div className="referral-section">
        <div className="section-title-wrapper">
          <span className="section-title-icon">🏆</span>
          <h3 className="section-title-text">QUYỀN LỢI CỘNG TÁC VIÊN</h3>
        </div>
        
        <div className="benefits-cards-grid">
          <div className="benefit-card">
            <div className="benefit-card-icon orange"><Award size={20} /></div>
            <h4 className="benefit-card-title">Hoa hồng hấp dẫn</h4>
            <p className="benefit-card-desc">Lên đến 25% theo hợp đồng thuê</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-card-icon blue"><CreditCard size={20} /></div>
            <h4 className="benefit-card-title">Thanh toán nhanh chóng</h4>
            <p className="benefit-card-desc">Thanh toán vào ngày 10 hàng tháng</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-card-icon green"><Users size={20} /></div>
            <h4 className="benefit-card-title">Hỗ trợ tận tình</h4>
            <p className="benefit-card-desc">Đội ngũ hỗ trợ 24/7, đồng hành cùng bạn</p>
          </div>
        </div>

        {/* Real Example Case */}
        <div className="example-box">
          <div className="example-tag">VÍ DỤ THỰC TẾ</div>
          <div className="example-content">
            <div className="example-left">
              <span className="example-main-text">Hợp đồng thuê 4.000.000đ/tháng</span>
              <span className="example-sub-text">Thời hạn 12 tháng</span>
            </div>
            <div className="example-arrow">
              <ArrowRight size={20} color="var(--primary-red)" />
            </div>
            <div className="example-right">
              <span className="example-res-lbl">Hoa hồng của bạn</span>
              <span className="example-res-val">1.000.000đ</span>
            </div>
          </div>
        </div>
        <p className="referral-disclaimer">(*) Hoa hồng tính theo giá trị hợp đồng (chưa bao gồm phí dịch vụ khác nếu có)</p>
      </div>

      {/* Section: Your Job details */}
      <div className="referral-section bg-gray-light">
        <div className="section-title-wrapper">
          <span className="section-title-icon">📋</span>
          <h3 className="section-title-text">CÔNG VIỆC CỦA BẠN</h3>
        </div>

        <div className="job-steps-layout">
          {/* Steps List */}
          <div className="job-steps-list">
            <div className="job-step-item">
              <div className="job-step-number">1</div>
              <div className="job-step-text">Tìm kiếm khách thuê có nhu cầu</div>
            </div>
            <div className="job-step-item">
              <div className="job-step-number">2</div>
              <div className="job-step-text">Giới thiệu khách thuê phù hợp với phòng/căn</div>
            </div>
            <div className="job-step-item">
              <div className="job-step-number">3</div>
              <div className="job-step-text">Hỗ trợ khách xem phòng (nếu có thể)</div>
            </div>
            <div className="job-step-item">
              <div className="job-step-number">4</div>
              <div className="job-step-text">Khách thuê đồng ý – ký hợp đồng thành công</div>
            </div>
            <div className="job-step-item">
              <div className="job-step-number">5</div>
              <div className="job-step-text">Nhận hoa hồng hấp dẫn từ 80Land</div>
            </div>
          </div>

          {/* Visual Phone Mockup */}
          <div className="job-phone-mockup">
            <div className="phone-bezel">
              <div className="phone-screen">
                <div className="phone-header-row">
                  <span className="phone-brand">80Land</span>
                  <span className="phone-heart">❤️</span>
                </div>
                <div className="phone-card-preview">
                  <img 
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=150" 
                    alt="Căn hộ mini" 
                    className="phone-card-img" 
                  />
                  <div className="phone-card-info">
                    <h5 className="phone-card-title">Căn hộ mini full nội thất</h5>
                    <span className="phone-card-price">4.500.000đ/tháng</span>
                    <span className="phone-card-details">📐 28m² • 📍 Quận 7, TP.HCM</span>
                  </div>
                </div>
                <div className="phone-likes-dots">
                  <span className="dot active"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
              {/* Thumbs up badge */}
              <div className="phone-thumbs-badge">
                <span className="thumbs-icon">👍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Simple 4-Step Process */}
      <div className="referral-section">
        <h3 className="process-header-title">QUY TRÌNH HỢP TÁC 4 BƯỚC ĐƠN GIẢN</h3>
        
        <div className="process-steps-container">
          <div className="process-step-box">
            <div className="process-step-head">
              <span className="process-number">1</span>
              <h4 className="process-title">Đăng ký trở thành CTV 80Land</h4>
            </div>
            <p className="process-desc">Điền thông tin đăng ký để trở thành cộng tác viên.</p>
            <div className="process-arrow-next">➔</div>
          </div>

          <div className="process-step-box">
            <div className="process-step-head">
              <span className="process-number">2</span>
              <h4 className="process-title">Tìm kiếm & giới thiệu khách thuê</h4>
            </div>
            <p className="process-desc">Tìm kiếm khách hàng có nhu cầu thuê phòng và giới thiệu cho 80Land.</p>
            <div className="process-arrow-next">➔</div>
          </div>

          <div className="process-step-box">
            <div className="process-step-head">
              <span className="process-number">3</span>
              <h4 className="process-title">Khách thuê ký hợp đồng thuê thành công</h4>
            </div>
            <p className="process-desc">Khách thuê đồng ý thuê và ký hợp đồng với 80Land.</p>
            <div className="process-arrow-next">➔</div>
          </div>

          <div className="process-step-box">
            <div className="process-step-head">
              <span className="process-number">4</span>
              <h4 className="process-title">Nhận hoa hồng hấp dẫn</h4>
            </div>
            <p className="process-desc">Nhận hoa hồng lên đến 25% theo hợp đồng vào ngày 10 hàng tháng.</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner — Nằm ở cuối nội dung trang */}
      <div 
        className="cta-banner-bg"
        style={{ 
          marginTop: '32px',
        }}
      >
        <div className="cta-banner-content">
          <span className="cta-title">SẴN SÀNG KIẾM TIỀN CÙNG 80LAND?</span>
          <span className="cta-desc">Nhấn Zalo cho Admin ngay để được hướng dẫn chi tiết!</span>
        </div>
        <button 
          type="button" 
          className="cta-zalo-btn"
          onClick={handleContactAdmin}
        >
          <span className="zalo-bubble">Zalo</span>
          <span>Nhắn Zalo Admin ngay ➔</span>
        </button>
      </div>
    </div>
  );
};

export default ClientReferralView;
