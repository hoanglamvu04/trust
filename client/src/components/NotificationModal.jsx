import React, { useState, useEffect } from "react";
import "./NotificationModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationModal({ show, onClose }) {
  const [activeTab, setActiveTab] = useState("report");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [reportNotifications, setReportNotifications] = useState([]);
  const [commentNotifications, setCommentNotifications] = useState([]);
  const [likeNotifications, setLikeNotifications] = useState([]);

  useEffect(() => {
    if (!show) return;

    fetch(`/api/notifications?type=${activeTab}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (activeTab === "report") setReportNotifications(data);
        else if (activeTab === "comment") setCommentNotifications(data);
        else if (activeTab === "like") setLikeNotifications(data);
      })
      .catch(() => toast.error("Không thể tải dữ liệu thông báo."));
  }, [activeTab, show]);

  const handleMarkAllRead = () => {
    const list =
      activeTab === "report"
        ? reportNotifications
        : activeTab === "comment"
        ? commentNotifications
        : likeNotifications;
    list.forEach((n) => handleMarkAsRead(n.id));
  };

  const confirmAndExecute = (action) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleDeleteAll = () => {
    confirmAndExecute(() => {
      fetch(`/api/notifications?type=${activeTab}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          if (activeTab === "report") setReportNotifications([]);
          else if (activeTab === "comment") setCommentNotifications([]);
          else if (activeTab === "like") setLikeNotifications([]);
          toast.success("Đã xóa tất cả thông báo.");
        })
        .catch(() => toast.error("Lỗi khi xóa tất cả."));
    });
  };

  const handleDelete = (id) => {
    confirmAndExecute(() => {
      fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          if (activeTab === "report")
            setReportNotifications((prev) => prev.filter((n) => n.id !== id));
          else if (activeTab === "comment")
            setCommentNotifications((prev) => prev.filter((n) => n.id !== id));
          else
            setLikeNotifications((prev) => prev.filter((n) => n.id !== id));
          toast.success("Đã xóa thông báo.");
        })
        .catch(() => toast.error("Lỗi khi xóa thông báo."));
    });
  };

  const handleMarkAsRead = (id) => {
    fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        const update = (prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        if (activeTab === "report") setReportNotifications(update);
        else if (activeTab === "comment") setCommentNotifications(update);
        else if (activeTab === "like") setLikeNotifications(update);
      })
      .catch(() => toast.error("Lỗi khi đánh dấu đã đọc."));
  };

  const currentList =
    activeTab === "report"
      ? reportNotifications
      : activeTab === "comment"
      ? commentNotifications
      : likeNotifications;

  const unreadCountReport = reportNotifications.filter((n) => !n.isRead).length;
  const unreadCountComment = commentNotifications.filter((n) => !n.isRead).length;
  const unreadCountLike = likeNotifications.filter((n) => !n.isRead).length;

  if (!show) return null;

  return (
    <div className="notificationmodal-overlay" onClick={onClose}>
      <div className="notificationmodal-content" onClick={(e) => e.stopPropagation()}>
        <ToastContainer />
        <h3>Thông báo</h3>
        <div className="notificationmodal-tab-buttons">
          <button className={activeTab === "report" ? "active" : ""} onClick={() => setActiveTab("report")}>
            📢 Bài Cảnh Báo ({unreadCountReport})
          </button>
          <button className={activeTab === "comment" ? "active" : ""} onClick={() => setActiveTab("comment")}>
            💬 Bình Luận ({unreadCountComment})
          </button>
          <button className={activeTab === "like" ? "active" : ""} onClick={() => setActiveTab("like")}>
            ❤️ Cảm Xúc ({unreadCountLike})
          </button>
        </div>
        <div className="notificationmodal-list">
          {currentList.length === 0 ? (
            <p>Không có thông báo.</p>
          ) : (
            currentList.map((n) => (
              <div key={n.id} className="notificationmodal-item">
                <a
                  href={n.link}
                  onClick={() => handleMarkAsRead(n.id)}
                  className="notificationmodal-link"
                >
                  {n.content?.trim()
                    ? n.content
                    : n.senderName
                    ? `${n.senderName} ${
                        n.type === "comment"
                          ? "đã bình luận vào bài viết của bạn."
                          : n.type === "like"
                          ? "đã thích bình luận của bạn."
                          : "đã gửi tố cáo mới."
                      }`
                    : "Bạn có một thông báo mới."}
                </a>
                {!n.isRead && <span className="notificationmodal-dot"></span>}
                <button className="notificationmodal-delete-btn" onClick={() => handleDelete(n.id)}>
                  <img src="/images/bin.png" alt="delete" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="notificationmodal-actions">
          <button onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</button>
          <button onClick={handleDeleteAll}>Xóa tất cả</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
      {showConfirmModal && (
        <div className="notificationmodal-confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="notificationmodal-confirm-content" onClick={(e) => e.stopPropagation()}>
            <p>Bạn có chắc chắn muốn xóa?</p>
            <div className="notificationmodal-confirm-actions">
              <button
                onClick={() => {
                  confirmAction();
                  setShowConfirmModal(false);
                }}
              >
                Xác nhận
              </button>
              <button onClick={() => setShowConfirmModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
