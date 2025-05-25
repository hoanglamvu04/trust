// File: src/pages/CheckWebsite.jsx
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/CheckWebsite.css";

const dummyData = [
  {
    domain: "amazou2.com",
    status: "Đang xử lý",
    field: "Thương mại điện tử",
    type: "Website",
    label: "Mạo danh",
    date: "2025-02-12",
    official: "https://amazon.com",
  },
  {
    domain: "muacard.online",
    status: "Đang xử lý",
    field: "Ngân hàng - Tài chính",
    type: "Website",
    label: "Lừa đảo",
    date: "2025-02-12",
    official: "",
  },
  {
    domain: "shoplazada.xyz",
    status: "Đang xử lý",
    field: "Thương mại điện tử",
    type: "Website",
    label: "Trang giả",
    date: "2025-01-17",
    official: "https://www.lazada.vn",
  },
  {
    domain: "zalo-fake.info",
    status: "Đang chờ",
    field: "Dịch vụ trực tuyến",
    type: "Mạng xã hội",
    label: "Mạo danh",
    date: "2025-01-16",
    official: "https://zalo.me",
  },
  {
    domain: "appfakebanking.com",
    status: "Đã xử lý",
    field: "Ngân hàng - Tài chính",
    type: "Website",
    label: "Lừa đảo",
    date: "2025-01-15",
    official: "",
  },
  {
    domain: "fakenews.site",
    status: "Đang xử lý",
    field: "Báo chí",
    type: "Website",
    label: "Trang giả",
    date: "2025-01-10",
    official: "",
  },
];

export default function CheckWebsite() {
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = dummyData.filter((item) => {
    return (
      item.domain.toLowerCase().includes(search.toLowerCase()) &&
      (!fieldFilter || item.field === fieldFilter) &&
      (!statusFilter || item.status === statusFilter) &&
      (!typeFilter || item.type === typeFilter) &&
      (!labelFilter || item.label === labelFilter)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Header />
      <div className="check-website-layout">
        <div className="filter-sidebar sticky">
          <h2>Tra cứu website</h2>
          <input
            type="text"
            placeholder="Nhập tên lừa đảo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <label>Lĩnh vực</label>
          <select onChange={(e) => setFieldFilter(e.target.value)}>
            <option value="">-- Tất cả --</option>
            <option>Thương mại điện tử</option>
            <option>Ngân hàng - Tài chính</option>
            <option>Cơ quan - Doanh nghiệp</option>
            <option>Tổ chức nhà nước</option>
            <option>Dịch vụ trực tuyến</option>
            <option>Mạng xã hội</option>
            <option>Báo chí</option>
          </select>

          <label>Tình trạng</label>
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">-- Tất cả --</option>
            <option>Đang chờ</option>
            <option>Đang xử lý</option>
            <option>Đã xử lý</option>
          </select>

          <label>Loại</label>
          <select onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">-- Tất cả --</option>
            <option>Website</option>
            <option>Mạng xã hội</option>
          </select>

          <label>Phân loại</label>
          <select onChange={(e) => setLabelFilter(e.target.value)}>
            <option value="">-- Tất cả --</option>
            <option>Mạo danh</option>
            <option>Lừa đảo</option>
            <option>Trang giả</option>
          </select>
        </div>

        <div className="result-list">
          <h2 className="result-header">Kết quả phát hiện</h2>
          {paginatedData.map((item, idx) => (
            <div className="result-card modern" key={idx}>
              <div className="result-left">
                <img src="/images/web-icon.png" alt="web icon" className="result-icon" />
              </div>
              <div className="result-center">
                <div className="domain-name">{item.domain}</div>
                <div className="date-found">Phát hiện: {item.date}</div>
                <div className="label-field">Loại: {item.label} | {item.field}</div>
                <div className="official">
                  Website chính thức: {item.official ? (
                    <a href={item.official} target="_blank" rel="noopener noreferrer">
                      {item.official}
                    </a>
                  ) : "Không xác định"}
                </div>
              </div>
              <div className="result-right">
                <span className="status-badge">
                  <img
                    src={
                      item.status === "Đã xử lý"
                        ? "/images/status/done.png"
                        : item.status === "Đang xử lý"
                        ? "/images/status/processing.png"
                        : "/images/status/pending.png"
                    }
                    alt="status"
                    className="status-icon"
                  />
                  {item.status}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p>Không tìm thấy kết quả phù hợp.</p>}

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
