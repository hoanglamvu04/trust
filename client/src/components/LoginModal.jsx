import { useState } from "react";
import React from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginModal({
  isRegister,
  setIsRegister,
  closeModal,
  setUser
}) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "", name: "", email: "",
    password: "", confirmPassword: "",
    nickname: ""
  });

  const onLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm)
      });
      const json = await res.json();
      if (json.success) {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        if (meData.success) {
          setUser(meData.user);
          localStorage.setItem("user", JSON.stringify(meData.user));
          localStorage.setItem("auth-event", JSON.stringify({ type: "login", time: Date.now() }));
          toast.success("✅ Đăng nhập thành công!");
          closeModal();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast.error("❌ " + json.message);
      }
    } catch (err) {
      toast.error("❌ Lỗi kết nối server!");
      console.error(err);
    }
  };

  const onRegister = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Đăng ký thành công, mời đăng nhập!");
        setIsRegister(false);
      } else {
        toast.error("❌ " + json.message);
      }
    } catch (err) {
      toast.error("❌ Lỗi kết nối server!");
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isRegister ? "Đăng ký" : "Đăng nhập"}</h3>

        {!isRegister ? (
          <>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={onLogin}>Đăng nhập</button>
              <button className="cancel-btn" onClick={closeModal}>Huỷ</button>
            </div>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Chưa có tài khoản?{" "}
              <span className="link-text" onClick={() => setIsRegister(true)}>
                Đăng ký
              </span>
            </p>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Tên người dùng"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            />
            <input
              type="text"
              placeholder="Họ và tên"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            />
            <input
            type="text"
            placeholder="Biệt danh (nickname) *"
            value={registerForm.nickname}
            onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
          />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={onRegister}>Đăng ký</button>
              <button className="cancel-btn" onClick={closeModal}>Huỷ</button>
            </div>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Đã có tài khoản?{" "}
              <span className="link-text" onClick={() => setIsRegister(false)}>
                Đăng nhập
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
