import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="/about">Về Chúng Tôi</a>
        <a href="/vision">Tầm Nhìn & Chiến Lược</a>
        <a href="/terms">Điều Khoản & Dịch Vụ</a>
        <a href="/scam-signs">Các Dấu Hiệu Lừa Đảo</a>
      </div>

      <div className="footer-bottom">
        <p>© 2025 TrustCheck. An toàn cộng đồng là sứ mệnh của chúng tôi.</p>
        <p className="dev-note">Hệ thống được phát triển và vận hành bởi <strong>Hoàng Lâm Vũ</strong>.</p>
      </div>
    </footer>
  );
}
