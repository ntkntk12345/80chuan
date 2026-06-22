import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Users, 
  Award, 
  Eye, 
  EyeOff, 
  Download,
  AlertCircle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const POPULAR_BANKS = [
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng Ngoại Thương Việt Nam' },
  { bin: '970407', code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng Kỹ Thương Việt Nam' },
  { bin: '970422', code: 'MB', shortName: 'MBBank', name: 'Ngân hàng Quân Đội' },
  { bin: '970415', code: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam' },
  { bin: '970418', code: 'BID', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam' },
  { bin: '970416', code: 'ACB', shortName: 'ACB', name: 'Ngân hàng Á Châu' },
  { bin: '970454', code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng Thịnh Vượng' },
  { bin: '970405', code: 'VBA', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & Phát triển Nông thôn' },
  { bin: '970423', code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong' },
  { bin: '970443', code: 'SHB', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội' },
  { bin: '970437', code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM' },
  { bin: '970429', code: 'SCB', shortName: 'SCB', name: 'Ngân hàng Sài Gòn' },
  { bin: '970403', code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín' },
  { bin: '970441', code: 'VIB', shortName: 'VIB', name: 'Ngân hàng Quốc tế' },
  { bin: '970426', code: 'MSB', shortName: 'MSB', name: 'Ngân hàng Hàng Hải' },
  { bin: '970449', code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng Bưu điện Liên Việt' },
  { bin: '970415', code: 'EIB', shortName: 'Eximbank', name: 'Ngân hàng Xuất Nhập Khẩu' },
  { bin: '970430', code: 'OCB', shortName: 'OCB', name: 'Ngân hàng Phương Đông' },
  { bin: '970425', code: 'ABB', shortName: 'ABBANK', name: 'Ngân hàng An Bình' },
  { bin: '970409', code: 'BAB', shortName: 'BacABank', name: 'Ngân hàng Bắc Á' }
];

const WalletView = ({ user, onOpenLogin, isMobile, setCurrentPage, settings, onUserUpdate }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'

  const [bankList, setBankList] = useState(POPULAR_BANKS);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then(res => res.json())
      .then(result => {
        if (result && result.code === '00' && result.data) {
          setBankList(result.data);
        }
      })
      .catch(err => console.error('Error fetching bank list from VietQR:', err));
  }, []);

  // Form states
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');
  const [phone, setPhone] = useState('');

  const [registrations, setRegistrations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userStats, setUserStats] = useState(user || {
    walletBalance: 0,
    totalEarned: 0,
    totalReferrals: 0,
    activeReferrals: 0
  });

  const referralCode = user ? user.referralCode : 'A12345';
  const userPhone = user ? user.phone : 'user';

  // Generate last 7 days data dynamically
  const getLast7Days = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d);
    }
    return list;
  };

  const last7DaysData = getLast7Days().map((d) => {
    const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const searchStr = `${dayStr}/${d.getFullYear()}`;
    
    // Daily income (positive transactions)
    const dayTxs = transactions.filter(t => t.date && t.date.includes(searchStr));
    let dailyIncome = 0;
    dayTxs.forEach(t => {
      if (t.amount && t.amount.startsWith('+')) {
        const clean = t.amount.replace(/[đ\s\+]/g, '').replace(/\./g, '');
        const val = parseFloat(clean) || 0;
        dailyIncome += val;
      }
    });

    // Daily active referrals (registered on this day and earned money)
    const dayRegs = registrations.filter(r => r.date && r.date.includes(searchStr) && (r.status === 'Đã kiếm được tiền' || r.status.includes('Đã kiếm')));
    const dailyPeople = dayRegs.length;

    return {
      label: dayStr,
      income: dailyIncome,
      people: dailyPeople
    };
  });

  const incomePoints = last7DaysData.map((day, idx) => {
    const x = 50 + idx * 70;
    const y = Math.max(20, Math.min(170, 170 - (day.income / 2000000) * 150));
    return { x, y };
  });
  const incomePath = `M ${incomePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const incomeAreaPath = `${incomePath} L 470 170 L 50 170 Z`;

  const peoplePoints = last7DaysData.map((day, idx) => {
    const x = 50 + idx * 70;
    const y = Math.max(20, Math.min(170, 170 - (day.people / 20) * 150));
    return { x, y };
  });
  const peoplePath = `M ${peoplePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  // Load registrations, transactions, and user stats on mount
  useEffect(() => {
    fetch(`/api/users/${userPhone}`)
      .then(res => {
        if (res.ok) return res.json();
        return user;
      })
      .then(data => {
        if (data && data.role) {
          setUserStats(data);
          if (onUserUpdate) onUserUpdate(data);
        } else {
          if (onUserUpdate) onUserUpdate(null);
        }
      });

    fetch('/api/referrals')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(r => r.referralCode === referralCode);
        const mapped = filtered.map((item, idx) => ({
          stt: idx + 1,
          name: item.name,
          date: item.date,
          status: item.status,
          statusColor: item.status === 'Đã kiếm được tiền' || item.status.includes('Đã kiếm') ? 'green' : 'orange'
        }));
        setRegistrations(mapped);
      });

    fetch('/api/sync-referrals', { method: 'POST' })
      .then(() => fetch('/api/transactions'))
      .then(res => res.json())
      .then(data => {
        const list = data.filter(t => t.phone === userPhone);
        
        const getTimestamp = (dateStr) => {
          if (!dateStr) return 0;
          const parts = dateStr.split(' ');
          if (parts[0]) {
            const dParts = parts[0].split('/');
            if (dParts.length === 3) {
              return new Date(`${dParts[2]}-${dParts[1]}-${dParts[0]}T${parts[1] || '00:00'}`).getTime() || 0;
            }
          }
          return 0;
        };
        list.sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));

        const mapped = list.map(t => ({
          ...t,
          statusColor: t.statusColor || (t.status === 'Thành công' ? 'green' : 'orange')
        }));
        setTransactions(mapped);

        return fetch(`/api/users/${userPhone}`);
      })
      .then(res => {
        if (res && res.ok) return res.json();
      })
      .then(data => {
        if (data && data.role) {
          setUserStats(data);
          if (onUserUpdate) onUserUpdate(data);
        } else {
          if (onUserUpdate) onUserUpdate(null);
        }
      })
      .catch(err => console.error('Error fetching data from SQLite:', err));
  }, [user, userPhone, referralCode]);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }
    const withdrawalAmount = parseFloat(amount.replace(/\D/g, ''));
    const minWithdraw = settings?.min_withdrawal || 50000;
    if (!withdrawalAmount || withdrawalAmount < minWithdraw) {
      alert(`Số tiền rút tối thiểu là ${minWithdraw.toLocaleString('vi-VN')}đ`);
      return;
    }
    if (withdrawalAmount > userStats.walletBalance) {
      alert('Số dư khả dụng không đủ');
      return;
    }

    const selectedBankObj = bankList.find(b => (b.bin === bank || b.code === bank));
    const bankLabel = selectedBankObj ? (selectedBankObj.shortName || selectedBankObj.code) : bank;

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newWithdrawal = {
      phone: user.phone,
      date: dateStr,
      type: 'Rút tiền',
      amount: `-${withdrawalAmount.toLocaleString('vi-VN')}đ`,
      status: 'Đang xử lý',
      statusColor: 'orange',
      note: JSON.stringify({
        bankCode: bank,
        bankName: bankLabel,
        accountNum: accountNum,
        accountName: accountName
      })
    };

    const saved = localStorage.getItem('withdrawals_db');
    let list = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }
    list.unshift(newWithdrawal);
    localStorage.setItem('withdrawals_db', JSON.stringify(list));

    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWithdrawal)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post withdrawal');
        return res.json();
      })
      .then(() => {
        const updatedMe = {
          ...userStats,
          walletBalance: Math.max(0, userStats.walletBalance - withdrawalAmount)
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedMe));
        window.dispatchEvent(new Event('storage'));

        alert(`Yêu cầu rút ${withdrawalAmount.toLocaleString('vi-VN')}đ về tài khoản ngân hàng của bạn đã được gửi thành công. Chúng tôi sẽ xử lý trong vòng 24 giờ.`);
        window.location.reload();
      })
      .catch(err => {
        console.error(err);
        alert('Có lỗi xảy ra khi thực hiện rút tiền!');
      });
  };

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="detail-mobile">
        {/* Header */}
        <div className="mobile-header">
          <button className="mobile-header-back" onClick={() => setCurrentPage(setCurrentPage ? 'profile' : 'home')}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span className="mobile-header-title">Ví hoa hồng</span>
          <div className="mobile-header-right"></div>
        </div>

        {/* Padding container for content */}
        <div style={{ padding: '12px', paddingBottom: '80px' }}>
          {/* Stats grid matching image23.png layout */}
          <div className="mobile-stats-row">
            {/* Card 1: Available balance */}
            <div className="mobile-stat-card blue">
              <span className="mobile-stat-card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Số dư khả dụng 
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                >
                  {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </span>
              <div className="mobile-stat-card-value">
                {showBalance ? (user ? `${(userStats?.walletBalance || 0).toLocaleString('vi-VN')}đ` : '0đ') : '••••••'}
              </div>
              <span className="mobile-stat-card-desc">Có thể rút ngay</span>
              <button 
                className="mobile-stat-card-btn" 
                style={{ color: 'var(--zalo-blue)' }}
                onClick={() => {
                  setActiveTab('overview');
                  setTimeout(() => {
                    document.getElementById('mobile-withdraw-amount-input')?.focus();
                  }, 100);
                }}
              >
                Rút tiền
              </button>
            </div>

            {/* Card 2: Total income */}
            <div className="mobile-stat-card green">
              <span className="mobile-stat-card-title">Tổng thu nhập</span>
              <div className="mobile-stat-card-value">
                {user ? `${(userStats?.totalEarned || 0).toLocaleString('vi-VN')}đ` : '0đ'}
              </div>
              <span className="mobile-stat-card-desc">Đã nhận &amp; chờ duyệt</span>
            </div>

            {/* Card 3: Total referrals */}
            <div className="mobile-stat-card orange">
              <span className="mobile-stat-card-title">Tổng người đăng ký</span>
              <div className="mobile-stat-card-value">
                {user ? userStats.totalReferrals : '0'}
              </div>
              <span className="mobile-stat-card-desc">Qua mã giới thiệu</span>
            </div>

            {/* Card 4: Active referrals */}
            <div className="mobile-stat-card purple">
              <span className="mobile-stat-card-title">Người kiếm được tiền</span>
              <div className="mobile-stat-card-value">
                {user ? userStats.activeReferrals : '0'}
              </div>
              <span className="mobile-stat-card-desc">Đã phát sinh đơn</span>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="wallet-tabs" style={{ margin: '16px 0 12px' }}>
            <div 
              className={`wallet-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={{ flex: 1, textAlign: 'center', fontSize: '13px', paddingBottom: '10px' }}
            >
              Tổng quan &amp; Rút tiền
            </div>
            <div 
              className={`wallet-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ flex: 1, textAlign: 'center', fontSize: '13px', paddingBottom: '10px' }}
            >
              Lịch sử giao dịch
            </div>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Form Rút Tiền Card */}
              <div className="wallet-form-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', marginBottom: '16px' }}>
                <h3 className="wallet-form-title" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-dark)' }}>Rút tiền</h3>
                <p className="wallet-form-desc" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Rút tiền nhanh về tài khoản ngân hàng</p>
                
                <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Số tiền rút</label>
                    <input 
                      id="mobile-withdraw-amount-input"
                      type="text" 
                      className="form-input" 
                      placeholder="Nhập số tiền cần rút" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    />
                    <span className="form-input-help" style={{ fontSize: '10px', marginTop: '2px' }}>
                      Số dư khả dụng: {userStats ? `${(userStats?.walletBalance || 0).toLocaleString('vi-VN')}đ` : '1.850.000đ'} • Tối thiểu rút: {(settings?.min_withdrawal || 50000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Ngân hàng</label>
                    <select className="filter-select" required value={bank} onChange={(e) => setBank(e.target.value)} style={{ padding: '8px 12px', fontSize: '12px', width: '100%' }}>
                      <option value="">Chọn ngân hàng</option>
                      {bankList.map(b => (
                        <option key={b.bin || b.code} value={b.bin || b.code}>
                          {b.shortName || b.short_name || b.code} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Số tài khoản</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nhập số tài khoản" 
                      required
                      value={accountNum}
                      onChange={(e) => setAccountNum(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Tên chủ tài khoản</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="TÊN CHỦ TÀI KHOẢN (VIẾT HOA)" 
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Số điện thoại xác nhận</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="Nhập số điện thoại" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>

                  <button type="submit" className="form-submit-btn" style={{ padding: '10px', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>Rút tiền ngay</button>
                </form>
              </div>

              {/* Chart Card */}
              <div className="wallet-chart-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Hiệu quả mời bạn bè</h3>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>7 ngày qua</span>
                </div>

                {/* SVG Chart */}
                <div className="chart-container" style={{ margin: '8px 0', overflow: 'hidden' }}>
                  <svg className="chart-svg" viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1.5" />

                    {/* Left Y-Axis labels (Income) */}
                    <text x="35" y="24" fill="#94A3B8" fontSize="10" textAnchor="end">2M</text>
                    <text x="35" y="64" fill="#94A3B8" fontSize="10" textAnchor="end">1.5M</text>
                    <text x="35" y="104" fill="#94A3B8" fontSize="10" textAnchor="end">1M</text>
                    <text x="35" y="144" fill="#94A3B8" fontSize="10" textAnchor="end">500K</text>
                    <text x="35" y="174" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

                    {/* X-Axis labels */}
                    {last7DaysData.map((day, idx) => (
                      <text key={idx} x={50 + idx * 70} y="188" fill="#94A3B8" fontSize="10" textAnchor="middle">{day.label}</text>
                    ))}

                    {/* Line 1: Income (Green) */}
                    <path 
                      d={incomePath} 
                      fill="none" 
                      stroke="var(--success-green)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d={incomeAreaPath} 
                      fill="url(#green-gradient-mob)" 
                      opacity="0.1" 
                    />
                    {incomePoints.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="var(--success-green)" stroke="#FFFFFF" strokeWidth="1.5" />
                    ))}

                    {/* Line 2: Users (Blue) */}
                    <path 
                      d={peoplePath} 
                      fill="none" 
                      stroke="var(--zalo-blue)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                    {peoplePoints.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="var(--zalo-blue)" stroke="#FFFFFF" strokeWidth="1.5" />
                    ))}

                    <defs>
                      <linearGradient id="green-gradient-mob" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--success-green)" />
                        <stop offset="100%" stopColor="var(--success-green)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div style={{
                  backgroundColor: 'var(--zalo-blue-light)',
                  color: 'var(--zalo-blue)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  lineHeight: 1.4,
                  marginTop: '12px'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>Hoa hồng được duyệt sau khi đơn của bạn bè hoàn tất.</span>
                </div>
              </div>

              {/* Registrations List */}
              <div className="wallet-chart-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '12px' }}>Người đăng ký gần đây</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {registrations.map((reg) => (
                    <div key={reg.stt} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>{reg.name}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{reg.date}</div>
                      </div>
                      <span className={`status-badge ${reg.statusColor}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {reg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Lịch sử giao dịch Panel */
            <div className="wallet-chart-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Lịch sử biến động</h3>
                <button style={{ border: 'none', background: 'var(--zalo-blue-light)', color: 'var(--zalo-blue)', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={10} /> Sao kê
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transactions.map((tx, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>{tx.type}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{tx.date}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ 
                        fontSize: '12px',
                        fontWeight: 800, 
                        color: tx.amount.startsWith('+') ? 'var(--success-green)' : 'var(--primary-red)' 
                      }}>
                        {tx.amount}
                      </span>
                      <span className={`status-badge green`} style={{ fontSize: '8px', padding: '1px 4px' }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Title Header */}
      <div className="section-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px' }}>
        <img 
          src="/wallet-3d.png" 
          alt="Wallet Icon" 
          style={{ 
            width: '48px', 
            height: '48px', 
            objectFit: 'contain',
            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
          }} 
        />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontFamily: 'var(--font-main)' }}>
            Ví của tôi
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Quản lý thu nhập và rút tiền dễ dàng
          </p>
        </div>
      </div>

      {/* Wallet Cards Row */}
      <div className="wallet-cards-row">
        {/* Card 1: Available balance */}
        <div className="wallet-card primary" style={{ position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '65%', zIndex: 1 }}>
            <span className="wallet-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EBF3FF' }}>
              Số dư khả dụng 
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </span>
            <div className="wallet-card-value" style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              {showBalance ? (user ? `${(userStats?.walletBalance || 0).toLocaleString('vi-VN')}đ` : '0đ') : '••••••'}
            </div>
            <div className="wallet-card-desc" style={{ color: '#EBF3FF', opacity: 0.9 }}>Số tiền có thể rút ngay</div>
          </div>
          
          <img 
            src="/wallet-3d.png" 
            alt="Wallet 3D" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'contain', 
              position: 'absolute', 
              right: '12px', 
              top: '12px',
              filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))' 
            }} 
          />

          <div className="wallet-card-actions" style={{ marginTop: 'auto', zIndex: 1 }}>
            <button className="wallet-card-btn-white" onClick={() => document.getElementById('withdraw-amount-input')?.focus()}>
              Rút tiền
            </button>
            <button className="wallet-card-btn-outline" onClick={() => setActiveTab('history')}>
              Lịch sử giao dịch
            </button>
          </div>
        </div>

        {/* Card 2: Total income */}
        <div className="wallet-card" style={{ position: 'relative', overflow: 'hidden', minHeight: '160px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '65%' }}>
            <span className="wallet-card-label" style={{ color: '#15803D', fontWeight: 600 }}>Tổng thu nhập</span>
            <div className="wallet-card-value" style={{ color: '#166534', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              {user ? `${(userStats?.totalEarned || 0).toLocaleString('vi-VN')}đ` : '0đ'}
            </div>
            <div className="wallet-card-desc" style={{ color: '#166534', opacity: 0.8 }}>Tổng số tiền bạn đã kiếm được</div>
          </div>
          <img 
            src="/moneybag-3d.png" 
            alt="Money bag 3D" 
            style={{ 
              width: '75px', 
              height: '75px', 
              objectFit: 'contain', 
              position: 'absolute', 
              right: '10px', 
              bottom: '10px',
              filter: 'drop-shadow(0px 6px 12px rgba(22,101,52,0.15))' 
            }} 
          />
        </div>

        {/* Card 3: Total registrations */}
        <div className="wallet-card" style={{ position: 'relative', overflow: 'hidden', minHeight: '160px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '65%' }}>
            <span className="wallet-card-label" style={{ color: '#C2410C', fontWeight: 600 }}>Tổng số người đăng ký</span>
            <div className="wallet-card-value" style={{ color: '#9A3412', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              {user ? userStats.totalReferrals : '0'}
            </div>
            <div className="wallet-card-desc" style={{ color: '#9A3412', opacity: 0.8 }}>Người đăng ký qua mã của bạn</div>
          </div>
          <img 
            src="/users-3d.png" 
            alt="Users 3D" 
            style={{ 
              width: '75px', 
              height: '75px', 
              objectFit: 'contain', 
              position: 'absolute', 
              right: '10px', 
              bottom: '10px',
              filter: 'drop-shadow(0px 6px 12px rgba(154,52,18,0.15))' 
            }} 
          />
        </div>

        {/* Card 4: Commissions earned users */}
        <div className="wallet-card" style={{ position: 'relative', overflow: 'hidden', minHeight: '160px', backgroundColor: '#FAF5FF', border: '1px solid #F3E8FF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '65%' }}>
            <span className="wallet-card-label" style={{ color: '#7E22CE', fontWeight: 600 }}>Số người đã kiếm được tiền</span>
            <div className="wallet-card-value" style={{ color: '#6B21A8', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              {user ? userStats.activeReferrals : '0'}
            </div>
            <div className="wallet-card-desc" style={{ color: '#6B21A8', opacity: 0.8 }}>Người đã đủ điều kiện hoa hồng</div>
          </div>
          <img 
            src="/badge-3d.png" 
            alt="Badge 3D" 
            style={{ 
              width: '75px', 
              height: '75px', 
              objectFit: 'contain', 
              position: 'absolute', 
              right: '10px', 
              bottom: '10px',
              filter: 'drop-shadow(0px 6px 12px rgba(107,33,168,0.15))' 
            }} 
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
        <div 
          className={`wallet-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </div>
        <div 
          className={`wallet-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử giao dịch
        </div>
      </div>

      {activeTab === 'overview' ? (
        /* Overview Panel */
        <div className="wallet-columns">
          {/* Left Column (Chart + registrations table) */}
          <div>
            {/* SVG Chart Card */}
            <div className="wallet-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Hiệu quả mời bạn bè tham gia</h3>
                <select className="filter-select" style={{ minWidth: '120px', padding: '4px 24px 4px 10px', fontSize: '12px' }}>
                  <option>7 ngày gần đây</option>
                  <option>30 ngày gần đây</option>
                </select>
              </div>

              {/* Stat Boxes Grid (Matches image13.png details) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Stat Box 1: Total Referrals */}
                <div style={{ 
                  backgroundColor: '#F8FAFC', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success-green)', fontFamily: 'var(--font-title)' }}>
                      {userStats ? userStats.totalReferrals : '42'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
                      Tổng số người đăng ký
                    </div>
                  </div>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--success-green-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--success-green)'
                  }}>
                    <Users size={20} />
                  </div>
                </div>

                {/* Stat Box 2: Active Referrals */}
                <div style={{ 
                  backgroundColor: '#F8FAFC', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--warning-orange)', fontFamily: 'var(--font-title)' }}>
                      {userStats ? userStats.activeReferrals : '12'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
                      Số người đã kiếm được tiền
                    </div>
                  </div>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--warning-orange-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--warning-orange)'
                  }}>
                    <Award size={20} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--success-green)', borderRadius: '50%' }} />
                  <span>Thu nhập (đ)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: 'var(--zalo-blue)', borderRadius: '50%' }} />
                  <span>Số người kiếm được tiền (người)</span>
                </div>
              </div>

              {/* Pure SVG Line Chart */}
              <div className="chart-container">
                <svg className="chart-svg" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1.5" />

                  {/* Left Y-Axis labels (Income) */}
                  <text x="30" y="24" fill="#94A3B8" fontSize="8" textAnchor="end">2M</text>
                  <text x="30" y="64" fill="#94A3B8" fontSize="8" textAnchor="end">1.5M</text>
                  <text x="30" y="104" fill="#94A3B8" fontSize="8" textAnchor="end">1M</text>
                  <text x="30" y="144" fill="#94A3B8" fontSize="8" textAnchor="end">500K</text>
                  <text x="30" y="174" fill="#94A3B8" fontSize="8" textAnchor="end">0</text>

                  {/* Right Y-Axis labels (Users count) */}
                  <text x="490" y="24" fill="#94A3B8" fontSize="8" textAnchor="start">20</text>
                  <text x="490" y="64" fill="#94A3B8" fontSize="8" textAnchor="start">15</text>
                  <text x="490" y="104" fill="#94A3B8" fontSize="8" textAnchor="start">10</text>
                  <text x="490" y="144" fill="#94A3B8" fontSize="8" textAnchor="start">5</text>
                  <text x="490" y="174" fill="#94A3B8" fontSize="8" textAnchor="start">0</text>

                  {/* X-Axis labels */}
                  {last7DaysData.map((day, idx) => (
                    <text key={idx} x={50 + idx * 70} y="188" fill="#94A3B8" fontSize="8" textAnchor="middle">{day.label}</text>
                  ))}

                  {/* Line 1: Income (Green) */}
                  <path 
                    d={incomePath} 
                    fill="none" 
                    stroke="var(--success-green)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                  {/* Line 1 Area fill under curve */}
                  <path 
                    d={incomeAreaPath} 
                    fill="url(#green-gradient)" 
                    opacity="0.1" 
                  />
                  {/* Line 1 Dots */}
                  {incomePoints.map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r="4" fill="var(--success-green)" stroke="#FFFFFF" strokeWidth="1.5" />
                  ))}

                  {/* Line 2: Users (Blue) */}
                  <path 
                    d={peoplePath} 
                    fill="none" 
                    stroke="var(--zalo-blue)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                  {peoplePoints.map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r="4" fill="var(--zalo-blue)" stroke="#FFFFFF" strokeWidth="1.5" />
                  ))}

                  {/* Definitions for Gradients */}
                  <defs>
                    <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--success-green)" />
                      <stop offset="100%" stopColor="var(--success-green)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div style={{
                backgroundColor: 'var(--zalo-blue-light)',
                color: 'var(--zalo-blue)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}>
                <AlertCircle size={14} />
                <span>Hoa hồng sẽ được ghi nhận khi người bạn mời đủ điều kiện và có đơn đầu tiên thành công.</span>
              </div>
            </div>

            {/* Registrations list */}
            <div className="wallet-chart-card">
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800 }}>Người đăng ký gần đây</h3>
                <span className="section-link">Xem tất cả</span>
              </div>
              
              <div className="earnings-table-container">
                <table className="earnings-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên người đăng ký</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.stt}>
                        <td>{reg.stt}</td>
                        <td style={{ fontWeight: 600 }}>{reg.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{reg.date}</td>
                        <td>
                          <span className={`status-badge ${reg.statusColor}`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Withdraw form) */}
          <div className="wallet-form-card">
            <h3 className="wallet-form-title">Rút tiền</h3>
            <p className="wallet-form-desc">Rút tiền nhanh chóng về tài khoản ngân hàng của bạn</p>
            
            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Số tiền rút</label>
                <input 
                  id="withdraw-amount-input"
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập số tiền cần rút" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                 <span className="form-input-help">
                  Số dư khả dụng: {userStats ? `${(userStats?.walletBalance || 0).toLocaleString('vi-VN')}đ` : '1.850.000đ'} • Tối thiểu rút: {(settings?.min_withdrawal || 50000).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Ngân hàng</label>
                <select className="filter-select" required value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="">Chọn ngân hàng</option>
                  {bankList.map(b => (
                    <option key={b.bin || b.code} value={b.bin || b.code}>
                      {b.shortName || b.short_name || b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Số tài khoản</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập số tài khoản ngân hàng" 
                  required
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên chủ tài khoản</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập tên chủ tài khoản (VIẾT HOA)" 
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại nhận xác nhận</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Nhập số điện thoại" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                Sau khi chuyển khoản thành công, chúng tôi sẽ gửi biên lai xác nhận qua số điện thoại của bạn.
              </div>

              <button type="submit" className="form-submit-btn">Rút tiền ngay</button>
            </form>
          </div>
        </div>
      ) : (
        /* History Panel */
        <div className="wallet-chart-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800 }}>Lịch sử rút tiền & hoa hồng</h3>
            <button className="sidebar-support-btn" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} />
              <span>Xuất sao kê</span>
            </button>
          </div>

          <div className="earnings-table-container">
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Loại giao dịch</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.type}</td>
                    <td style={{ 
                      fontWeight: 700, 
                      color: tx.amount.startsWith('+') ? 'var(--success-green)' : 'var(--primary-red)' 
                    }}>
                      {tx.amount}
                    </td>
                    <td>
                      <span className={`status-badge ${tx.statusColor}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
