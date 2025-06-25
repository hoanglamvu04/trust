const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// ===== Alias logic giống như user =====
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

// ===== Quản lý comment admin =====

// Lấy danh sách comment (search + phân trang)
exports.getAdminComments = async (req, res) => {
  const search = req.query.search || '';
  const userId = req.query.userId || '';
  const reportId = req.query.reportId || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push('c.content LIKE ?');
      values.push(`%${search}%`);
    }
    if (userId) {
      conditions.push('c.userId = ?');
      values.push(userId);
    }
    if (reportId) {
      conditions.push('c.reportId = ?');
      values.push(reportId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Tổng số bản ghi
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM comments c ${whereClause}`,
      values
    );
    const total = countRows[0].total;

    // Danh sách comment (JOIN user & report)
    const [comments] = await db.query(
      `SELECT c.*, u.username, u.email, r.accountNumber
       FROM comments c
       LEFT JOIN users u ON c.userId = u.id
       LEFT JOIN reports r ON c.reportId = r.id
       ${whereClause}
       ORDER BY c.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách comment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};

// ===== Thêm comment ẩn danh =====
exports.createAdminComment = async (req, res) => {
  const { userId, reportId, content } = req.body;
  const id = uuidv4();

  if (!userId || !reportId || !content) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
  }

  try {
    // Kiểm tra user + report tồn tại
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    const [[report]] = await db.query('SELECT id FROM reports WHERE id = ?', [reportId]);
    if (!user || !report) {
      return res.status(404).json({ success: false, message: 'User hoặc Report không tồn tại' });
    }

    // Gán alias cho admin nếu đã từng bình luận report này, chưa có thì random
    const alias = await ensureAlias(userId, reportId);

    await db.query(
      `INSERT INTO comments (id, userId, reportId, alias, content, likes, replies, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, userId, reportId, alias, content, JSON.stringify([]), JSON.stringify([])]
    );

    res.json({ success: true, comment: { id, userId, reportId, content, alias } });
  } catch (err) {
    console.error('❌ Lỗi thêm comment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};

// ===== Sửa comment =====
exports.updateAdminComment = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy comment!' });
    }

    const [[updated]] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    res.json({ success: true, comment: updated });
  } catch (err) {
    console.error('❌ Lỗi update comment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};

// ===== Xoá comment =====
exports.deleteAdminComment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM comments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy comment!' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi delete comment:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};
