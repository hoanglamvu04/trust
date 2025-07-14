const db = require('../db');

// Lấy danh sách tests (search, paging, filter category)
exports.getTests = async (req, res) => {
  try {
    const { search = "", page = 1, category_id } = req.query;
    const limit = 30;
    const offset = (page - 1) * limit;
    let where = "1";
    const params = [];
    if (search) {
      where += " AND t.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (category_id) {
      where += " AND t.category_id=?";
      params.push(category_id);
    }
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM tests t WHERE ${where}`, params
    );
    const total = countRows[0].total;
    const [rows] = await db.query(
      `SELECT t.*, c.name as category_name, u.username as created_by_username
       FROM tests t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ tests: rows, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Lỗi getTests:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Lấy chi tiết 1 test
exports.getTestById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT t.*, c.name as category_name, u.username as created_by_username
       FROM tests t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id=? LIMIT 1`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy đề kiểm tra" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Lỗi getTestById:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Thêm test
exports.createTest = async (req, res) => {
  const { category_id, name, description } = req.body;
  const userId = req.user?.id || req.session?.user?.id;
  // (Nếu dùng phân quyền) if (req.user?.roleId !== 1) return res.status(403).json({ message: "Không đủ quyền!" });
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });
  if (!name?.trim() || !category_id || isNaN(Number(category_id))) {
    return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng!" });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO tests (category_id, name, description, created_by) VALUES (?, ?, ?, ?)`,
      [category_id, name, description || '', userId]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Lỗi createTest:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Sửa test
exports.updateTest = async (req, res) => {
  const { name, description, category_id } = req.body;
  const { id } = req.params;
  const userId = req.user?.id || req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });
  if (!name?.trim() || !category_id || isNaN(Number(category_id))) {
    return res.status(400).json({ message: "Thiếu dữ liệu hoặc sai định dạng!" });
  }
  try {
    await db.query(
      `UPDATE tests SET name=?, description=?, category_id=?, updated_by=?, updated_at=NOW() WHERE id=?`,
      [name, description || '', category_id, userId, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi updateTest:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xóa test
exports.deleteTest = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM tests WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteTest:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
