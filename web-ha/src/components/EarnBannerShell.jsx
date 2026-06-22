import React from 'react';

/**
 * Khung banner thiết kế: ảnh nền full-width + lớp overlay (chữ, nút) căn theo %.
 */
const EarnBannerShell = ({ src, alt = '', aspectRatio, className = '', children }) => {
  return (
    <div
      className={`earn-banner-shell ${className}`.trim()}
      style={{ aspectRatio: aspectRatio || undefined }}
    >
      <img src={src} alt={alt} className="earn-banner-shell__img" draggable={false} />
      {children ? <div className="earn-banner-shell__overlay">{children}</div> : null}
    </div>
  );
};

export default EarnBannerShell;
