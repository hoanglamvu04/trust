import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";
import React from 'react';

export default function ManageContacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const fetchContacts = async () => {
    try {
      const res = await fetch(
        `/api/admin/contacts?search=${search}&status=${statusFilter}&page=${page}`
      );
      const data = await res.json();
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("❌ Lỗi fetch contacts");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter, page]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `/api/admin/contacts/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const json = await res.json();
      if (json.success || json.message?.includes("thành công")) {
        toast.success("✅ Cập nhật trạng thái thành công!");
        fetchContacts();
      } else {
        toast.warning(`⚠️ ${json.message}`);
      }
    } catch {
      toast.error("❌ Lỗi update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa contact này?")) return;
    try {
      const res = await fetch(
        `/api/admin/contacts/${id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        toast.success("🗑️ Xóa contact thành công!");
        fetchContacts();
      } else {
        toast.warning(`⚠️ ${json.message}`);
      }
    } catch {
      toast.error("❌ Lỗi xóa contact");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.message && (json.id || res.status === 201)) {
        toast.success("✅ Thêm liên hệ thành công!");
        setShowModal(false);
        setForm({ name: "", email: "", subject: "", message: "" });
        fetchContacts();
      } else {
        toast.warning(json.message || "Có lỗi xảy ra!");
      }
    } catch {
      toast.error("❌ Lỗi gửi liên hệ!");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>
          <img className="icon-title" alt="" /> Quản lý Contacts
        </h2>
        <div className="header-actions" style={{ gap: 8, display: "flex" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, email, subject, message..."
          />
          <button className="btn-add" onClick={() => setShowModal(true)}>
            Thêm liên hệ
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={statusFilter === "" ? "active" : ""}
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
        >
          Tất cả
        </button>
        <button
          className={statusFilter === "unread" ? "active" : ""}
          onClick={() => {
            setStatusFilter("unread");
            setPage(1);
          }}
        >
          Chưa xem
        </button>
        <button
          className={statusFilter === "read" ? "active" : ""}
          onClick={() => {
            setStatusFilter("read");
            setPage(1);
          }}
        >
          Đã xem
        </button>
        <button
          className={statusFilter === "replied" ? "active" : ""}
          onClick={() => {
            setStatusFilter("replied");
            setPage(1);
          }}
        >
          Đã phản hồi
        </button>
      </div>

    <div className="table-container">
  <table>
    <thead>
      <tr>
        <th>Tên</th>
        <th>Email</th>
        <th>Chủ đề</th>
        <th>Nội dung</th>
        <th>Trạng thái</th>
        <th>Ngày</th>
        <th style={{ width: "140px", textAlign: "center" }}>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {Array.isArray(contacts) && contacts.length > 0 ? (
        contacts.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.subject}</td>
            <td>{c.message}</td>
            <td>{c.status === "unread"
                ? "Chưa xem"
                : c.status === "read"
                  ? "Đã xem"
                  : c.status === "replied"
                    ? "Đã phản hồi"
                    : c.status
              }
            </td>
            <td>{new Date(c.createdAt).toLocaleString()}</td>
            <td style={{ textAlign: "center" }}>
              {c.status !== "read" && (
                <button
                  className="btn-icon"
                  onClick={() => handleUpdateStatus(c.id, "read")}
                >
                  Đã xem
                </button>
              )}
              {c.status !== "replied" && (
                <button
                  className="btn-icon"
                  onClick={() => handleUpdateStatus(c.id, "replied")}
                >
                  Phản hồi
                </button>
              )}
              <button
                className="btn-icon"
                onClick={() => handleDelete(c.id)}
                style={{ color: "#e34d4d", marginLeft: 4 }}
              >
                Xóa
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" style={{ textAlign: "center" }}>
            Không có dữ liệu
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ◀
        </button>
        <span>
          Trang {page}/{totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          ▶
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thêm liên hệ</h3>
            <form onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Chủ đề" required />
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Nội dung" required />
              <div className="modal-actions">
                <button type="submit">Gửi</button>
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
