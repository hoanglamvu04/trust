import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    username: "", name: "", email: "", password: "", nickname: "", status: 1, roleId: 4
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 30;

  // 1: hoạt động, 2: bị khóa
  const STATUS_MAP = {
    1: "Hoạt động",
    2: "Bị khóa"
  };

  const fetchUsers = () => {
    fetch(`/api/users`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let filtered = data.users || [];
          if (search.trim()) {
            const s = search.toLowerCase();
            filtered = filtered.filter(u =>
              u.username.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s) ||
              (u.nickname && u.nickname.toLowerCase().includes(s))
            );
          }
          if (statusFilter) {
            filtered = filtered.filter(u => String(u.status) === String(statusFilter));
          }
          setUsers(filtered);
        }
      })
      .catch(() => toast.error("❌ Lỗi lấy danh sách users"));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    const method = editingUser ? "PUT" : "POST";
    const url = editingUser ? `/api/users/${editingUser.id}` : `/api/users`;
    const payload = { ...form };
    if (!editingUser) delete payload.status; // Khi tạo mới, status để mặc định là 1

    // Chuyển status và roleId về int nếu có
    if (payload.status) payload.status = parseInt(payload.status);
    if (payload.roleId) payload.roleId = parseInt(payload.roleId);

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(json => {
        if (json.success || json.message?.includes("thành công")) {
          toast.success(editingUser ? "✅ Cập nhật user thành công!" : "✅ Thêm user thành công!");
          setForm({ username: "", name: "", email: "", password: "", nickname: "", status: 1, roleId: 4 });
          setEditingUser(null);
          setShowModal(false);
          fetchUsers();
        } else {
          toast.warning(`⚠️ ${json.message}`);
        }
      })
      .catch(() => toast.error("❌ Lỗi thêm/sửa user"));
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa user này?")) return;
    fetch(`/api/users/${id}`, { method: "DELETE" })
      .then(() => {
        toast.success("🗑️ Đã xóa user!");
        fetchUsers();
      })
      .catch(() => toast.error("❌ Lỗi xóa user"));
  };

  const openEdit = user => {
    setEditingUser(user);
    setForm({
      username: user.username,
      name: user.name,
      email: user.email,
      password: "",
      nickname: user.nickname || "",
      status: user.status,
      roleId: user.roleId || 4,
      diaChi: user.diaChi,
    });
    setShowModal(true);
  };

  // Đặt lại mật khẩu (reset về mặc định)
  const handleResetPassword = (userId) => {
    if (!window.confirm("Đặt lại mật khẩu cho user này về mặc định?")) return;
    fetch(`/api/users/${userId}/reset-password`, { method: "POST" })
      .then(res => res.json())
      .then(json => {
        if (json.success) toast.success(json.message);
        else toast.warning(json.message);
      })
      .catch(() => toast.error("❌ Lỗi đặt lại mật khẩu!"));
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>👥Quản lý Users</h2>
        <div className="header-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm username, email, biệt danh..."
            style={{ flex: 1, minWidth: "220px" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: "180px" }}
          >
            <option value="">-- Lọc theo Trạng thái --</option>
            <option value={1}>Hoạt động</option>
            <option value={2}>Bị khóa</option>
          </select>
          <button className="btn-add" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            Thêm Người Dùng
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Biệt danh</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
              <th>Địa Chỉ</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.nickname || ""}</td>
                <td>
                  <select disabled value={user.status}>
                    <option value={1}>Hoạt động</option>
                    <option value={2}>Bị khóa</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  <button className="btn-icon" onClick={() => openEdit(user)}>Sửa</button>
                  <button className="btn-icon" onClick={() => handleDelete(user.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingUser ? "Cập nhật Người Dùng" : "Thêm User"}</h3>
            <form onSubmit={handleSubmit}>
              <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
              <input name="name" value={form.name} onChange={handleChange} placeholder="Họ và tên" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="Biệt danh" required />
              <input name="diaChi" value={form.diaChi} onChange={handleChange} placeholder="Địa chỉ" required />

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editingUser ? "Để trống nếu không đổi" : "Password"}
              />
              {editingUser && (
                <>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value={1}>Hoạt động</option>
                    <option value={2}>Bị khóa</option>
                  </select>
                  <select name="roleId" value={form.roleId} onChange={handleChange}>
                    <option value={1}>Quản trị hệ thống</option>
                    <option value={2}>Quản trị viên</option>
                    <option value={3}>Người kiểm duyệt</option>
                    <option value={4}>Người dùng</option>
                  </select>
                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="btn-reset-password"
                      style={{ background: "#e2a426", color: "#fff", marginRight: 8 }}
                      onClick={() => handleResetPassword(editingUser.id)}
                    >
                      Đặt lại mật khẩu
                    </button>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="submit">{editingUser ? "Lưu thay đổi" : "Thêm mới"}</button>
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
