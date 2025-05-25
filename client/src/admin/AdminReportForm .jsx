import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from 'react';

const banks = ["", "MB", "Vietcombank", "Techcombank", "BIDV", "ACB", "TPBank", "VPBank", "Agribank", "VietinBank"];
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
    category: categories[0], proofs: [], userId: null, status: "approved"
  });

  const [proofURLs, setProofURLs] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [bankSearch, setBankSearch] = useState("");
  const filteredBanks = banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/admin/reports/${id}`)
        .then(res => res.json())
        .then(data => {
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

      const res = await fetch(url, { method, body: formData });
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
            <input name="accountName" value={form.accountName} onChange={handleChange} required disabled={!editMode} />
          </div>
          <div className="adm-form-group">
            <label>Số tài khoản *</label>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} required disabled={!editMode} />
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
            <input name="reporterName" value={form.reporterName} onChange={handleChange} required disabled={!editMode} />
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
          <textarea name="content" value={form.content} onChange={handleChange} required disabled={!editMode} />
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
