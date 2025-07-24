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
 * Lấy danh sách thông báo của người dùng hiện tại
 */
exports.getNotificationsByUser = async (req, res) => {
  const userId = req.session.user.id;
  const { type } = req.query;

  try {
    let query = `
  SELECT n.*, u.nickname AS senderName
  FROM notifications n 
  LEFT JOIN users u ON n.senderId = u.id 
  WHERE n.userId = ?
`;
    const params = [userId];

    if (type === 'report' || type === 'comment') {
      query += ' AND n.type = ?';
      params.push(type);
    }

    query += ' ORDER BY n.createdAt DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy thông báo:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
  }
};

/**
 * Tạo thông báo thủ công (có xử lý tự động content nếu không có)
 */
exports.createNotification = async ({ userId, senderId, type, content, link }) => {
  const id = uuidv4();

  // Tự sinh nội dung nếu thiếu
  if (!content && senderId) {
    const [[user]] = await db.query('SELECT nickname FROM users WHERE id = ?', [senderId]);
    const nickname = user?.nickname || 'Ai đó';
    if (type === 'comment') {
      content = `${nickname} đã bình luận vào bài viết của bạn.`;
    } else if (type === 'like') {
      content = `${nickname} đã thích bình luận của bạn.`;
    } else {
      content = `${nickname} đã gửi một thông báo đến bạn.`;
    }
  }

  if (!content) {
    content = 'Bạn có thông báo mới.';
  }

  await db.query(
    'INSERT INTO notifications (id, userId, senderId, type, content, link) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, senderId || null, type, content, link || null]
  );
};

/**
 * ✔️ Đánh dấu đã đọc
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

/**
 * 🔁 Hàm tiện ích gọi ở controller khác (comment, like, report,...)
 * ⚠️ Đảm bảo phải truyền `senderId`, nếu không sẽ bị null
 */
exports.createNotificationHelper = async ({ userId, senderId, type, content, link }) => {
  const id = uuidv4();

  // Nếu thiếu nội dung, tự động sinh theo senderId
  if (!content && senderId) {
    const [[user]] = await db.query('SELECT nickname FROM users WHERE id = ?', [senderId]);
    const nickname = user?.nickname || 'Ai đó';
    if (type === 'comment') {
      content = `${nickname} đã bình luận vào bài viết của bạn.`;
    } else if (type === 'like') {
      content = `${nickname} đã thích bình luận của bạn.`;
    } else {
      content = `${nickname} đã gửi một thông báo đến bạn.`;
    }
  }

  if (!content) {
    content = 'Bạn có thông báo mới.';
  }

  await db.query(
    'INSERT INTO notifications (id, userId, senderId, type, content, link) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, senderId || null, type, content, link || null]
  );
};
/**
 * ❌ Xóa một thông báo theo ID
 */
exports.deleteNotificationById = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo!' });
    }

    res.json({ message: 'Đã xóa thông báo.' });
  } catch (err) {
    console.error('❌ Lỗi xóa thông báo:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa thông báo.' });
  }
};

/**
 * ❌ Xóa tất cả thông báo theo loại
 */
exports.deleteAllNotificationsByType = async (req, res) => {
  const userId = req.session.user.id;
  const { type } = req.query;

  try {
    let query = 'DELETE FROM notifications WHERE userId = ?';
    const params = [userId];

    // Chỉ lọc nếu type là hợp lệ
    if (type === 'report' || type === 'comment' || type === 'like') {
      query += ' AND type = ?';
      params.push(type);
    }

    await db.query(query, params);

    res.json({ message: 'Đã xóa tất cả thông báo.' });
  } catch (err) {
    console.error('❌ Lỗi xóa tất cả thông báo:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa tất cả.' });
  }
};
