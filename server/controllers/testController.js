const db = require("../db");

// Lấy tất cả đề (hoặc theo category_id), kèm số lượt làm
exports.getTests = async (req, res) => {
  try {
    const { category_id } = req.query;
    let where = "1";
    const params = [];
    if (category_id) {
      where += " AND t.category_id = ?";
      params.push(category_id);
    }
    const [rows] = await db.query(
      `SELECT t.id, t.name, t.description, t.category_id, c.name AS category_name,
              (SELECT COUNT(*) FROM user_test_sessions s WHERE s.test_id = t.id) AS session_count
         FROM tests t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE ${where}
         ORDER BY t.created_at DESC`,
      params
    );
    res.json({ tests: rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đề!" });
  }
};

// Lấy top N đề HOT (nhiều lượt làm nhất)
exports.getTopTests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const [rows] = await db.query(
      `SELECT t.id, t.name, t.description, c.name as category_name,
              COUNT(s.id) AS session_count
         FROM tests t
         LEFT JOIN user_test_sessions s ON t.id = s.test_id
         LEFT JOIN categories c ON t.category_id = c.id
         GROUP BY t.id
         ORDER BY session_count DESC, t.created_at DESC
         LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy đề hot!" });
  }
};
