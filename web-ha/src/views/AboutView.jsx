import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const AboutView = ({ isMobile, setCurrentPage }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: isMobile ? '0' : '16px', padding: isMobile ? '20px' : '40px', boxShadow: isMobile ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: '#1E293B', marginBottom: '24px', textAlign: 'center' }}>GIỚI THIỆU VỀ 80LAND</h1>
      
      <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, textAlign: 'justify' }}>
        <p style={{ marginBottom: '16px' }}>
          <strong>80Land</strong> là nền tảng hỗ trợ tìm kiếm và kết nối cho thuê bất động sản, mang đến những giải pháp nhanh chóng, tiện lợi và đáng tin cậy cho khách hàng. Chúng tôi hiểu rằng việc tìm được một nơi ở phù hợp hay một mặt bằng kinh doanh ưng ý luôn tốn nhiều thời gian và công sức. Vì vậy, 80Land ra đời với mong muốn giúp quá trình đó trở nên đơn giản và hiệu quả hơn.
        </p>
        
        <p style={{ marginBottom: '16px' }}>
          Tại 80Land, người dùng có thể dễ dàng tiếp cận đa dạng các loại hình bất động sản như phòng trọ, chung cư, nhà nguyên căn, mặt bằng kinh doanh, pass phòng và ở ghép. Các tin đăng được cập nhật thường xuyên nhằm mang đến nhiều lựa chọn phù hợp với nhu cầu, vị trí mong muốn và khả năng tài chính của từng khách hàng.
        </p>

        <p style={{ marginBottom: '16px' }}>
          Với phương châm <em>"Tìm phòng nhanh – Kết nối dễ dàng"</em>, 80Land luôn nỗ lực xây dựng một môi trường tìm kiếm minh bạch, thuận tiện và thân thiện. Chúng tôi không chỉ là nơi đăng tải thông tin cho thuê mà còn mong muốn trở thành người bạn đồng hành đáng tin cậy, giúp bạn tiết kiệm thời gian, tối ưu chi phí và nhanh chóng tìm thấy không gian phù hợp để sinh sống, học tập hoặc phát triển công việc kinh doanh.
        </p>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--zalo-blue)', marginTop: '32px' }}>
          <p style={{ margin: 0, fontWeight: 500, color: '#475569' }}>
            Cảm ơn bạn đã tin tưởng và lựa chọn 80Land. Sự hài lòng của khách hàng chính là động lực để chúng tôi không ngừng cải thiện chất lượng dịch vụ và mang đến những trải nghiệm tốt hơn mỗi ngày.
          </p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="home-mobile-layout" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="mobile-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <button className="mobile-header-back" onClick={() => setCurrentPage('profile')}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="mobile-header-title">Giới thiệu 80Land</span>
          <div style={{ width: 40 }}></div>
        </div>
        <div style={{ paddingBottom: '80px' }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 140px)' }}>
      {content}
    </div>
  );
};

export default AboutView;
