import { useState, useEffect } from "react";
import React from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import SidebarProfile from "../components/SidebarProfile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css";

export default function Profile() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    name: "",
    email: "",
    createdAt: "",
  });

  const [formEdit, setFormEdit] = useState({ username: "", name: "" });
  const [formPassword, setFormPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNew: "",
  });

  // 🟢 Lấy user từ API /api/auth/me (dựa vào cookie)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include", // gửi cookie
        });
        const result = await res.json();
        if (result.success) {
          setUserData(result.user);
          setFormEdit({
            username: result.user.username,
            name: result.user.name,
          });
        } else {
          toast.error("Chưa đăng nhập!", { position: "top-right" });
          setTimeout(() => (window.location.href = "/"), 1500);
        }
      } catch (err) {
        console.error("Lỗi lấy user:", err);
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
        setUserData(result.user);
        setEditMode(false);
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
      toast.error("Lỗi server!", { position: "top-right" });
    }
  };

  return (
    <>
      <Header />
      <ToastContainer
        position="top-right"
        style={{ marginTop: "60px" }} // ✅ đẩy xuống dưới header
      />

      <div className="profile-page">
        <SidebarProfile active="profile" />

        <main className="profile-info">
          <h2>Thông tin tài khoản</h2>
          <div className="profile-content">
            <div className="info-section">
              <div>
                <span>Tên người dùng:</span>{" "}
                {editMode ? (
                  <input
                    type="text"
                    value={formEdit.username}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, username: e.target.value })
                    }
                  />
                ) : (
                  userData.username
                )}
              </div>
              <div>
                <span>Họ và tên:</span>{" "}
                {editMode ? (
                  <input
                    type="text"
                    value={formEdit.name}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, name: e.target.value })
                    }
                  />
                ) : (
                  userData.name
                )}
              </div>
              <div>
                <span>Email:</span> {userData.email}
              </div>
              <div>
                <span>Ngày tạo tài khoản:</span>{" "}
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </div>
              <div className="password-line">
                <span>Mật khẩu:</span> ********
                {!showPasswordForm && (
                  <button
                    className="edit-btn"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Đổi mật khẩu
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <div className="change-password">
                  <form onSubmit={handleChangePassword}>
                    <div>
                      <label>Mật khẩu cũ:</label>
                      <input
                        type="password"
                        value={formPassword.oldPassword}
                        onChange={(e) =>
                          setFormPassword({
                            ...formPassword,
                            oldPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>Mật khẩu mới:</label>
                      <input
                        type="password"
                        value={formPassword.newPassword}
                        onChange={(e) =>
                          setFormPassword({
                            ...formPassword,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>Xác nhận lại:</label>
                      <input
                        type="password"
                        value={formPassword.confirmNew}
                        onChange={(e) =>
                          setFormPassword({
                            ...formPassword,
                            confirmNew: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="btn-group">
                      <button type="submit">Cập nhật mật khẩu</button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowPasswordForm(false)}
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!editMode ? (
                <button
                  className="main-edit-btn"
                  onClick={() => setEditMode(true)}
                >
                  Chỉnh sửa thông tin
                </button>
              ) : (
                <div className="btn-group">
                  <button className="save-btn" onClick={handleChangeInfo}>
                    💾 Lưu
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditMode(false)}
                  >
                    Huỷ
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
