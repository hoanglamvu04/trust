import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import "../styles/ReportHistory.css";
import React from 'react';

export default function ReportHistory() {
  const [filter, setFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [showReason, setShowReason] = useState(null);

  const toggleFilter = (status) => {
    if (filter === status) setFilter("all");
    else setFilter(status);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/report/all");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách reports:", err);
      }
    };
    fetchReports();
  }, []);

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <>
      <Header />
      <div className="profile-page">
        <SidebarProfile active="report" />

        <main className="profile-info">
          <div className="prl-tt">LỊCH SỬ TỐ CÁO</div>

          {/* ✅ BỌC BỘ FILTER */}
          <div className="filter-wrapper">
            <div className="status-filter">
              <button
                className={filter === "pending" ? "active" : ""}
                onClick={() => toggleFilter("pending")}
              >
                <img
                  src="/icons/waiting.png"
                  width="25"
                  height="25"
                  alt="pending"
                />{" "}
                Chờ duyệt
              </button>
              <button
                className={filter === "approved" ? "active" : ""}
                onClick={() => toggleFilter("approved")}
              >
                <img
                  src="/icons/approved.png"
                  width="25"
                  height="25"
                  alt="approved"
                />{" "}
                Đã đăng
              </button>
              <button
                className={filter === "rejected" ? "active" : ""}
                onClick={() => toggleFilter("rejected")}
              >
                <img
                  src="/icons/refusal.png"
                  width="25"
                  height="25"
                  alt="rejected"
                />{" "}
                Đã huỷ
              </button>
            </div>
          </div>

          {/* ✅ LIST */}
          <ul className="report-list">
            {filteredReports.length === 0 ? (
              <p>Không có dữ liệu.</p>
            ) : (
              filteredReports.map((r) => (
                <li
                  key={r._id}
                  className={r.status === "approved" ? "clickable" : ""}
                  onClick={() =>
                    r.status === "approved" && (window.location.href = `/report/${r._id}`)
                  }
                >
                  <div className="report-header">
                    <h4>{r.accountName} - {r.accountNumber}</h4>
                    <div className="meta">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      
                    </div>
                  </div>

                  {r.status === "rejected" && (
                    <>
                      <button
                        className="btn-view"
                     
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReason(showReason === r._id ? null : r._id);
                        }}
                      >
                      Xem lý do
                      </button>
                      {showReason === r._id && (
                        <p className="rejection-reason">
                          <strong>Lý do từ chối:</strong> {r.rejectionReason || "Không có lý do"}
                        </p>
                      )}
                    </>
                  )}
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
