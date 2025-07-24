import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchHeader from "../components/SearchHeader";
import NotFoundRating from "../components/NotFoundRating";
import "../styles/CheckAccount.css";
import React from "react";

export default function CheckAccount() {
  const [account, setAccount] = useState("");
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  const [searchParams, setSearchParams] = useSearchParams();
  const hasLoggedRef = useRef(new Set());

  // ✅ Gọi toàn bộ báo cáo đã duyệt (1 lần)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/report/all");
        const data = await res.json();
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map(r => [r.id, r])).values());
          const approved = unique.filter(r => String(r.status).toLowerCase() === "approved");
          const sorted = approved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllReports(sorted);
        } else {
          console.error("API không trả về array:", data);
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };
    fetchReports();
  }, []);

  // ✅ Lọc theo search param
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setAccount(query);

      if (!hasLoggedRef.current.has(query)) {
        hasLoggedRef.current.add(query);
        fetch("http://localhost:5000/api/searchlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: query }),
        }).catch(err => console.error("Log search error:", err));
      }

      const filtered = allReports.filter(r => r.accountNumber === query);
      setReports(filtered);
    } else {
      setReports([]);
      setAccount("");
    }
  }, [allReports, searchParams]);

  // ✅ Tính phân trang
  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // ✅ Hiển thị tiêu đề báo cáo
  const renderReportTitle = () => {
    if (reports.length === 0 || !account) return null;

    const groupedByDate = reports.reduce((acc, r) => {
      const dateStr = new Date(r.createdAt).toLocaleDateString("vi-VN");
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(r);
      return acc;
    }, {});

    const dates = Object.keys(groupedByDate).sort((a, b) => {
      const [d1, m1, y1] = a.split("/").map(Number);
      const [d2, m2, y2] = b.split("/").map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });

    const selectedDate = dates[0];
    const count = groupedByDate[selectedDate]?.length || 0;

    return (
      <h3 className="report-title">
        📅 Ngày {selectedDate} có {count} cảnh báo liên quan
      </h3>
    );
  };

  return (
    <>
      <Header />
      <div className="check-account-page">
        <SearchHeader
          setAccount={setAccount}
          setSearchParams={setSearchParams}
          allReports={allReports}
          setReports={setReports}
          setCurrentPage={setCurrentPage}
        />

        {renderReportTitle()}

        {/* ✅ HIỂN THỊ DANH SÁCH KẾT QUẢ */}
        {reports.length > 0 && (
          <div className="report-list">
            {currentReports.map((r, index) => (
              <div
                key={`${r.id}-${index}`}
                className="report-card"
                onClick={async () => {
                  try {
                    await fetch(`http://localhost:5000/api/report/${r.id}/view`, {
                      method: "PATCH",
                    });
                  } catch (err) {
                    console.error("❌ Lỗi cập nhật lượt xem:", err);
                  }
                  window.location.href = `/report/${r.id}`;
                }}
              >
                <div className="report-top">
                  <span className="report-name">{r.accountName}</span>
                  <span className="report-id">
                    #{reports.length - (indexOfFirst + index)}
                  </span>
                </div>
                <div className="report-bottom">
                  <span className="report-date">
                    📅 {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="report-views">👁 {r.views || 0} lượt xem</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nếu không có báo cáo */}
        {reports.length === 0 && account && (
          <NotFoundRating account={account} />
        )}

        {/* Phân trang */}
        {reports.length > 0 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
