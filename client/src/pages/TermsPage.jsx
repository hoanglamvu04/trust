import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/TermsPage.css";

const sections = [
  {
    title: "1. Phạm vi & đối tượng áp dụng",
    content: (
      <ul>
        <li>
          TrustCheck là hệ thống cảnh báo nội bộ dành cho cư dân HH1A và các tòa mở rộng, hỗ trợ kiểm tra, chia sẻ thông tin rủi ro về lừa đảo, spam, mạo danh, hành vi bất thường.
        </li>
        <li>
          Dịch vụ chỉ phục vụ cho cư dân, Ban quản lý và nhân sự kỹ thuật được phân quyền sử dụng hệ thống.
        </li>
      </ul>
    ),
  },
  {
    title: "2. Quyền & nghĩa vụ của người dùng",
    content: (
      <>
        <b>Quyền của người dùng:</b>
        <ul>
          <li>Đăng ký, sử dụng các chức năng tra cứu, gửi cảnh báo, bình luận, đánh giá, kiểm tra thông tin nghi vấn.</li>
          <li>Được đảm bảo bảo mật thông tin cá nhân, chỉ hiển thị nickname/alias công khai.</li>
          <li>Truy cập lịch sử tố cáo, bình luận, chỉnh sửa hồ sơ cá nhân, đổi mật khẩu, biệt danh.</li>
        </ul>
        <b>Nghĩa vụ của người dùng:</b>
        <ul>
          <li>Cung cấp thông tin đăng ký chính xác, cập nhật khi có thay đổi.</li>
          <li>Tuân thủ quy định cộng đồng, không đăng nội dung vi phạm pháp luật hoặc sai sự thật.</li>
          <li>Chỉ gửi cảnh báo, bình luận về các sự việc có thật, chịu trách nhiệm về nội dung cung cấp.</li>
          <li>Không lạm dụng hệ thống để vu khống, spam, phá hoại cộng đồng.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Quyền và trách nhiệm của Ban quản lý/Quản trị viên",
    content: (
      <ul>
        <li>Có quyền duyệt, chỉnh sửa, ẩn/xóa cảnh báo hoặc bình luận vi phạm.</li>
        <li>Kiểm soát nội dung, xử lý báo cáo vi phạm, quản lý tài khoản người dùng.</li>
        <li>Đảm bảo hệ thống hoạt động liên tục, dữ liệu bảo mật, phân quyền rõ ràng.</li>
        <li>Không chịu trách nhiệm với giao dịch dân sự ngoài hệ thống hoặc thiệt hại phát sinh do người dùng không tra cứu đúng hướng dẫn.</li>
      </ul>
    ),
  },
  {
    title: "4. Quy tắc cộng đồng & nội dung cấm",
    content: (
      <ul>
        <li>Không đăng nội dung liên quan đến chính trị, tôn giáo, bạo lực, khiêu dâm, hoặc hành vi trái pháp luật.</li>
        <li>Không tiết lộ thông tin cá nhân của người khác trừ khi phục vụ cảnh báo rủi ro xác thực.</li>
        <li>Không spam, quảng cáo, phát tán phần mềm độc hại hoặc liên kết trái phép.</li>
        <li>Mọi hành vi phá hoại, tấn công hệ thống sẽ bị khóa tài khoản và báo cáo cơ quan chức năng.</li>
      </ul>
    ),
  },
  {
    title: "5. Giới hạn trách nhiệm",
    content: (
      <ul>
        <li>TrustCheck chỉ là công cụ hỗ trợ cảnh báo, kết quả tra cứu mang tính tham khảo.</li>
        <li>Ban quản trị không chịu trách nhiệm về mọi thiệt hại phát sinh từ việc sử dụng thông tin trên hệ thống mà không kiểm chứng lại.</li>
        <li>Nội dung do người dùng tự đăng tải và chịu trách nhiệm pháp lý về thông tin mình cung cấp.</li>
      </ul>
    ),
  },
  {
    title: "6. Quy định bảo mật & dữ liệu cá nhân",
    content: (
      <ul>
        <li>TrustCheck cam kết bảo vệ thông tin cá nhân, không tiết lộ cho bên thứ ba nếu không có sự đồng ý hoặc yêu cầu từ pháp luật.</li>
        <li>Lưu lại lịch sử hoạt động để kiểm duyệt, nâng cao chất lượng cảnh báo cộng đồng.</li>
        <li>Người dùng cần tự bảo mật thông tin đăng nhập, không dùng chung tài khoản.</li>
      </ul>
    ),
  },
  {
    title: "7. Thay đổi điều khoản",
    content: (
      <ul>
        <li>Điều khoản có thể được cập nhật, sửa đổi khi cần thiết. Thông báo thay đổi sẽ đăng trên trang chủ.</li>
        <li>Tiếp tục sử dụng hệ thống sau khi điều khoản thay đổi là bạn đồng ý với các sửa đổi đó.</li>
      </ul>
    ),
  },
  {
    title: "8. Hiệu lực & giải quyết tranh chấp",
    content: (
      <ul>
        <li>Điều khoản này có hiệu lực từ ngày công bố.</li>
        <li>Mọi tranh chấp phát sinh sẽ giải quyết qua thương lượng; nếu không thành sẽ chuyển cơ quan quản lý tòa nhà hoặc cơ quan pháp luật xử lý.</li>
      </ul>
    ),
  },
];

export default function DieuKhoanDichVu() {
  // Theo dõi mở/đóng từng mục
  const [open, setOpen] = useState(sections.map(() => true));

  const toggle = idx => {
    setOpen(open =>
      open.map((o, i) => (i === idx ? !o : o))
    );
  };

  return (
    <div className="terms-root">
      <Header />

      <main className="terms-container">
        <h1 className="terms-title">
          Điều khoản Dịch vụ – TrustCheck
        </h1>
        <p className="terms-subtitle">
          (Áp dụng cho hệ thống cảnh báo cộng đồng nội bộ – HH1A Linh Đàm)
        </p>

        {sections.map((section, idx) => (
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

        <div className="terms-footer-note">
          Nếu có thắc mắc về điều khoản, vui lòng liên hệ Ban quản lý hoặc email hỗ trợ trên website.<br />
          <b>Cảm ơn bạn đã chung tay xây dựng cộng đồng an toàn!</b>
        </div>
      </main>

      <Footer />
    </div>
  );
}
