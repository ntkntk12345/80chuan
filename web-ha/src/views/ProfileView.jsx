import React, { useState } from 'react';
import { 
  UserPlus, 
  LogIn, 
  KeyRound, 
  MessageCircle, 
  PhoneCall, 
  Info, 
  FileText, 
  ShieldAlert, 
  ChevronRight,
  Play,
  Settings,
  Heart,
  Bell,
  ArrowLeft,
  LogOut,
  UserCircle,
  Users2,
  Camera
} from 'lucide-react';

const FacebookIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const ProfileView = ({ user, setCurrentPage, onOpenLogin, onLogout, isMobile, unreadNotificationsCount = 0, onOpenNotifications }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showZaloModal, setShowZaloModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 200;

        if (width > height) {
          if (width > max) {
            height *= max / width;
            width = max;
          }
        } else {
          if (height > max) {
            width *= max / height;
            height = max;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const updatedUser = { ...user, avatar: dataUrl };
        
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser)
        })
        .then(async res => {
          if (!res.ok) {
            if (res.status === 403 || res.status === 401) {
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.');
            }
            throw new Error('Lỗi server: ' + res.statusText);
          }
          return res.json();
        })
        .then(data => {
          if (data.exists || data.phone) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('storage'));
            alert('Cập nhật avatar thành công!');
          } else {
            throw new Error('Lỗi cập nhật dữ liệu.');
          }
        })
        .catch(err => {
          console.error(err);
          alert(err.message || 'Có lỗi xảy ra khi cập nhật avatar.');
        })
        .finally(() => {
          setUploadingAvatar(false);
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const zaloGroups = [
    { name: 'Trọ Thanh Trì', link: 'https://zalo.me/g/jaltio837' },
    { name: 'Trọ Hà Đông', link: 'https://zalo.me/g/tekxhb042' },
    { name: 'Trọ Ba Đình', link: 'https://zalo.me/g/aaqvrt728' },
    { name: 'Trọ Long Biên', link: 'https://zalo.me/g/phkkqg956' },
    { name: 'Trọ Tây Hồ', link: 'https://zalo.me/g/miqnye467' },
    { name: 'Trọ Bắc Từ Liêm', link: 'https://zalo.me/g/wmpdmr127' },
    { name: 'Trọ Hai Bà Trưng', link: 'https://zalo.me/g/mjgssa376' },
    { name: 'Trọ Mỹ Đình', link: 'https://zalo.me/g/yznsov579' },
    { name: 'Trọ Hoàng Mai', link: 'https://zalo.me/g/eiqzpy861' },
    { name: 'Trọ Hoàn Kiếm', link: 'https://zalo.me/g/hsvkhh683' },
    { name: 'Trọ Nam Từ Liêm', link: 'https://zalo.me/g/xhozfr597' },
    { name: 'Trọ Cầu Giấy', link: 'https://zalo.me/g/pjqbuw790' },
    { name: 'Trọ Thanh Xuân', link: 'https://zalo.me/g/zyrisy778' },
    { name: 'Trọ Đống Đa', link: 'https://zalo.me/g/huqnvg252' },
    { name: 'Trọ Hoài Đức', link: 'https://zalo.me/g/zqjhqx638' },
    { name: 'Nhà nguyên căn', link: 'https://zalo.me/g/rjzphf421' },
    { name: 'Mặt bằng kinh doanh', link: 'https://zalo.me/g/vxtfys921' },
    { name: 'Căn hộ dịch vụ để đầu tư', link: 'https://zalo.me/g/olaknp431' },
    { name: 'Chung cư', link: 'https://zalo.me/g/7frirf8fcq4nl4pcxxos' }
  ];

  const renderZaloModal = () => {
    if (!showZaloModal) return null;

    if (isMobile) {
      return (
        <div className="mobile-filter-modal-overlay" onClick={() => setShowZaloModal(false)} style={{ zIndex: 9999, display: 'flex', alignItems: 'flex-end', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="mobile-filter-modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', padding: '20px', width: '100%', backgroundColor: '#fff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Danh sách Nhóm Zalo Hỗ Trợ</h3>
              <button onClick={() => setShowZaloModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
            </div>
            <p style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-dark)', fontWeight: 600 }}>Chào cậu, hiện tại bên tớ đang có bằng này nhóm trọ:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {zaloGroups.map((group, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{group.name}</span>
                  <button 
                    onClick={() => window.open(group.link, '_blank')}
                    style={{ background: 'var(--zalo-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Tham gia
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // PC Layout Modal
    return (
      <div onClick={() => setShowZaloModal(false)} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '500px', maxHeight: '80vh', backgroundColor: '#fff', 
          borderRadius: '16px', padding: '24px', overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1E293B' }}>Danh sách Nhóm Zalo Hỗ Trợ</h3>
            <button onClick={() => setShowZaloModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748B', lineHeight: 1 }}>&times;</button>
          </div>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: '#475569', fontWeight: 500 }}>Chào cậu, hiện tại bên tớ đang có bằng này nhóm trọ:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {zaloGroups.map((group, idx) => (
              <div key={idx} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', 
                border: '1px solid #E2E8F0', transition: 'all 0.2s ease', cursor: 'pointer'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--zalo-blue)'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
              onClick={() => window.open(group.link, '_blank')}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{group.name}</span>
                <span style={{ color: 'var(--zalo-blue)', fontWeight: 700, fontSize: '12px' }}>Tham gia &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContactModal = () => {
    if (!showContactModal) return null;

    if (isMobile) {
      return (
        <div className="mobile-filter-modal-overlay" onClick={() => setShowContactModal(false)} style={{ zIndex: 9999, display: 'flex', alignItems: 'flex-end', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="mobile-filter-modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', padding: '24px', width: '100%', backgroundColor: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Hỗ trợ liên hệ 24/7</h3>
              <button onClick={() => setShowContactModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748B', lineHeight: 1 }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '14px', marginBottom: '20px', color: '#334155', lineHeight: 1.6, textAlign: 'justify' }}>
              Mỗi câu hỏi của bạn đều xứng đáng được lắng nghe. Đội ngũ 80Land luôn sẵn sàng hỗ trợ, giải đáp và đồng hành trên hành trình tìm kiếm chỗ ở phù hợp.
            </p>
            
            <p style={{ fontSize: '14px', marginBottom: '12px', color: '#1E293B', fontWeight: 700 }}>Liên hệ với chúng tôi qua:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => window.open('tel:0876480130')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={18} color="var(--success-green)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Hotline</span>
                  <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>0876 480 130</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => window.open('https://zalo.me/0876480130', '_blank')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={18} fill="var(--zalo-blue)" color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Zalo</span>
                  <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>0876 480 130</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => window.open('https://facebook.com', '_blank')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FacebookIcon size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Fanpage</span>
                  <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>80Land – Tìm trọ Hà Nội</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => window.open('https://tiktok.com', '_blank')}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>TikTok</span>
                  <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>@80land.timtrohanoi</span>
                </div>
              </div>
            </div>
            
            <div style={{ background: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--primary-red)', lineHeight: 1.5, fontWeight: 500, textAlign: 'justify' }}>
                Hãy kết nối với 80Land để không bỏ lỡ những thông tin hữu ích, tin tức mới nhất và những cơ hội tìm trọ phù hợp dành cho bạn.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PC Layout Modal
    return (
      <div onClick={() => setShowContactModal(false)} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '500px', maxHeight: '90vh', backgroundColor: '#fff', 
          borderRadius: '20px', padding: '32px', overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1E293B' }}>Hỗ trợ liên hệ 24/7</h3>
            <button onClick={() => setShowContactModal(false)} style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#64748B', lineHeight: 1 }}>&times;</button>
          </div>
          
          <p style={{ fontSize: '15px', marginBottom: '24px', color: '#334155', lineHeight: 1.6, textAlign: 'justify' }}>
            Mỗi câu hỏi của bạn đều xứng đáng được lắng nghe. Đội ngũ 80Land luôn sẵn sàng hỗ trợ, giải đáp và đồng hành trên hành trình tìm kiếm chỗ ở phù hợp.
          </p>
          
          <p style={{ fontSize: '15px', marginBottom: '16px', color: '#1E293B', fontWeight: 700 }}>Liên hệ với chúng tôi qua:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--success-green)'} onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'} onClick={() => window.open('tel:0876480130')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={20} color="var(--success-green)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Hotline</span>
                <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>0876 480 130</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--zalo-blue)'} onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'} onClick={() => window.open('https://zalo.me/0876480130', '_blank')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} fill="var(--zalo-blue)" color="#FFFFFF" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Zalo</span>
                <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>0876 480 130</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#1877F2'} onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'} onClick={() => window.open('https://facebook.com', '_blank')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FacebookIcon size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Fanpage</span>
                <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>80Land – Tìm trọ Hà Nội</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#000'} onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'} onClick={() => window.open('https://tiktok.com', '_blank')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>TikTok</span>
                <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: 800 }}>@80land.timtrohanoi</span>
              </div>
            </div>
          </div>
          
          <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '16px', border: '1px solid #FECACA' }}>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--primary-red)', lineHeight: 1.6, fontWeight: 500, textAlign: 'justify' }}>
              Hãy kết nối với 80Land để không bỏ lỡ những thông tin hữu ích, tin tức mới nhất và những cơ hội tìm trọ phù hợp dành cho bạn.
            </p>
          </div>
        </div>
      </div>
    );
  };



  if (isMobile) {
    if (showSettings) {
      // Cài đặt screen matching image12.png
      return (
        <div className="detail-mobile">
          {/* Header */}
          <div className="mobile-header">
            <button className="mobile-header-back" onClick={() => setShowSettings(false)}>
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <span className="mobile-header-title">Cài đặt</span>
            <div className="mobile-header-right"></div>
          </div>

          {/* Promo Banner */}
          <div style={{ padding: '12px' }}>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>💰</span>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>
                    Tham gia 80Land - Kiếm thêm thu nhập
                  </h3>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    Giới thiệu khách thuê, sáng tạo video hoặc mời bạn bè để nhận hoa hồng hấp dẫn.
                  </p>
                </div>
              </div>
              <button 
                style={{
                  background: 'var(--primary-red)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
                onClick={() => {
                  setShowSettings(false);
                  setCurrentPage('kiem-tien');
                }}
              >
                Xem chi tiết
              </button>
            </div>
          </div>

          {/* Section: Tài khoản */}
          <div style={{ padding: '0 12px 12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tài khoản
            </h4>
            <div className="profile-mobile-menu">
              <div className="profile-mobile-menu-item" onClick={() => alert('Thông tin cá nhân')}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: 'var(--zalo-blue-light)', color: 'var(--zalo-blue)' }}>
                    <UserCircle size={16} />
                  </div>
                  <span className="profile-mobile-menu-title">Thông tin cá nhân</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="profile-mobile-menu-item" onClick={() => alert('Đổi mật khẩu')}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FEE2E2', color: 'var(--primary-red)' }}>
                    <KeyRound size={16} />
                  </div>
                  <span className="profile-mobile-menu-title">Đổi mật khẩu</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="profile-mobile-menu-item">
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FEF3C7', color: 'var(--warning-orange)' }}>
                    <PhoneCall size={16} color="var(--warning-orange)" />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Số điện thoại</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--zalo-blue)', fontWeight: 600 }}>{user ? user.phone : '0987 654 321'}</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="profile-mobile-menu-item">
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#E0F2FE', color: 'var(--zalo-blue)' }}>
                    <FileText size={16} color="var(--zalo-blue)" />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Email</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--zalo-blue)', fontWeight: 600 }}>{user ? (user.email || (user.phone.includes('@') ? user.phone : user.phone + '@80land.vn')) : 'nguyenvana@gmail.com'}</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Hỗ trợ & kết nối */}
          <div style={{ padding: '0 12px 12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hỗ trợ & kết nối
            </h4>
            <div className="profile-mobile-menu">
              <div className="profile-mobile-menu-item" onClick={() => setShowZaloModal(true)}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: 'var(--zalo-blue-light)', color: 'var(--zalo-blue)' }}>
                    <MessageCircle size={16} fill="var(--zalo-blue)" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Nhóm Zalo hỗ trợ</span>
                    <span className="profile-mobile-menu-desc">Tham gia cộng đồng 80Land nhận hỗ trợ 24/7</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="profile-mobile-menu-item" onClick={() => setShowContactModal(true)}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#D1FAE5', color: 'var(--success-green)' }}>
                    <PhoneCall size={16} color="var(--success-green)" />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Hỗ trợ liên hệ 24/7</span>
                    <span className="profile-mobile-menu-desc">Chúng tôi luôn sẵn sàng hỗ trợ bạn</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('gioi-thieu')}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#F5F3FF', color: 'var(--purple-badge)' }}>
                    <Info size={16} color="var(--purple-badge)" />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Giới thiệu về 80Land</span>
                    <span className="profile-mobile-menu-desc">Tìm hiểu về sứ mệnh và đội ngũ</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Section: Chính sách */}
          <div style={{ padding: '0 12px 12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Chính sách & quy định
            </h4>
            <div className="profile-mobile-menu">
              <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('chinh-sach-bao-mat')}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#F1F5F9', color: 'var(--text-muted)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Điều khoản sử dụng</span>
                    <span className="profile-mobile-menu-desc">Quy định về việc sử dụng nền tảng 80Land</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('chinh-sach-bao-mat')}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FEE2E2', color: 'var(--primary-red)' }}>
                    <ShieldAlert size={16} />
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title">Chính sách bảo mật</span>
                    <span className="profile-mobile-menu-desc">Cam kết bảo mật thông tin cá nhân</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Section: Hệ thống */}
          <div style={{ padding: '0 12px 24px' }}>
            <button 
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FCA5A5',
                color: 'var(--primary-red)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={() => {
                onLogout();
                setShowSettings(false);
              }}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
          {renderZaloModal()}
          {renderContactModal()}
        </div>
      );
    }

    // Main mobile Profile Dashboard matching image54.jpg
    return (
      <div className="home-mobile-layout">
        {/* Header */}
        <div className="mobile-header">
          <span className="mobile-header-title" style={{ textAlign: 'left', paddingLeft: '4px' }}>Cá nhân</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="mobile-header-back" onClick={onOpenNotifications}>
              <div style={{ position: 'relative' }}>
                <Bell size={22} />
                {unreadNotificationsCount > 0 && (
                  <span className="header-btn-badge" style={{ top: '-4px', right: '-4px', width: '14px', height: '14px', fontSize: '8px', border: '1.5px solid #FFFFFF' }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
            </button>
            {user && (
              <button className="mobile-header-back" onClick={() => setShowSettings(true)}>
                <Settings size={22} />
              </button>
            )}
          </div>
        </div>

        {/* User profile card */}
        <div style={{ padding: '12px' }}>
          <div className="profile-mobile-card">
            <div className="profile-mobile-info">
              {user ? (
                <>
                  <div style={{ position: 'relative', cursor: 'pointer', opacity: uploadingAvatar ? 0.5 : 1 }} onClick={() => fileInputRef.current?.click()}>
                    <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} alt={user.name} className="profile-mobile-avatar" />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', borderRadius: '50%', padding: '4px', border: '1px solid #E2E8F0', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <Camera size={12} color="#64748B" />
                    </div>
                  </div>
                  <div className="profile-mobile-details">
                    <span className="profile-mobile-name">{user.name}</span>
                    <span className="profile-mobile-code">Mã CTV: {user.referralCode}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UserCircle size={28} />
                  </div>
                  <div className="profile-mobile-details" style={{ gap: '2px' }}>
                    <span className="profile-mobile-name" style={{ color: '#1E293B', fontSize: '15px' }}>Khách hàng</span>
                    <span className="profile-mobile-code" style={{ color: '#64748B', fontSize: '11px' }}>Đăng nhập để trải nghiệm ngay!</span>
                  </div>
                </>
              )}
            </div>
            {user ? (
              <button className="profile-mobile-btn" onClick={() => setShowSettings(true)}>
                Xem hồ sơ
              </button>
            ) : (
              <button 
                className="profile-mobile-btn" 
                onClick={onOpenLogin}
                style={{
                  backgroundColor: 'var(--primary-red)',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(230, 30, 37, 0.2)',
                  whiteSpace: 'nowrap'
                }}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>

        {/* Menu Items List */}
        <div style={{ padding: '0 12px' }}>
          <div className="profile-mobile-menu">
            <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('saved-rooms')}>
              <div className="profile-mobile-menu-item-left">
                <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FFF0F1', color: 'var(--primary-red)' }}>
                  <Heart size={16} fill="var(--primary-red)" color="var(--primary-red)" />
                </div>
                <div className="profile-mobile-menu-text">
                  <span className="profile-mobile-menu-title">Phòng đã lưu</span>
                  <span className="profile-mobile-menu-desc">Phòng trọ, chung cư đã quan tâm</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="profile-mobile-menu-item" onClick={user ? () => setCurrentPage('o-ghep') : onOpenLogin}>
              <div className="profile-mobile-menu-item-left">
                <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#F5F3FF', color: 'var(--purple-badge)' }}>
                  <Users2 size={16} color="var(--purple-badge)" />
                </div>
                <div className="profile-mobile-menu-text">
                  <span className="profile-mobile-menu-title">Tin ở ghép của tôi</span>
                  <span className="profile-mobile-menu-desc">Xem và quản lý các tin tìm người ở ghép</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('kiem-tien')}>
              <div className="profile-mobile-menu-item-left">
                <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FEF3C7', color: 'var(--warning-orange)' }}>
                  <span style={{ color: 'var(--warning-orange)', fontWeight: 800, fontSize: '13px' }}>$</span>
                </div>
                <div className="profile-mobile-menu-text">
                  <span className="profile-mobile-menu-title">Kiếm tiền</span>
                  <span className="profile-mobile-menu-desc">Tạo thu nhập cùng 80Land</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div className="profile-mobile-menu-item" onClick={user ? () => setCurrentPage('wallet') : onOpenLogin}>
              <div className="profile-mobile-menu-item-left">
                <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#E0F2FE', color: 'var(--zalo-blue)' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                </div>
                <div className="profile-mobile-menu-text">
                  <span className="profile-mobile-menu-title">Ví của tôi</span>
                  <span className="profile-mobile-menu-desc">Số dư khả dụng: {user ? `${(user.walletBalance || 0).toLocaleString('vi-VN')}đ` : '0đ'}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {user && (user.role === 'admin' || user.role === 'ctv') && (
              <div className="profile-mobile-menu-item" onClick={() => setCurrentPage('admin-dashboard')} style={{ borderLeft: '3px solid var(--primary-red)' }}>
                <div className="profile-mobile-menu-item-left">
                  <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#FEE2E2', color: 'var(--primary-red)' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div className="profile-mobile-menu-text">
                    <span className="profile-mobile-menu-title" style={{ color: 'var(--primary-red)', fontWeight: 800 }}>
                      {user.role === 'admin' ? 'Quản lý Admin' : 'Kênh CTV'}
                    </span>
                    <span className="profile-mobile-menu-desc">
                      {user.role === 'admin' ? 'Đăng tin ở ghép, pass phòng & quản trị' : 'Đăng tin ở ghép, pass phòng & xem hoa hồng'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}

            <div className="profile-mobile-menu-item" onClick={user ? () => setShowSettings(true) : onOpenLogin}>
              <div className="profile-mobile-menu-item-left">
                <div className="profile-mobile-menu-icon" style={{ backgroundColor: '#F1F5F9', color: 'var(--text-muted)' }}>
                  <Settings size={16} />
                </div>
                <div className="profile-mobile-menu-text">
                  <span className="profile-mobile-menu-title">Cài đặt</span>
                  <span className="profile-mobile-menu-desc">Quản lý tài khoản và bảo mật</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Invite friends banner */}
        <div style={{ padding: '0 12px 16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            border: '1px solid #FECDD3',
            borderRadius: '12px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ zIndex: 1, flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                Giới thiệu bạn bè
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Nhận ngay hoa hồng hấp dẫn từ 80Land
              </p>
              <button 
                style={{
                  background: 'var(--primary-red)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginTop: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentPage('kiem-tien-invite')}
              >
                Mời ngay
              </button>
            </div>
            <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
              <img src="/ic.png" alt="gift" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
        {renderZaloModal()}
        {renderContactModal()}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleAvatarChange} 
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 140px)' }}>
      <div style={{ padding: '0 0 40px 0' }}>
        {/* Title Header */}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Cá nhân</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Quản lý tài khoản và các thông tin của bạn
            </p>
          </div>
        </div>

        {user && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ position: 'relative', cursor: 'pointer', opacity: uploadingAvatar ? 0.5 : 1 }} onClick={() => fileInputRef.current?.click()}>
              <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '4px', right: '-4px', background: '#fff', borderRadius: '50%', padding: '6px', border: '1px solid #E2E8F0', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Camera size={14} color="#64748B" />
              </div>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1E293B' }}>{user.name}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>Mã CTV: <span style={{ fontWeight: 600, color: 'var(--zalo-blue)' }}>{user.referralCode}</span></p>
            </div>
          </div>
        )}

        {/* Affiliate Campaign Banner (only shows if not logged in or just a general banner) */}
        <div style={{
          background: 'linear-gradient(135deg, #E0F2FE 0%, #EFF6FF 100%)',
          border: '1px solid #BAE6FD',
          padding: '20px 24px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
                Tham gia 80Land - Kiếm thêm thu nhập
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Giới thiệu khách thuê, sáng tạo video hoặc mời bạn bè tham gia để nhận hoa hồng hấp dẫn từ 80Land.
              </p>
            </div>
          </div>
          <button 
            className="form-submit-btn" 
            style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--zalo-blue)' }}
            onClick={() => setCurrentPage('kiem-tien')}
          >
            Xem chi tiết
          </button>
        </div>

        {/* Settings grid */}
        <div className="profile-grid">
          {/* Card 1: Account */}
          <div className="profile-card">
            <div className="profile-card-header">Tài khoản</div>
            
            {user ? (
              <>
                <div className="profile-card-item" onClick={() => setCurrentPage('wallet')}>
                  <div className="profile-item-icon">
                    <UserPlus size={16} />
                  </div>
                  <div className="profile-item-info">
                    <span className="profile-item-title">Ví hoa hồng của tôi</span>
                    <span className="profile-item-desc">Kiểm tra thu nhập và thực hiện rút tiền</span>
                  </div>
                  <ChevronRight size={16} className="profile-item-arrow" />
                </div>
                {user && (user.role === 'admin' || user.role === 'ctv') && (
                  <div className="profile-card-item" onClick={() => setCurrentPage('admin-dashboard')} style={{ borderLeft: '3px solid var(--primary-red)' }}>
                    <div className="profile-item-icon" style={{ backgroundColor: 'var(--primary-red-light)', color: 'var(--primary-red)' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="profile-item-info">
                      <span className="profile-item-title" style={{ color: 'var(--primary-red)', fontWeight: 800 }}>
                        {user.role === 'admin' ? 'Quản lý Admin' : 'Kênh CTV'}
                      </span>
                      <span className="profile-item-desc">
                        {user.role === 'admin' ? 'Trang quản trị tin đăng hệ thống' : 'Đăng tin ở ghép, pass phòng & xem hoa hồng'}
                      </span>
                    </div>
                    <ChevronRight size={16} className="profile-item-arrow" />
                  </div>
                )}
                <div className="profile-card-item" onClick={onLogout}>
                  <div className="profile-item-icon" style={{ backgroundColor: 'var(--primary-red-light)', color: 'var(--primary-red)' }}>
                    <LogIn size={16} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div className="profile-item-info">
                    <span className="profile-item-title">Đăng xuất</span>
                    <span className="profile-item-desc">Đăng xuất khỏi tài khoản của bạn</span>
                  </div>
                  <ChevronRight size={16} className="profile-item-arrow" />
                </div>
              </>
            ) : (
              <>
                <div className="profile-card-item" onClick={onOpenLogin}>
                  <div className="profile-item-icon">
                    <UserPlus size={16} />
                  </div>
                  <div className="profile-item-info">
                    <span className="profile-item-title">Tạo tài khoản</span>
                    <span className="profile-item-desc">Đăng ký tài khoản mới để sử dụng đầy đủ tính năng</span>
                  </div>
                  <ChevronRight size={16} className="profile-item-arrow" />
                </div>
                <div className="profile-card-item" onClick={onOpenLogin}>
                  <div className="profile-item-icon" style={{ backgroundColor: 'var(--success-green-light)', color: 'var(--success-green)' }}>
                    <LogIn size={16} />
                  </div>
                  <div className="profile-item-info">
                    <span className="profile-item-title">Đăng nhập</span>
                    <span className="profile-item-desc">Đăng nhập vào tài khoản của bạn</span>
                  </div>
                  <ChevronRight size={16} className="profile-item-arrow" />
                </div>
              </>
            )}

            <div className="profile-card-item" onClick={() => alert('Chức năng đổi mật khẩu đang được phát triển')}>
              <div className="profile-item-icon" style={{ backgroundColor: 'var(--warning-orange-light)', color: 'var(--warning-orange)' }}>
                <KeyRound size={16} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Đổi mật khẩu</span>
                <span className="profile-item-desc">Cập nhật mật khẩu để bảo mật tài khoản</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>
          </div>

          {/* Card 2: Support & Connect */}
          <div className="profile-card">
            <div className="profile-card-header">Hỗ trợ & kết nối</div>
            
            <div className="profile-card-item" onClick={() => setShowZaloModal(true)}>
              <div className="profile-item-icon">
                <MessageCircle size={16} fill="var(--zalo-blue)" style={{ color: '#FFFFFF' }} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Nhóm Zalo hỗ trợ</span>
                <span className="profile-item-desc">Tham gia cộng đồng 80Land để nhận hỗ trợ nhanh chóng 24/7</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>

            <div className="profile-card-item" onClick={() => setShowContactModal(true)}>
              <div className="profile-item-icon" style={{ backgroundColor: 'var(--success-green-light)', color: 'var(--success-green)' }}>
                <PhoneCall size={16} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Hỗ trợ liên hệ 24/7</span>
                <span className="profile-item-desc">Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>

            <div className="profile-card-item" onClick={() => setCurrentPage('gioi-thieu')}>
              <div className="profile-item-icon" style={{ backgroundColor: 'var(--warning-orange-light)', color: 'var(--warning-orange)' }}>
                <Info size={16} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Giới thiệu về 80Land</span>
                <span className="profile-item-desc">Tìm hiểu về sứ mệnh, giá trị và đội ngũ của chúng tôi</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>
          </div>

          {/* Card 3: Policy */}
          <div className="profile-card">
            <div className="profile-card-header">Chính sách & quy định</div>
            
            <div className="profile-card-item" onClick={() => setCurrentPage('chinh-sach-bao-mat')}>
              <div className="profile-item-icon">
                <FileText size={16} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Điều khoản sử dụng</span>
                <span className="profile-item-desc">Quy định về việc sử dụng nền tảng 80Land</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>

            <div className="profile-card-item" onClick={() => setCurrentPage('chinh-sach-bao-mat')}>
              <div className="profile-item-icon" style={{ backgroundColor: 'var(--primary-red-light)', color: 'var(--primary-red)' }}>
                <ShieldAlert size={16} />
              </div>
              <div className="profile-item-info">
                <span className="profile-item-title">Chính sách bảo mật</span>
                <span className="profile-item-desc">Cam kết bảo vệ thông tin cá nhân của bạn</span>
              </div>
              <ChevronRight size={16} className="profile-item-arrow" />
            </div>
          </div>
        </div>
      </div>

      {/* Official Footer (image21) */}
      <footer className="footer">
        <div className="footer-content">
          {/* Col 1 */}
          <div className="footer-logo-col">
            <div className="footer-logo">
              <span className="footer-logo-brand">80Land</span>
              <span className="footer-logo-sub">Tìm phòng nhanh</span>
            </div>
            <p className="footer-logo-desc" style={{ fontSize: '12px' }}>
              Kết nối nhanh chóng – Tìm phòng hiệu quả. Hệ thống tổng hợp tin đăng phòng trọ, căn hộ, mặt bằng kinh doanh hàng đầu Hà Nội.
            </p>
            <div className="footer-license">
              <strong>Giấy ĐKKD:</strong> Số 036305000432 do UBND Xã Rạng Đông, Tỉnh Ninh Bình cấp phép.<br />
              <strong>Chịu trách nhiệm nội dung:</strong> Bà Nguyễn Bích Hà.
            </div>
          </div>

          {/* Col 2: Navigation shortcuts */}
          <div>
            <h4 className="footer-col-title">DANH MỤC</h4>
            <div className="footer-links">
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('phong-tro')}>Phòng trọ</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('chung-cu')}>Chung cư</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('nha-nguyen-can')}>Nhà nguyên căn</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('can-ho-dich-vu')}>Căn hộ dịch vụ</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('mat-bang-kinh-doanh')}>Mặt bằng KD</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('o-ghep')}>Ở ghép</span>
            </div>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="footer-col-title">LIÊN HỆ</h4>
            <div className="footer-links">
              <div className="footer-link-item">
                <span>📍</span>
                <span>Xã Rạng Đông, Tỉnh Ninh Bình</span>
              </div>
              <div className="footer-link-item">
                <span>📞</span>
                <span>0876 480 130</span>
              </div>
              <div className="footer-link-item">
                <span>🌐</span>
                <span>80landtimphong.vn</span>
              </div>
              <div className="footer-link-item">
                <span>✉</span>
                <span>hotro@80land.vn</span>
              </div>
              
              <h4 className="footer-col-title" style={{ marginTop: '16px', marginBottom: '8px' }}>KẾT NỐI VỚI CHÚNG TÔI</h4>
              <div className="footer-social-row">
                <span className="footer-social-btn" onClick={() => window.open('https://zalo.me/g/80land', '_blank')}>
                  <MessageCircle size={16} fill="#FFFFFF" />
                </span>
                <span className="footer-social-btn" onClick={() => window.open('https://facebook.com', '_blank')}>
                  <FacebookIcon size={16} />
                </span>
                <span className="footer-social-btn" onClick={() => window.open('https://youtube.com', '_blank')}>
                  <YoutubeIcon size={16} />
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: App Download badges */}
          <div>
            <h4 className="footer-col-title">TẢI ỨNG DỤNG</h4>
            <p style={{ fontSize: '11px', marginBottom: '16px', lineHeight: 1.4 }}>
              Trải nghiệm 80Land tốt nhất trên điện thoại di động của bạn.
            </p>
            
            <div className="footer-app-badges">
              <div className="footer-app-badge" onClick={() => alert('App Store Download Link')}>
                <span style={{ fontSize: '20px' }}></span>
                <div className="footer-app-badge-info">
                  <span className="footer-app-badge-sub">Tải về trên</span>
                  <span className="footer-app-badge-title">App Store</span>
                </div>
              </div>

              <div className="footer-app-badge" onClick={() => alert('Google Play Download Link')}>
                <span style={{ fontSize: '20px', color: '#3bccff' }}>▶</span>
                <div className="footer-app-badge-info">
                  <span className="footer-app-badge-sub">Tải về trên</span>
                  <span className="footer-app-badge-title">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© 2026 80Land. Tất cả quyền được bảo lưu.</span>
          <div className="footer-bottom-links">
            <span className="footer-bottom-link" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('chinh-sach-bao-mat')}>Điều khoản sử dụng</span>
            <span className="footer-bottom-link" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('chinh-sach-bao-mat')}>Chính sách bảo mật</span>
            <span className="footer-bottom-link" style={{ cursor: 'pointer' }}>Liên hệ</span>
          </div>
        </div>
      </footer>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleAvatarChange} 
      />
      {renderZaloModal()}
      {renderContactModal()}
    </div>
  );
};

export default ProfileView;
