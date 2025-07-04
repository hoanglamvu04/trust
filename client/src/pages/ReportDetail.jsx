import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SearchHeader from "../components/SearchHeader";
import CommentSection from "../components/CommentSection";
import "../styles/ReportDetail.css";
import React from "react";

export default function ReportDetail() {
  const [report, setReport] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [zoomedImage, setZoomedImage] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/check-account?search=${encodeURIComponent(search.trim())}`);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const res = await fetch(`http://localhost:5000/api/report/${id}`);
        if (!res.ok) throw new Error("Không tìm thấy báo cáo!");
        const data = await res.json();
        setReport(data);

        const detailRes = await fetch(`http://localhost:5000/api/report-detail/${id}`);
        const detailData = await detailRes.json();
        if (Array.isArray(detailData) && detailData.length > 0) {
          setReportDetail(detailData[0]);
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    let retries = 0;
    const intervalId = setInterval(() => {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        clearInterval(intervalId);
      } else {
        retries++;
        if (retries > 10) {
          clearInterval(intervalId);
        }
      }
    }, 300);
  }, [location, report]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!report) return <div>Không tìm thấy báo cáo</div>;

  let proofArray = [];
  if (Array.isArray(report.proof)) {
    proofArray = report.proof;
  } else if (typeof report.proof === "string") {
    try {
      const parsed = JSON.parse(report.proof);
      if (Array.isArray(parsed)) proofArray = parsed;
    } catch (err) {
      console.warn("Lỗi parse proof:", err);
    }
  }

  return (
    <>
      <Header />
      <div className="check-account-page">
        <SearchHeader search={search} setSearch={setSearch} handleSearch={handleSearch} />

        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th colSpan="2" className="report-table-title">Thông tin cảnh báo:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><img src="/images/chutk.png" alt="tk" /> Chủ TK:</td>
                <td>{report.accountName}</td>
              </tr>
              <tr>
                <td><img src="/images/stk.png" alt="stk" /> STK:</td>
                <td>{report.accountNumber} <span className="warning-icon">⚠️</span></td>
              </tr>
              <tr>
                <td><img src="/images/bank.png" alt="bank" /> Ngân Hàng:</td>
                <td>{report.bank}</td>
              </tr>
              <tr>
                <td><img src="/images/fb.png" alt="fb" /> Facebook:</td>
                <td>
                  {report.facebookLink
                    ? <a href={report.facebookLink} target="_blank" rel="noopener noreferrer">{report.facebookLink}</a>
                    : "Không có link Facebook"}
                </td>
              </tr>
              <tr>
                <td><img src="/images/details3.png" alt="hm" /> Hạng Mục:</td>
                <td>{report.category || "Không xác định"}</td>
              </tr>
              <tr>
                <td><img src="/images/anh.png" alt="img" /> Ảnh Bằng Chứng:</td>
                <td>
                  <div className="proof-gallery">
                    {proofArray.length > 0 ? (
                      proofArray.map((filename, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5000/uploads/reports/${report.id}/${filename}`}
                          alt={`Proof ${idx + 1}`}
                          onClick={() => setZoomedImage(`http://localhost:5000/uploads/reports/${report.id}/${filename}`)}
                          style={{ maxWidth: "200px", cursor: "pointer", borderRadius: "8px", margin: "5px" }}
                        />
                      ))
                    ) : (
                      <p>Không có ảnh bằng chứng.</p>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="content-box">
            <h3><img src="/images/details3.png" alt="nd" /> Nội Dung Cảnh Báo:</h3>
            <p className="report-text">{report.content}</p>
            <p className="report-meta">
              Bài cảnh báo <strong>{report.accountName}</strong> tạo ngày <strong>{new Date(report.createdAt).toLocaleDateString()}</strong>.
            </p>
            <p className="note">⚠️ <strong>Lưu ý:</strong> Bài đăng chỉ cung cấp thông tin cảnh báo, không kết luận cá nhân/tổ chức vi phạm pháp luật</p>
          </div>

          {reportDetail && (
            <div className="reporter-box">
              <h3 className="blue-title">Người gửi:</h3>
              <table className="reporter-table">
                <tbody>
                  <tr><td>Họ Và Tên:</td><td>{reportDetail.reporterName}</td></tr>
                  <tr><td>Zalo Liên Hệ:</td><td>{reportDetail.zalo}</td></tr>
                  <tr>
                    <td>Tôi Muốn Gỡ Bài:</td>
                    <td>Dùng Zalo số <strong>{reportDetail.zalo}</strong> gửi <strong>"Yêu Cầu Gỡ"</strong> tới <strong className="blue-text">Admin TrustCheck</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <CommentSection reportId={report.id} currentUser={currentUser} />
        </div>

        {zoomedImage && (
          <div className="image-popup" onClick={() => setZoomedImage(null)}>
            <div className="image-popup-inner" onClick={(e) => e.stopPropagation()}>
              <img src={zoomedImage} alt="Zoomed" className="zoomable-img" />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
