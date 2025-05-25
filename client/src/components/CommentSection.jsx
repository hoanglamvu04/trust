import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from 'react';

export default function CommentSection({ reportId, currentUser }) {
  const [userName, setUserName] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    if (currentUser && currentUser.name) {
      setUserName(currentUser.name);
      setLoadingUser(false);
    } else {
      const fetchCurrentUser = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", { credentials: "include" });
          const result = await res.json();
          if (result.success) {
            setUserName(result.user.name);
          } else {
            setUserName("");
          }
        } catch (err) {
          console.error("❌ Lỗi lấy user:", err);
          setUserName("");
        } finally {
          setLoadingUser(false);
        }
      };
      fetchCurrentUser();
    }
  }, [currentUser]);

  const isLoggedIn = !!userName;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/report/${reportId}`);
        const result = await res.json();
        if (result.success) {
          setComments(result.comments);
        } else {
          console.error(result.message);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    if (reportId) fetchComments();
  }, [reportId]);

  // ✅ Bổ sung scroll đến comment theo hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight-comment");
          setTimeout(() => el.classList.remove("highlight-comment"), 2000);
        }, 300);
      }
    }
  }, [comments]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung!", { position: "top-right" });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reportId, content }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Bình luận thành công!", { position: "top-right" });
        setComments(prev => [result.comment, ...prev]);
        setContent("");
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error("❌ Lỗi gửi comment:", err);
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  const handleLike = async (commentId) => {
    if (!isLoggedIn) {
      toast.error("Bạn chưa đăng nhập!", { position: "top-right" });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId }),
      });
      const result = await res.json();
      if (result.success) {
        const updatedComments = await fetch(`http://localhost:5000/api/comments/report/${reportId}`);
        const updatedResult = await updatedComments.json();
        if (updatedResult.success) {
          setComments(updatedResult.comments);
        }
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error("❌ Lỗi like:", err);
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Xác nhận xoá bình luận?")) return;
    try {
      const res = await fetch("http://localhost:5000/api/comments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId }),
      });
      const result = await res.json();
      if (result.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        toast.success("Đã xoá bình luận!", { position: "top-right" });
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error("❌ Lỗi xoá comment:", err);
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText || !replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi!", { position: "top-right" });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId, content: replyText }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Phản hồi thành công!", { position: "top-right" });
        setComments(prev =>
          prev.map(c =>
            c._id === commentId ? { ...c, replies: result.replies } : c
          )
        );
        setReplyingTo(null);
        setReplyContent(prev => ({ ...prev, [commentId]: "" }));
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error("❌ Lỗi phản hồi:", err);
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  if (loadingUser) return <p>Đang kiểm tra đăng nhập...</p>;

  return (
    <div className="comment-section">
      {!isLoggedIn ? (
        <p className="login-required">Hãy đăng nhập để gửi bình luận!</p>
      ) : (
        <>
          <p><strong>{userName}:</strong> Để lại bình luận của bạn:</p>
          <textarea
            className="comment-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung bình luận..."
          />
          <button className="comment-btn submit" onClick={handleSubmit}>Gửi bình luận</button>
        </>
      )}

      <h4 className="comment-title">Tất cả bình luận:</h4>
      {loadingComments ? (
        <p>Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p>Chưa có bình luận nào.</p>
      ) : (
        comments.map(c => (
          <div key={c._id} id={`comment${c._id}`} className="comment-item">
            <p><strong>{c.userName}</strong>: {c.content}</p>
            <p className="comment-meta">
              ❤️ {c.likes.length} likes
              {isLoggedIn && (
                <>
                  <button className="comment-btn like" onClick={() => handleLike(c._id)}>Like</button>
                  <button className="comment-btn reply" onClick={() => setReplyingTo(c._id)}>Trả lời</button>
                  {c.userName === userName && (
                    <button className="comment-btn delete" onClick={() => handleDelete(c._id)}>Xoá</button>
                  )}
                </>
              )}
            </p>

            {replyingTo === c._id && isLoggedIn && (
              <div className="reply-box">
                <textarea
                  className="reply-input"
                  value={replyContent[c._id] || ""}
                  onChange={e => setReplyContent(prev => ({ ...prev, [c._id]: e.target.value }))}
                  rows={2}
                  placeholder="Nhập nội dung phản hồi..."
                />
                <button className="comment-btn send-reply" onClick={() => handleReply(c._id, replyContent[c._id])}>Gửi phản hồi</button>
                <button className="comment-btn cancel-reply" onClick={() => { setReplyingTo(null); setReplyContent(prev => ({ ...prev, [c._id]: "" })); }}>Huỷ</button>
              </div>
            )}

            {c.replies && c.replies.length > 0 && (
              <div className="reply-list">
                <p><strong>Phản hồi:</strong></p>
                {c.replies.map((r, idx) => (
                  <p key={idx} className="reply-item"><strong>{r.userName}</strong>: {r.content}</p>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      <ToastContainer />
    </div>
  );
}
