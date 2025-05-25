import React from "react";
export default function PartnerSources({ sources }) {
  return (
    <div className="ai-box">
      <h3>Kết quả từ TrustCheck & đối tác</h3>
      <table className="source-table">
        <thead>
          <tr>
            <th>Nhà cung cấp</th>
            <th>Loại</th>
            <th>Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s, i) => (
            <tr key={i}>
              <td>{s.provider}</td>
              <td>{s.type}</td>
              <td className={s.value.includes("Nguy hiểm") ? "text-danger" : ""}>{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
