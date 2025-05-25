import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AIAnalysis.css";

export default function AIGptAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryUrl = new URLSearchParams(location.search).get("url") || "";

  const [url, setUrl] = useState(queryUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    navigate(`/ai-gpt-analysis?url=${encodeURIComponent(trimmed)}`);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/api/analyze-web", {
        domain: trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
      });

      if (res.data.exists) {
        setResult(res.data);
      } else {
        setError("Không thể truy cập trang web hoặc trang không tồn tại.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi phân tích bằng AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryUrl) {
      setUrl(queryUrl);
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <>
      <Header />
      <div className="ai-analysis-container">
        <div className="intro">
          <h1>Phân tích website bằng AI (GPT)</h1>
          <p>Hệ thống sẽ truy cập trang web thật và gửi nội dung đến AI để đánh giá mức độ nguy hiểm.</p>
        </div>

        <div className="ai-input">
          <input
            type="text"
            placeholder="Nhập URL..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setResult(null);
            }}
          />
          <button onClick={handleAnalyze} disabled={!url.trim()}>
            🔍 Phân tích AI
          </button>
        </div>

        {loading && <p className="loader">Đang phân tích trang web...</p>}
        {error && <p className="error-message">❗ {error}</p>}

        {result && (
          <div className="ai-grid">
            <div className="ai-left">
              <div className="ai-box ai-risk">
                <h3>🎯 Kết quả AI GPT</h3>
                <p><strong>Tiêu đề:</strong> {result.title}</p>
                <p><strong>GPT phân tích:</strong></p>
                <div className="gpt-analysis">{result.analysis}</div>
              </div>
            </div>

            <div className="ai-right">
              <div className="ai-box">
                <h3>📸 Ảnh chụp trang</h3>
                <img src={result.screenshot} alt="screenshot" style={{ width: "100%", borderRadius: "8px" }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
