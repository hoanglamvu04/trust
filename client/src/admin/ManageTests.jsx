import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({ name: "", description: "", category_id: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load categories để chọn
  const fetchCategories = () => {
    fetch(`/api/admin/categories`)
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  };

  const fetchTests = () => {
    let url = `/api/admin/tests?search=${search}&page=${page}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTests(data.tests || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error("❌ Lỗi tải danh sách đề kiểm tra"));
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchTests(); }, [search, categoryId, page]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id) return toast.warn("Nhập đủ tên và chọn danh mục!");
    const url = editing
      ? `/api/admin/tests/${editing.id}`
      : `/api/admin/tests`;
    const method = editing ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        category_id: form.category_id,
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success || json.id) {
          toast.success(editing ? "✅ Đã sửa đề!" : "✅ Đã thêm đề!");
          setShowModal(false);
          setEditing(null);
          setForm({ name: "", description: "", category_id: "" });
          fetchTests();
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi thao tác"));
  };

  const handleEdit = t => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || "",
      category_id: t.category_id || "",
    });
    setShowModal(true);
  };

  const handleDelete = id => {
    if (!window.confirm("Xóa đề này?")) return;
    fetch(`/api/admin/tests/${id}`, { method: "DELETE", credentials: "include" })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          toast.success("🗑️ Đã xóa đề!");
          fetchTests();
        } else {
          toast.warn(json.message || "Có lỗi xảy ra!");
        }
      })
      .catch(() => toast.error("❌ Lỗi xóa đề"));
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>📝 Quản lý Đề kiểm tra</h2>
        <div className="header-actions" style={{ display: "flex", gap: 8 }}>
          <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}>
            <option value="">-- Tất cả danh mục --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Tìm tên đề..."
          />
          <button className="btn-add" onClick={() => { setEditing(null); setForm({ name: "", description: "", category_id: "" }); setShowModal(true); }}>
            Thêm đề kiểm tra
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên đề</th>
              <th>Mô tả</th>
              <th>Danh mục</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center" }}>Không có dữ liệu</td></tr>
            ) : (
              tests.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.description}</td>
                  <td>{t.category_name}</td>
                  <td>{t.created_by_username}</td>
                  <td>{t.created_at ? new Date(t.created_at).toLocaleString("vi-VN") : ""}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(t)}>Sửa</button>
                    <button className="btn-icon" onClick={() => handleDelete(t.id)} style={{ color: "#e34d4d" }}>Xóa</button>
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
            <h3>{editing ? "Sửa đề kiểm tra" : "Thêm đề kiểm tra"}</h3>
            <form onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên đề kiểm tra" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
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
