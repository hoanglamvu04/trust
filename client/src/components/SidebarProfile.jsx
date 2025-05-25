import React from 'react';
import "./SidebarProfile.css";

export default function SidebarProfile({ active }) {
  return (
    <aside className="sidebar-profile">
      <ul className="sidebar-profile-list">
        <li
          className={`sidebar-profile-item ${active === "profile" ? "sidebar-profile-active" : ""}`}
          onClick={() => (window.location.href = "/profile")}
        >
          👤 Thông tin của tôi
        </li>
        <li
          className={`sidebar-profile-item ${active === "report" ? "sidebar-profile-active" : ""}`}
          onClick={() => (window.location.href = "/report-history")}
        >
          📄 Lịch sử tố cáo
        </li>
        <li
          className={`sidebar-profile-item ${active === "comment" ? "sidebar-profile-active" : ""}`}
          onClick={() => (window.location.href = "/comment-history")}
        >
          💬 Lịch sử bình luận
        </li>
        <li className="sidebar-profile-logout">↩️ Đăng xuất</li>
      </ul>
    </aside>
  );
}
