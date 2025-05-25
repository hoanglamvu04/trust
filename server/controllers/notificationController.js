const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy toàn bộ thông báo của user
exports.getNotificationsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy thông báo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Tạo thông báo mới
exports.createNotification = async (req, res) => {
  const { userId, type, content, link } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO notifications (id, userId, type, content, link) VALUES (?, ?, ?, ?, ?)',
      [id, userId, type, content, link || null]
    );
    res.status(201).json({ message: 'Đã tạo thông báo!', id });
  } catch (err) {
    console.error('❌ Lỗi tạo thông báo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'UPDATE notifications SET isRead = 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy thông báo!' });
    res.json({ message: 'Đã đánh dấu đã đọc.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
