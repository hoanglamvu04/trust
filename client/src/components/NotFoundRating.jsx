import React, { useEffect, useState } from "react";
import "./NotFoundRating.css";

export default function NotFoundRating({ account }) {
  // Lấy thông tin user đăng nhập
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  // Rating state
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [labels, setLabels] = useState([]);
  const [searchStats, setSearchStats] = useState({ today: 0, yesterday: 0, last7days: 0, last30days: 0 });

  const colorMap = { 1: "red", 2: "orange", 3: "yellow", 4: "blue", 5: "green" };
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  // Lấy thông tin user đăng nhập giống như comment section
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          setUserId(result.user.id);
          setNickname(result.user.nickname || "");
        } else {
          setUserId("");
          setNickname("");
        }
      } catch {
        setUserId("");
        setNickname("");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [API_BASE]);

  // Lấy tổng rating
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch(`${API_BASE}/rating/${account}`);
        const data = await res.json();
        if (typeof data === "object") {
          const labelData = Object.entries(data).map(([key, count]) => ({
            label: `${key} sao`,
            count: parseInt(count, 10), // tránh NaN
            color: colorMap[parseInt(key)] || "gray",
            star: parseInt(key)
          }));
          setLabels(labelData);
        } else {
          setLabels([]);
        }
      } catch (err) {
        setLabels([]);
        console.error("API ratings error:", err);
      }
    };
    fetchLabels();
  }, [account, selectedRating, API_BASE]);

  // Lấy trạng thái đã vote của user hiện tại
  useEffect(() => {
    if (!userId) {
      setSelectedRating(0);
      return;
    }
    const fetchMyVote = async () => {
      try {
        const res = await fetch(`${API_BASE}/rating/${account}/my-vote`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data && data.rating) setSelectedRating(data.rating);
        else setSelectedRating(0);
      } catch (err) {
        setSelectedRating(0);
      }
    };
    fetchMyVote();
  }, [account, userId, API_BASE]);

  // Lấy thống kê lượt tìm kiếm
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/searchlog/stats?account=${account}`);
        const data = await res.json();
        setSearchStats(data);
      } catch (err) {
        setSearchStats({ today: 0, yesterday: 0, last7days: 0, last30days: 0 });
      }
    };
    fetchStats();
  }, [account, API_BASE]);

  // Xử lý vote/unvote
  const handleVote = async (num) => {
    if (loadingUser) return; // đợi user load xong
    if (!userId) {
      alert("Bạn cần đăng nhập để đánh giá!");
      return;
    }
    if (selectedRating === num) {
      // Unvote
      await fetch(`${API_BASE}/rating/${account}/unvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      setSelectedRating(0);
    } else {
      // Vote hoặc chỉnh sửa vote
      await fetch(`${API_BASE}/rating/${account}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: num })
      });
      setSelectedRating(num);
    }
    // labels sẽ reload lại khi selectedRating thay đổi
  };

  // Tổng số vote để tính %
  const total = labels.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="not-found-box">
      <h3>📝 Không tìm thấy kết quả cho tài khoản <span className="highlight">[{account}]</span></h3>

      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((num) => (
          <img
            key={num}
            src={`/images/${num <= (hoverRating || selectedRating) ? "selected" : "inactive"}.png`}
            alt={`${num} sao`}
            className="rating-star-img"
            onClick={() => handleVote(num)}
            onMouseEnter={() => setHoverRating(num)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: userId ? "pointer" : "not-allowed",
              opacity: userId ? 1 : 0.5
            }}
          />
        ))}
      </div>

      <p>
        {selectedRating
          ? `${selectedRating}/5 – (Bạn đã đánh giá)`
          : "Bạn chưa đánh giá"}
      </p>

      <div className="search-stats">
        <div><strong>Hôm nay:</strong> {searchStats.today} lượt tìm kiếm</div>
        <div><strong>Hôm qua:</strong> {searchStats.yesterday} lượt tìm kiếm</div>
        <div><strong>7 ngày qua:</strong> {searchStats.last7days} lượt tìm kiếm</div>
        <div><strong>30 ngày qua:</strong> {searchStats.last30days} lượt tìm kiếm</div>
      </div>

      <div className="rating-bars">
        {labels.length === 0 ? (
          <p>Đang tải dữ liệu đánh giá...</p>
        ) : (
          labels.map((item, index) => {
            const percent = total === 0 ? 0 : (item.count / total) * 100;
            return (
              <div className="bar" key={index}>
                <span
                  className={`label ${item.color} clickable`}
                  onClick={() => handleVote(item.star)}
                  style={{
                    cursor: userId ? "pointer" : "not-allowed",
                    opacity: userId ? 1 : 0.5
                  }}
                >
                  {item.label} [{item.count}]
                </span>
                <progress className={`progress ${item.color}`} value={percent} max="100" />
              </div>
            );
          })
        )}
      </div>

      <p className="note">
        <strong>LƯU Ý:</strong> Đây là nội dung đánh giá tự động, không thay thế chứng cứ pháp lý.
      </p>
    </div>
  );
}
