import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/AdminStyles.css";

export default function AnswerSessionDetail() {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get("session_id");
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;
    fetch(`/api/test-sessions/detail?session_id=${session_id}`)
      .then(res => res.json())
      .then(data => {
        setInfo(data);
        setLoading(false);
      });
  }, [session_id]);

  if (!session_id) return <div>Không tìm thấy dữ liệu!</div>;
  if (loading) return <div>Đang tải...</div>;

  const { username, test_name, started_at, submitted_at, score, detail } = info || {};

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button onClick={() => navigate(-1)} className="btn-no" style={{ marginRight: 18 }}>← Quay lại</button>
        <h2 style={{ display: "inline-block" }}>Chi tiết Lần làm bài</h2>
      </div>
      <div className="report-form" style={{ maxWidth: 700, margin: "24px auto" }}>
        <div className="report-row"><div className="report-label">Tên đề</div><div className="report-value">{test_name}</div></div>
        <div className="report-row"><div className="report-label">User</div><div className="report-value">{username}</div></div>
        <div className="report-row"><div className="report-label">Bắt đầu</div><div className="report-value">{started_at ? new Date(started_at).toLocaleString("vi-VN") : ""}</div></div>
        <div className="report-row"><div className="report-label">Nộp bài</div><div className="report-value">{submitted_at ? new Date(submitted_at).toLocaleString("vi-VN") : <span style={{color:"red"}}>Chưa nộp</span>}</div></div>
        <div className="report-row"><div className="report-label">Số câu</div><div className="report-value">{detail?.length || 0}</div></div>
        <div className="report-row"><div className="report-label">Số đúng</div>
          <div className="report-value" style={{ fontWeight: 700, color: "#219a37" }}>
            {detail?.filter(q => q.is_correct).length}
          </div>
        </div>
        <hr style={{ margin: "16px 0" }} />
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách các câu hỏi:</div>
        <table className="table-detail">
          <thead>
            <tr>
              <th>#</th>
              <th>Subject</th>
              <th>Đáp án đã chọn</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {detail.map((q, i) => (
              <tr key={q.question_id}>
                <td>{i + 1}</td>
                <td>{q.subject}</td>
                <td>{q.user_answer === "true" || q.user_answer === "1" ? "Lừa đảo" : "Hợp lệ"}</td>
                <td>
                  {q.is_correct
                    ? <span style={{ color: "#219a37", fontWeight: 600 }}>✔️ Đúng</span>
                    : <span style={{ color: "#b30b0b", fontWeight: 600 }}>❌ Sai</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
