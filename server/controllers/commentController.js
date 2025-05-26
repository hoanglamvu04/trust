const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tên giả chưa dùng trong bài viết
async function getUnusedAlias(reportId) {
  const [usedRows] = await db.query(
    'SELECT alias FROM anonymous_aliases WHERE reportId = ?',
    [reportId]
  );
  const used = usedRows.map(row => row.alias);

  const [availableRows] = await db.query(
    'SELECT name FROM alias_pool WHERE name NOT IN (?) ORDER BY RAND() LIMIT 1',
    [used.length ? used : ['']]
  );
  return availableRows[0]?.name || `Người ẩn danh #${Math.floor(Math.random() * 10000)}`;
}

// Lấy tất cả bình luận theo reportId
exports.getCommentsByReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM comments WHERE reportId = ? ORDER BY createdAt DESC',
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
  const { reportId, userId, content } = req.body;
  const commentId = uuidv4();

  try {
    // Kiểm tra alias đã có chưa
    const [aliasRows] = await db.query(
      'SELECT alias FROM anonymous_aliases WHERE userId = ? AND reportId = ? LIMIT 1',
      [userId, reportId]
    );

    let alias = aliasRows[0]?.alias;
    if (!alias) {
      alias = await getUnusedAlias(reportId);
      await db.query(
        'INSERT INTO anonymous_aliases (id, userId, reportId, alias) VALUES (?, ?, ?, ?)',
        [uuidv4(), userId, reportId, alias]
      );
    }

    await db.query(
      `INSERT INTO comments (id, reportId, userId, userName, content, likes, replies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        commentId,
        reportId,
        userId,
        alias,
        content,
        JSON.stringify([]),
        JSON.stringify([]),
      ]
    );

    res.status(201).json({ message: 'Đã bình luận!', id: commentId, alias });
  } catch (err) {
    console.error('❌ Lỗi tạo bình luận:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Like hoặc Unlike bình luận
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

// Gửi phản hồi
exports.replyToComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;

  try {
    const [[commentRow]] = await db.query('SELECT reportId FROM comments WHERE id = ?', [commentId]);
    const reportId = commentRow?.reportId;
    if (!reportId) return res.status(404).json({ message: 'Không tìm thấy comment!' });

    const [[aliasRow]] = await db.query(
      'SELECT alias FROM anonymous_aliases WHERE userId = ? AND reportId = ?',
      [userId, reportId]
    );
    const alias = aliasRow?.alias || `Người ẩn danh #${Math.floor(Math.random() * 10000)}`;

    const [rows] = await db.query('SELECT replies FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy comment!' });

    const replies = JSON.parse(rows[0].replies || '[]');
    replies.push({
      userId,
      userName: alias,
      content,
      createdAt: new Date().toISOString()
    });

    await db.query('UPDATE comments SET replies = ? WHERE id = ?', [JSON.stringify(replies), commentId]);
    res.json({ message: 'Đã phản hồi!', replies });
  } catch (err) {
    console.error('❌ Lỗi reply comment:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xoá bình luận
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const [result] = await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận!' });
    }
    res.json({ message: 'Đã xoá bình luận!' });
  } catch (err) {
    console.error('❌ Lỗi xoá comment:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xoá phản hồi
exports.deleteReply = async (req, res) => {
  const { commentId, replyIndex } = req.params;
  try {
    const [rows] = await db.query('SELECT replies FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy comment!' });

    const replies = JSON.parse(rows[0].replies || '[]');
    if (replyIndex < 0 || replyIndex >= replies.length) {
      return res.status(400).json({ message: 'Chỉ số phản hồi không hợp lệ!' });
    }

    replies.splice(replyIndex, 1);
    await db.query('UPDATE comments SET replies = ? WHERE id = ?', [JSON.stringify(replies), commentId]);
    res.json({ message: 'Đã xoá phản hồi!', replies });
  } catch (err) {
    console.error('❌ Lỗi xoá phản hồi:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
