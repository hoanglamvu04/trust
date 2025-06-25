const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Phân trang, lọc danh sách liên hệ
exports.getContacts = async (req, res) => {
  const search = req.query.search || "";
  const status = req.query.status || "";
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  let values = [];

  if (search) {
    where += " AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)";
    values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    where += " AND status = ?";
    values.push(status);
  }

  try {
    // Tổng số bản ghi
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM contacts ${where}`,
      values
    );
    const total = countRows[0].total;

    // Dữ liệu phân trang
    const [rows] = await db.query(
      `SELECT * FROM contacts ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({
      contacts: rows,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách liên hệ:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Gửi liên hệ mới
exports.createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO contacts (id, name, email, subject, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, name, email, subject, message, "unread"]
    );
    res.status(201).json({ message: 'Gửi liên hệ thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi gửi liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật trạng thái liên hệ (read/replied/unread)
exports.updateContactStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE contacts SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy liên hệ!' });
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xóa liên hệ
exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy liên hệ!' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi xóa liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
