import { Link, useNavigate } from "react-router-dom";
import React from 'react';
import "./Header.css";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "./LoginModal";
import NotificationModal from "./NotificationModal"; 

export default function Header() {
  const [user, setUser] = useState({ isLoggedIn: false, name: "" });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    createdAt: new Date().toLocaleDateString("vi-VN"),
  });

// (phần đầu giữ nguyên)

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setUser({ isLoggedIn: true, name: result.user.name });
      }
    } catch (err) {
      console.error("Lỗi lấy user:", err);
    }
  };
  fetchUser();
}, []);

// ✅ Đồng bộ login/logout giữa các tab
useEffect(() => {
  const onStorageChange = (e) => {
    if (e.key === "auth-event") {
      const { type } = JSON.parse(e.newValue);
      if (type === "logout") {
        setUser({ isLoggedIn: false, name: "" });
        localStorage.removeItem("user");
        window.location.reload();
      } else if (type === "login") {
        window.location.reload();
      }
    }
  };
  window.addEventListener("storage", onStorageChange);
  return () => window.removeEventListener("storage", onStorageChange);
}, []);


  const handleProtectedClick = (url) => {
    if (user.isLoggedIn) {
      navigate(url);
    } else {
      toast.error("Bạn cần đăng nhập!", { position: "top-right" });
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(result.message, { position: "top-right" });
        setUser({ isLoggedIn: true, name: result.user.name });
        setShowLoginModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server!", { position: "top-right" });
    }
  };

  const handleRegister = async () => {
    if (
      !registerForm.username ||
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!", { position: "top-right" });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Mật khẩu không khớp!", { position: "top-right" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { position: "top-right" });
        setIsRegister(false);
        setTimeout(() => setShowLoginModal(true), 1000);
      } else {
        toast.error(result.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server!", { position: "top-right" });
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (!confirmLogout) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { position: "top-right" });
        setUser({ isLoggedIn: false, name: "" });
        setTimeout(() => window.location.reload(), 500);
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
      <header className="header">
        <div className="container">
          <div className="logo">
            <Link to="/">🔐 TrustCheck</Link>
          </div>
          <nav>
            <Link to="/check-account">Tra cứu STK</Link>
            <Link to="/check-website">Tra cứu Website</Link>

            <a className="nav-link" onClick={() => handleProtectedClick("/report")}>
              Gửi tố cáo
            </a>

            <a className="nav-link" onClick={() => navigate("/ai-analysis")}>AI phân tích WEB</a>

            {user.isLoggedIn ? (
              <>
                <a className="nav-link" onClick={() => handleProtectedClick("/profile")}>👤 {user.name}</a>
                <img
                  src="/images/notification.png"
                  alt="Thông báo"
                  width="30"
                  height="30"
                  style={{ cursor: "pointer", verticalAlign: "middle", marginLeft: "10px" }}
                  onClick={() => setShowNotificationModal(true)}
                />
                <span className="nav-link" onClick={handleLogout}>Đăng xuất</span>
              </>
            ) : (
              <span className="nav-link" onClick={() => setShowLoginModal(true)}>Đăng nhập</span>
            )}
          </nav>
        </div>
      </header>

      <ToastContainer position="top-right" style={{ marginTop: "60px" }} />

      {showLoginModal && (
        <LoginModal
          isRegister={isRegister}
          setIsRegister={setIsRegister}
          closeModal={() => setShowLoginModal(false)}
          setUser={setUser}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
        />
      )}

      <NotificationModal
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
}
