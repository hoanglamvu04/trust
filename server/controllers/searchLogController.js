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
// Thống kê lượt tìm kiếm theo thời gian
exports.getSearchStats = async (req, res) => {
  const { account } = req.query;
  if (!account) return res.status(400).json({ message: "Thiếu account" });

  try {
    const stats = {};
    const now = new Date();

    const formatDate = (d) => d.toISOString().slice(0, 10);

    const today = formatDate(now);
    const yesterday = formatDate(new Date(now.getTime() - 86400000));
    const last7days = formatDate(new Date(now.getTime() - 86400000 * 7));
    const last30days = formatDate(new Date(now.getTime() - 86400000 * 30));

    const [[{ countToday }]] = await db.query(
      "SELECT COUNT(*) AS countToday FROM search_logs WHERE account = ? AND DATE(timestamp) = ?",
      [account, today]
    );
    const [[{ countYesterday }]] = await db.query(
      "SELECT COUNT(*) AS countYesterday FROM search_logs WHERE account = ? AND DATE(timestamp) = ?",
      [account, yesterday]
    );
    const [[{ count7 }]] = await db.query(
      "SELECT COUNT(*) AS count7 FROM search_logs WHERE account = ? AND timestamp >= ?",
      [account, last7days]
    );
    const [[{ count30 }]] = await db.query(
      "SELECT COUNT(*) AS count30 FROM search_logs WHERE account = ? AND timestamp >= ?",
      [account, last30days]
    );

    res.json({
      today: countToday,
      yesterday: countYesterday,
      last7days: count7,
      last30days: count30,
    });
  } catch (err) {
    console.error("❌ Lỗi thống kê search logs:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
