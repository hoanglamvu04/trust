// controllers/categoryController.js
const db = require('../db');

// Lấy tất cả danh mục cho user (public, không phân trang)
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description FROM categories ORDER BY name ASC`
    );
    res.json(rows); // trả về mảng thẳng
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lấy danh mục!" });
  }
};
