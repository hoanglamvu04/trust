import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/AdminStyles.css";
import "../styles/AdminLayout.css";
import React, { useState } from 'react';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-wrapper ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
}
