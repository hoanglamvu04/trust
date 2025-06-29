const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { createNotification } = require('../utils/notification');

// Lấy bình luận theo report, kèm nickname user
exports.getCommentsByReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    // Lấy comment + nickname user
    const [comments] = await db.query(
      `SELECT c.*, u.nickname 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.reportId = ? 
       ORDER BY c.createdAt DESC`,
      [reportId]
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ getCommentsByReport error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Tạo bình luận mới (phải có nickname)
exports.createComment = async (req, res) => {
  const { reportId, content } = req.body;
  const commenterId = req.session.user.id;
  // Lấy thông tin bài viết để biết ai là chủ bài viết
  const [reportRows] = await db.query('SELECT id, userId FROM reports WHERE id = ?', [reportId]);
  if (!reportRows.length) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });

  const ownerId = reportRows[0].userId;

  // Lưu bình luận vào DB (giả sử bảng comments)
  const commentId = uuidv4();
  await db.query(
    'INSERT INTO comments (id, reportId, userId, content) VALUES (?, ?, ?, ?)',
    [commentId, reportId, commenterId, content]
  );

  // Tạo thông báo nếu người bình luận khác chủ bài viết
  if (ownerId !== commenterId) {
    await createNotification({
      userId: ownerId,
      type: 'comment',
      content: `${req.session.user.name} đã bình luận vào bài viết của bạn.`,
      link: `/report/${reportId}`,
    });
  }

  res.status(201).json({ message: 'Đã bình luận!' });
};

// Like hoặc Unlike giữ nguyên (không liên quan nickname)
exports.toggleLike = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id; // hoặc req.session.user.id tuỳ hệ thống

  try {
    // Lấy bình luận và chủ sở hữu bình luận
    const [[row]] = await db.query(
      "SELECT likes, userId, reportId FROM comments WHERE id = ?",
      [commentId]
    );
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    let likes = [];
    try {
      likes = JSON.parse(row.likes || "[]");
    } catch (e) {
      console.warn("❗ Parse likes error:", e);
    }

    let liked = false;
    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
      liked = true;
    }

    await db.query("UPDATE comments SET likes = ? WHERE id = ?", [JSON.stringify(likes), commentId]);

    // Tạo thông báo nếu là lượt like mới và không phải tự like chính mình
    if (liked && userId !== row.userId) {
      // Lấy tên người dùng like
      const [[userRow]] = await db.query(
        "SELECT name FROM users WHERE id = ?",
        [userId]
      );
      const likerName = userRow ? userRow.name : "Ai đó";

      await createNotification({
        userId: row.userId, // chủ sở hữu comment
        type: 'like',
        content: `${likerName} đã thích bình luận của bạn.`,
        link: `/report/${row.reportId}`,
      });
    }

    res.json({ message: "Cập nhật like thành công!", likes });
  } catch (err) {
    console.error("❌ toggleLike error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Trả lời bình luận (nickname cho reply)
exports.replyToComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
  const content = req.body.content;

  if (!content?.trim())
    return res.status(400).json({ message: "Nội dung phản hồi không hợp lệ!" });

  // Kiểm tra nickname
  const [[user]] = await db.query(
    "SELECT nickname FROM users WHERE id = ?",
    [userId]
  );
  if (!user || !user.nickname || !user.nickname.trim()) {
    return res.status(400).json({ message: "Bạn cần đặt biệt danh trước khi trả lời!" });
  }

  try {
    const [[row]] = await db.query("SELECT replies FROM comments WHERE id = ?", [commentId]);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    let replies = [];
    try {
      replies = JSON.parse(row.replies || "[]");
    } catch (e) {
      console.warn("❗ Parse replies error:", e);
    }

    replies.push({
      userId,
      userName: user.nickname,
      content,
      createdAt: new Date().toISOString()
    });

    await db.query("UPDATE comments SET replies = ? WHERE id = ?", [JSON.stringify(replies), commentId]);
    res.json({ message: "Đã phản hồi!", replies });
  } catch (err) {
    console.error("❌ replyToComment error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xoá bình luận
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.roleId;

  try {
    const [[comment]] = await db.query("SELECT userId FROM comments WHERE id = ?", [commentId]);
    if (!comment) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    // Chỉ cho phép chính chủ hoặc admin (role 1, 2) xoá
    if (String(comment.userId) !== String(userId) && userRole > 2) {
      return res.status(403).json({ message: "Không có quyền xoá bình luận này!" });
    }

    const [result] = await db.query("DELETE FROM comments WHERE id = ?", [commentId]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    res.json({ message: "Đã xoá bình luận!" });
  } catch (err) {
    console.error("❌ deleteComment error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xoá phản hồi
exports.deleteReply = async (req, res) => {
  const { commentId, replyIndex } = req.params;
  const userId = req.user.id;
  const userRole = req.user.roleId;

  try {
    const [[row]] = await db.query("SELECT replies FROM comments WHERE id = ?", [commentId]);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    let replies = JSON.parse(row.replies || "[]");
    if (replyIndex < 0 || replyIndex >= replies.length)
      return res.status(400).json({ message: "Chỉ số phản hồi không hợp lệ!" });

    // Chỉ cho phép chính chủ hoặc admin (role 1, 2) xoá
    if (
      String(replies[replyIndex].userId) !== String(userId) &&
      userRole > 2
    ) {
      return res.status(403).json({ message: "Không có quyền xoá phản hồi này!" });
    }

    replies.splice(replyIndex, 1);
    await db.query("UPDATE comments SET replies = ? WHERE id = ?", [JSON.stringify(replies), commentId]);

    res.json({ message: "Đã xoá phản hồi!", replies });
  } catch (err) {
    console.error("❌ deleteReply error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.getCommentsByUser = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Chưa đăng nhập!" });
  }

  try {
    const [comments] = await db.query(
      `SELECT c.*, u.nickname
       FROM comments c
       JOIN users u ON c.userId = u.id
       WHERE c.userId = ?
       ORDER BY c.createdAt DESC`,
      [userId]
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ getCommentsByUser error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};