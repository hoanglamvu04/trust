import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AddQuestion.css";

export default function AddQuestion() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    subject: "", sender: "", email: "", time: "", avatar: "", preview: "",
    content: "", is_scam: "0", scam_reason: "", unread: "1", starred: "0", test_id: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/admin/tests`)
      .then(res => res.json())
      .then(data => setTests(data.tests || []));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.subject.trim() || !form.sender.trim() || !form.email.trim() || !form.content.trim() || !form.test_id) {
      return toast.warn("Vui lòng nhập đủ các trường bắt buộc!");
    }
    fetch(`/api/admin/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        is_scam: Number(form.is_scam),
        unread: Number(form.unread),
        starred: Number(form.starred),
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success || json.id) {
          toast.success("✅ Đã thêm câu hỏi!");
          setTimeout(() => navigate("/admin/questions"), 1000);
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi thao tác"));
  };

  return (
    <div className="admin-container" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ margin: 0, padding: "24px 0 18px" }}>Thêm Câu hỏi Mô phỏng Email</h2>
      <form onSubmit={handleSubmit} className="big-form">
        <input name="subject" value={form.subject} onChange={handleChange} placeholder="Chủ đề (subject) *" required />
        <input name="sender" value={form.sender} onChange={handleChange} placeholder="Người gửi *" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email người gửi *" required />
        <input name="time" value={form.time} onChange={handleChange} placeholder="Thời gian hiển thị" />
        <input name="avatar" value={form.avatar} onChange={handleChange} placeholder="Avatar (chữ cái đầu...)" />
        <input name="preview" value={form.preview} onChange={handleChange} placeholder="Dòng preview" />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Nội dung email *" required rows={5} />
        <select name="is_scam" value={form.is_scam} onChange={handleChange} required>
          <option value="0">Hợp lệ</option>
          <option value="1">Lừa đảo</option>
        </select>
        <input name="scam_reason" value={form.scam_reason} onChange={handleChange} placeholder="Giải thích" />
        <select name="unread" value={form.unread} onChange={handleChange}>
          <option value="1">Chưa đọc</option>
          <option value="0">Đã đọc</option>
        </select>
        <select name="starred" value={form.starred} onChange={handleChange}>
          <option value="1">Đánh dấu sao</option>
          <option value="0">Không đánh dấu</option>
        </select>
        <select name="test_id" value={form.test_id} onChange={handleChange} required>
          <option value="">-- Chọn đề kiểm tra --</option>
          {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <button type="submit">Thêm</button>
          <button type="button" className="btn-cancel" onClick={() => navigate("/admin/questions")}>Huỷ</button>
        </div>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
