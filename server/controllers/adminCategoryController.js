// controllers/adminCategoryController.js
const db = require('../db');

// Lấy danh sách categories (có search + paging)
exports.getCategories = async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM categories WHERE name LIKE ?`,
      [`%${search}%`]
    );
    const total = countRows[0].total;
    const [rows] = await db.query(
      `SELECT c.*, u.username as created_by_username
       FROM categories c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.name LIKE ?
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`, [`%${search}%`, limit, offset]
    );
    res.json({ categories: rows, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  // Lấy id admin từ JWT/session:
  const userId = req.user?.id || req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });
  if (!name) return res.status(400).json({ message: "Thiếu tên danh mục!" });
  try {
    const [result] = await db.query(
      `INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)`,
      [name, description || '', userId]
    );
    res.json({ success: true, id: result.insertId });
  } catch {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Sửa (không nhận updated_by từ FE)
exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  const userId = req.user?.id || req.session?.user?.id;
  if (!userId) return res.status(401).json({ message: "Chưa đăng nhập!" });
  if (!name) return res.status(400).json({ message: "Thiếu tên danh mục!" });
  try {
    await db.query(
      `UPDATE categories SET name=?, description=?, updated_by=?, updated_at=NOW() WHERE id=?`,
      [name, description || '', userId, id]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Xóa (nếu muốn truy vết, cũng có thể log user xóa)
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM categories WHERE id=?`, [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Lỗi server!" });
  }
};