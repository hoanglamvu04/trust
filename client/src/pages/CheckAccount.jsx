import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchHeader from "../components/SearchHeader";
import NotFoundRating from "../components/NotFoundRating";
import "../styles/CheckAccount.css";

export default function CheckAccount() {
  const [account, setAccount] = useState("");
  const [allReports, setAllReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState("ALL"); // "ALL" | "dd/mm/yyyy"
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  const [searchParams, setSearchParams] = useSearchParams();
  const hasLoggedRef = useRef(new Set());
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/report/all`);
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
  }, [API_BASE]);

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setAccount(query);

    if (query && !hasLoggedRef.current.has(query)) {
      hasLoggedRef.current.add(query);
      fetch(`${API_BASE}/searchlog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: query }),
      }).catch(err => console.error("Log search error:", err));
    }
    setCurrentPage(1);
  }, [searchParams, API_BASE]);

  const filteredByAccount = useMemo(() => {
    if (!account) return allReports;
    return allReports.filter(r => r.accountNumber === account);
  }, [allReports, account]);

  const { groupedByDate, datesDesc } = useMemo(() => {
    const grouped = filteredByAccount.reduce((acc, r) => {
      const d = new Date(r.createdAt).toLocaleDateString("vi-VN");
      (acc[d] ||= []).push(r);
      return acc;
    }, {});
    const dates = Object.keys(grouped).sort((a, b) => {
      const [d1, m1, y1] = a.split("/").map(Number);
      const [d2, m2, y2] = b.split("/").map(Number);
      return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
    });
    return { groupedByDate: grouped, datesDesc: dates };
  }, [filteredByAccount]);

  useEffect(() => {
    if (selectedDate === "ALL") return;
    if (selectedDate && !groupedByDate[selectedDate]) {
      const fallback = datesDesc[0] || "ALL";
      setSelectedDate(fallback);
    }
  }, [groupedByDate, datesDesc, selectedDate]);

  const displayReports = useMemo(() => {
    if (selectedDate === "ALL") return filteredByAccount;
    return groupedByDate[selectedDate] || [];
  }, [filteredByAccount, groupedByDate, selectedDate]);

  const totalPages = Math.ceil(displayReports.length / reportsPerPage);
  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = displayReports.slice(indexOfFirst, indexOfLast);

  const onPickDate = (e) => {
    const iso = e.target.value; // yyyy-mm-dd
    if (!iso) return;
    const dt = new Date(iso);
    const vn = dt.toLocaleDateString("vi-VN");
    setSelectedDate(vn);
    setCurrentPage(1);
  };

  const renderTitle = () => {
    if (account && filteredByAccount.length === 0) return null;
    if (selectedDate === "ALL") {
      return (
        <h3 className="report-title">
          📚 Tất cả cảnh báo {account ? `cho STK ${account}` : ""}: {filteredByAccount.length}
        </h3>
      );
    }
    const count = groupedByDate[selectedDate]?.length || 0;
    return (
      <h3 className="report-title">
        📅 Ngày {selectedDate} có {count} cảnh báo {account ? `cho STK ${account}` : ""}
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
          setReports={() => {}}
          setCurrentPage={setCurrentPage}
        />

        {filteredByAccount.length > 0 && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "12px 0" }}>
            <button
              className={`date-chip${selectedDate === "ALL" ? " active" : ""}`}
              onClick={() => { setSelectedDate("ALL"); setCurrentPage(1); }}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: selectedDate === "ALL" ? "#2563eb" : "#f9fafb",
                color: selectedDate === "ALL" ? "#fff" : "#111827",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Tất cả ngày ({filteredByAccount.length})
            </button>

            {datesDesc.map(d => {
              const c = groupedByDate[d]?.length || 0;
              const active = d === selectedDate;
              return (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setCurrentPage(1); }}
                  className={`date-chip${active ? " active" : ""}`}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #e5e7eb",
                    background: active ? "#2563eb" : "#f9fafb",
                    color: active ? "#fff" : "#111827",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                  title={`Ngày ${d} có ${c} cảnh báo`}
                >
                  {d} ({c})
                </button>
              );
            })}

            <input
              type="date"
              onChange={onPickDate}
              style={{
                marginLeft: "auto",
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb"
              }}
              aria-label="Chọn ngày"
            />
          </div>
        )}

        {renderTitle()}

        {currentReports.length > 0 && (
          <div className="report-list">
            {currentReports.map((r, index) => (
              <div
                key={`${r.id}-${index}`}
                className="report-card"
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/report/${r.id}/view`, { method: "PATCH" });
                  } catch (err) {
                    console.error("❌ Lỗi cập nhật lượt xem:", err);
                  }
                  window.location.href = `/report/${r.id}`;
                }}
              >
                <div className="report-top">
                  <span className="report-name">{r.accountName}</span>
                  <span className="report-id">
                    #{displayReports.length - (indexOfFirst + index)}
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

        {account && filteredByAccount.length === 0 && <NotFoundRating account={account} />}

        {currentReports.length === 0 && !account && allReports.length === 0 && (
          <div style={{ marginTop: 8, color: "#6b7280" }}>Chưa có bài cảnh báo nào.</div>
        )}

        {currentReports.length === 0 && filteredByAccount.length > 0 && (
          <div style={{ marginTop: 8, color: "#6b7280" }}>
            Không có cảnh báo cho ngày đã chọn.
          </div>
        )}

        {displayReports.length > reportsPerPage && (
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
