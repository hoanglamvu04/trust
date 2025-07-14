import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [testId, setTestId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Lấy danh sách đề kiểm tra
  const fetchTests = () => {
    fetch(`/api/admin/tests`)
      .then(res => res.json())
      .then(data => setTests(data.tests || []));
  };

  // Lấy danh sách câu hỏi
  const fetchQuestions = () => {
    let url = `/api/admin/questions?search=${search}&page=${page}`;
    if (testId) url += `&test_id=${testId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error("❌ Lỗi tải câu hỏi"));
  };

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => { fetchQuestions(); }, [search, testId, page]);

  const handleDelete = id => {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    fetch(`/api/admin/questions/${id}`, { method: "DELETE", credentials: "include" })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          toast.success("🗑️ Đã xóa câu hỏi!");
          fetchQuestions();
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi xóa câu hỏi"));
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>📩 Quản lý Câu hỏi (mẫu email giả lập)</h2>
        <div className="header-actions" style={{ display: "flex", gap: 8 }}>
          <select value={testId} onChange={e => { setTestId(e.target.value); setPage(1); }}>
            <option value="">-- Tất cả đề --</option>
            {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Tìm chủ đề, người gửi, nội dung..."
          />
          <button className="btn-add" onClick={() => navigate("/admin/questions/new")}>
            Thêm câu hỏi
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Đề</th>
              <th>Subject</th>
              <th>Sender</th>
              <th>Email</th>
              <th>Time</th>
              <th>Avatar</th>
              <th>Preview</th>
              <th>Lừa đảo?</th>
              <th>Giải thích</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign: "center" }}>Không có dữ liệu</td></tr>
            ) : (
              questions.map(q => (
                <tr key={q.id}>
                  <td>{q.test_name}</td>
                  <td>{q.subject}</td>
                  <td>{q.sender}</td>
                  <td>{q.email}</td>
                  <td>{q.time}</td>
                  <td>{q.avatar}</td>
                  <td>{q.preview}</td>
                  <td style={{ color: q.is_scam ? "#f32" : "#28a745" }}>{q.is_scam ? "Lừa đảo" : "Hợp lệ"}</td>
                  <td>{q.scam_reason}</td>
                  <td>{q.created_by_username}</td>
                  <td>{q.created_at ? new Date(q.created_at).toLocaleString("vi-VN") : ""}</td>
                  <td>
                    <button className="btn-icon" onClick={() => navigate(`/admin/questions/${q.id}/edit`)}>Sửa</button>
                    <button className="btn-icon" onClick={() => handleDelete(q.id)} style={{ color: "#e34d4d" }}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
        ))}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
