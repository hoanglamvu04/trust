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

  const fetchContacts = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/contacts?search=${search}&status=${statusFilter}&page=${page}`
      );
      const data = await res.json();
      console.log("Dữ liệu trả về từ API:", data); // debug
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("❌ Lỗi fetch contacts:", err);
      toast.error("❌ Lỗi fetch contacts");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter, page]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/contacts/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Cập nhật trạng thái thành công!");
        fetchContacts();
      } else {
        toast.warning(`⚠️ ${json.message}`);
      }
    } catch (err) {
      console.error("❌ Lỗi update status:", err);
      toast.error("❌ Lỗi update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa contact này?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/contacts/${id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        toast.success("🗑️ Xóa contact thành công!");
        fetchContacts();
      } else {
        toast.warning(`⚠️ ${json.message}`);
      }
    } catch (err) {
      console.error("❌ Lỗi xóa contact:", err);
      toast.error("❌ Lỗi xóa contact");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>
          <img className="icon-title" /> Quản lý Contacts
        </h2>
        <div className="header-actions">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, email, subject, message..."
          />
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
                <tr key={c._id || c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.subject}</td>
                  <td>{c.message}</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    {c.status !== "read" && (
                      <button
                        className="btn-icon"
                        onClick={() => handleUpdateStatus(c._id, "read")}
                      >
                        <img src="/icons/edit-contact.png" alt="read" className="icon-btn" /> Đã xem
                      </button>
                    )}
                    {c.status !== "replied" && (
                      <button
                        className="btn-icon"
                        onClick={() => handleUpdateStatus(c._id, "replied")}
                      >
                        <img src="/icons/add-rp.png" alt="replied" className="icon-btn" /> Phản hồi
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(c._id)}
                    >
                      <img src="/icons/delete-contact.png" alt="delete" className="icon-btn" /> Xóa
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

      <ToastContainer position="bottom-right" />
    </div>
  );
}
