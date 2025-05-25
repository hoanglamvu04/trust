const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả report (mới nhất trước)
exports.getAllReports = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS userName 
       FROM reports r 
       LEFT JOIN users u ON r.userId = u.id 
       ORDER BY r.createdAt DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Lấy báo cáo theo ID
exports.getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Lỗi lấy báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Gửi báo cáo mới
exports.createReport = async (req, res) => {
  const {
    accountName, accountNumber, bank, facebookLink,
    content, reporterName, zalo, confirm,
    category, proof, userId
  } = req.body;

  const id = uuidv4();

  try {
    await db.query(
      `INSERT INTO reports (
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category, proof,
        userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        JSON.stringify(proof || []),
        userId || null
      ]
    );
    res.status(201).json({ message: 'Gửi báo cáo thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi gửi báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật trạng thái (duyệt / từ chối)
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE reports SET status = ?, rejectionReason = ? WHERE id = ?',
      [status, rejectionReason || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
