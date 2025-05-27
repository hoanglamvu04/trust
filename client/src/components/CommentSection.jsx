import React from "react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaHeart } from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function CommentSection({ reportId }) {
  const [userId, setUserId] = useState("");
  const [alias, setAlias] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  const getAvatarUrl = (name) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/me?reportId=${reportId}`, {
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          setUserId(result.user.id);
          setAlias(result.user.alias || "");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy user:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const isLoggedIn = !!userId;

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${reportId}`);
      const data = await res.json();

      const parsed = data.map((c) => ({
        ...c,
        replies: typeof c.replies === "string" ? JSON.parse(c.replies || "[]") : c.replies || [],
        likes: typeof c.likes === "string" ? JSON.parse(c.likes || "[]") : c.likes || [],
      }));

      setComments(parsed);
    } catch (err) {
      console.error("❌ Lỗi lấy comments:", err);
    }
  };

  useEffect(() => {
    if (reportId) fetchComments();
  }, [reportId, userId]);

  const paginated = comments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const handleSubmit = async () => {
    if (!content.trim() || !userId) return toast.error("Thiếu nội dung hoặc chưa đăng nhập!");

    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, userId, content }),
      });
      const result = await res.json();
      if (res.ok) {
        setContent("");
        setAlias(result.alias); // alias cố định được trả về
        fetchComments();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Lỗi server!");
    }
  };

  const handleLike = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchComments();
      else toast.error("Lỗi like!");
    } catch {
      toast.error("Lỗi khi like!");
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim()) return toast.error("Nhập nội dung phản hồi!");

    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: replyText }),
      });
      if (res.ok) {
        setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
        fetchComments();
      } else {
        const result = await res.json();
        toast.error(result.message);
      }
    } catch {
      toast.error("Lỗi phản hồi!");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Xác nhận xoá bình luận?")) return;
    try {
      await fetch(`http://localhost:5000/api/comments/${commentId}`, { method: "DELETE" });
      fetchComments();
    } catch {
      toast.error("Lỗi xoá bình luận!");
    }
  };

  const handleDeleteReply = async (commentId, index) => {
    if (!window.confirm("Xác nhận xoá phản hồi?")) return;
    try {
      await fetch(`http://localhost:5000/api/comments/${commentId}/reply/${index}`, {
        method: "DELETE",
      });
      fetchComments();
    } catch {
      toast.error("Lỗi xoá phản hồi!");
    }
  };

  if (loadingUser) return <p>Đang kiểm tra đăng nhập...</p>;

  return (
    <div className="comment-section">
      {isLoggedIn ? (
        <>
          <p><strong>Bình luận với tên:</strong> {alias || "(đang tạo...)"}</p>
          <textarea
            className="comment-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung bình luận..."
          />
          <button className="comment-btn submit" onClick={handleSubmit}>Gửi bình luận</button>
        </>
      ) : (
        <p className="login-required">Hãy đăng nhập để gửi bình luận!</p>
      )}

      <h4 className="comment-title">Tất cả bình luận:</h4>
      {paginated.map((c) => (
        <div key={c.id} className="comment-item">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={getAvatarUrl(c.alias)} className="comment-avatar" alt="avatar" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>
                <strong>{c.alias}</strong>: {c.content}
              </p>
              <div className="comment-meta">
                <button
                  className="comment-btn like"
                  onClick={() => handleLike(c.id)}
                  style={{ color: c.likes.includes(userId) ? "red" : "#ccc" }}
                >
                  <FaHeart /> <span>{c.likes.length}</span>
                </button>
                <button className="comment-btn reply" onClick={() => setReplyingTo(c.id)}>
                  Trả lời
                </button>
                {String(userId) === String(c.userId) && (
                  <button className="comment-btn delete" onClick={() => handleDeleteComment(c.id)}>
                    Xoá
                  </button>
                )}
                <span className="comment-time">
                  <FaClock style={{ marginRight: "5px" }} />
                  {dayjs(c.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>

          {replyingTo === c.id && (
            <div className="reply-box">
              <textarea
                className="reply-input"
                value={replyContent[c.id] || ""}
                onChange={(e) =>
                  setReplyContent((prev) => ({ ...prev, [c.id]: e.target.value }))
                }
                rows={2}
                placeholder="Nhập nội dung phản hồi..."
              />
              <button className="comment-btn send-reply" onClick={() => handleReply(c.id, replyContent[c.id])}>
                Gửi phản hồi
              </button>
              <button className="comment-btn cancel-reply" onClick={() => setReplyingTo(null)}>
                Huỷ
              </button>
            </div>
          )}

          {Array.isArray(c.replies) && c.replies.length > 0 && (
            <div className="reply-list">
              <p><strong>Phản hồi:</strong></p>
              {c.replies.slice(0, expandedReplies[c.id] || 3).map((r, idx) => (
                <div key={idx} className="reply-item" style={{ padding: "8px", background: "#f4f4f4", margin: "4px 0", borderRadius: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={getAvatarUrl(r.userName)} className="comment-avatar" alt="avatar" />
                    <strong>{r.userName}</strong>: {r.content}
                  </div>
                  <div className="reply-time">
                    <FaClock style={{ marginRight: "5px" }} />
                    {dayjs(r.createdAt).fromNow()}
                    {String(userId) === String(r.userId) && (
                      <button className="comment-btn delete" style={{ marginLeft: 10 }} onClick={() => handleDeleteReply(c.id, idx)}>
                        Xoá
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {c.replies.length > 3 && (
                <button
                  className="comment-btn see-more"
                  onClick={() =>
                    setExpandedReplies((prev) => ({
                      ...prev,
                      [c.id]: expandedReplies[c.id] ? null : 10,
                    }))
                  }
                >
                  {expandedReplies[c.id] ? "Thu gọn phản hồi" : "Xem thêm phản hồi"}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => setCurrentPage(p)} className={p === currentPage ? "active" : ""}>
            {p}
          </button>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
}
