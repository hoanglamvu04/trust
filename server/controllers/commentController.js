const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// 📌 Lấy alias chưa sử dụng trong 1 report
async function getUnusedAlias(reportId) {
  const [used] = await db.query(
    "SELECT alias FROM anonymous_aliases WHERE reportId = ?",
    [reportId]
  );
  const usedAliases = used.map(row => row.alias);

  const [available] = await db.query(
    "SELECT name FROM alias_pool WHERE name NOT IN (?) ORDER BY RAND() LIMIT 1",
    [usedAliases.length ? usedAliases : [""]]
  );

  return available[0]?.name || `Người ẩn danh #${Math.floor(Math.random() * 10000)}`;
}

// 📌 Lấy alias cố định cho user trong 1 report, tạo mới nếu chưa có
async function ensureAlias(userId, reportId) {
  const [[existing]] = await db.query(
    "SELECT alias FROM anonymous_aliases WHERE userId = ? AND reportId = ? LIMIT 1",
    [userId, reportId]
  );

  if (existing) return existing.alias;

  const alias = await getUnusedAlias(reportId);

  await db.query(
    "INSERT INTO anonymous_aliases (id, userId, reportId, alias) VALUES (?, ?, ?, ?)",
    [uuidv4(), userId, reportId, alias]
  );

  return alias;
}

// ✅ Lấy bình luận theo report
exports.getCommentsByReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    const [comments] = await db.query(
      "SELECT * FROM comments WHERE reportId = ? ORDER BY createdAt DESC",
      [reportId]
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ getCommentsByReport error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Tạo bình luận mới
exports.createComment = async (req, res) => {
  const rawUserId = req.body.userId;
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

  const reportId = req.body.reportId; // ✅ Bổ sung dòng này
  const content = req.body.content;

  if (!reportId || !userId || !content?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin!" });
  }

  const id = uuidv4();

  try {
    const alias = await ensureAlias(userId, reportId);

    await db.query(
      `INSERT INTO comments (id, reportId, userId, alias, content, likes, replies, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, reportId, userId, alias, content, "[]", "[]"]
    );

    res.status(201).json({ message: "Đã bình luận!", id, alias });
  } catch (err) {
    console.error("❌ createComment error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};


// ✅ Like hoặc Unlike
exports.toggleLike = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const [[row]] = await db.query("SELECT likes FROM comments WHERE id = ?", [commentId]);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    let likes = [];
    try {
      likes = JSON.parse(row.likes || "[]");
    } catch (e) {
      console.warn("❗ Parse likes error:", e);
    }

    if (likes.includes(userId)) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
    }

    await db.query("UPDATE comments SET likes = ? WHERE id = ?", [JSON.stringify(likes), commentId]);
    res.json({ message: "Cập nhật like thành công!", likes });
  } catch (err) {
    console.error("❌ toggleLike error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Trả lời bình luận
exports.replyToComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;

  if (!content?.trim())
    return res.status(400).json({ message: "Nội dung phản hồi không hợp lệ!" });

  try {
    const [[row]] = await db.query("SELECT reportId, replies FROM comments WHERE id = ?", [commentId]);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    const alias = await ensureAlias(userId, row.reportId);

    let replies = [];
    try {
      replies = JSON.parse(row.replies || "[]");
    } catch (e) {
      console.warn("❗ Parse replies error:", e);
    }

    replies.push({
      userId,
      userName: alias,
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

// ✅ Xoá bình luận
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    const [result] = await db.query("DELETE FROM comments WHERE id = ?", [commentId]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    res.json({ message: "Đã xoá bình luận!" });
  } catch (err) {
    console.error("❌ deleteComment error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ✅ Xoá phản hồi
exports.deleteReply = async (req, res) => {
  const { commentId, replyIndex } = req.params;
  try {
    const [[row]] = await db.query("SELECT replies FROM comments WHERE id = ?", [commentId]);
    if (!row) return res.status(404).json({ message: "Không tìm thấy bình luận!" });

    const replies = JSON.parse(row.replies || "[]");
    if (replyIndex < 0 || replyIndex >= replies.length)
      return res.status(400).json({ message: "Chỉ số phản hồi không hợp lệ!" });

    replies.splice(replyIndex, 1);
    await db.query("UPDATE comments SET replies = ? WHERE id = ?", [JSON.stringify(replies), commentId]);

    res.json({ message: "Đã xoá phản hồi!", replies });
  } catch (err) {
    console.error("❌ deleteReply error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.getCommentsByUser = async (req, res) => {
  console.log("📦 SESSION:", req.session);
  console.log("📦 req.session.user:", req.session?.user);
  console.log("📦 req.user (from JWT):", req.user);

  const userId = req.session?.user?.id || req.user?.id;

  if (!userId) {
    console.warn("🚫 Không có userId để truy vấn bình luận!");
    return res.status(401).json({ message: "Chưa đăng nhập!" });
  }

  try {
    const [comments] = await db.query(
      "SELECT * FROM comments WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ getCommentsByUser error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

