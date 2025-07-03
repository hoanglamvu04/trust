import React, { useState } from "react";
import axios from "axios";

export default function CheckWebsiteTrust() {
  const [inputUrl, setInputUrl] = useState("");
  const [score, setScore] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractDomain = (input) => {
    try {
      const hasProtocol = input.startsWith("http://") || input.startsWith("https://");
      const urlObj = new URL(hasProtocol ? input : `http://${input}`);
      return urlObj.hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  };

  const handleCheck = async () => {
    const domain = extractDomain(inputUrl);
    if (!domain) {
      setError("Tên miền hoặc URL không hợp lệ.");
      return;
    }

    setError(null);
    setLoading(true);
    setScore(null);
    setDetails(null);

    try {
      const res = await axios.post("/api/trust-score", { domain });
      setScore(res.data.score);
      setDetails(res.data.details);
    } catch (err) {
      console.error(err);
      setError("Không thể đánh giá. Lỗi: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 50) return "orange";
    return "red";
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>🔍 Đánh giá độ tin cậy website (thang điểm 100)</h2>
      <input
        type="text"
        placeholder="Nhập URL hoặc domain (vd: facebook.com)"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        style={{ padding: "0.5rem", width: "100%" }}
      />
      <button
        onClick={handleCheck}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Kiểm tra
      </button>

      {loading && <p>⏳ Đang kiểm tra...</p>}

      {score !== null && (
        <div style={{ marginTop: "1rem", color: getColor(score) }}>
          <h3>✅ Điểm tin cậy: {score}/100</h3>
          <ul>
            {Object.entries(details || {}).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {String(v)}
              </li>
            ))}
          </ul>
          {score < 50 && (
            <div
              style={{
                marginTop: "1rem",
                background: "#ffe6e6",
                padding: "1rem",
                border: "1px solid red",
              }}
            >
              ⚠️ Website có độ tin cậy thấp. Bạn có chắc muốn truy cập?
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ {error}</p>
      )}
    </div>
  );
}
