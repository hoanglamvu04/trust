import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
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

  const hasLoggedRef = useRef(new Set()); // Ghi lại các account đã log rồi

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/report");
        const data = await res.json();
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map(r => [r.id, r])).values());
          const sorted = unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  useEffect(() => {
    const queryAccount = searchParams.get("search");
    if (queryAccount) {
      setAccount(queryAccount);

      // Chỉ log nếu chưa log account này trước đó
      if (!hasLoggedRef.current.has(queryAccount)) {
        hasLoggedRef.current.add(queryAccount); // Đánh dấu là đã log
        fetch("http://localhost:5000/api/searchlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: queryAccount })
        })
          .then(res => res.json())
          .then(data => console.log("Đã log search:", data))
          .catch(err => console.error("Log search error:", err));
      }

      const filtered = allReports.filter(
        (r) => r.accountNumber && r.accountNumber === queryAccount
      );
      setReports(filtered);

    } else {
      setReports(allReports);
    }
  }, [allReports, searchParams]);

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const renderReportTitle = () => {
    if (reports.length === 0) return null;
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

        {reports.length === 0 && account && <NotFoundRating account={account} />}

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
      </div>
      <Footer />
    </>
  );
}
