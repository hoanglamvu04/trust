import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import background from "/images/ehe.jpg";

export default function AdminGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [warning, setWarning] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Kiểm tra token & quyền truy cập
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        if (!json.success) throw new Error("Chưa đăng nhập");
        const roleId = json.user?.roleId;
        if (roleId > 3) {
          setWarning("Bạn không có quyền truy cập trang quản trị.");
          setShowLogin(true);
        } else {
          setUser(json.user);
          setChecking(false);
        }
      } catch {
        setWarning("Vui lòng đăng nhập để sử dụng khu vực quản trị.");
        setShowLogin(true);
      }
    };
    check();
  }, []);

  // ✅ Theo dõi login/logout từ localStorage để đồng bộ giữa các tab
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === "auth-event") {
        const { type } = JSON.parse(e.newValue);
        if (type === "logout") {
          setUser(null);
          setWarning("Vui lòng đăng nhập để sử dụng khu vực quản trị.");
          setShowLogin(true);
          setChecking(true);
        } else if (type === "login") {
          window.location.reload();
        }
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  if (checking && !showLogin) return null;

  const wrapperStyle = showLogin
    ? {
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        minHeight: "100vh",
      }
    : {};

  return (
    <div style={wrapperStyle}>
      {showLogin ? (
        <>
          <div
            style={{
              textAlign: "center",
              paddingTop: 80,
              color: "white",
              fontSize: 20,
            }}
          >
            {warning}
          </div>
          <LoginModal
            forceLogin={true}
            setUser={(u) => {
              setUser(u);
              if (u.roleId <= 3) {
                setShowLogin(false);
                setChecking(false);
              } else {
                alert("Bạn không có quyền truy cập khu vực quản trị!");
              }
            }}
          />
        </>
      ) : (
        children
      )}
    </div>
  );
}
