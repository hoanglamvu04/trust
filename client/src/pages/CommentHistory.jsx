import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import "../styles/CommentHistory.css";
import { FaCommentDots } from "react-icons/fa";

export default function CommentHistory() {
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 8;
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/comment/my`, { credentials: "include" });
        if (!res.ok) {
          setComments([]);
          return;
        }
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch {
        setComments([]);
      }
    };
    fetchComments();
  }, [API_BASE]);

  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const indexOfLast = currentPage * commentsPerPage;
  const indexOfFirst = indexOfLast - commentsPerPage;
  const currentComments = comments.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <SidebarProfile active="comment" />
        <main className="profile-info">
          <div className="prl-tt">LỊCH SỬ BÌNH LUẬN</div>
          <ul className="comment-list">
            {currentComments.length === 0 ? (
              <p>Không có bình luận nào.</p>
            ) : (
              currentComments.map((c) => (
                <li
                  key={c.id}
                  className="comment-card"
                  onClick={() => (window.location.href = `/report/${c.reportId}#comment${c.id}`)}
                  title="Xem bài báo cáo bạn đã bình luận"
                >
                  <div className="comment-icon">
                    <FaCommentDots size={20} />
                  </div>
                  <div className="comment-content">
                    <div className="comment-text">
                      Bình luận: <span>{c.content}</span>
                    </div>
                    <div className="comment-meta">
                      Biệt danh: <b>{c.nickname || "Ẩn danh"}</b> • Ngày:{" "}
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                →
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
