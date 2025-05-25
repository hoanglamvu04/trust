import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import "../styles/CommentHistory.css";
import React from 'react';

export default function CommentHistory() {
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 8; // ✅ mỗi trang 8 bình luận

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/comments/user", { credentials: "include" });
        if (!res.ok) throw new Error("Lỗi lấy comments");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("❌ Lỗi lấy comments:", err);
      }
    };
    fetchComments();
  }, []);

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
          <div className="prl-tt">Lịch sử bình luận</div>

          <ul className="comment-list">
            {currentComments.length === 0 ? (
              <p>Không có bình luận nào.</p>
            ) : (
              currentComments.map((c) => (
                <li
                  key={c._id}
                  onClick={() => window.location.href = `/report/${c.reportId}#comment${c._id}`}
                >
                  <p>{c.content}</p>
                  <div className="meta">
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* ✅ PAGINATION */}
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
