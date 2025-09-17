import React, { useState } from "react";

export default function AddCategory() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage("Tên danh mục không được để trống!");
      return;
    }
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success || json.id) {
      setMessage("✅ Đã thêm danh mục thành công!");
      setForm({ name: "", description: "" });
    } else {
      setMessage(json.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Thêm danh mục mới</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Tên danh mục"
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Mô tả"
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit">Thêm</button>
      </form>
      {message && <div style={{ marginTop: 10, color: "#e34d4d" }}>{message}</div>}
    </div>
  );
}
