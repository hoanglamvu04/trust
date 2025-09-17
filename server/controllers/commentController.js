const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { createNotification } = require('../utils/notification');


const BAD_WORDS = [
  // Từ tục, bậy phổ biến
  "địt", "đụ", "lồn", "cặc", "đéo", "bướm", "bú", "đĩ", "dâm", "bố mày", "bà mày", "mẹ mày",
  "vkl", "vcl", "cl", "cmm", "dm", "đm", "cc", "cái lìn", "lìn", "đíu", "cu", "thằng chó", "con chó",
  "óc chó", "ngu", "chó má", "mẹ kiếp", "khốn nạn", "đú", "đú mợ", "thằng khốn", "đồ chó", "dốt",
  "rảnh chó", "súc vật", "khốn", "fuck", "shit", "asshole", "bastard", "fucking", "motherfucker", "pussy",
  // Viết tắt biến thể
  "dm", "đm", "cl", "cmm", "vkl", "vcl", "cc",
  // Một số cụm từ miệt thị, bạo lực, toxic
  "bố láo", "bố đời", "vô học", "láo toét", "láo lếu", "láo nháo", "ngu học", "khựa", "tục tĩu", "bẩn bựa", "rác rưởi",
  // Biến thể
  "ncc", "ml", "dmm", "đmm", "con điên", "con dở hơi", "thằng ngu", "con ngu", "bẩn thỉu", "khốn khiếp", "rẻ rách",
  "bựa", "bẩn", "đần", "đần độn", "đồ ngu", "kệ mẹ", "cút", "súc sinh", "cave", "đĩ điếm", "giẻ rách", "lâm vũ"
];


// Chuẩn hóa, loại bỏ ký tự đặc biệt, viết thường
function normalizeVNText(str) {
  return str
    .toLowerCase()
    .normalize('NFC') // giữ đúng chữ tiếng Việt
    .replace(/[^a-z0-9\s\u00C0-\u1EF9]/gi, ' ') // chỉ giữ chữ và số, khoảng trắng, ký tự unicode tiếng Việt
    .replace(/\s+/g, ' ')
    .trim();
}

function containsBadWord(text) {
  if (!text) return false;
  const normalized = normalizeVNText(text);
  const words = normalized.split(' ');

  // Kiểm tra từng BAD_WORDS
  return BAD_WORDS.some(word => {
    const wordNorm = normalizeVNText(word);
    // Nếu là cụm (có dấu cách) => kiểm tra exact cụm trong bình luận
    if (wordNorm.includes(' ')) {
      // match cả cụm trong câu
      return normalized.includes(wordNorm);
    }
    // Nếu là 1 từ => match từng từ trong bình luận (không match 1 phần)
    return words.includes(wordNorm);
  });
}



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

exports.createComment = async (req, res) => {
  const { reportId, content } = req.body;
  const userId = req.session?.user?.id || null;

  // 🛑 Kiểm duyệt từ ngữ không phù hợp trước khi xử lý tiếp
  if (containsBadWord(content)) {
    return res.status(400).json({ message: "Bình luận chứa từ ngữ không phù hợp!" });
  }

  try {
    // ✅ Kiểm tra báo cáo tồn tại và đã duyệt
    const [[report]] = await db.query("SELECT id, userId, status FROM reports WHERE id = ?", [reportId]);
    if (!report) return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    if (report.status !== 'approved') {
      return res.status(403).json({ message: "Không thể bình luận vì báo cáo chưa được duyệt" });
    }

    // ✅ Tạo bình luận
    const id = uuidv4();
    await db.query(
      'INSERT INTO comments (id, reportId, userId, content) VALUES (?, ?, ?, ?)',
      [id, reportId, userId, content]
    );

    // ✅ Tạo thông báo cho người tạo báo cáo (nếu không phải chính mình)
    if (userId && userId !== report.userId) {
      const [[userRow]] = await db.query("SELECT nickname FROM users WHERE id = ?", [userId]);
      const commenter = userRow?.nickname || "Ai đó";

      await createNotification({
        userId: report.userId,         // người nhận thông báo
        senderId: userId,
        type: 'comment',
        content: `${commenter} đã bình luận vào báo cáo của bạn.`,
        link: `/report/${reportId}`,
      });
    }

    res.status(201).json({ message: 'Đã thêm bình luận!', id });
  } catch (err) {
    console.error('❌ Lỗi tạo bình luận:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo bình luận!' });
  }
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
      // Lấy nickname người dùng like
      const [[userRow]] = await db.query(
        "SELECT nickname FROM users WHERE id = ?",
        [userId]
      );
      const likerName = userRow ? userRow.nickname : "Ai đó";

      await createNotification({
        userId: row.userId,               // người nhận thông báo
        senderId: userId,                // 👈 senderId cần để join ra nickname
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