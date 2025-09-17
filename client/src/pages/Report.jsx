import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Report.css";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const banks = ["",
  "Ví điện tử MoMo",
  "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
  "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)",
  "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
  "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
  "Ngân hàng TMCP Á Châu (ACB)",
  "Ngân hàng TMCP Quân Đội (MB Bank)",
  "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
  "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
  "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)",
  "Ngân hàng TMCP Hàng Hải Việt Nam (MSB)",
  "Ngân hàng TMCP Đông Nam Á (SeABank)",
  "Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)",
  "Ngân hàng TMCP Phương Đông (OCB)",
  "Ngân hàng TMCP Quốc Tế Việt Nam (VIB)",
  "Ngân hàng TMCP Nam Á (Nam A Bank)",
  "Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)",
  "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam (Eximbank)",
  "Ngân hàng TMCP An Bình (ABBANK)",
  "Ngân hàng TMCP Bắc Á (Bac A Bank)",
  "Ngân hàng TMCP Quốc Dân (NCB)",
  "Ngân hàng TMCP Sài Gòn Công Thương (Saigonbank)",
  "Ngân hàng TMCP Bảo Việt (BaoViet Bank)",
  "Ngân hàng TMCP Xăng dầu Petrolimex (PGBank)",
  "Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)",
  "Ngân hàng TMCP Việt Á (VietABank)",
  "Ngân hàng TMCP Việt Nam Thương Tín (Vietbank)",
  "Ngân hàng TMCP Bản Việt (BVBank)",
  "Ngân hàng TMCP Kiên Long (Kienlongbank)",
  "Ngân hàng TNHH MTV HSBC Việt Nam (HSBC)",
  "Ngân hàng TNHH MTV Shinhan Việt Nam (Shinhan Bank)",
  "Ngân hàng TNHH MTV Standard Chartered Việt Nam (Standard Chartered)",
  "Ngân hàng TNHH MTV Public Bank Việt Nam (Public Bank)",
  "Ngân hàng TNHH MTV CIMB Việt Nam (CIMB)",
  "Ngân hàng TNHH MTV Woori Việt Nam (Woori Bank)",
  "Ngân hàng TNHH MTV UOB Việt Nam (UOB)",
  "Ngân hàng TNHH MTV Indovina (Indovina Bank)",
  "Ngân hàng Liên doanh Việt – Nga (VRB)",
  "Ngân hàng Chính sách Xã hội Việt Nam (VBSP)",
  "Ngân hàng Phát triển Việt Nam (VDB)",
  "Ngân hàng Hợp tác xã Việt Nam (Co-opBank)"
];

const categories = ["Lừa đảo", "Cảnh báo", "Spam", "Tích cực"];

export default function Report() {

  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    bank: banks[0],
    facebookLink: "",
    content: "",
    reporterName: "",
    zalo: "",
    proofs: [],
    confirm: "",
    category: categories[0],
    userId: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [accountNumberError, setAccountNumberError] = useState("");
  const [zaloError, setZaloError] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  // ✅ Kiểm tra đăng nhập khi vào trang
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        const result = await res.json();
        if (!result.success) {
          toast.error("Chưa đăng nhập!", { position: "top-right" });
          setTimeout(() => (window.location.href = "/"), 1500);
        } else {
          // Nếu muốn lấy userId để gửi kèm form
          setForm(prev => ({ ...prev, userId: result.user.id }));
        }
      } catch (err) {
        toast.error("Lỗi kết nối server!", { position: "top-right" });
        setTimeout(() => (window.location.href = "/"), 1500);
      }
    };
    checkAuth();
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "proofs") {
      setForm({ ...form, proofs: [...files] });
    } else if (name === "accountNumber" || name === "zalo") {
      const numericValue = value.replace(/\D/g, "");
      setForm({ ...form, [name]: numericValue });

      if (/\D/.test(value)) {
        if (name === "accountNumber") setAccountNumberError("⚠️ Chỉ được nhập số.");
        if (name === "zalo") setZaloError("⚠️ Chỉ được nhập số.");
      } else {
        if (name === "accountNumber") setAccountNumberError("");
        if (name === "zalo") setZaloError("");
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      setShowTermsError(true);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          proof: form.proofs.map(file => file.name),
          agreedTerms: true
        })
      });

      const result = await res.json();
      if (res.ok) {
        setShowModal(true);
        setForm({
          accountName: "",
          accountNumber: "",
          bank: banks[0],
          facebookLink: "",
          content: "",
          reporterName: "",
          zalo: "",
          proofs: [],
          confirm: "",
          category: categories[0],
          userId: form.userId
        });
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      <Header />
      <main className="report-page">
        <div className="report-title">Gửi Thông Tin Cảnh Báo</div>

        <form className="report-form" onSubmit={handleSubmit}>
          {/* Các input giữ nguyên */}
          <div className="form-row">
            <div className="form-group" style={{ width: "40%" }}>
              <label>Tên chủ tài khoản *</label>
              <input
                type="text"
                name="accountName"
                required
                value={form.accountName}
                onChange={handleChange}
                style={{ width: "90%" }}
              />
            </div>
            <div className="form-group" style={{ width: "48%" }}>
              <label>Số tài khoản *</label>
              <input
                type="text"
                name="accountNumber"
                required
                value={form.accountNumber}
                onChange={handleChange}
                pattern="\d*"
                inputMode="numeric"
                style={{ width: "90%" }}
              />
              {accountNumberError && <small style={{ color: "red" }}>{accountNumberError}</small>}
            </div>
          </div>

          {/* ✅ BANK SEARCH */}
          <div className="form-row">
            <div className="form-group" style={{ width: "48%" }}>
              <label>Tìm ngân hàng</label>
              <input
                type="text"
                placeholder="Gõ tên ngân hàng..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                style={{ width: "90%" }}
              />
              <label>Ngân hàng *</label>
              <select
                name="bank"
                value={form.bank}
                onChange={handleChange}
                style={{ width: "90%" }}
              >
                {filteredBanks.map((bank, idx) => (
                  <option key={idx} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ width: "48%" }}>
              <label>Link Facebook (nếu có)</label>
              <input
                type="text"
                name="facebookLink"
                value={form.facebookLink}
                onChange={handleChange}
                style={{ width: "90%" }}
              />
            </div>
          </div>

          {/* Giữ nguyên các trường khác */}
          <div className="form-group">
            <label>Hạng mục *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ width: "90%" }}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nội dung cảnh báo *</label>
            <textarea
              name="content"
              required
              value={form.content}
              onChange={handleChange}
              style={{ width: "90%" }}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Upload ảnh minh chứng (chọn nhiều ảnh):</label>
            <input type="file" name="proofs" multiple onChange={handleChange} />
            {form.proofs.length > 0 && (
              <ul>
                {Array.from(form.proofs).map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="warning-note">
            ⚠️ Hãy Upload đầy đủ bill chuyển tiền & đoạn chat để chứng minh
            người đó đã lừa đảo bạn. Bài tố cáo sẽ không được duyệt nếu không đủ
            bằng chứng.
          </div>

          <div className="report-title">Người Xác Thực</div>

          <div className="form-row">
            <div className="form-group" style={{ width: "48%" }}>
              <label>Họ và tên *</label>
              <input
                type="text"
                name="reporterName"
                required
                value={form.reporterName}
                onChange={handleChange}
                style={{ width: "90%" }}
              />
            </div>
            <div className="form-group" style={{ width: "48%" }}>
              <label>Liên hệ Zalo *</label>
              <input
                type="text"
                name="zalo"
                required
                value={form.zalo}
                onChange={handleChange}
                pattern="\d*"
                inputMode="numeric"
                style={{ width: "90%" }}
              />
              {zaloError && <small style={{ color: "red" }}>{zaloError}</small>}
            </div>
          </div>

          <div className="confirm-options">
            <label>
              <input
                type="radio"
                name="confirm"
                value="share"
                checked={form.confirm === "share"}
                onChange={handleChange}
              />
              Phốt này tôi chỉ đăng hộ
            </label>
            <label>
              <input
                type="radio"
                name="confirm"
                value="victim"
                checked={form.confirm === "victim"}
                onChange={handleChange}
              />
              Tôi là nạn nhân và chịu trách nhiệm
            </label>
          </div>
          <div className="form-check">
            <label>
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  setShowTermsError(false);
                }}
              />{" "}
              Tôi đã đọc và đồng ý với{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Điều khoản Dịch vụ
              </a>{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            {showTermsError && (
              <p className="form-error">⚠ Bạn cần đồng ý điều khoản để tiếp tục.</p>
            )}
          </div>

          <button type="submit" className="submit-btn">Gửi Duyệt</button>
        </form>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>✅ Đã gửi tố cáo thành công!</h3>
              <p>Chúng tôi sẽ xem xét và duyệt bài trong thời gian sớm nhất.</p>
              <button onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
