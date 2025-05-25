import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchHeader.css";
import React from 'react';

export default function SearchHeader() {
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    accounts: 0,
    facebook: 0,
    comments: 0,
    pending: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stats");
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        } else {
          console.error("API không trả dữ liệu stats hợp lệ:", data.message);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy thống kê:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/check-account?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="search-header">
      <h1>🔍 Kiểm Tra - Tố Cáo Kẻ Lừa Đảo</h1>
      <p>
        Hiện có <strong>{stats.accounts?.toLocaleString() || 0}</strong> bài viết cảnh báo, 
        <strong> {stats.comments?.toLocaleString() || 0}</strong> bình luận,
        <strong> {stats.pending?.toLocaleString() || 0}</strong> cảnh báo đang chờ duyệt.
        Sẽ giúp bạn mua bán an toàn hơn khi online!!!
      </p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nhập số tài khoản cần kiểm tra"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Tra cứu</button>
      </form>

      <div className="action-buttons">
        <button className="btn-red" onClick={() => navigate("/report")}>
          Gửi Tố Cáo Scam
        </button>
        <button className="btn-blue" onClick={() => navigate("/contact")}>
          Liên Hệ Admin
        </button>
      </div>
    </div>
  );
}
