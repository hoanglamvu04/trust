const db = require('../db');

// Lưu từng câu trả lời vào bảng user_results
exports.submitResult = async (req, res) => {
  try {
    // Lấy user_id từ token/session, KHÔNG lấy từ FE truyền lên!
    const userId = req.user?.id || req.session?.user?.id;
    const { session_id, test_id, question_id, user_answer, is_correct } = req.body;

    if (!userId || !session_id || !test_id || !question_id || typeof is_correct === "undefined") {
      return res.status(400).json({ message: "Thiếu dữ liệu!" });
    }

    // Lưu kết quả từng câu
    await db.query(
      `INSERT INTO user_results (user_id, session_id, test_id, question_id, user_answer, is_correct, answered_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, session_id, test_id, question_id, String(user_answer), is_correct]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi lưu kết quả:", err);
    res.status(500).json({ message: "Lỗi lưu kết quả!" });
  }
};

// Xem chi tiết các câu trả lời của 1 session (1 lần làm bài)
exports.getSessionResults = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id!" });

  // Lấy tổng quát thông tin lần làm bài
  const [sessionRows] = await db.query(
    `SELECT s.id as session_id, s.started_at, s.submitted_at, s.score,
            u.username, t.name as test_name
     FROM user_test_sessions s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN tests t ON s.test_id = t.id
     WHERE s.id = ? LIMIT 1`,
    [session_id]
  );
  const info = sessionRows[0] || {};

  // Lấy danh sách câu hỏi và đáp án đã chọn
  const [rows] = await db.query(
    `SELECT ur.question_id, ur.user_answer, ur.is_correct, q.subject
     FROM user_results ur
     LEFT JOIN questions q ON ur.question_id = q.id
     WHERE ur.session_id = ?
     ORDER BY ur.question_id ASC`,
    [session_id]
  );

  res.json({
    ...info,
    detail: rows
  });
};

// API cho admin/trainer lấy tất cả kết quả (nâng cao, phân trang v.v…)
exports.getAllResults = async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const offset = (page - 1) * limit;

  // Ví dụ: lấy 100 kết quả mới nhất
  const [rows] = await db.query(
    `SELECT ur.*, u.username, t.name AS test_name
     FROM user_results ur
     LEFT JOIN users u ON ur.user_id = u.id
     LEFT JOIN tests t ON ur.test_id = t.id
     ORDER BY ur.answered_at DESC
     LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]
  );

  res.json({ results: rows });
};
