import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const PolicyView = ({ isMobile, setCurrentPage }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: isMobile ? '0' : '16px', padding: isMobile ? '20px' : '40px', boxShadow: isMobile ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: '#1E293B', marginBottom: '24px', textAlign: 'center' }}>ĐIỀU KHOẢN SỬ DỤNG NỀN TẢNG 80LAND</h1>
      
      <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, textAlign: 'justify' }}>
        <p>Chào mừng bạn đến với 80Land. Khi truy cập và sử dụng các dịch vụ trên nền tảng 80Land, đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý tuân thủ các điều khoản dưới đây. Nếu bạn không đồng ý với bất kỳ nội dung nào trong điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi.</p>
        
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>1. Phạm vi dịch vụ</h2>
        <p>80Land là nền tảng kết nối người có nhu cầu tìm kiếm bất động sản với các cá nhân, tổ chức có nhu cầu cho thuê hoặc chuyển nhượng. Các danh mục hiện có bao gồm: phòng trọ, chung cư, nhà nguyên căn, mặt bằng kinh doanh, pass phòng và ở ghép.</p>
        <p>80Land cung cấp môi trường đăng tải và tiếp cận thông tin, không trực tiếp tham gia vào các giao dịch, thỏa thuận hoặc hợp đồng giữa các bên.</p>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>2. Quyền và trách nhiệm của người dùng</h2>
        <p>Người dùng cam kết:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Cung cấp thông tin chính xác, trung thực và đầy đủ khi đăng ký hoặc đăng tin.</li>
          <li style={{ marginBottom: '8px' }}>Chịu hoàn toàn trách nhiệm đối với nội dung, hình ảnh và thông tin do mình cung cấp.</li>
          <li style={{ marginBottom: '8px' }}>Không đăng tải thông tin sai sự thật, gây hiểu nhầm, lừa đảo hoặc vi phạm pháp luật.</li>
          <li style={{ marginBottom: '8px' }}>Không sử dụng nền tảng vào mục đích quấy rối, phát tán nội dung phản cảm hoặc ảnh hưởng đến quyền và lợi ích của người khác.</li>
          <li style={{ marginBottom: '8px' }}>Tự kiểm tra, xác minh thông tin trước khi thực hiện giao dịch.</li>
        </ul>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>3. Quy định về đăng tin</h2>
        <p>Người đăng tin phải đảm bảo:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Có quyền đăng tải đối với tài sản hoặc thông tin được cung cấp.</li>
          <li style={{ marginBottom: '8px' }}>Nội dung tin đăng rõ ràng, đúng thực tế và không gây nhầm lẫn cho người xem.</li>
          <li style={{ marginBottom: '8px' }}>Hình ảnh sử dụng phải thuộc quyền sở hữu hoặc được phép sử dụng hợp pháp.</li>
          <li style={{ marginBottom: '8px' }}>Không đăng trùng lặp nhiều lần nhằm mục đích spam hoặc làm sai lệch kết quả hiển thị.</li>
        </ul>
        <p>80Land có quyền chỉnh sửa, từ chối hoặc gỡ bỏ các tin đăng vi phạm mà không cần thông báo trước.</p>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>4. Giới hạn trách nhiệm</h2>
        <p>80Land luôn nỗ lực kiểm duyệt và duy trì chất lượng thông tin trên nền tảng. Tuy nhiên, chúng tôi không bảo đảm tuyệt đối về tính chính xác, đầy đủ hoặc cập nhật của toàn bộ nội dung do người dùng đăng tải.</p>
        <p>80Land không chịu trách nhiệm đối với các tranh chấp, thiệt hại hoặc rủi ro phát sinh từ quá trình giao dịch giữa các bên. Người dùng cần chủ động xác minh thông tin, khảo sát thực tế và thỏa thuận rõ ràng trước khi đưa ra quyết định.</p>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>5. Quyền của 80Land</h2>
        <p>80Land có quyền:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Cập nhật, thay đổi hoặc nâng cấp dịch vụ nhằm nâng cao trải nghiệm người dùng.</li>
          <li style={{ marginBottom: '8px' }}>Tạm ngừng hoặc chấm dứt quyền sử dụng đối với các tài khoản có hành vi vi phạm điều khoản.</li>
          <li style={{ marginBottom: '8px' }}>Gỡ bỏ nội dung không phù hợp với quy định của nền tảng hoặc quy định pháp luật hiện hành.</li>
        </ul>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>6. Thay đổi điều khoản</h2>
        <p>80Land có thể điều chỉnh và cập nhật Điều khoản sử dụng theo từng thời kỳ để phù hợp với hoạt động của nền tảng và quy định pháp luật. Các thay đổi sẽ được công bố trên hệ thống và có hiệu lực kể từ thời điểm đăng tải.</p>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '32px', marginBottom: '16px' }}>7. Liên hệ hỗ trợ</h2>
        <p>Nếu có bất kỳ thắc mắc nào liên quan đến Điều khoản sử dụng, vui lòng liên hệ với 80Land qua:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px', listStyleType: 'none' }}>
          <li style={{ marginBottom: '8px' }}>• <strong>Hotline:</strong> 0876 480 130</li>
          <li style={{ marginBottom: '8px' }}>• <strong>Zalo hỗ trợ:</strong> 0876 480 130</li>
          <li style={{ marginBottom: '8px' }}>• <strong>Fanpage:</strong> 80Land – Tìm trọ Hà Nội</li>
          <li style={{ marginBottom: '8px' }}>• <strong>TikTok:</strong> @80land.timtrohanoi</li>
        </ul>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--zalo-blue)', marginTop: '32px' }}>
          <p style={{ margin: 0, fontWeight: 500, color: '#475569' }}>
            Việc tiếp tục sử dụng nền tảng sau khi Điều khoản sử dụng được cập nhật đồng nghĩa với việc bạn chấp thuận và tuân thủ các quy định mới nhất của 80Land.
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
          <span className="mobile-header-title">Chính sách & Điều khoản</span>
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

export default PolicyView;
