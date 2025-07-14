import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AdminStyles.css";

export default function ManageAnswerSessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchSessions(); }, [search, page]);

  const fetchSessions = () => {
    fetch(`/api/admin-answers?search=${search}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data.results || []);
        setTotalPages(data.totalPages || 1);
      });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>📊 Danh sách các lần làm bài kiểm tra</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm user hoặc tên đề..."
          />
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Bài kiểm tra</th>
              <th>Điểm</th>
              <th>Số câu</th>
              <th>Bắt đầu</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center" }}>Không có dữ liệu</td></tr>
            ) : sessions.map(r => (
              <tr key={r.session_id}>
                <td>{r.username}</td>
                <td>{r.test_name}</td>
                <td style={{ fontWeight: 600 }}>{r.score || 0}</td>
                <td>{r.total || 0}</td>
                <td>{r.started_at ? new Date(r.started_at).toLocaleString("vi-VN") : ""}</td>
                <td>
                  {r.submitted_at
                    ? <span style={{ color: "#219a37" }}>Đã nộp</span>
                    : <span style={{ color: "#f8a900" }}>Chưa nộp</span>}
                </td>
                <td>
                  <Link
                    to={`/admin/answer-sessions/detail?session_id=${r.session_id}`}
                    className="btn-no"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}
