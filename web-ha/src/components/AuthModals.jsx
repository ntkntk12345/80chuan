import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';


const AuthModals = ({ isOpen, type, onClose, onAuthSuccess }) => {
  const [modalType, setModalType] = useState(type || 'login'); // 'login' | 'register'
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Sync modal type when opening
  useEffect(() => {
    if (isOpen) {
      setModalType(type || 'login');
    }
  }, [isOpen, type]);

  // Capture or restore referral code
  useEffect(() => {
    if (isOpen && modalType === 'register') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref');
      if (urlRef) {
        setRegReferral(urlRef);
        localStorage.setItem('pending_referral_code', urlRef);
      } else {
        const storedRef = localStorage.getItem('pending_referral_code');
        if (storedRef) {
          setRegReferral(storedRef);
        }
      }
    }
  }, [isOpen, modalType]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginPhone, password: loginPassword })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Số điện thoại/Email hoặc mật khẩu không chính xác!');
        }
        return res.json();
      })
      .then(matchedUser => {
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        onAuthSuccess(matchedUser);
        onClose();
      })
      .catch(err => {
        console.error(err);
        alert(err.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác!');
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật');
      return;
    }
    if (regPass !== regPassConfirm) {
      alert('Mật khẩu nhập lại không trùng khớp');
      return;
    }
    
    fetch(`/api/users/${regPhone}`)
      .then(res => {
        if (res.ok) {
          alert('Số điện thoại này đã được đăng ký!');
          throw new Error('User already exists');
        }
        
        const newUser = {
          phone: regPhone,
          password: regPass,
          name: regName || 'Người dùng mới',
          referralCode: 'A' + Math.floor(10000 + Math.random() * 90000),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          role: 'user',
          walletBalance: 0,
          totalEarned: 0,
          pendingCommissions: 0,
          totalReferrals: 0,
          activeReferrals: 0
        };

        const referralPromise = regReferral ? 
          fetch('/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referralCode: regReferral,
              name: regName || 'Người dùng mới',
              phone: regPhone,
              date: (() => {
                const now = new Date();
                return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              })(),
              status: 'Chưa đủ điều kiện',
              commission: 0
            })
          }) : Promise.resolve();

        return referralPromise
          .then(() => fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
          }))
          .then(res => {
            if (!res.ok) throw new Error('Failed to create user');
            return res.json();
          })
          .then(createdUser => {
            localStorage.setItem('currentUser', JSON.stringify(createdUser));
            onAuthSuccess(createdUser);
            onClose();
          });
      })
      .catch(err => {
        if (err.message !== 'User already exists') {
          console.error(err);
          alert('Có lỗi xảy ra trong quá trình đăng ký!');
        }
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Left side Blue Banner */}
        <div className="modal-banner">
          <div className="modal-banner-top">
            <span className="modal-banner-logo">80Land</span>
            <div className="modal-banner-sub">Tìm phòng nhanh</div>
          </div>
          
          <div className="modal-banner-middle">
            <p className="modal-banner-desc">
              Nền tảng kết nối người thuê và chủ nhà nhanh chóng, minh bạch, hiệu quả.
            </p>
          </div>
          
          {/* Mock house layout SVG drawing */}
          <div style={{ width: '100%', height: '140px', marginTop: '20px' }}>
            <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', fill: 'none' }}>
              <path d="M20 100 L180 100" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              {/* House 1 */}
              <rect x="40" y="50" width="40" height="50" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" strokeWidth="2" />
              <polygon points="35,50 60,25 85,50" fill="rgba(255,255,255,0.25)" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="52" y="70" width="16" height="30" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="95" cy="40" r="12" fill="#E61E25" />
              <path d="M95 33 L95 43 M91 38 L99 38" stroke="#FFFFFF" strokeWidth="2" />
              {/* House 2 */}
              <rect x="110" y="60" width="50" height="40" fill="rgba(255,255,255,0.1)" stroke="#FFFFFF" strokeWidth="2" />
              <polygon points="105,60 135,35 165,60" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="120" y="75" width="12" height="15" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="1.5" />
              <rect x="140" y="75" width="12" height="15" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Right side form */}
        <div className="modal-form-side">
          {modalType === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <h2 className="modal-form-title">Đăng nhập</h2>
              <p className="modal-form-subtitle">Chào mừng bạn quay trở lại 80Land!</p>
              
              <div className="form-group">
                <label className="form-label">Số điện thoại hoặc email</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập số điện thoại hoặc email" 
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Mật khẩu</label>
                  <span className="form-link" style={{ fontSize: '12px' }}>Quên mật khẩu?</span>
                </div>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Nhập mật khẩu" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="form-submit-btn">Đăng nhập</button>

              <p className="modal-footer-link">
                Chưa có tài khoản?{' '}
                <span className="form-link" onClick={() => setModalType('register')}>Đăng ký ngay</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <h2 className="modal-form-title">Đăng ký tài khoản</h2>
              <p className="modal-form-subtitle">Tạo tài khoản để bắt đầu cùng 80Land!</p>

              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập họ và tên" 
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Nhập số điện thoại" 
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Nhập mật khẩu" 
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nhập lại mật khẩu</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Nhập lại mật khẩu" 
                    required
                    value={regPassConfirm}
                    onChange={(e) => setRegPassConfirm(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mã giới thiệu (nếu có)</label>
                <input 
                  type="text" 
                  className="form-input form-input-highlighted" 
                  placeholder="Nhập mã giới thiệu" 
                  value={regReferral}
                  onChange={(e) => setRegReferral(e.target.value)}
                />
                <span className="form-input-help">Nhập mã giới thiệu để ghi nhận và nhận hỗ trợ hệ thống.</span>
              </div>

              <div className="form-options">
                <label className="form-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    Tôi đồng ý với <span className="form-link">Điều khoản sử dụng</span> và{' '}
                    <span className="form-link">Chính sách bảo mật</span>
                  </span>
                </label>
              </div>

              <button type="submit" className="form-submit-btn form-submit-btn-red">Đăng ký</button>

              <p className="modal-footer-link" style={{ marginTop: '20px' }}>
                Đã có tài khoản?{' '}
                <span className="form-link" onClick={() => setModalType('login')}>Đăng nhập ngay</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModals;
