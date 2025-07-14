const db = require('../db');

// Lấy danh sách các lần làm bài (gộp cả user, đề)
exports.getAnswerSessions = async (req, res) => {
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

  // Lấy dữ liệu từng session
  const [rows] = await db.query(
    `SELECT s.id as session_id, s.user_id, u.username, s.test_id, t.name as test_name,
            s.started_at, s.submitted_at, s.score,
            (SELECT COUNT(*) FROM user_results ur WHERE ur.session_id = s.id) as total_answered
     FROM user_test_sessions s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN tests t ON s.test_id = t.id
     WHERE ${where}
     ORDER BY s.started_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({ results: rows, totalPages: Math.ceil(total / limit) });
};

// Lấy chi tiết 1 lần làm bài: các câu hỏi + đáp án
exports.getAnswerSessionDetail = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id!" });

  // Lấy info tổng quát
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

  // Lấy danh sách từng câu trả lời trong session
  const [rows] = await db.query(
    `SELECT ur.question_id, ur.user_answer, ur.is_correct, q.subject, q.content, q.is_scam, q.explanation
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
