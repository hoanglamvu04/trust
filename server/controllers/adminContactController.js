const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy toàn bộ liên hệ
exports.getAllContacts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Gửi liên hệ mới
exports.createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO contacts (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, subject, message]
    );
    res.status(201).json({ message: 'Gửi liên hệ thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi gửi liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật trạng thái liên hệ
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
