import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import "../styles/ReportHistory.css";

export default function ReportHistory() {
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [showReason, setShowReason] = useState(null);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  const toggleFilter = (status) => {
    if (filter === status) setFilter("all");
    else setFilter(status);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/report`, { credentials: "include" });
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách reports:", err);
      }
    };
    fetchReports();
  }, [API_BASE]);

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const handleViewReport = (r) => {
    if (r.id) {
      window.location.href = `/report/${r.id}`;
    }
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <SidebarProfile active="report" />

        <main className="profile-info">
          <div className="prl-tt">LỊCH SỬ TỐ CÁO</div>

          <div className="filter-wrapper">
            <div className="status-filter">
              <button
                className={"status-btn pending" + (filter === "pending" ? " active" : "")}
                onClick={() => toggleFilter("pending")}
              >
                <img src="/icons/waiting.png" width="25" height="25" alt="pending" />
                Chờ duyệt
              </button>
              <button
                className={"status-btn approved" + (filter === "approved" ? " active" : "")}
                onClick={() => toggleFilter("approved")}
              >
                <img src="/icons/approved.png" width="25" height="25" alt="approved" />
                Đã đăng
              </button>
              <button
                className={"status-btn rejected" + (filter === "rejected" ? " active" : "")}
                onClick={() => toggleFilter("rejected")}
              >
                <img src="/icons/refusal.png" width="25" height="25" alt="rejected" />
                Từ chối
              </button>
            </div>
          </div>

          <ul className="report-list">
            {filteredReports.length === 0 ? (
              <p>Không có dữ liệu.</p>
            ) : (
              filteredReports.map((r) => (
                <li
                  key={r.id}
                  className="report-item clickable"
                  onClick={() => handleViewReport(r)}
                >
                  <div className="report-main">
                    <span className="report-title">
                      {r.accountName} - {r.accountNumber}
                    </span>
                    <span className="report-date">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="report-status-badge" data-status={r.status}>
                      {r.status === "approved" && "✔ Đã đăng"}
                      {r.status === "pending" && "⏳ Chờ duyệt"}
                      {r.status === "rejected" && "✖ Từ chối"}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </main>
      </div>
      <Footer />
    </>
  );
}
