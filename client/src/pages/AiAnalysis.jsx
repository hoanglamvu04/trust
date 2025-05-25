import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AIAnalysis.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

import AIResultBox from "../components/AIResultBox";
import PartnerSources from "../components/PartnerSources";
import AnalysisHistory from "../components/AnalysisHistory";
import ScreenshotSection from "../components/ScreenshotSection";
import ContactInfo from "../components/ContactInfo";

export default function AIAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQueryUrl = params.get("url");

  const [url, setUrl] = useState(initialQueryUrl || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const itemsPerPage = 7;

  const sources = [
    { provider: "ChongLuaDao.vn", type: "Phân loại", value: "Nguy hiểm – Giả mạo nạp thẻ" },
    { provider: "VN-CERT", type: "Danh sách cảnh báo", value: "Không có trong danh sách" },
    { provider: "TinNhiemMang.vn (NCSC)", type: "Đánh giá tin cậy", value: "Không đạt tiêu chuẩn tin cậy" },
    { provider: "ScamAdviser", type: "Độ tin cậy", value: "51/100 – Mức thấp" },
    { provider: "Google Web Risk", type: "Danh sách lừa đảo", value: "Không tìm thấy" },
    { provider: "Hudson Rock", type: "Lộ dữ liệu người dùng", value: "Không phát hiện rò rỉ" },
    { provider: "CyRadar", type: "Giám sát DNS", value: "URL nằm trong danh sách theo dõi" },
  ];

  const history = Array.from({ length: 15 }).map((_, i) => ({
    risk: "10/10",
    detection: "Trang web giả mạo trang nạp thẻ...",
    time: `4:${40 + i}pm, 2 tháng 5, 2025`,
  }));

  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handleAnalyze = async (inputUrl) => {
    const trimmed = (inputUrl || url).trim();
    if (!trimmed) return;

    navigate(`/ai-analysis?url=${encodeURIComponent(trimmed)}`);
    setUrl(trimmed);
    setLoading(true);
    setErrorMessage("");

    const domainOnly = trimmed
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    try {
      const res = await axios.post("http://localhost:5000/api/check-domain", {
        domain: domainOnly,
      });

      if (res.data.exists) {
        setShowResults(true);
        setAiAnalysis(res.data.aiAnalysis);
        setErrorMessage("");
      } else {
        setShowResults(false);
        setErrorMessage("URL không dẫn đến web tồn tại. Vui lòng thử lại.");
      }
    } catch (error) {
      setShowResults(false);
      setErrorMessage("Đã xảy ra lỗi khi kiểm tra domain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") handleAnalyze();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [url]);

  useEffect(() => {
    if (initialQueryUrl) {
      setUrl(initialQueryUrl);
      handleAnalyze(initialQueryUrl);
    } else {
      setShowResults(false);
      setErrorMessage("");
      setUrl("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <>
      <Header />
      <div className="ai-analysis-container">
        <div className="intro">
          <h1>TrustCheck AI-Powered URL Analyzer</h1>
          <p>Nhận diện web lừa đảo bằng AI, kèm ghi hình trực tiếp và các báo cáo tìm thấy.</p>
          <small>
            <strong>Miễn trừ trách nhiệm:</strong> Chúng tôi không chịu trách nhiệm cho bất cứ điều gì, vì kết quả phân tích được tạo ra bởi AI.
          </small>
        </div>

        <div className="ai-input">
          <input
            type="text"
            placeholder="Nhập URL..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setErrorMessage("");
            }}
          />
          <button
            onClick={() => handleAnalyze()}
            className={!url.trim() ? "disabled-tooltip" : ""}
            title={!url.trim() ? "Vui lòng nhập tên miền." : ""}
          >
            🔍 Phân tích
          </button>
        </div>

        {loading && <p className="loader">Đang kiểm tra...</p>}
        {errorMessage && <p className="error-message">❗ {errorMessage}</p>}

        {showResults && (
          <div className="ai-grid">
            <div className="ai-left">
              <AIResultBox result={aiAnalysis} />
              <AnalysisHistory
                history={history}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className="ai-right">
              <PartnerSources sources={sources} />
              <ScreenshotSection />
              <ContactInfo />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
