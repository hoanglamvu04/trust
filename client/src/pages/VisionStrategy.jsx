import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/TermsPage.css";

const visionSections = [
  {
    title: "Tầm nhìn dài hạn",
    content: (
      <div style={{margin: "0 0 8px 0"}}>
        TrustCheck hướng tới trở thành nền tảng cảnh báo rủi ro và xây dựng cộng đồng số “tự bảo vệ – tự xác thực – tự cảnh báo” đầu tiên dành cho khu chung cư và đô thị tại Việt Nam. 
        Hệ thống không chỉ là công cụ công nghệ mà còn là “mạng lưới chia sẻ niềm tin” – nơi thông tin xác thực được ưu tiên, cư dân chủ động hỗ trợ lẫn nhau, góp phần xây dựng lối sống an toàn và văn minh số.
      </div>
    ),
  },
  {
    title: "Giá trị cốt lõi",
    content: (
      <ul>
        <li><b>Minh bạch:</b> Mọi dữ liệu cảnh báo, thống kê đều công khai nguồn gốc, minh bạch quy trình kiểm duyệt.</li>
        <li><b>Bảo mật & tôn trọng:</b> Luôn bảo vệ quyền riêng tư, danh tính của cư dân khi sử dụng dịch vụ.</li>
        <li><b>Kết nối cộng đồng:</b> Cổ vũ mọi thành viên chủ động tham gia xây dựng và xác minh thông tin, phòng ngừa lừa đảo từ gốc.</li>
        <li><b>Lấy trải nghiệm thực tế làm trung tâm:</b> Lắng nghe đóng góp, hoàn thiện từng chức năng dựa trên nhu cầu thực tế của cộng đồng.</li>
      </ul>
    ),
  },
  {
    title: "Chiến lược phát triển",
    content: (
      <ul>
        <li>
          <b>Công nghệ làm nền tảng:</b> Đầu tư phát triển các thuật toán nhận diện lừa đảo, tự động phân loại nguy cơ, bổ sung AI và học máy phục vụ kiểm tra nhanh các thông tin nghi vấn.
        </li>
        <li>
          <b>Hợp tác đa chiều:</b> Kết nối với Ban quản lý, tổ chức xã hội, đơn vị báo chí và các hệ thống cảnh báo quốc gia để mở rộng nguồn dữ liệu, tăng độ tin cậy.
        </li>
        <li>
          <b>Đào tạo cộng đồng:</b> Định kỳ tổ chức các hoạt động phổ biến kỹ năng cảnh giác, chia sẻ kiến thức phòng tránh lừa đảo cho cư dân và trẻ nhỏ.
        </li>
        <li>
          <b>Mở rộng quy mô:</b> Khi đủ ổn định, hệ thống sẽ nhân rộng cho toàn khu Linh Đàm và các dự án chung cư, khu đô thị khác tại Việt Nam.
        </li>
      </ul>
    ),
  },
  {
    title: "Cam kết phát triển bền vững",
    content: (
      <ul>
        <li>Không ngừng nâng cấp hệ thống, tiếp thu phản hồi cư dân để đảm bảo TrustCheck luôn thực sự hữu ích.</li>
        <li>Mọi dữ liệu đều được kiểm duyệt nhiều lớp, hạn chế tối đa tin giả, tin đồn gây hoang mang cộng đồng.</li>
        <li>Luôn sẵn sàng hợp tác với các tổ chức, cá nhân quan tâm đến an toàn cộng đồng, cùng xây dựng môi trường số lành mạnh.</li>
      </ul>
    ),
  },
];

export default function VisionStrategy() {
  const [open, setOpen] = useState(visionSections.map(() => true));
  const toggle = idx => setOpen(open => open.map((o, i) => (i === idx ? !o : o)));

  return (
    <div className="terms-root">
      <Header />
      <main className="terms-container">
        <h1 className="terms-title" style={{marginBottom: 10}}>Tầm nhìn & Chiến lược</h1>
        <p className="terms-subtitle" style={{marginBottom: 22}}>Xây dựng cộng đồng chung cư an toàn – chủ động – minh bạch</p>
        {visionSections.map((section, idx) => (
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
              <span className="arrow">{open[idx] ? "▼" : "▶"}</span>
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
