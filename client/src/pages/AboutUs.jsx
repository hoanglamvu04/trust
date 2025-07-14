import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/TermsPage.css";

const aboutSections = [
  {
    title: "Khởi nguồn ý tưởng",
    content: (
      <div style={{marginBottom: 8}}>
        TrustCheck ra đời từ thực tế nhiều cư dân chung cư gặp rủi ro vì các thủ đoạn lừa đảo, spam, giả mạo tài khoản chuyển tiền, hoặc bị quấy rối online. Dù có kinh nghiệm sống, nhiều người vẫn dễ bị mắc bẫy do thiếu kênh xác minh, chia sẻ thông tin và cảnh báo hiệu quả trong cộng đồng.
      </div>
    ),
  },
  {
    title: "Động lực phát triển",
    content: (
      <ul>
        <li>Xây dựng một “hàng rào số” bảo vệ cư dân khỏi các chiêu trò lừa đảo ngày càng tinh vi, đặc biệt trong các khu dân cư đông đúc, giao dịch online thường xuyên.</li>
        <li>Tạo cầu nối để mọi thành viên dễ dàng chia sẻ trải nghiệm, hỗ trợ lẫn nhau xác thực thông tin nghi vấn.</li>
        <li>Giúp Ban quản lý nâng cao hiệu quả quản trị, kịp thời tiếp nhận, xử lý phản ánh – kiến nghị của cư dân.</li>
      </ul>
    ),
  },
  {
    title: "Các điểm khác biệt của TrustCheck",
    content: (
      <ul>
        <li>Cho phép gửi cảnh báo, bình luận, đánh giá với cơ chế kiểm duyệt linh hoạt, bảo mật danh tính.</li>
        <li>Giao diện thân thiện với cả người ít am hiểu công nghệ; tối ưu cho điện thoại, máy tính, sử dụng mọi nơi trong tòa nhà.</li>
        <li>Thông tin cập nhật minh bạch, thống kê dễ hiểu, cảnh báo trực quan nhiều mức độ (an toàn, nghi ngờ, nguy hiểm).</li>
        <li>Hỗ trợ đa chức năng: tra cứu STK, website, gửi tố cáo, bình luận, quản lý cá nhân, tương tác cộng đồng và quản trị viên.</li>
      </ul>
    ),
  },
  {
    title: "Người phát triển hệ thống",
    content: (
      <div style={{margin: "7px 0 0 0", color: "#186d40"}}>
        <b>Hệ thống TrustCheck được thiết kế & phát triển bởi Hoàng Lâm Vũ.</b><br />
        Mọi góp ý xin gửi về hộp thư Ban quản lý hoặc qua chức năng liên hệ trên website.<br />
        <span style={{ color: "#178346", display: "block", marginTop: 12 }}>
          Xin cảm ơn sự đồng hành và đóng góp của cư dân!
        </span>
      </div>
    ),
  },
];

export default function AboutUs() {
  const [open, setOpen] = useState(aboutSections.map(() => true));
  const toggle = idx => setOpen(open => open.map((o, i) => (i === idx ? !o : o)));

  return (
    <div className="terms-root">
      <Header />
      <main className="terms-container">
        <h1 className="terms-title" style={{marginBottom: 16}}>Về Chúng Tôi</h1>
        {aboutSections.map((section, idx) => (
          <section
            className={"terms-section" + (open[idx] ? " open" : " collapsed")}
            key={idx}
          >
            <div
              className="section-header"
              onClick={() => toggle(idx)}
              tabIndex={0}
              role="button"
              aria-expanded={open[idx]}
              title={open[idx] ? "Thu gọn" : "Mở rộng"}
            >
              <span className="arrow">
                {open[idx] ? "▼" : "▶"}
              </span>
              {section.title}
            </div>
            <div
              className="section-content"
              style={{
                display: open[idx] ? "block" : "none",
                animation: open[idx] ? "fadeinSection 0.2s" : "none"
              }}
            >
              {section.content}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
