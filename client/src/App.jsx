import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/global.css";
import "./styles/index.css";

const maskName = (name) => {
  if (!name) return "";
  const arr = name.trim().split(" ");
  if (arr.length < 2) return arr[0][0] + "***";
  arr[arr.length - 1] = "*".repeat(arr[arr.length - 1].length);
  return arr.join(" ");
};

const maskAccount = (acc) =>
  String(acc).replace(/(\d+)(\d{4})$/, (m, a, b) => "*".repeat(a.length) + b);

function App() {
  const navigate = useNavigate();

  const [topReported, setTopReported] = useState([]);
  const [latestReports, setLatestReports] = useState([]);
  const [latestComments, setLatestComments] = useState([]);
  const [topSearched, setTopSearched] = useState([]);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    fetch(`${API_BASE}/statistics/top-reported`)
      .then((res) => res.json())
      .then(setTopReported)
      .catch(() => setTopReported([]));

    fetch(`${API_BASE}/statistics/latest-reports`)
      .then((res) => res.json())
      .then(setLatestReports)
      .catch(() => setLatestReports([]));

    fetch(`${API_BASE}/statistics/latest-comments`)
      .then((res) => res.json())
      .then(setLatestComments)
      .catch(() => setLatestComments([]));

    fetch(`${API_BASE}/statistics/top-searched`)
      .then((res) => res.json())
      .then(setTopSearched)
      .catch(() => setTopSearched([]));
  }, [API_BASE]);

  return (
    <>
      <Header />
      <div className="index-home-container">
        <h1 className="index-home-title">
          <img src="/images/logoweb.png" alt="TrustCheck" />
        </h1>
        <p className="index-home-desc">
          Nơi bạn kiểm tra – cảnh báo – bảo vệ cộng đồng khỏi các hành vi lừa đảo.
        </p>

        <h3 className="index-section-title" style={{ marginTop: 24 }}>
          <span role="img" aria-label="top">🔝</span> 5 Tài khoản bị cảnh báo nhiều nhất
        </h3>
        <div className="index-report-list">
          {topReported.length === 0 ? (
            <p>Chưa có dữ liệu.</p>
          ) : (
            topReported.map((acc, i) => (
              <div
                className="index-report-card"
                key={acc.accountNumber + i}
                onClick={() => navigate(`/check-account?search=${acc.accountNumber}`)}
              >
                <div className="index-report-name">{maskName(acc.accountName)}</div>
                <div className="index-report-account">STK: {maskAccount(acc.accountNumber)}</div>
                <div className="index-report-bottom">
                  <span>Số lần cảnh báo: <b>{acc.reportCount}</b></span>
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="index-section-title" style={{ marginTop: 32 }}>
          <span role="img" aria-label="news">🧾</span> 3 Bài cảnh báo mới nhất
        </h3>
        <div className="index-report-list">
          {latestReports.length === 0 ? (
            <p>Chưa có bài cảnh báo mới.</p>
          ) : (
            latestReports.map((r) => (
              <div
                className="index-report-card"
                key={r.id}
                onClick={() => navigate(`/report/${r.id}`)}
              >
                <div className="index-report-name">{maskName(r.accountName)}</div>
                <div className="index-report-bottom">
                  <span>📅 {new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                  <span>👁 {r.views || 0} lượt xem</span>
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="index-section-title" style={{ marginTop: 32 }}>
          <span role="img" aria-label="comments">💬</span> 5 Bình luận mới nhất
        </h3>
        <div className="index-report-list">
          {latestComments.length === 0 ? (
            <p>Chưa có bình luận.</p>
          ) : (
            latestComments.map((c) => (
              <div
                className="index-comment-card"
                key={c.id}
                onClick={() => navigate(`/report/${c.reportId}#comment-${c.id}`)}
              >
                <div className="index-comment-user">{c.nickname || "Ẩn danh"}</div>
                <div className="index-comment-content">
                  {c.content.length > 70 ? c.content.slice(0, 70) + "..." : c.content}
                </div>
                <div className="index-comment-meta">
                  <span className="index-comment-reportid"># Báo cáo {c.reportId}</span>
                  <span>🕓 {new Date(c.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="index-section-title" style={{ marginTop: 32 }}>
          <span role="img" aria-label="search">🔎</span> 5 STK được tra cứu nhiều nhất
        </h3>
        <div className="index-report-list">
          {topSearched.length === 0 ? (
            <p>Chưa có số liệu.</p>
          ) : (
            topSearched.map((s, i) => (
              <div
                className="index-report-card"
                key={s.accountNumber + i}
                onClick={() => navigate(`/check-account?search=${s.accountNumber}`)}
              >
                <div className="index-report-account">{maskAccount(s.accountNumber)}</div>
                <div className="index-report-bottom">
                  <span>{s.searchCount} lượt tra cứu</span>
                  <span>Chưa có tên TK</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
