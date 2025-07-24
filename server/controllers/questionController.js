const db = require("../db");

// Lấy danh sách câu hỏi theo test_id (public)
exports.getQuestions = async (req, res) => {
  try {
    const { test_id } = req.query;
    if (!test_id) return res.status(400).json({ message: "Thiếu test_id!" });

    const [rows] = await db.query(
      `SELECT 
        q.id, q.subject, q.sender, q.email, q.time, q.avatar, q.preview,
        q.content, q.is_scam, q.scam_reason
      FROM questions q
      WHERE q.test_id = ?
      ORDER BY q.id ASC
      `, [test_id]
    );
    res.json({ questions: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy câu hỏi!" });
  }
};
