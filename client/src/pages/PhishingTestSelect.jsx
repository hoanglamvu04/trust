import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/PhishingSelect.css";

export default function PhishingTestSelect() {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [topTests, setTopTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal xác nhận
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Lấy danh mục
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data || []));
  }, []);

  // Lấy đề HOT
  useEffect(() => {
    fetch("/api/tests/top?limit=5")
      .then(res => res.json())
      .then(data => setTopTests(data || []));
  }, []);

  // Lấy đề theo danh mục
  useEffect(() => {
    setLoading(true);
    let url = "/api/tests";
    if (selectedCat) url += `?category_id=${selectedCat}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setTests(data.tests || []))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  // Hiện modal xác nhận
  const handleStartTest = (testId) => {
    const test = [...topTests, ...tests].find(t => String(t.id) === String(testId));
    setSelectedTest(test);
    setShowConfirm(true);
  };

  // Đồng ý bắt đầu làm bài
  const confirmStartTest = () => {
    setShowConfirm(false);
    if (selectedTest) {
      window.location.href = `/phishing-test/doing?test_id=${selectedTest.id}`;
    }
  };

  return (
    <>
      <Header />
      <div className="test-select-container">
        <div className="ts-title">
          <span role="img" aria-label="shield">🛡️</span> Chọn đề kiểm tra kỹ năng nhận biết lừa đảo
        </div>

        {/* Top 5 đề HOT */}
        <div className="ts-section">
          <div className="ts-section-title">🔥 Đề thi HOT nhất</div>
          <div className="ts-hot-list">
            {topTests.length === 0 ? (
              <span className="ts-empty">Không có dữ liệu.</span>
            ) : topTests.map(t => (
              <div className="ts-hot-item" key={t.id} onClick={() => handleStartTest(t.id)}>
                <div className="ts-hot-name">{t.name}</div>
                <div className="ts-hot-meta">
                  <span className="ts-hot-attempts">{t.attempts || t.session_count || 0} lượt làm</span>
                  <span className="ts-hot-cat">{t.category_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bộ lọc danh mục */}
        <div className="ts-section">
          <div className="ts-section-title">📂 Danh mục</div>
          <div className="ts-cat-list">
            <button
              className={selectedCat === "" ? "ts-cat-active" : ""}
              onClick={() => setSelectedCat("")}
            >Tất cả</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={selectedCat === String(cat.id) ? "ts-cat-active" : ""}
                onClick={() => setSelectedCat(String(cat.id))}
              >{cat.name}</button>
            ))}
          </div>
        </div>

        {/* Danh sách đề */}
        <div className="ts-section">
          <div className="ts-section-title">📝 Chọn đề kiểm tra</div>
          {loading ? <div className="ts-loading">Đang tải đề...</div> : (
            <div className="ts-test-list">
              {tests.length === 0 ? (
                <div className="ts-test-empty">Không có đề thi nào trong mục này.</div>
              ) : tests.map(test => (
                <div className="ts-test-item" key={test.id}>
                  <div className="ts-test-name">{test.name}</div>
                  <div className="ts-test-desc">{test.description}</div>
                  <div className="ts-test-meta">
                    <span>Đã làm: {test.attempts || test.session_count || 0} lượt</span>
                  </div>
                  <button className="ts-btn-do" onClick={() => handleStartTest(test.id)}>
                    Bắt đầu
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Modal xác nhận bắt đầu làm bài */}
      {showConfirm && selectedTest && (
        <div className="ts-modal-overlay">
          <div className="ts-modal">
            <h3>Bạn đã sẵn sàng làm bài kiểm tra<br />
              <b style={{ color: "#216bdf" }}>{selectedTest.name}</b> chưa?</h3>
            <div style={{ marginTop: 22, display: "flex", gap: 16, justifyContent: "center" }}>
              <button className="ts-modal-ok" onClick={confirmStartTest}>Đồng ý</button>
              <button className="ts-modal-cancel" onClick={() => setShowConfirm(false)}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
