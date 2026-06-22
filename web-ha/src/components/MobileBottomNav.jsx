import React from 'react';
import { Search, Building2, Users2, DollarSign, User } from 'lucide-react';

const MobileBottomNav = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'home', label: 'Tìm phòng', icon: Search },
    { id: 'can-ho-dich-vu', label: 'Hộ kinh doanh', icon: Building2 },
    { id: 'pass-phong', label: 'Pass phòng', icon: Users2 },
    { id: 'kiem-tien', label: 'Kiếm tiền', icon: DollarSign },
    { id: 'profile', label: 'Cá nhân', icon: User }
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        
        // Active checking logic matching the categories
        let isActive = currentPage === item.id;
        
        if (item.id === 'home') {
          isActive = currentPage === 'home' || 
                     currentPage === 'phong-tro' || 
                     currentPage === 'chung-cu' || 
                     currentPage === 'nha-nguyen-can' ||
                     currentPage === 'mat-bang-kinh-doanh' ||
                     currentPage === 'phong-tro-detail' ||
                     currentPage === 'chung-cu-detail' ||
                     currentPage === 'nha-nguyen-can-detail';
        } else if (item.id === 'can-ho-dich-vu') {
          isActive = currentPage === 'can-ho-dich-vu';
        } else if (item.id === 'pass-phong') {
          isActive = currentPage === 'pass-phong' || currentPage === 'o-ghep';
        } else if (item.id === 'kiem-tien') {
          isActive = currentPage.startsWith('kiem-tien') || currentPage === 'wallet';
        } else if (item.id === 'profile') {
          isActive = currentPage === 'profile' || currentPage === 'saved-rooms' || currentPage === 'viewed-rooms';
        }

        // Tinh chỉnh nhãn ngắn cho vừa màn hình mobile
        let shortLabel = item.label;
        if (item.id === 'can-ho-dich-vu') {
          shortLabel = 'Hộ kinh doanh';
        } else if (item.id === 'pass-phong') {
          shortLabel = 'Pass phòng';
        }


        return (
          <div
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <div className="mobile-nav-icon-wrapper">
              <Icon size={20} />
            </div>
            <span className="mobile-nav-label">{shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
