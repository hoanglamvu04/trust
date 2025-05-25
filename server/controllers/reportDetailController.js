const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Thêm chi tiết báo cáo
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

// Lấy chi tiết báo cáo theo reportId
exports.getDetailsByReportId = async (req, res) => {
  const { reportId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM report_details WHERE reportId = ? ORDER BY submittedAt DESC',
      [reportId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy chi tiết:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
