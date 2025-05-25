const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả comment theo reportId
exports.getCommentsByReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM comments WHERE reportId = ? ORDER BY createdAt ASC',
      [reportId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy bình luận:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Gửi bình luận mới
exports.createComment = async (req, res) => {
  const { reportId, userId, userName, content } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      `INSERT INTO comments (id, reportId, userId, userName, content, likes, replies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, reportId, userId, userName, content, JSON.stringify([]), JSON.stringify([])]
    );
    res.status(201).json({ message: 'Đã bình luận!', id });
  } catch (err) {
    console.error('❌ Lỗi tạo bình luận:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Like hoặc Unlike comment
exports.toggleLike = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const [rows] = await db.query('SELECT likes FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy comment!' });

    let likes = JSON.parse(rows[0].likes || '[]');
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    await db.query('UPDATE comments SET likes = ? WHERE id = ?', [JSON.stringify(likes), commentId]);
    res.json({ message: 'Đã cập nhật like.', likes });
  } catch (err) {
    console.error('❌ Lỗi like comment:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Gửi reply vào comment
exports.replyToComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId, userName, content } = req.body;
  const reply = {
    userId,
    userName,
    content,
    createdAt: new Date().toISOString()
  };

  try {
    const [rows] = await db.query('SELECT replies FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy comment!' });

    const replies = JSON.parse(rows[0].replies || '[]');
    replies.push(reply);

    await db.query('UPDATE comments SET replies = ? WHERE id = ?', [JSON.stringify(replies), commentId]);
    res.json({ message: 'Đã phản hồi!', replies });
  } catch (err) {
    console.error('❌ Lỗi reply comment:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
