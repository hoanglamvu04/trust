import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Contact.css";

export default function Contact() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch(`${API_BASE}/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        e.target.reset();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <>
      <Header />
      <div className="contact-page">
        <div className="contact-social-block">
          <h3>🌟 Liên kết mạng xã hội</h3>
          <ul className="social-links">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/social/facebook.png" alt="Facebook" className="social-icon" /> Facebook
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/social/instagram.png" alt="Instagram" className="social-icon" /> Instagram
              </a>
            </li>
            <li>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/social/tiktok.png" alt="TikTok" className="social-icon" /> TikTok
              </a>
            </li>
            <li>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
                <img src="/images/social/zalo.png" alt="Zalo" className="social-icon" /> Zalo
              </a>
            </li>
            <li>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                <img src="/images/social/telegram.png" alt="Telegram" className="social-icon" /> Telegram
              </a>
            </li>
          </ul>
          <div className="contact-desc">
            <p>
              Theo dõi chúng tôi trên các nền tảng để nhận cảnh báo scam mới nhất, thông tin hữu ích và hỗ trợ nhanh chóng!
            </p>
            <p>
              Nếu có câu hỏi, thắc mắc hoặc muốn đóng góp, đừng ngần ngại liên hệ qua bất kỳ nền tảng nào bên trên. Chúng tôi luôn lắng nghe và hỗ trợ bạn!
            </p>
          </div>
        </div>

        <div className="contact-form">
          <h2>📞 Liên hệ với TrustCheck</h2>
          <p>Nếu bạn có bất kỳ câu hỏi, góp ý hoặc cần hỗ trợ, vui lòng gửi tin nhắn qua biểu mẫu dưới đây!</p>
          <form onSubmit={handleSubmit}>
            <label>👤 Họ và tên</label>
            <input type="text" name="name" placeholder="Nhập họ và tên..." required />
            <label>📧 Email</label>
            <input type="email" name="email" placeholder="Nhập email liên hệ..." required />
            <label>📝 Tiêu đề</label>
            <input type="text" name="subject" placeholder="Nhập tiêu đề liên hệ..." required />
            <label>💬 Nội dung</label>
            <textarea name="message" rows="4" placeholder="Viết nội dung liên hệ..." required></textarea>
            <button type="submit">Gửi liên hệ</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
