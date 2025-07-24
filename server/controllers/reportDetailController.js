const db = require('../db');
const { v4: uuidv4 } = require("uuid");

// ✅ Lấy thông tin báo cáo từ bảng 'reports'
exports.getReportDetail = async (req, res) => {
  const { reportId } = req.params;

  try {
    const [[report]] = await db.query(
      "SELECT * FROM reports WHERE id = ?",
      [reportId]
    );

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo!" });
    }

    res.json(report);
  } catch (err) {
    console.error("❌ Lỗi lấy báo cáo:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ (Tùy chọn) Tạo chi tiết báo cáo — nếu bạn vẫn muốn dùng bảng report_details
exports.createReportDetail = async (req, res) => {
  const { reportId, reporterName, zalo, confirm } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      `INSERT INTO report_details (id, reportId, reporterName, zalo, confirm)
       VALUES (?, ?, ?, ?, ?)`,
      [id, reportId, reporterName, zalo, confirm]
    );
    res.status(201).json({ message: 'Đã lưu chi tiết báo cáo!', id });
  } catch (err) {
    console.error('❌ Lỗi thêm chi tiết:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
