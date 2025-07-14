const db = require('../db');

// Lấy danh sách câu hỏi (search, phân trang, filter test)
exports.getQuestions = async (req, res) => {
  try {
    const { search = "", page = 1, test_id } = req.query;
    const limit = 30;
    const offset = (page - 1) * limit;
    let where = "1";
    const params = [];
    if (search) {
      where += " AND q.content LIKE ?";
      params.push(`%${search}%`);
    }
    if (test_id) {
      where += " AND q.test_id=?";
      params.push(test_id);
    }
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM questions q WHERE ${where}`, params
    );
    const total = countRows[0].total;
    const [rows] = await db.query(
      `SELECT q.*, t.name as test_name, u.username as created_by_username
       FROM questions q
       LEFT JOIN tests t ON q.test_id = t.id
       LEFT JOIN users u ON q.created_by = u.id
       WHERE ${where}
       ORDER BY q.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ questions: rows, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Lỗi getQuestions:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Lấy chi tiết 1 câu hỏi
exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT q.*, t.name as test_name, u.username as created_by_username
       FROM questions q
       LEFT JOIN tests t ON q.test_id = t.id
       LEFT JOIN users u ON q.created_by = u.id
       WHERE q.id=? LIMIT 1`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Lỗi getQuestionById:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Thêm câu hỏi mới
exports.createQuestion = async (req, res) => {
  const {
    test_id,
    subject,
    sender,
    email,
    time,
    avatar,
    preview,
    content,
    is_scam,
    scam_reason,
    unread,
    starred
  } = req.body;
  const userId = req.user?.id || req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });

  // Validate trường bắt buộc (tùy yêu cầu)
  if (!test_id || !subject || !sender || !email || !content || typeof is_scam === 'undefined') {
    return res.status(400).json({ message: "Thiếu dữ liệu!" });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO questions
      (test_id, subject, sender, email, time, avatar, preview, content, is_scam, scam_reason, unread, starred, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        test_id, subject, sender, email, time || '', avatar || '',
        preview || '', content, is_scam, scam_reason || '',
        unread ?? 1, starred ?? 0, userId
      ]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Lỗi createQuestion:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Sửa câu hỏi
exports.updateQuestion = async (req, res) => {
  const {
    subject, sender, email, time, avatar, preview, content,
    is_scam, scam_reason, unread, starred, test_id
  } = req.body;
  const { id } = req.params;
  const userId = req.user?.id || req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });

  if (!test_id || !subject || !sender || !email || !content || typeof is_scam === 'undefined') {
    return res.status(400).json({ message: "Thiếu dữ liệu!" });
  }
  try {
    await db.query(
      `UPDATE questions
        SET subject=?, sender=?, email=?, time=?, avatar=?, preview=?,
            content=?, is_scam=?, scam_reason=?, unread=?, starred=?,
            test_id=?, updated_by=?, updated_at=NOW()
        WHERE id=?`,
      [
        subject, sender, email, time || '', avatar || '', preview || '',
        content, is_scam, scam_reason || '', unread ?? 1, starred ?? 0,
        test_id, userId, id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi updateQuestion:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};


// Xoá câu hỏi
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM questions WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteQuestion:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
