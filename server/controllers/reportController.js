const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả báo cáo (mới nhất trước)
exports.getAllReports = async (req, res) => {
  try {
   const [rows] = await db.query(`
    SELECT * FROM (
      SELECT r.*, u.name AS userName
      FROM reports r 
      LEFT JOIN users u ON r.userId = u.id 
      ORDER BY r.createdAt DESC
    ) AS sub
    GROUP BY sub.id

  `);
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
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    }
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
  const status = 'approved'; // mặc định auto duyệt nếu là admin thêm

  try {
    await db.query(
      `INSERT INTO reports (
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category, proof,
        userId, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        JSON.stringify(proof || []),
        userId || null,
        status
      ]
    );
    res.status(201).json({ message: 'Gửi báo cáo thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi gửi báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật trạng thái báo cáo (duyệt / từ chối)
exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE reports SET status = ?, rejectionReason = ? WHERE id = ?',
      [status, rejectionReason || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    }
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật nội dung báo cáo (dành cho Admin sửa)
exports.updateReportContent = async (req, res) => {
  const { id } = req.params;
  const {
    accountName, accountNumber, bank, facebookLink,
    content, reporterName, zalo, confirm,
    category, proof
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE reports SET
        accountName = ?, accountNumber = ?, bank = ?, facebookLink = ?,
        content = ?, reporterName = ?, zalo = ?, confirm = ?,
        category = ?, proof = ?
      WHERE id = ?`,
      [
        accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm,
        category, JSON.stringify(proof || []),
        id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    }
    res.json({ message: 'Cập nhật báo cáo thành công.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Tăng lượt xem
exports.incrementViews = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE reports SET views = views + 1 WHERE id = ?', [id]);
    res.json({ message: 'Đã tăng lượt xem!' });
  } catch (err) {
    console.error("❌ Lỗi tăng lượt xem:", err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
