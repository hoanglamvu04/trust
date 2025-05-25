import React from "react";
export default function AnalysisHistory({ history, currentPage, totalPages, onPageChange }) {
  const paginated = history.slice((currentPage - 1) * 7, currentPage * 7);

  return (
    <div className="ai-box">
      <h3>📋 Lịch sử phân tích</h3>
      <table>
        <thead>
          <tr>
            <th>Rủi ro</th>
            <th>Phát hiện</th>
            <th>Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((entry, index) => (
            <tr key={index}>
              <td><span className="badge badge-risk">{entry.risk}</span></td>
              <td>{entry.detection}</td>
              <td>{entry.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => onPageChange(i + 1)}
            title={`Trang ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button className="reanalyze-btn">🔁 Phân tích lại</button>
    </div>
  );
}
