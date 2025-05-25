import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Contact.css"; // CSS giữ nguyên nhé
import React from 'react';

export default function Contact() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
    };

    const res = await fetch("http://localhost:5000/api/contact/send", {
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
  };

  return (
    <>
      <Header />

      <div className="contact-page">
        {/* Hàng 1 */}
        <div className="contact-row">
          {/* Cột trái: Thông tin admin */}
          <div className="contact-col left">
            <h3>🌟 Liên kết mạng xã hội</h3>
            <ul className="social-links">
              <li>
                <a href="https://facebook.com" target="_blank">
                  <img src="/images/social/facebook.png" alt="Facebook" className="social-icon" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank">
                  <img src="/images/social/instagram.png" alt="Instagram" className="social-icon" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank">
                  <img src="/images/social/tiktok.png" alt="TikTok" className="social-icon" /> TikTok
                </a>
              </li>
              <li>
                <a href="https://zalo.me" target="_blank">
                  <img src="/images/social/zalo.png" alt="Zalo" className="social-icon" /> Zalo
                </a>
              </li>
              <li>
                <a href="https://t.me" target="_blank">
                  <img src="/images/social/telegram.png" alt="Telegram" className="social-icon" /> Telegram
                </a>
              </li>
            </ul>

            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Theo dõi chúng tôi trên các nền tảng để nhận cảnh báo scam mới nhất, thông tin hữu ích và hỗ trợ nhanh chóng!
            </p>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px", lineHeight: "1.6" }}>
              Chúng tôi luôn đồng hành cùng bạn trong hành trình phòng chống lừa đảo online. Hãy follow các kênh mạng xã hội để cập nhật thông tin cảnh báo mới nhất, thủ thuật an toàn khi giao dịch, và những chia sẻ hữu ích từ cộng đồng.
              <br />
              <br />
              Nếu có câu hỏi, thắc mắc hoặc muốn đóng góp, đừng ngần ngại liên hệ qua bất kỳ nền tảng nào bên trên. Chúng tôi luôn lắng nghe và hỗ trợ bạn!
            </p>
          </div>

          {/* Cột phải: Ủng hộ */}
          <div className="contact-col right">
            <h3>💖 Ủng hộ TrustCheck</h3>
            <p>Cảm ơn bạn đã ủng hộ dự án!</p>
            <img src="/images/qrcode.jpg" alt="Mã QR ủng hộ" className="qr-image" />
            <p><strong>Số tài khoản:</strong> 2009204 - Ngân hàng LioBank</p>
          </div>
        </div>

        {/* Hàng 2: Biểu mẫu liên hệ */}
        <div className="contact-form">
          <h2>📞 Liên hệ với TrustCheck</h2>
          <p>Nếu bạn có bất kỳ câu hỏi, góp ý hoặc cần hỗ trợ, vui lòng gửi tin nhắn qua biểu mẫu dưới đây!</p>

          <form onSubmit={handleSubmit}>
            <label>👤 Họ và tên</label>
            <input type="text" name="name" placeholder="Nhập họ và tên..." />

            <label>📧 Email</label>
            <input type="email" name="email" placeholder="Nhập email liên hệ..." />

            <label>📝 Tiêu đề</label>
            <input type="text" name="subject" placeholder="Nhập tiêu đề liên hệ..." />

            <label>💬 Nội dung</label>
            <textarea name="message" rows="4" placeholder="Viết nội dung liên hệ..."></textarea>

            <button type="submit">Gửi liên hệ</button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
