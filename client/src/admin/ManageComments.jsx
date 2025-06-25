import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";

export default function ManageComments() {
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterReportId, setFilterReportId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ userId: "", reportId: "", content: "" });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchComments = () => {
    const query = new URLSearchParams({
      search,
      page,
      userId: filterUserId,
      reportId: filterReportId,
    }).toString();

    fetch(`/api/admin/comments?${query}`)
      .then((res) => res.json())
      .then((data) => {
        // Always parse likes/replies to array
        const parsed = (data.comments || []).map((c) => ({
          ...c,
          likes: typeof c.likes === "string" ? JSON.parse(c.likes || "[]") : c.likes || [],
          replies: typeof c.replies === "string" ? JSON.parse(c.replies || "[]") : c.replies || [],
        }));
        setComments(parsed);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error("❌ Lỗi fetch comments"));
  };

  const fetchUsers = () => {
    fetch(`/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => toast.error("❌ Lỗi fetch users"));
  };

  const fetchReports = () => {
    fetch(`/api/admin/reports`)
      .then((res) => res.json())
      .then((data) => setReports(Array.isArray(data.reports) ? data.reports : []))
      .catch(() => {
        toast.error("❌ Lỗi fetch reports");
        setReports([]);
      });
  };

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterUserId, filterReportId]);

  useEffect(() => {
    fetchComments();
  }, [search, page, filterUserId, filterReportId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.userId || !form.reportId || !form.content) {
      toast.warning("⚠️ Vui lòng nhập đủ thông tin!");
      return;
    }

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/admin/comments/${editing}`
      : `/api/admin/comments`;

    const body = editing
      ? JSON.stringify({ content: form.content })
      : JSON.stringify(form);

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          toast.success(editing ? "✅ Cập nhật thành công!" : "✅ Thêm thành công!");
          setShowModal(false);
          setEditing(null);
          setForm({ userId: "", reportId: "", content: "" });
          fetchComments();
        } else {
          toast.warning(`⚠️ ${json.message || "Lỗi thao tác"}`);
        }
      })
      .catch(() => toast.error("❌ Lỗi gửi dữ liệu"));
  };

  const handleEdit = (comment) => {
    setEditing(comment.id);
    setForm({
      userId: comment.userId,
      reportId: comment.reportId,
      content: comment.content,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Xóa comment này?")) return;
    fetch(`/api/admin/comments/${id}`, { method: "DELETE" })
      .then(() => {
        toast.success("🗑️ Đã xóa comment!");
        fetchComments();
      })
      .catch(() => toast.error("❌ Lỗi xóa comment"));
  };

  const openModal = () => {
    setEditing(null);
    setForm({ userId: "", reportId: "", content: "" });
    setShowModal(true);
  };

  const userOptions = users.map(u => ({ value: u.id, label: u.username }));
  const reportOptions = reports.map(r => ({
    value: r.id,
    label: r.accountNumber || r.id
  }));

  return (
    <div className="admin-container">
      <h2 className="adm-comment-title">🗨️ Quản lý Comments</h2>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: "10px",
        alignItems: "center", marginBottom: "16px"
      }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm comment..."
          style={{ flex: "1", minWidth: "200px", padding: "8px" }}
        />

        <Select
          options={userOptions}
          value={userOptions.find(u => u.value === filterUserId) || null}
          onChange={opt => setFilterUserId(opt?.value || "")}
          isClearable
          placeholder={<span>👤 Lọc theo User</span>}
          styles={{ container: base => ({ ...base, minWidth: 200 }) }}
        />

        <Select
          options={reportOptions}
          value={reportOptions.find(r => r.value === filterReportId) || null}
          onChange={opt => setFilterReportId(opt?.value || "")}
          isClearable
          placeholder={<span>📄 Lọc theo Report</span>}
          styles={{ container: base => ({ ...base, minWidth: 200 }) }}
        />

        <button onClick={openModal} className="btn-add">Thêm Comment</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Report</th>
              <th>Nội dung</th>
              <th>Likes</th>
              <th>Replies</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <React.Fragment key={c.id}>
                <tr>
                  <td>{c.alias || c.username || c.userId}</td>
                  <td>{c.accountNumber || c.reportId}</td>
                  <td>{c.content}</td>
                  <td>{c.likes.length}</td>
                  <td>{c.replies.length}</td>
                  <td>{new Date(c.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(c)}>Sửa</button>
                    <button className="btn-icon" onClick={() => handleDelete(c.id)}>Xóa</button>
                  </td>
                </tr>
                {c.replies && c.replies.length > 0 && (
                  <tr>
                    <td colSpan={7} style={{ background: "#f9f9f9", padding: "10px" }}>
                      <strong>Phản hồi:</strong>
                      <ul style={{ margin: 0 }}>
                        {c.replies.map((r, idx) => (
                          <li key={idx}>
                            <span style={{ color: "#0088ff" }}>{r.userName}</span>: {r.content}
                            <span style={{ fontSize: "11px", color: "#666", marginLeft: 8 }}>{new Date(r.createdAt).toLocaleString("vi-VN")}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={page === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editing ? "Sửa Comment" : "Thêm Comment"}</h3>
            <form onSubmit={handleSubmit}>
              <select name="userId" value={form.userId} onChange={handleChange} required>
                <option value="">-- Chọn User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
              <select name="reportId" value={form.reportId} onChange={handleChange} required>
                <option value="">-- Chọn Report --</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>{r.accountNumber || r.id}</option>
                ))}
              </select>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Nội dung"
                required
              />
              <div className="modal-actions">
                <button type="submit">{editing ? "Lưu" : "Thêm"}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
