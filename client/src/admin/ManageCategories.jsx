import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({ name: "", description: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Lấy userId (admin) từ localStorage/session, hoặc sửa lại theo hệ thống đăng nhập của anh
  const userId = localStorage.getItem("userId") || "admin-uuid-demo";

  const fetchCategories = () => {
    fetch(`/api/admin/categories?search=${search}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error("❌ Lỗi tải danh mục"));
  };

  useEffect(() => { fetchCategories(); }, [search, page]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Tên danh mục không được để trống!");
    const url = editing
      ? `/api/admin/categories/${editing.id}`
      : `/api/admin/categories`;
    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { ...form, updated_by: userId }
      : { ...form, created_by: userId };
    fetch(url, {
     credentials: "include",
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(json => {
        if (json.success || json.id) {
          toast.success(editing ? "✅ Đã sửa danh mục!" : "✅ Đã thêm danh mục!");
          setShowModal(false);
          setEditing(null);
          setForm({ name: "", description: "" });
          fetchCategories();
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi thao tác"));
  };

  const handleEdit = cat => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowModal(true);
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa danh mục này?")) return;
    fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          toast.success("🗑️ Đã xóa danh mục!");
          fetchCategories();
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi xóa danh mục"));
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>📚 Quản lý Danh mục</h2>
        <div className="header-actions" style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Tìm tên danh mục..."
          />
          <button className="btn-add" onClick={() => { setEditing(null); setForm({ name: "", description: "" }); setShowModal(true); }}>
            Thêm danh mục
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center" }}>Không có dữ liệu</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>{cat.created_by_username}</td>
                  <td>{cat.created_at ? new Date(cat.created_at).toLocaleString("vi-VN") : ""}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(cat)}>Sửa</button>
                    <button className="btn-icon" onClick={() => handleDelete(cat.id)} style={{ color: "#e34d4d" }}>Xóa</button>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editing ? "Sửa danh mục" : "Thêm danh mục"}</h3>
            <form onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên danh mục" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
              <div className="modal-actions">
                <button type="submit">{editing ? "Lưu" : "Thêm"}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
}
