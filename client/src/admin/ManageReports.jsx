import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminStyles.css";
import "../styles/AdminReports.css";

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const navigate = useNavigate();

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  const fetchReports = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/reports?search=${encodeURIComponent(search)}&status=${encodeURIComponent(
          statusFilter
        )}&page=${page}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json.success) {
        setReports(json.reports);
        setTotal(json.total);
      } else {
        toast.warning(json.message || "Không lấy được dữ liệu.");
      }
    } catch {
      toast.error("❌ Lỗi tải dữ liệu reports");
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("🗑️ Xoá thành công");
        fetchReports();
      } else {
        toast.warning(json.message || "Không thể xoá report.");
      }
    } catch {
      toast.error("❌ Lỗi xoá report");
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "approved" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Đã duyệt!");
        fetchReports();
      } else {
        toast.warning(json.message || "Không thể duyệt report.");
      }
    } catch {
      toast.error("❌ Lỗi duyệt report");
    }
  };

  const openReject = (id) => {
    setRejectId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${rejectId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "rejected", rejectionReason: rejectReason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("❌ Đã từ chối!");
        setShowRejectModal(false);
        fetchReports();
      } else {
        toast.warning(json.message || "Không thể từ chối.");
      }
    } catch {
      toast.error("❌ Lỗi từ chối");
    }
  };

  const totalPages = Math.ceil(total / 30) || 1;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Quản lý Reports</h2>
        <div className="header-actions">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="🔍 Nhập STK Hoặc Tên CTK..."
            style={{ flex: 1, minWidth: "220px" }}
          />
          <button onClick={() => navigate("/admin/reports/new")} className="btn-add">
            Thêm Report
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {["", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "active" : ""}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
          >
            {status === "" ? "Tất cả" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Số tài khoản</th>
              <th>Tên tài khoản</th>
              <th>Ngân hàng</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.accountNumber}</td>
                <td>{r.accountName}</td>
                <td>{r.bank}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                <td className="action-buttons">
                  <button onClick={() => navigate(`/admin/reports/${r.id}`)} className="btn-outline">
                    Chi tiết
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="btn-red">
                    Xoá
                  </button>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(r.id)} className="btn-green">
                        Duyệt
                      </button>
                      <button onClick={() => openReject(r.id)} className="btn-orange">
                        Từ chối
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
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
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          ▶
        </button>
      </div>

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Lý do từ chối</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
            />
            <div className="modal-actions">
              <button onClick={handleReject}>Xác nhận</button>
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
