import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AddQuestion.css";

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    test_id: "",
    subject: "",
    sender: "",
    email: "",
    time: "",
    avatar: "",
    preview: "",
    content: "",
    is_scam: 0,
    scam_reason: "",
    unread: 1,
    starred: 0
  });
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách đề kiểm tra
  useEffect(() => {
    fetch("/api/admin/tests")
      .then(res => res.json())
      .then(data => setTests(data.tests || []));
  }, []);

  // Lấy dữ liệu câu hỏi cũ
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/questions/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          test_id: data.test_id,
          subject: data.subject,
          sender: data.sender,
          email: data.email,
          time: data.time || "",
          avatar: data.avatar || "",
          preview: data.preview || "",
          content: data.content,
          is_scam: data.is_scam,
          scam_reason: data.scam_reason || "",
          unread: data.unread ?? 1,
          starred: data.starred ?? 0
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Không tìm thấy câu hỏi!");
        navigate("/admin/questions");
      });
  }, [id, navigate]);

  // Xử lý thay đổi form
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  // Gửi dữ liệu lên server
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`/api/admin/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          toast.success("✅ Đã cập nhật câu hỏi!");
          setTimeout(() => navigate("/admin/questions"), 700);
        } else {
          toast.warn(json.message || "Có lỗi khi cập nhật!");
        }
      })
      .catch(() => toast.error("❌ Lỗi server khi cập nhật!"));
  };

  if (loading)
    return <div className="admin-container"><div className="admin-loading">Đang tải dữ liệu...</div></div>;

  return (
    <div className="admin-container">
      <h2 className="admin-title">📝 Sửa câu hỏi</h2>
      <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
        <div className="form-group">
          <label>Đề kiểm tra *</label>
          <select name="test_id" value={form.test_id} onChange={handleChange} required>
            <option value="">-- Chọn đề --</option>
            {tests.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Chủ đề (subject) *</label>
          <input name="subject" value={form.subject} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Người gửi *</label>
          <input name="sender" value={form.sender} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email người gửi *</label>
          <input name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Thời gian hiển thị</label>
          <input name="time" value={form.time} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Avatar (chữ cái đầu...)</label>
          <input name="avatar" value={form.avatar} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Dòng preview</label>
          <input name="preview" value={form.preview} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Nội dung email *</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={5} />
        </div>

        <div className="form-group">
          <label>Lừa đảo?</label>
          <select name="is_scam" value={form.is_scam} onChange={handleChange}>
            <option value={0}>Hợp lệ</option>
            <option value={1}>Lừa đảo</option>
          </select>
        </div>

        <div className="form-group">
          <label>Giải thích</label>
          <textarea name="scam_reason" value={form.scam_reason} onChange={handleChange} rows={3} />
        </div>

        <div className="form-group" style={{ display: "flex", gap: 16 }}>
          <label style={{ fontWeight: 500 }}>
            <input type="checkbox" name="unread" checked={!!form.unread} onChange={handleChange} />
            <span style={{ marginLeft: 6 }}>Chưa đọc</span>
          </label>
          <label style={{ fontWeight: 500 }}>
            <input type="checkbox" name="starred" checked={!!form.starred} onChange={handleChange} />
            <span style={{ marginLeft: 6 }}>Đánh dấu sao</span>
          </label>
        </div>

        <div className="form-actions" style={{ marginTop: 24 }}>
          <button className="btn-save" type="submit">Lưu thay đổi</button>
          <button className="btn-cancel" type="button" onClick={() => navigate("/admin/questions")} style={{ marginLeft: 10 }}>Hủy</button>
        </div>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
