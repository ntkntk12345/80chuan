import React from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  Flame,
  MessageCircle,
  Play,
  Users,
  XCircle,
  Pencil,
} from 'lucide-react';

const REWARD_TIERS = [
  { views: '5.000 - dưới 10.000 view', reward: '+50.000đ' },
  { views: '10.000 - dưới 30.000 view', reward: '+100.000đ' },
  { views: '30.000 - dưới 50.000 view', reward: '+200.000đ' },
  { views: '50.000 - dưới 100.000 view', reward: '+400.000đ' },
  { views: '100.000 - dưới 200.000 view', reward: '+600.000đ' },
  { views: '200.000 - dưới 500.000 view', reward: '+800.000đ' },
  { views: '>= 500.000 view', reward: '+800.000đ' },
];

const TOPICS = [
  { title: 'Review phòng trọ đẹp', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=200' },
  { title: 'Căn hộ mini full nội thất', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=200' },
  { title: 'Phòng trọ giá rẻ sinh viên', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=200' },
  { title: 'Không gian sống tiện nghi', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=200' },
];

const REQUIREMENTS = [
  { icon: Users, text: 'Sử dụng kho tư liệu phòng/căn hộ do 80Land cung cấp hoặc tự quay/chụp theo chủ đề sáng tạo nội dung.' },
  { icon: ClipboardCheck, text: 'Đăng tải video lên tài khoản TikTok theo đúng chủ đề phòng trọ/nhà ở, đúng khung giờ quy định.' },
  { icon: XCircle, text: 'Nội dung sạch, không sử dụng thủ thuật mua view, chạy ads hoặc spam video lên.' },
  { icon: Pencil, text: 'Không tự ý xoá/ẩn video trong suốt thời gian hợp tác.' },
];

const TikTokCampaignView = ({ setCurrentPage, settings }) => {
  const activeTiers = settings?.tiktok_reward_tiers && settings.tiktok_reward_tiers.length > 0
    ? settings.tiktok_reward_tiers.map(t => ({
        views: t.views,
        reward: typeof t.reward === 'number' ? `+${t.reward.toLocaleString('vi-VN')}đ` : t.reward
      }))
    : REWARD_TIERS;
  return (
    <div className="earn-page">
      <button type="button" className="earn-page-back" onClick={() => setCurrentPage('kiem-tien')}>
        <ArrowLeft size={16} />
        <span>Trở lại cổng kiếm tiền</span>
      </button>

      <section className="earn-tiktok-hero-banner" aria-label="Sáng tạo video TikTok cùng 80Land">
        <img
          src="/bannertiktok.png"
          alt="Sáng tạo video TikTok cùng 80Land — Sáng tạo dễ dàng, thu nhập không giới hạn"
          className="earn-tiktok-hero-banner__img"
        />
      </section>

      <section className="earn-tiktok-coche-grid">
        <div className="earn-coche-panel">
          <h3 className="earn-coche-panel-title">
            <span className="earn-coche-panel-icon earn-coche-panel-icon--money">💰</span>
            Cơ chế thu nhập cực hấp dẫn
          </h3>
          <div className="earn-coche-split">
            <div className="earn-coche-split-box">
              <span className="earn-coche-split-amt">{(settings?.tiktok_base_reward || 30000).toLocaleString('vi-VN')}đ</span>
              <span className="earn-coche-split-label">TIỀN CỨNG</span>
              <p>/ video đăng thành công (Video đạt từ 1.000 view và không vi phạm chính sách TikTok)</p>
            </div>
            <span className="earn-coche-split-plus">+</span>
            <div className="earn-coche-split-box">
              <span className="earn-coche-split-amt">{(settings?.tiktok_max_reward || 800000).toLocaleString('vi-VN')}đ</span>
              <span className="earn-coche-split-label">THƯỞNG XU HƯỚNG</span>
              <p>lên đến từng mốc view đạt được</p>
            </div>
          </div>
          <div className="earn-coche-total-bar">
            <span>TỔNG THU NHẬP CÓ THỂ NHẬN:</span>
            <strong>{((settings?.tiktok_base_reward || 30000) + (settings?.tiktok_max_reward || 800000)).toLocaleString('vi-VN')}đ / video</strong>
          </div>
          <p className="earn-coche-example-line">
            Ví dụ: Video đạt 200.000 view — {(settings?.tiktok_base_reward || 30000).toLocaleString('vi-VN')}đ + {(settings?.tiktok_max_reward || 800000).toLocaleString('vi-VN')}đ = <strong>{((settings?.tiktok_base_reward || 30000) + (settings?.tiktok_max_reward || 800000)).toLocaleString('vi-VN')}đ</strong>
          </p>
        </div>

        <div className="earn-coche-panel earn-coche-panel--table">
          <div className="earn-coche-table-head">Bảng thưởng xu hướng (Cộng thêm)</div>
          <table className="earn-coche-table">
            <thead>
              <tr>
                <th>Mốc view đạt được</th>
                <th>Tiền thưởng cộng thêm</th>
              </tr>
            </thead>
            <tbody>
              {activeTiers.map((tier) => (
                <tr key={tier.views}>
                  <td>
                    <span className="earn-coche-table-views">
                      <Flame size={14} className="earn-coche-flame" />
                      {tier.views}
                    </span>
                  </td>
                  <td className="earn-coche-reward">{tier.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="earn-coche-panel">
          <h3 className="earn-coche-panel-title">
            <span className="earn-coche-panel-icon earn-coche-panel-icon--green">$</span>
            Yêu cầu công việc
          </h3>
          <ul className="earn-coche-req-list">
            {REQUIREMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text}>
                  <Icon size={16} />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="earn-coche-panel">
          <h3 className="earn-coche-panel-title">
            <span className="earn-coche-panel-icon earn-coche-panel-icon--check">✓</span>
            Video cần đúng chủ đề
          </h3>
          <div className="earn-coche-topics">
            {TOPICS.map((topic) => (
              <div key={topic.title} className="earn-coche-topic">
                <div className="earn-coche-topic-thumb">
                  <img src={topic.img} alt={topic.title} />
                  <Play size={22} fill="#fff" strokeWidth={0} />
                </div>
                <span>{topic.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="earn-tiktok-extra">
        <h2 className="detail-section-title">Quy trình tham gia 3 bước: Siêu đơn giản</h2>
        <div className="earn-tiktok-steps">
          <div className="earn-tiktok-step">
            <div className="earn-tiktok-step-num" style={{ background: 'var(--zalo-blue-light)', color: 'var(--zalo-blue)' }}>1</div>
            <h4>Bước 1: Nhóm hỗ trợ Zalo</h4>
            <p>Bấm vào nút bên dưới để tham gia nhóm hỗ trợ Zalo chính thức của 80Land.</p>
          </div>
          <div className="earn-tiktok-step">
            <div className="earn-tiktok-step-num" style={{ background: 'var(--warning-orange-light)', color: 'var(--warning-orange)' }}>2</div>
            <h4>Bước 2: Nhận kho tư liệu</h4>
            <p>Tải hình ảnh, clip mẫu và thông tin phòng được cập nhật liên tục hàng ngày.</p>
          </div>
          <div className="earn-tiktok-step">
            <div className="earn-tiktok-step-num" style={{ background: 'var(--success-green-light)', color: 'var(--success-green)' }}>3</div>
            <h4>Bước 3: Đăng video &amp; Báo cáo</h4>
            <p>Đăng bài lên TikTok cá nhân, gửi link báo cáo cho Admin để chốt lượt view nhận tiền.</p>
          </div>
        </div>

        <div className="earn-tiktok-zalo">
          <div>
            <h3>Sẵn sàng kiếm tiền?</h3>
            <p>Tham gia ngay để bắt đầu hành trình kiếm tiền cùng 80Land!</p>
          </div>
          <button
            type="button"
            className="cta-btn-zalo"
            style={{ 
              backgroundColor: '#0068FF', 
              color: '#FFFFFF', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer' 
            }}
            onClick={() => window.open(settings?.zalo_monetization_link || 'https://zalo.me/0876480130', '_blank')}
          >
            <MessageCircle size={18} fill="#FFFFFF" style={{ marginRight: '6px' }} />
            <span>THAM GIA NHÓM ZALO ĐỂ HỖ TRỢ NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// SVG helper mapping fallback in case lucide-react Share2 is missing
const Share2 = ({ size, fill, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill={fill || "none"} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default TikTokCampaignView;

