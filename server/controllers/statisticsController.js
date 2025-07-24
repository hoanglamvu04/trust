const db = require('../db');

// 1. Top 5 tài khoản bị cảnh báo nhiều nhất
exports.topReportedAccounts = async (req, res) => {
  const [rows] = await db.query(`
    SELECT accountNumber, accountName, COUNT(*) AS reportCount
    FROM reports WHERE status = 'approved'
    GROUP BY accountNumber, accountName
    ORDER BY reportCount DESC LIMIT 5
  `);
  res.json(rows);
};

// 2. 3 bài cảnh báo mới nhất
exports.latestReports = async (req, res) => {
  const [rows] = await db.query(`
    SELECT * FROM reports
    WHERE status = 'approved'
    ORDER BY createdAt DESC LIMIT 3
  `);
  res.json(rows);
};

// 3. 5 bình luận mới nhất
exports.latestComments = async (req, res) => {
  const [rows] = await db.query(`
    SELECT c.*, u.nickname
    FROM comments c LEFT JOIN users u ON c.userId = u.id
    ORDER BY c.createdAt DESC LIMIT 5
  `);
  res.json(rows);
};

// Lấy 5 STK được tra cứu nhiều nhất từ bảng search_logs
exports.topSearchedAccounts = async (req, res) => {
  const [rows] = await db.query(`
    SELECT account AS accountNumber, COUNT(*) AS searchCount
    FROM search_logs
    GROUP BY account
    ORDER BY searchCount DESC LIMIT 5
  `);
  res.json(rows);
};