import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaRegStar, FaStar, FaInbox, FaPaperPlane, FaExclamationCircle, FaSearch, FaCog, FaUserCircle
} from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/PhishingTest.css";

function shorten(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max).trim() + "..." : str;
}

export default function PhishingGmailQuizFull() {
  const [params] = useSearchParams();
  const testId = params.get("test_id");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [userAnswers, setUserAnswers] = useState({});
  const [showed, setShowed] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [suggestedTests, setSuggestedTests] = useState([]); // Gợi ý thêm đề khác
  const navigate = useNavigate();

  // 1. Lấy danh sách câu hỏi của đề kiểm tra
  useEffect(() => {
    let ignore = false;
    if (!testId) return;
    fetch(`/api/questions?test_id=${testId}`)
      .then(res => res.json())
      .then(data => {
        const emails = (data.questions || []).map(q => ({
          ...q,
          id: q.id,
          subject: q.subject,
          sender: q.sender,
          email: q.email,
          time: q.time,
          avatar: q.avatar,
          preview: q.preview,
          content: q.content,
          isScam: !!q.is_scam,
          scamReason: q.explanation,
          unread: !!q.unread,
          starred: !!q.starred,
        }));
        if (!ignore) setList(emails);
      });
    return () => { ignore = true; };
  }, [testId]);

  // 2. Gợi ý các đề HOT khác
  useEffect(() => {
    fetch("/api/tests/top?limit=4")
      .then(res => res.json())
      .then(data => setSuggestedTests((data || []).filter(t => String(t.id) !== String(testId))));
  }, [testId]);

  // 3. Trả lời, phân trang, chọn thư
  const startIdx = (page - 1) * perPage;
  const endIdx = startIdx + perPage;
  const emailsToShow = list.slice(startIdx, endIdx);
  const allAnswered = list.every(e => userAnswers[e.id] !== undefined);
  const answeredCount = Object.keys(userAnswers).length;

  const handleSelect = mail => {
    setSelected(mail);
    setShowed(prev => ({ ...prev, [mail.id]: true }));
  };

  const answerMail = (id, isScam) => {
    if (userAnswers[id] !== undefined) return;
    setUserAnswers(a => ({ ...a, [id]: isScam }));
  };

  // 4. Gửi kết quả lên server: Chỉ tạo session khi ấn nộp bài!
  const submitToServer = async () => {
    setSaving(true);
    let session_id = null;
    try {
      // 1. Tạo session
      const res = await fetch("/api/test-sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ test_id: testId }),
      });
      const data = await res.json();
      if (!data.session_id) throw new Error("Không tạo được phiên làm bài!");
      session_id = data.session_id;

      // 2. Gửi kết quả từng câu
      for (const q of list) {
        const is_correct = userAnswers[q.id] === q.isScam ? 1 : 0;
        await fetch("/api/user-results/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            session_id,
            test_id: testId,
            question_id: q.id,
            user_answer: userAnswers[q.id] !== undefined ? (userAnswers[q.id] ? 1 : 0) : null,
            is_correct
          })
        });
      }

      // 3. Gọi API nộp bài (update submitted_at, score)
      await fetch("/api/test-sessions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ session_id }),
      });
      await fetch("/api/test-sessions/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ session_id }),
      });


    } catch (e) {
      alert("Lưu kết quả thất bại!");
    }
    setSaving(false);
  };


  const handleSubmit = async () => {
    if (!allAnswered) setShowConfirm(true);
    else {
      await submitToServer();
      setSubmitted(true);
      setShowConfirm(false);
    }
  };
  const confirmSubmitAnyway = async () => {
    await submitToServer();
    setSubmitted(true);
    setShowConfirm(false);
  };
  const totalCorrect = list.filter(e => userAnswers[e.id] === e.isScam).length;

  // Unread dot
  const unreadDot = (
    <span style={{
      position: "absolute", left: 4, top: 5,
      width: 9, height: 9, borderRadius: "50%",
      background: "#f33", zIndex: 10,
      border: "2.5px solid #fff"
    }}></span>
  );

  // Xác nhận khi rời trang mà chưa nộp bài
  useEffect(() => {
    if (submitted) return;
    const handleBeforeUnload = (e) => {
      if (!submitted && (answeredCount > 0 && answeredCount < list.length)) {
        e.preventDefault();
        e.returnValue = "Bạn chưa nộp bài! Nếu rời trang, kết quả sẽ bị mất.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitted, answeredCount, list.length]);

  return (
    <>
      <Header />
      <div className="gmail-wrap">
        <div className="gmail-topbar">
          <span className="gmail-title"><FaInbox /> Hộp thư đến</span>
          <span className="gmail-search">
            <FaSearch />
            <input disabled placeholder="Tìm kiếm thư..." />
          </span>
          <span className="gmail-actions"><FaCog /></span>
          <span className="gmail-user"><FaUserCircle size={28} /></span>
        </div>
        <div className="gmail-main">
          <aside className="gmail-sidebar">
            <div className="gmail-menu-selected"><FaInbox /> Hộp thư đến</div>
            <div className="gmail-menu"><FaPaperPlane /> Đã gửi</div>
            <div className="gmail-menu"><FaExclamationCircle /> Spam</div>
          </aside>
          {/* Danh sách thư */}
          <section className="gmail-list">
            {emailsToShow.map((mail) => (
              <div
                className={
                  "gmail-item"
                  + (showed[mail.id] ? "" : " unread")
                  + (selected?.id === mail.id ? " active" : "")
                }
                key={mail.id}
                onClick={() => handleSelect(mail)}
                style={{ cursor: "pointer", userSelect: "none", position: "relative" }}
              >
                {!showed[mail.id] && unreadDot}
                <span className="gmail-avatar" style={{ position: "relative", zIndex: 2 }}>{mail.avatar}</span>
                <input type="checkbox" className="gmail-checkbox" tabIndex={-1} style={{ pointerEvents: "none" }} disabled />
                <span className="gmail-star" style={{ pointerEvents: "none" }}>
                  {mail.starred ? <FaStar color="#FBC02D" /> : <FaRegStar color="#BBB" />}
                </span>
                <span className="gmail-mailinfo">
                  <span className="gmail-from" style={{ fontWeight: 600 }}>{shorten(mail.sender, 22)}</span>
                  <span className="gmail-subject" style={{ fontWeight: 600, color: "#1841a6" }}>{shorten(mail.subject, 38)}</span>
                  <span className="gmail-preview" style={{ color: "#647197", fontWeight: 400 }}>{shorten(mail.preview || "", 42)}</span>
                </span>
                <span className="gmail-time">{mail.time}</span>
                {userAnswers[mail.id] !== undefined && (
                  <span style={{
                    marginLeft: 8,
                    color: userAnswers[mail.id] ? "#c92d2d" : "#227c3a",
                    fontWeight: 700,
                    fontSize: 13,
                    position: "absolute",
                    right: 10,
                    top: 13,
                    zIndex: 3
                  }}>
                    Đã chọn: {userAnswers[mail.id] ? "Lừa đảo" : "Hợp lệ"}
                  </span>
                )}
              </div>
            ))}
          </section>
          {/* Nội dung thư */}
          <section className="gmail-view">
            {!selected && (
              <div className="gmail-empty">
                <p>Chọn một thư để xem nội dung.</p>
              </div>
            )}
            {selected && (
              <div>
                <div className="gmail-view-header">
                  <span className="gmail-subject-view">{selected.subject}</span>
                  <span className="gmail-time-view">{selected.time}</span>
                </div>
                <div className="gmail-from-view">
                  <span className="gmail-avatar">{selected.avatar}</span>
                  <b>{selected.sender}</b> &lt;{selected.email}&gt;
                </div>
                <div className="gmail-warning">
                  ⚠️ Đây là mô phỏng kiểm tra khả năng nhận biết lừa đảo. Các liên kết trong thư KHÔNG hoạt động, không gửi dữ liệu ra ngoài.
                </div>
                <div
                  className="gmail-mail-body"
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                  onClick={e => e.preventDefault()}
                />
                {!submitted && (
                  <div className="gmail-action-btns">
                    <button
                      className="gmail-btn safe"
                      onClick={() => answerMail(selected.id, false)}
                      disabled={userAnswers[selected.id] !== undefined}
                    >
                      Đây là thư hợp lệ
                    </button>
                    <button
                      className="gmail-btn danger"
                      onClick={() => answerMail(selected.id, true)}
                      disabled={userAnswers[selected.id] !== undefined}
                    >
                      Thư lừa đảo!
                    </button>
                  </div>
                )}
                {submitted && (
                  <div className={`gmail-feedback ${userAnswers[selected.id] === selected.isScam ? "correct" : "wrong"
                    }`}>
                    <p>
                      {userAnswers[selected.id] === selected.isScam
                        ? "✨ Chính xác!" : "❌ Sai rồi!"}
                    </p>
                    <p className="gmail-explain">{selected.scamReason}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button
            disabled={page === 1 || submitted}
            onClick={() => { setPage(page - 1); setSelected(null); }}
            style={{ marginRight: 10 }}
          >Trước</button>
          Trang {page}/{Math.ceil(list.length / perPage)}
          <button
            disabled={endIdx >= list.length || submitted}
            onClick={() => { setPage(page + 1); setSelected(null); }}
            style={{ marginLeft: 10 }}
          >Sau</button>
        </div>
        {!submitted && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <button
              className="gmail-btn danger"
              onClick={handleSubmit}
              style={{ fontSize: 17, padding: "11px 28px" }}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : `Nộp bài (${answeredCount}/${list.length} thư đã trả lời)`}
            </button>
          </div>
        )}
        {showConfirm && (
          <div className="gmail-modal-overlay">
            <div className="gmail-confirm-submit">
              <b>Bạn chưa làm hết tất cả các thư ({answeredCount}/{list.length}).</b><br />
              Bạn có chắc chắn muốn nộp bài không?<br />
              <div style={{ marginTop: 18 }}>
                <button className="btn-yes" onClick={confirmSubmitAnyway} disabled={saving}>
                  {saving ? "Đang lưu..." : "Nộp luôn"}
                </button>
                <button className="btn-no" onClick={() => setShowConfirm(false)} disabled={saving}>Quay lại làm tiếp</button>
              </div>
            </div>
          </div>
        )}
        {/* Sau khi nộp bài xong */}
        {submitted && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#185e1d", marginBottom: 12 }}>
              Kết quả: Bạn đúng {totalCorrect}/{list.length} thư!
            </div>
            <button
              className="gmail-btn"
              style={{ marginTop: 8 }}
              onClick={() => navigate("/phishing-test")}
            >
              ← Quay lại chọn đề
            </button>
            {/* Đề xuất HOT khác */}
            {suggestedTests.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>
                  Đề xuất kiểm tra tiếp theo:
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                  {suggestedTests.map(t => (
                    <div
                      key={t.id}
                      style={{
                        background: "#f5f7fd", borderRadius: 8, padding: "14px 22px",
                        minWidth: 180, boxShadow: "0 0 8px #0001", cursor: "pointer"
                      }}
                      onClick={() => navigate(`/phishing-test/doing?test_id=${t.id}`)}
                    >
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "#444" }}>{t.category_name || ""}</div>
                      <div style={{ fontSize: 13, color: "#999" }}>{t.session_count || t.attempts || 0} lượt làm</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
