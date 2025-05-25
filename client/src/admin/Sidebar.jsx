import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import React, { useState } from 'react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navItems = [
    { to: "/admin/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/admin/users", icon: "👥", label: "Quản lý Users" },
    { to: "/admin/reports", icon: "⚠️", label: "Quản lý Reports" },
    { to: "/admin/comments", icon: "💬", label: "Quản lý Comments" },
    { to: "/admin/contacts", icon: "📨", label: "Quản lý Contacts" },
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
