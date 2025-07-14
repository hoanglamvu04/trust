import React, { useState } from "react";
import axios from "axios";

export default function CheckWebsiteTrust() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    setResult(null);
    setError(null);
    if (!domain || !domain.includes(".")) {
      setError("Vui lòng nhập đúng tên miền (domain)!");
      return;
    }
    setLoading(true);
    try {
    const res = await axios.post("/api/trust-score", { url: domain }); 
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "auto" }}>
      <h2>🛡️ Kiểm tra Google Safe Browsing</h2>
      <input
        type="text"
        placeholder="Nhập domain (vd: abc.com)"
        value={domain}
        onChange={e => setDomain(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontSize: 16 }}
      />
      <button
        onClick={handleCheck}
        style={{ marginTop: 16, padding: "0.5rem 1rem" }}
      >
        Kiểm tra
      </button>
      {loading && <p>Đang kiểm tra...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>
            Điểm tin cậy:{" "}
            <span style={{ color: result.score >= 80 ? "green" : result.score >= 50 ? "orange" : "red" }}>
              {result.score}/100 ({result.level})
            </span>
          </h3>
          <ul>
            {result.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  );
  
}
