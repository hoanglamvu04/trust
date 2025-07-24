import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';

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
const categories = [
  "Lừa đảo", "Cảnh báo", "Spam", "Tích cực",
  "Lừa chuyển khoản", "Bán hàng giả",
  "Giả danh cơ quan chức năng", "Tuyển dụng/việc làm ảo",
  "Cho vay tiền/App tín dụng"
];

export default function AdminReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editMode, setEditMode] = useState(!id);
  const [form, setForm] = useState({
    accountName: "", accountNumber: "", bank: "", facebookLink: "",
    content: "", reporterName: "", zalo: "", confirm: "",
    category: categories[0], proofs: [], status: "approved"
  });

  const [proofURLs, setProofURLs] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [bankSearch, setBankSearch] = useState("");
  const filteredBanks = banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

 useEffect(() => {
  if (id) {
    fetch(`http://localhost:5000/api/admin/reports/${id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        console.log("DATA REPORT DETAIL:", data); 
        if (data.success) {
          const r = data.report;
          const parsedProof = r.proof ? JSON.parse(r.proof) : [];
          setForm({ ...r, proofs: [], status: r.status || "approved" });
          setProofURLs(parsedProof);
        }
      })
      .catch(console.error);
  }
}, [id]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "proofs") {
      setForm({ ...form, proofs: [...files] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageDelete = (filename) => {
    setDeletedImages(prev => [...prev, filename]);
    setProofURLs(prev => prev.filter(f => f !== filename));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === "proofs") {
        form.proofs.forEach(file => formData.append("proofs", file));
      } else {
        formData.append(key, form[key]);
      }
    });

    formData.append("deletedImages", JSON.stringify(deletedImages));

    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `http://localhost:5000/api/admin/reports/${id}`
        : "http://localhost:5000/api/admin/reports";

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include", 
      });

      const json = await res.json();
      if (json.success) {
        alert(id ? "✅ Đã cập nhật!" : "✅ Đã thêm mới!");
        navigate("/admin/reports");
      } else {
        alert(json.message || "❌ Thao tác thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi gửi dữ liệu!");
    }
  };

  return (
    <div className="adm-report-page">
      <h2 className="adm-report-title">{id ? "Chi tiết Báo cáo" : "Thêm Báo cáo mới"}</h2>

      <form className="adm-report-form" onSubmit={handleSubmit}>
        <div className="adm-form-row">
          <div className="adm-form-group">
            <label>Tên chủ tài khoản *</label>
            <input name="accountName" value={form.accountName} onChange={handleChange} required readOnly={!editMode} />
          </div>
          <div className="adm-form-group">
            <label>Số tài khoản *</label>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} required readOnly={!editMode} />
          </div>
        </div>

        <div className="adm-form-row">
          <div className="adm-form-group">
            <label>Tìm ngân hàng</label>
            <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} disabled={!editMode} />
            <label>Ngân hàng *</label>
            <select name="bank" value={form.bank} onChange={handleChange} required disabled={!editMode}>
              {filteredBanks.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label>Facebook (nếu có)</label>
            <input name="facebookLink" value={form.facebookLink} onChange={handleChange} disabled={!editMode} />
          </div>
        </div>

        <div className="adm-form-row">
          <div className="adm-form-group">
            <label>Người tố cáo *</label>
            <input name="reporterName" value={form.reporterName} onChange={handleChange} required readOnly={!editMode} />
          </div>
          <div className="adm-form-group">
            <label>Zalo</label>
            <input name="zalo" value={form.zalo} onChange={handleChange} disabled={!editMode} />
          </div>
        </div>

        <div className="adm-form-group">
          <label>Phân loại</label>
          <select name="category" value={form.category} onChange={handleChange} disabled={!editMode}>
            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="adm-form-group">
          <label>Nội dung tố cáo *</label>
          <textarea name="content" value={form.content} onChange={handleChange} required readOnly={!editMode} />
        </div>

        <div className="adm-form-group">
          <label>Upload ảnh minh chứng</label>
          {editMode && <input type="file" name="proofs" multiple onChange={handleChange} />}
          {proofURLs.length > 0 && (
            <div className="adm-proof-preview">
              {proofURLs.map((filename, idx) => (
                <div key={idx} className="adm-proof-wrapper">
                  <img
                    src={`http://localhost:5000/uploads/reports/${id}/${filename}`}
                    alt={`proof-${idx}`}
                    className="adm-proof-thumb"
                    onClick={() => {
                      setCurrentImage(idx);
                      setModalOpen(true);
                    }}
                  />
                  {editMode && (
                    <button type="button" className="adm-remove-proof" onClick={() => handleImageDelete(filename)}>✖</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-form-group">
          <label>Xác nhận</label>
          <select name="confirm" value={form.confirm} onChange={handleChange} disabled={!editMode}>
            <option value="">-- Chọn --</option>
            <option value="share">Tôi chỉ đăng hộ</option>
            <option value="victim">Tôi là nạn nhân</option>
          </select>
        </div>

        {editMode && (
          <div className="adm-form-actions">
            <button type="submit" className="adm-btn">Lưu thay đổi</button>
            <button type="button" className="adm-btn-cancel" onClick={() => navigate("/admin/reports")}>Hủy</button>
          </div>
        )}
      </form>

      {!editMode && (
        <div className="adm-form-actions">
          <button type="button" className="adm-btn" onClick={() => setEditMode(true)}>Sửa</button>
          <button type="button" className="adm-btn-cancel" onClick={() => navigate("/admin/reports")}>Đóng</button>
        </div>
      )}

      {/* Modal hiển thị ảnh lớn + điều hướng */}
      {modalOpen && (
        <div className="adm-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="adm-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:5000/uploads/reports/${id}/${proofURLs[currentImage]}`}
              alt="Zoom"
              className="adm-modal-img"
            />
            <button className="adm-nav-btn left" onClick={() => setCurrentImage((currentImage - 1 + proofURLs.length) % proofURLs.length)}>&lt;</button>
            <button className="adm-nav-btn right" onClick={() => setCurrentImage((currentImage + 1) % proofURLs.length)}>&gt;</button>
            <button className="adm-modal-close" onClick={() => setModalOpen(false)}>✖</button>
          </div>
        </div>
      )}
    </div>
  );
}
