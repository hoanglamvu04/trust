const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Gửi liên hệ mới từ người dùng
exports.createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO contacts (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, subject, message]
    );

    res.json({ success: true, message: 'Liên hệ của bạn đã được gửi thành công!' });
  } catch (err) {
    console.error('❌ Lỗi gửi liên hệ:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};
