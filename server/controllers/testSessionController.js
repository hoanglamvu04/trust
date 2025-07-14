const db = require('../db');

// Tạo mới một session (bắt đầu lần làm bài mới)
exports.startSession = async (req, res) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    const { test_id } = req.body;
    if (!userId || !test_id) {
      return res.status(400).json({ message: "Thiếu user_id hoặc test_id!" });
    }
    // Tạo mới 1 lần làm bài
    const [result] = await db.query(
      `INSERT INTO user_test_sessions (user_id, test_id, started_at) VALUES (?, ?, NOW())`,
      [userId, test_id]
    );
    res.json({ success: true, session_id: result.insertId });
  } catch (err) {
    console.error("Lỗi tạo session:", err);
    res.status(500).json({ message: "Lỗi server khi tạo session!" });
  }
};

// Lấy danh sách các lần làm bài (sessions)
exports.getSessions = async (req, res) => {
  const { search = "", page = 1, user_id, test_id } = req.query;
  const limit = 30;
  const offset = (page - 1) * limit;
  let where = "1";
  const params = [];

  if (user_id) { where += " AND s.user_id=?"; params.push(user_id); }
  if (test_id) { where += " AND s.test_id=?"; params.push(test_id); }
  if (search) {
    where += " AND (u.username LIKE ? OR t.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  // Đếm tổng số session
  const [countRows] = await db.query(
    `SELECT COUNT(*) as total
     FROM user_test_sessions s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN tests t ON s.test_id = t.id
     WHERE ${where}`, params
  );
  const total = countRows[0].total;

  // Lấy dữ liệu từng session (lần làm bài)
  const [rows] = await db.query(
    `SELECT s.id as session_id, s.user_id, s.test_id,
            u.username, t.name AS test_name,
            s.started_at, s.submitted_at, s.score
     FROM user_test_sessions s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN tests t ON s.test_id = t.id
     WHERE ${where}
     ORDER BY s.submitted_at DESC, s.started_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ results: rows, totalPages: Math.ceil(total / limit) });
};
// Ghi từng câu trả lời vào user_results
exports.submitResult = async (req, res) => {
  const userId = req.user?.id || req.session?.user?.id;
  const { session_id, test_id, question_id, user_answer, is_correct } = req.body;
  if (!userId || !session_id || !test_id || !question_id || typeof is_correct === "undefined") {
    return res.status(400).json({ message: "Thiếu dữ liệu!" });
  }
  try {
    await db.query(
      `INSERT INTO user_results (user_id, session_id, test_id, question_id, user_answer, is_correct, answered_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, session_id, test_id, question_id, String(user_answer), is_correct]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lưu kết quả!" });
  }
};

// Lấy chi tiết 1 lần làm bài theo session_id
exports.getSessionDetail = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id!" });

  // Lấy info tổng quát: user, tên đề, ngày nộp
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

  // Lấy danh sách câu hỏi, đáp án đã chọn
  const [rows] = await db.query(
    `SELECT ur.question_id, ur.user_answer, ur.is_correct, q.subject
     FROM user_results ur
     LEFT JOIN questions q ON ur.question_id = q.id
     WHERE ur.session_id=?
     ORDER BY ur.question_id ASC`,
    [session_id]
  );

  res.json({
    ...info,
    detail: rows
  });
};
// controllers/userTestSessionController.js
exports.submitSession = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id!" });

  // Tính score (số câu đúng)
  const [rows] = await db.query(`SELECT SUM(is_correct) AS score FROM user_results WHERE session_id=?`, [session_id]);
  const score = rows[0]?.score || 0;

  await db.query(
    `UPDATE user_test_sessions SET submitted_at=NOW(), score=? WHERE id=?`,
    [score, session_id]
  );
  res.json({ success: true });
};
exports.finishSession = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id!" });

  // Đếm điểm đúng và tổng câu
  const [scoreRows] = await db.query(
    `SELECT COUNT(*) as total, SUM(is_correct) as score 
     FROM user_results WHERE session_id = ?`, [session_id]
  );
  const total = scoreRows[0]?.total || 0;
  const score = scoreRows[0]?.score || 0;

  // Update vào session
  await db.query(
    `UPDATE user_test_sessions SET score = ?, submitted_at = NOW() WHERE id = ?`,
    [score, session_id]
  );
  res.json({ success: true, total, score });
};