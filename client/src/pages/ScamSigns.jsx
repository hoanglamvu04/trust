import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/ScamSigns.css"; // tạo file này để style riêng cho trang này

const scamSigns = [
  {
    title: "1. Giả mạo tên miền và website",
    content: (
      <>
        <b>Dấu hiệu:</b> Địa chỉ website giống website thật nhưng thay đổi một số ký tự (ví dụ: “facebook.vn” thay vì “facebook.com”, hoặc có thêm dấu, số lạ).
        <br />
        <b>Cách nhận biết:</b> Luôn kiểm tra kỹ địa chỉ website trước khi đăng nhập hoặc nhập thông tin cá nhân. Nếu không chắc chắn, hãy tìm kiếm tên công ty/thương hiệu trên Google và truy cập từ trang chính thức.
      </>
    )
  },
  {
    title: "2. Giả mạo tin nhắn, email từ ngân hàng/cơ quan nhà nước",
    content: (
      <>
        <b>Dấu hiệu:</b> Tin nhắn/email thông báo bạn nhận được tiền, trúng thưởng hoặc có giao dịch bất thường, yêu cầu xác nhận gấp, điền thông tin tài khoản, mật khẩu, mã OTP…
        <br />
        <b>Cách nhận biết:</b> Ngân hàng/nhà nước **không bao giờ** yêu cầu cung cấp mật khẩu, mã OTP, hoặc gửi đường link lạ để xác thực. Hãy gọi hotline chính thức của ngân hàng để xác minh nếu có nghi ngờ.
      </>
    )
  },
  {
    title: "3. Giả mạo người thân, bạn bè nhờ chuyển tiền",
    content: (
      <>
        <b>Dấu hiệu:</b> Nhận được tin nhắn trên Facebook, Zalo, Messenger... nói mượn tiền, nhờ chuyển tiền gấp với lý do cá nhân hoặc tai nạn bất ngờ.
        <br />
        <b>Cách nhận biết:</b> Luôn gọi điện trực tiếp xác minh với người thân/bạn bè trước khi chuyển tiền.
      </>
    )
  },
  {
    title: "4. Giao dịch mua bán online không qua các sàn uy tín",
    content: (
      <>
        <b>Dấu hiệu:</b> Bán hàng với giá rẻ bất thường, yêu cầu chuyển khoản đặt cọc giữ hàng/giữ chỗ nhưng không giao hàng hoặc giao hàng giả, hàng không đúng mô tả.
        <br />
        <b>Cách nhận biết:</b> Chỉ giao dịch trên các sàn thương mại điện tử lớn, có bảo hiểm giao dịch, hoặc mua bán trực tiếp khi giá trị cao.
      </>
    )
  },
  {
    title: "5. Lừa đảo đầu tư – đa cấp tài chính",
    content: (
      <>
        <b>Dấu hiệu:</b> Cam kết lợi nhuận cao, trả lãi theo ngày/tuần, mời gọi đầu tư qua app, web hoặc nhóm chat Telegram/Zalo, trả thưởng khi giới thiệu người khác tham gia.
        <br />
        <b>Cách nhận biết:</b> Không đầu tư vào các dự án không rõ pháp lý, không minh bạch thông tin doanh nghiệp, đặc biệt nếu lợi nhuận “không tưởng”.
      </>
    )
  },
  {
    title: "6. Lừa đảo tuyển dụng, việc nhẹ lương cao",
    content: (
      <>
        <b>Dấu hiệu:</b> Đăng tin tuyển cộng tác viên, nhập liệu, việc nhẹ lương cao; yêu cầu đóng phí/đặt cọc/hoàn thiện hồ sơ mới được nhận việc.
        <br />
        <b>Cách nhận biết:</b> Công ty uy tín không bao giờ thu phí người xin việc dưới bất kỳ hình thức nào.
      </>
    )
  },
  {
    title: "7. Sử dụng app/web giả để chiếm đoạt tài khoản",
    content: (
      <>
        <b>Dấu hiệu:</b> Đề nghị tải app/ứng dụng hoặc truy cập web lạ để nhận quà, kiểm tra tài khoản, rút tiền thưởng, nạp game, v.v... Sau đó app/web yêu cầu đăng nhập bằng tài khoản ngân hàng, ví điện tử.
        <br />
        <b>Cách nhận biết:</b> Chỉ tải app từ App Store, Google Play hoặc trang chính thức; không nhập thông tin tài khoản/mật khẩu ở các web/app lạ.
      </>
    )
  },
  {
    title: "8. Giả danh cơ quan công an, tòa án, viện kiểm sát gọi điện đe dọa",
    content: (
      <>
        <b>Dấu hiệu:</b> Gọi điện thoại tự xưng là công an, viện kiểm sát, tòa án, dọa bạn liên quan vụ án, yêu cầu chuyển tiền vào tài khoản “an toàn” để xác minh.
        <br />
        <b>Cách nhận biết:</b> Cơ quan nhà nước **không bao giờ** gọi điện yêu cầu chuyển tiền hay xác minh tài khoản qua điện thoại.
      </>
    )
  }
];

function ScamSigns() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <>
      <Header />
      <div className="scam-signs-page">
        <h1 className="scam-signs-title">Dấu hiệu nhận biết lừa đảo</h1>
        <p className="scam-signs-desc">
          Hãy cảnh giác nếu bạn gặp các dấu hiệu sau khi giao dịch/mua bán/chuyển tiền online!
        </p>
        <div className="scam-signs-accordion">
          {scamSigns.map((item, idx) => (
            <div className="ss-accordion-item" key={idx}>
              <button
                className={`ss-accordion-title ${openIndex === idx ? "active" : ""}`}
                onClick={() => handleToggle(idx)}
              >
                <span>{item.title}</span>
                <span className="ss-arrow">{openIndex === idx ? "▲" : "▼"}</span>
              </button>
              <div
                className="ss-accordion-content"
                style={{ display: openIndex === idx ? "block" : "none" }}
              >
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ScamSigns;
