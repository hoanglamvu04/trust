import { useEffect, useState } from "react";
import { Link } from "react-router-dom";  // ✅ thêm Link
import "../styles/AdminStyles.css";
import "../styles/dashboard.css";
import React from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    reportCount: 0,
    approvedReports: 0,
    commentCount: 0,
    reportedAccountsCount: 0,
    contactCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stats/admin");
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        } else {
          console.error("❌ Lỗi từ server:", json.message);
        }
      } catch (err) {
        console.error("❌ Lỗi fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h2>🎉 Chào mừng đến trang Quản trị!</h2>
      <p>Đây là bảng điều khiển tổng quan của hệ thống TrustCheck.</p>

      <div className="dashboard-cards">
        <Link to="/admin/users" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>👤 Tổng Users</h3>
            <p>{stats.userCount?.toLocaleString()} người dùng</p>
          </div>
        </Link>

        <Link to="/admin/reports?status=approved" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>🚩 Tổng Reports đã duyệt</h3>
            <p>{stats.approvedReports?.toLocaleString()} bài đã duyệt</p>
          </div>
        </Link>

        <Link to="/admin/reports?status=pending" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>🕒 Tổng Reports chờ duyệt</h3>
            <p>{stats.reportCount?.toLocaleString()} bài chờ duyệt</p>
          </div>
        </Link>

        <Link to="/admin/comments" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>💬 Tổng Comments</h3>
            <p>{stats.commentCount?.toLocaleString()} bình luận</p>
          </div>
        </Link>

        <Link to="/admin/reports" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>⚠️ Tổng Accounts bị tố cáo</h3>
            <p>
              {stats.reportedAccountsCount !== undefined
                ? stats.reportedAccountsCount?.toLocaleString()
                : "N/A"}{" "}
              tài khoản
            </p>
          </div>
        </Link>

        <Link to="/admin/contacts" className="dashboard-card-link">
          <div className="dashboard-card">
            <h3>📩 Tổng Contacts</h3>
            <p>{stats.contactCount?.toLocaleString()} liên hệ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
