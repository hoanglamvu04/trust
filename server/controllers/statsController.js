const db = require('../db');

// ✅ Thống kê dành cho client (trang check-account)
exports.getStats = async (req, res) => {
  try {
    const [[{ accounts }]] = await db.query('SELECT COUNT(*) AS accounts FROM reports WHERE status = "approved"');
    const [[{ comments }]] = await db.query('SELECT COUNT(*) AS comments FROM comments');
    const [[{ pending }]] = await db.query('SELECT COUNT(*) AS pending FROM reports WHERE status = "pending"');

    res.json({
      success: true,
      data: { accounts, comments, pending }
    });
  } catch (err) {
    console.error('❌ Lỗi lấy stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Thống kê dành cho admin dashboard
exports.getAdminStats = async (req, res) => {
  try {
    const [[{ userCount }]] = await db.query('SELECT COUNT(*) AS userCount FROM users');
    const [[{ commentCount }]] = await db.query('SELECT COUNT(*) AS commentCount FROM comments');
    const [[{ reportCount }]] = await db.query('SELECT COUNT(*) AS reportCount FROM reports WHERE status = "pending"');
    const [[{ approvedReports }]] = await db.query('SELECT COUNT(*) AS approvedReports FROM reports WHERE status = "approved"');
    const [[{ contactCount }]] = await db.query('SELECT COUNT(*) AS contactCount FROM contacts');
    const [[{ reportedAccountsCount }]] = await db.query('SELECT COUNT(DISTINCT accountNumber) AS reportedAccountsCount FROM reports');

    res.json({
      success: true,
      data: {
        userCount,
        commentCount,
        reportCount,
        approvedReports,
        contactCount,
        reportedAccountsCount
      }
    });
  } catch (err) {
    console.error('❌ Lỗi lấy admin stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
