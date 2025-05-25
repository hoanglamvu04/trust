import { useEffect, useState } from "react";
import "./NotFoundRating.css";
import React from 'react';

export default function NotFoundRating({ account }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [labels, setLabels] = useState([]);
  const [searchStats, setSearchStats] = useState({ today: 0, yesterday: 0, last7days: 0, last30days: 0 });

  const localKey = `rating_${account}`;

  const colorMap = { 1: "red", 2: "orange", 3: "yellow", 4: "blue", 5: "green" };

  // Fetch labels & trạng thái vote
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/ratings/${account}`);
        const data = await res.json();
        if (typeof data === "object") {
          const labelData = Object.entries(data).map(([key, count]) => ({
            label: `${key} sao`,
            count,
            color: colorMap[parseInt(key)] || "gray",
            star: parseInt(key)
          }));
          setLabels(labelData);
        } else {
          console.error("API ratings không trả object:", data);
        }
      } catch (err) {
        console.error("API ratings error:", err);
      }
    };
    fetchLabels();

    const saved = localStorage.getItem(localKey);
    if (saved) setSelectedRating(parseInt(saved));
  }, [account]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`http://localhost:5000/api/searchlog/stats?account=${account}`);
      const data = await res.json();
      setSearchStats(data);
    };
    fetchStats();
  }, [account]);

  const handleVote = async (num) => {
    let newLabels = [...labels];

    if (selectedRating === num) {
      // 🟢 Hủy vote
      newLabels = newLabels.map((item) =>
        item.star === num ? { ...item, count: Math.max(0, item.count - 1) } : item
      );
      setSelectedRating(0);
      localStorage.removeItem(localKey);

      await fetch(`http://localhost:5000/api/ratings/${account}/unvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: num })
      });
    } else {
      // 🟢 Vote mới
      newLabels = newLabels.map((item) => {
        if (item.star === selectedRating) {
          return { ...item, count: Math.max(0, item.count - 1) };
        }
        if (item.star === num) {
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      setSelectedRating(num);
      localStorage.setItem(localKey, num);

      if (selectedRating !== 0) {
        await fetch(`http://localhost:5000/api/ratings/${account}/unvote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating: selectedRating })
        });
      }

      await fetch(`http://localhost:5000/api/ratings/${account}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: num })
      });
    }
    setLabels(newLabels);
  };

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
          />
        ))}
      </div>

      <p>{selectedRating}/5 – (Bạn đã đánh giá)</p>

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
            const total = labels.reduce((sum, l) => sum + l.count, 0);
            const percent = total === 0 ? 0 : (item.count / total) * 100;
            return (
              <div className="bar" key={index}>
                <span
                  className={`label ${item.color} clickable`}
                  onClick={() => handleVote(item.star)}
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
