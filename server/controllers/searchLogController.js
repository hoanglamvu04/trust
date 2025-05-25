const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Ghi log tìm kiếm
exports.createSearchLog = async (req, res) => {
  const { account } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO search_logs (id, account) VALUES (?, ?)',
      [id, account]
    );
    res.status(201).json({ message: 'Đã ghi log tìm kiếm!', id });
  } catch (err) {
    console.error('❌ Lỗi ghi log:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xem toàn bộ log (tuỳ quyền admin dùng)
exports.getAllSearchLogs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM search_logs ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách log:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
