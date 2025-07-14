import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import React, { useState } from 'react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navItems = [
    { to: "/admin/dashboard", icon: "🏠", label: "Hệ Thống" },
    { to: "/admin/users", icon: "👥", label: "Quản lý Người Dùng" },
    { to: "/admin/reports", icon: "⚠️", label: "Quản lý Cảnh Báo" },
    { to: "/admin/comments", icon: "💬", label: "Quản lý Bình Luận" },
    { to: "/admin/contacts", icon: "📨", label: "Quản lý Liên Hệ" },
    { to: "/admin/categories", icon: "|_|", label: "Quản Lý Loại Kiểm Tra" },
    { to: "/admin/tests", icon: "|-|", label: "Quản Lý Bài Kiểm Tra" },
    { to: "/admin/questions", icon: "|*|", label: "Quản Lý Câu Hỏi" },
    { to: "/admin/user-results", icon: "|*|", label: "Quản Lý Trả Lời" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "▶" : "◀"}
      </div>
      <h2>{!collapsed && "🛠️ Admin Panel"}</h2>
      <nav>
        {navItems.map((item, i) => (
          <NavLink key={i} to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
