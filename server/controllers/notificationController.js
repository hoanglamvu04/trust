// controllers/notificationController.js

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// 🔐 Middleware yêu cầu đăng nhập
exports.requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
  }
  next();
};

/**
 * 📥 Lấy toàn bộ thông báo của user (có thể lọc theo type: report/comment/like...)
 * GET /api/notifications?type=comment
 */
exports.getNotificationsByUser = async (req, res) => {
  const userId = req.session.user.id;
  const { type } = req.query;

  try {
    let query = 'SELECT * FROM notifications WHERE userId = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY createdAt DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy thông báo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
  // Log user id mỗi lần gọi API để debug
  console.log("session id:", req.session.user.id);
};

/**
 * ➕ Tạo thông báo mới (có thể gọi từ hệ thống, không cần session)
 * POST /api/notifications
 */
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

/**
 * ✔️ Đánh dấu đã đọc
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      'UPDATE notifications SET isRead = 1 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo!' });
    }
    res.json({ message: 'Đã đánh dấu đã đọc.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// --- Hàm tiện ích dùng lại trong các controller khác --- //
/**
 * Hàm tạo thông báo cho user, có thể dùng ở bất cứ đâu (import trực tiếp)
 * Ví dụ dùng cho comment, like, report...
 * @param {Object} param0
 * @param {string} param0.userId - id người nhận thông báo
 * @param {string} param0.type - loại thông báo
 * @param {string} param0.content - nội dung thông báo, đã bao gồm nickname hoặc tên, vd: 'LamzuZzz đã bình luận...'
 * @param {string} [param0.link] - link kèm theo (nếu có)
 */
exports.createNotificationHelper = async ({ userId, type, content, link }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO notifications (id, userId, type, content, link) VALUES (?, ?, ?, ?, ?)',
    [id, userId, type, content, link || null]
  );
};
