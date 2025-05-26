import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import React from "react";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function CommentSection({ reportId }) {
  const [userId, setUserId] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState({});
  const [alias, setAlias] = useState("");

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

      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const parsed = sorted.map((c) => {
        let replies = [];
        try {
          replies = typeof c.replies === "string" ? JSON.parse(c.replies) : (Array.isArray(c.replies) ? c.replies : []);
        } catch (e) {
          console.warn("❗️Lỗi parse replies:", e, c.replies);
        }

        let likes = [];
        try {
          likes = typeof c.likes === "string" ? JSON.parse(c.likes) : (Array.isArray(c.likes) ? c.likes : []);
        } catch (e) {
          console.warn("❗️Lỗi parse likes:", e, c.likes);
        }

        return {
          ...c,
          replies,
          likes
        };
      });

      setComments(parsed);

      // Lấy alias của user hiện tại từ comment đầu tiên tìm thấy
      const comment = parsed.find(c => c.userId === userId);
      if (comment) setAlias(comment.userName);

    } catch (err) {
      console.error("❌ Lỗi lấy comments:", err);
    }
  };

  useEffect(() => {
    if (reportId) fetchComments();
  }, [reportId, userId]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, userId, content }),
      });
      const result = await res.json();
      if (res.ok) {
        setContent("");
        setAlias(result.alias); // cập nhật alias mới nếu cần
        fetchComments();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Lỗi server!");
    }
  };

  const handleLike = async (commentId) => {
    if (!isLoggedIn) return toast.error("Bạn chưa đăng nhập!");
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchComments();
      } else {
        toast.error("Lỗi like");
      }
    } catch (err) {
      toast.error("Lỗi khi like");
    }
  };

  const handleReply = async (commentId, replyText) => {
    if (!replyText.trim()) {
      toast.error("Nhập nội dung phản hồi!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: replyText }),
      });
      const result = await res.json();
      if (res.ok) {
        setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
        fetchComments();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Lỗi phản hồi!");
    }
  };

  if (loadingUser) return <p>Đang kiểm tra đăng nhập...</p>;

  return (
    <div className="comment-section">
      {isLoggedIn ? (
        <>
          <p>
            <strong>Bình luận với tên:</strong> {alias || "(đang tạo...)"}
          </p>
          <textarea
            className="comment-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung bình luận..."
          />
          <button className="comment-btn submit" onClick={handleSubmit}>
            Gửi bình luận
          </button>
        </>
      ) : (
        <p className="login-required">Hãy đăng nhập để gửi bình luận!</p>
      )}

      <h4 className="comment-title">Tất cả bình luận:</h4>
      {comments.map((c) => (
        <div key={c.id} className="comment-item">
          <p>
            <strong>{c.userName}</strong>: {c.content}
          </p>
          <p className="comment-meta">
            ❤️ {c.likes.length}
            <button
              className={`comment-btn like ${c.likes.includes(userId) ? "liked" : ""}`}
              onClick={() => handleLike(c.id)}
            >
              {c.likes.includes(userId) ? "Đã like" : "Like"}
            </button>
            {isLoggedIn && (
              <button
                className="comment-btn reply"
                onClick={() => setReplyingTo(c.id)}
              >
                Trả lời
              </button>
            )}
            <span className="comment-time">
              {dayjs(c.createdAt).fromNow()}
            </span>
          </p>

          {replyingTo === c.id && (
            <div className="reply-box">
              <textarea
                className="reply-input"
                value={replyContent[c.id] || ""}
                onChange={(e) =>
                  setReplyContent((prev) => ({
                    ...prev,
                    [c.id]: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Nhập nội dung phản hồi..."
              />
              <button
                className="comment-btn send-reply"
                onClick={() => handleReply(c.id, replyContent[c.id])}
              >
                Gửi phản hồi
              </button>
              <button
                className="comment-btn cancel-reply"
                onClick={() => setReplyingTo(null)}
              >
                Huỷ
              </button>
            </div>
          )}

          {Array.isArray(c.replies) && c.replies.length > 0 && (
            <div className="reply-list">
              <p><strong>Phản hồi:</strong></p>
              {c.replies.map((r, idx) => (
                <p key={idx} className="reply-item">
                  <strong>{r.userName}</strong>: {r.content}{" "}
                  <span className="reply-time">
                    {dayjs(r.createdAt).fromNow()}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
      <ToastContainer />
    </div>
  );
}
