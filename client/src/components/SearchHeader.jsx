import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchHeader.css";
import React from "react";
import { FiSearch } from "react-icons/fi";

const user = JSON.parse(localStorage.getItem("user") || "{}");
const userId = user?.id || null;
console.log("USER OBJ:", user);
console.log("userId gửi đi:", userId);

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

  // Chỉ cho nhập chữ và số, không cho ký tự đặc biệt (trừ khoảng trắng nếu muốn)
  const specialCharRegex = /[^a-zA-Z0-9]/;
  const hasSpecialChar = specialCharRegex.test(search);

  // Ít nhất 7 ký tự, chỉ chữ và số
  const isValidInput = search.length >= 7 && !hasSpecialChar;

  // Lưu log tìm kiếm kèm userId
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValidInput) return;

    // Lấy userId từ localStorage (hoặc context/redux tuỳ bạn)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || null;

    // Gửi log tìm kiếm
    try {
      await fetch("http://localhost:5000/api/searchlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          account: search.trim(),
          userId,
        }),
      });
    } catch (err) {
      // Có thể hiển thị thông báo nhẹ nếu cần
      console.error("Lỗi ghi log tìm kiếm:", err);
    }

    // Chuyển trang
    navigate(`/check-account?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="search-header">
      <h1>Tra Cứu Số Tài Khoản Đáng Ngờ</h1>
      <p>
        Hiện có <strong>{stats.accounts?.toLocaleString() || 0}</strong> bài viết cảnh báo, 
        <strong> {stats.comments?.toLocaleString() || 0}</strong> bình luận,
        <strong> {stats.pending?.toLocaleString() || 0}</strong> cảnh báo đang chờ duyệt.
        Sẽ giúp bạn mua bán an toàn hơn khi online!!!
      </p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nhập số tài khoản hoặc bí danh cần kiểm tra"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" disabled={!isValidInput}>
          <FiSearch style={{ marginRight: 6 }} />Tra cứu
        </button>
      </form>
      {/* Hiển thị lỗi dưới input */}
      {search && (
        <>
          {hasSpecialChar && (
            <div style={{ color: "red", marginTop: 4, fontSize: 13 }}>
              Không được nhập ký tự đặc biệt, chỉ dùng chữ và số.
            </div>
          )}
          {search.length > 0 && search.length < 7 && !hasSpecialChar && (
            <div style={{ color: "red", marginTop: 4, fontSize: 13 }}>
              Nhập tối thiểu 7 ký tự (chữ/số).
            </div>
          )}
        </>
      )}

      <div className="action-buttons">
        <button className="btn-red" onClick={() => navigate("/report")}>
          Gửi Cảnh Báo
        </button>
        <button className="btn-blue" onClick={() => navigate("/contact")}>
          Liên Hệ Admin
        </button>
      </div>
    </div>
  );
}
