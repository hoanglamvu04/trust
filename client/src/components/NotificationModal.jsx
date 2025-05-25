import React, { useState, useEffect } from "react";
import "./NotificationModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationModal({ show, onClose, currentUserId }) {
  const [activeTab, setActiveTab] = useState("report");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [reportNotifications, setReportNotifications] = useState([]);
  const [commentNotifications, setCommentNotifications] = useState([]);

  useEffect(() => {
    if (!show) return;
    fetch(`/api/notifications?type=${activeTab}&userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (activeTab === "report") {
          setReportNotifications(data);
        } else {
          setCommentNotifications(data);
        }
      })
      .catch(() => toast.error("Không thể tải dữ liệu thông báo."));
  }, [activeTab, show, currentUserId]);

  const handleMarkAllRead = () => {
    const list = activeTab === "report" ? reportNotifications : commentNotifications;
    list.forEach((n) => handleMarkAsRead(n._id));
  };

  const confirmAndExecute = (action) => {
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleDeleteAll = () => {
    confirmAndExecute(() => {
      fetch(`/api/notifications?type=${activeTab}&userId=${currentUserId}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          if (activeTab === "report") {
            setReportNotifications([]);
          } else {
            setCommentNotifications([]);
          }
          toast.success("Đã xóa tất cả thông báo.");
        })
        .catch(() => toast.error("Lỗi khi xóa tất cả."));
    });
  };

  const handleDelete = (id) => {
    confirmAndExecute(() => {
      fetch(`/api/notifications/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          if (activeTab === "report") {
            setReportNotifications((prev) => prev.filter((n) => n._id !== id));
          } else {
            setCommentNotifications((prev) => prev.filter((n) => n._id !== id));
          }
          toast.success("Đã xóa thông báo.");
        })
        .catch(() => toast.error("Lỗi khi xóa thông báo."));
    });
  };

  const handleMarkAsRead = (id) => {
    fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      .then((res) => res.json())
      .then(() => {
        if (activeTab === "report") {
          setReportNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
          );
        } else {
          setCommentNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
          );
        }
      })
      .catch(() => toast.error("Lỗi khi đánh dấu đã đọc."));
  };

  const currentList = activeTab === "report" ? reportNotifications : commentNotifications;
  const unreadCountReport = reportNotifications.filter((n) => !n.isRead).length;
  const unreadCountComment = commentNotifications.filter((n) => !n.isRead).length;

  if (!show) return null;

  return (
    <div className="notificationmodal-overlay" onClick={onClose}>
      <div className="notificationmodal-content" onClick={(e) => e.stopPropagation()}>
        <ToastContainer />
        <h3>Thông báo</h3>
        <div className="notificationmodal-tab-buttons">
          <button className={activeTab === "report" ? "active" : ""} onClick={() => setActiveTab("report")}>
            📢 Tố Cáo ({unreadCountReport})
          </button>
          <button className={activeTab === "comment" ? "active" : ""} onClick={() => setActiveTab("comment")}>
            💬 Bình Luận ({unreadCountComment})
          </button>
        </div>
        <div className="notificationmodal-list">
          {currentList.length === 0 ? (
            <p>Không có thông báo.</p>
          ) : (
            currentList.map((n) => (
              <div key={n._id} className="notificationmodal-item">
                <a href={n.link} onClick={() => handleMarkAsRead(n._id)} className="notificationmodal-link">
                  {n.content}
                </a>
                {!n.isRead && <span className="notificationmodal-dot"></span>}
                <button className="notificationmodal-delete-btn" onClick={() => handleDelete(n._id)}>
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
