import React from "react";
export default function AIResultBox({ result }) {
  if (!result) return null;

  return (
    <div className="ai-box ai-risk">
      <h3>Phân tích AI</h3>
      <p><strong>Rủi ro:</strong> <span className="text-danger">{result.riskScore}</span></p>
      <p><strong>Phân loại:</strong> {result.category}</p>
      <p><strong>Tín hiệu nghi vấn:</strong></p>
      <ul>
        {result.signals.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <p><strong>Tình trạng:</strong> {result.status}</p>
      <p><strong>Khuyến nghị:</strong> {result.recommendation}</p>
      <p><strong>Thời gian:</strong> {result.time}</p>
    </div>
  );
}
