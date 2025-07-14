import { useState, useEffect } from "react";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css";

export default function Profile() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [nicknameMode, setNicknameMode] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    name: "",
    email: "",
    createdAt: "",
    nickname: "",
  });
  const [formEdit, setFormEdit] = useState({ username: "", name: "" });
  const [formNickname, setFormNickname] = useState("");
  const [formPassword, setFormPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNew: "",
  });

  // Lấy user từ API /api/auth/me (dựa vào cookie)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        const result = await res.json();
        if (result.success) {
          setUserData(result.user);
          setFormEdit({
            username: result.user.username,
            name: result.user.name,
          });
          setFormNickname(result.user.nickname || "");
        } else {
          toast.error("Chưa đăng nhập!", { position: "top-right" });
          setTimeout(() => (window.location.href = "/"), 1500);
        }
      } catch (err) {
        toast.error("Lỗi kết nối server!", { position: "top-right" });
        setTimeout(() => (window.location.href = "/"), 1500);
      }
    };
    fetchUser();
  }, []);

  const handleChangeInfo = async () => {
    if (!formEdit.username || !formEdit.name) {
      toast.error("Vui lòng nhập đầy đủ thông tin!", { position: "top-right" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: userData.id,
          username: formEdit.username,
          name: formEdit.name,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { position: "top-right" });
        setUserData((prev) => ({
          ...prev,
          username: result.user.username,
          name: result.user.name,
        }));
        setEditMode(false);
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  // Đổi biệt danh
  const handleUpdateNickname = async () => {
    const newNickname = formNickname.trim();
    if (!newNickname) {
      toast.error("Bạn phải nhập biệt danh!", { position: "top-right" });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/users/nickname", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nickname: newNickname }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Cập nhật biệt danh thành công!", { position: "top-right" });
        setUserData((prev) => ({
          ...prev,
          nickname: newNickname,
        }));
        setNicknameMode(false);
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (
      !formPassword.oldPassword ||
      !formPassword.newPassword ||
      !formPassword.confirmNew
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!", { position: "top-right" });
      return;
    }
    if (formPassword.newPassword !== formPassword.confirmNew) {
      toast.error("Mật khẩu mới không khớp!", { position: "top-right" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: userData.username,
          oldPassword: formPassword.oldPassword,
          newPassword: formPassword.newPassword,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { position: "top-right" });
        setShowPasswordForm(false);
        setFormPassword({ oldPassword: "", newPassword: "", confirmNew: "" });
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        style={{ marginTop: "60px" }}
      />

      <div className="profile-page">
        <SidebarProfile active="profile" />

          <div className="profile-glass-root">
      <div className="profile-glass-card">
        <div className="profile-glass-title">Hồ sơ cá nhân</div>

        <div className="profile-glass-avatar-box">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.nickname || userData.username)}`}
            alt="avatar"
            className="profile-glass-avatar-img"
          />
          <div className="profile-glass-nickname">
            {userData.nickname || userData.username}
          </div>
        </div>

        <div className="profile-glass-fields">
          <div className="profile-glass-row">
            <span className="profile-glass-label">Tên đăng nhập:</span>
            {editMode ? (
              <input
                type="text"
                className="profile-glass-input"
                value={formEdit.username}
                onChange={e =>
                  setFormEdit({ ...formEdit, username: e.target.value })
                }
              />
            ) : (
              <span className="profile-glass-value">{userData.username}</span>
            )}
          </div>
          <div className="profile-glass-row">
            <span className="profile-glass-label">Họ và tên:</span>
            {editMode ? (
              <input
                type="text"
                className="profile-glass-input"
                value={formEdit.name}
                onChange={e =>
                  setFormEdit({ ...formEdit, name: e.target.value })
                }
              />
            ) : (
              <span className="profile-glass-value">{userData.name}</span>
            )}
          </div>
          <div className="profile-glass-row">
            <span className="profile-glass-label">Email:</span>
            <span className="profile-glass-value">{userData.email}</span>
          </div>
          <div className="profile-glass-row">
            <span className="profile-glass-label">Ngày tạo:</span>
            <span className="profile-glass-value">
              {userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </span>
          </div>

          <div className="profile-glass-row">
            <span className="profile-glass-label">Biệt danh:</span>
            {!nicknameMode ? (
              <>
                <span
                  className="profile-glass-value"
                  style={{ color: userData.nickname ? "#197d4e" : "#a3a3a3" }}
                >
                  {userData.nickname || <i>Chưa đặt</i>}
                </span>
                <button
                  className="profile-glass-btn profile-glass-btn-outline"
                  style={{ marginLeft: 8, fontSize: "0.96rem" }}
                  onClick={() => setNicknameMode(true)}
                >
                  {userData.nickname ? "Đổi" : "Đặt"}
                </button>
              </>
            ) : (
              <>
                <input
                  className="profile-glass-input"
                  value={formNickname}
                  onChange={e => setFormNickname(e.target.value)}
                  maxLength={100}
                  placeholder="Nhập biệt danh mới..."
                  autoFocus
                />
                <button className="profile-glass-btn" onClick={handleUpdateNickname}>
                  Lưu
                </button>
                <button
                  className="profile-glass-btn profile-glass-btn-outline"
                  onClick={() => {
                    setNicknameMode(false);
                    setFormNickname(userData.nickname || "");
                  }}
                >
                  Huỷ
                </button>
              </>
            )}
          </div>

          <div className="profile-glass-row">
            <span className="profile-glass-label">Mật khẩu:</span>
            <span className="profile-glass-value">********</span>
            {!showPasswordForm && (
              <button
                className="profile-glass-btn profile-glass-btn-outline"
                onClick={() => setShowPasswordForm(true)}
              >
                Đổi mật khẩu
              </button>
            )}
          </div>
        </div>

        {showPasswordForm && (
          <div className="profile-glass-pw-form">
            <form onSubmit={handleChangePassword}>
              <label>Mật khẩu cũ:</label>
              <input
                type="password"
                className="profile-glass-input"
                value={formPassword.oldPassword}
                onChange={e =>
                  setFormPassword({
                    ...formPassword,
                    oldPassword: e.target.value,
                  })
                }
              />
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                className="profile-glass-input"
                value={formPassword.newPassword}
                onChange={e =>
                  setFormPassword({
                    ...formPassword,
                    newPassword: e.target.value,
                  })
                }
              />
              <label>Xác nhận lại:</label>
              <input
                type="password"
                className="profile-glass-input"
                value={formPassword.confirmNew}
                onChange={e =>
                  setFormPassword({
                    ...formPassword,
                    confirmNew: e.target.value,
                  })
                }
              />
              <div className="profile-glass-btn-group">
                <button type="submit" className="profile-glass-btn">
                  Cập nhật
                </button>
                <button
                  type="button"
                  className="profile-glass-btn profile-glass-btn-outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="profile-glass-btn-group">
          {!editMode ? (
            <button
              className="profile-glass-btn"
              onClick={() => setEditMode(true)}
            >
              Chỉnh sửa thông tin
            </button>
          ) : (
            <>
              <button className="profile-glass-btn" onClick={handleChangeInfo}>
                Lưu thay đổi
              </button>
              <button
                className="profile-glass-btn profile-glass-btn-outline"
                onClick={() => setEditMode(false)}
              >
                Huỷ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
      </div>
      <Footer />
    </>
  );
}
