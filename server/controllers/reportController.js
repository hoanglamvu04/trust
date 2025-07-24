const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification');

// 📌 Lấy tất cả báo cáo (mới nhất trước)
exports.getAllReports = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM (
        SELECT r.*, u.name AS userName
        FROM reports r 
        LEFT JOIN users u ON r.userId = u.id 
        ORDER BY r.createdAt DESC
      ) AS sub
      GROUP BY sub.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// 📌 Lấy báo cáo theo ID, có kiểm tra quyền riêng tư nếu chưa duyệt
exports.getReportById = async (req, res) => {
  const { id } = req.params;
  // Nếu chưa đăng nhập thì req.user có thể là undefined
  const userId = req.user?.id;

  try {
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);

    if (!rows || rows.length === 0) {
      console.warn("⚠️ Không tìm thấy báo cáo với id:", id);
      return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo!" });
    }

    const report = rows[0];

    // Nếu bài chưa duyệt, chỉ trả cho chủ bài
    if (report.status !== "approved") {
      // Nếu chưa đăng nhập hoặc không phải chủ bài thì từ chối
      if (!userId || userId !== report.userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập báo cáo này!"
        });
      }
    }

    // Trả ra dạng cũ FE đang dùng (nếu cần có success/report cho đồng bộ)
    res.json(report); // hoặc res.json({ success: true, report });

  } catch (err) {
    console.error("❌ getReportById error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!", error: err.message });
  }
};

// 📌 Gửi báo cáo mới
exports.createReport = async (req, res) => {
  const {
    accountName, accountNumber, bank, facebookLink,
    content, reporterName, zalo, confirm,
    category, proof, userId, agreedTerms
  } = req.body;

  const id = uuidv4();
  const status = 'pending';

  if (agreedTerms !== true) {
    return res.status(400).json({ message: 'Bạn cần đồng ý với điều khoản trước khi gửi.' });
  }

  try {
    await db.query(
      `INSERT INTO reports (
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category, proof,
        userId, status, createdAt, agreedTerms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        JSON.stringify(proof || []),
        userId || null,
        status,
        agreedTerms === true
      ]
    );

    if (userId) {
      await createNotification({
        userId,
        type: 'report',
        content: 'Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét và duyệt trong thời gian sớm nhất.',
        link: `/report/${id}`
      });
    }

    res.status(201).json({ message: 'Gửi báo cáo thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi gửi báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// 📌 Lấy danh sách báo cáo của riêng người dùng
exports.getMyReports = async (req, res) => {
  const userId = req.user?.id;
  try {
    const [reports] = await db.query('SELECT * FROM reports WHERE userId = ?', [userId]);
    res.json(reports);
  } catch (err) {
    console.error("❌ getMyReports error:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy report!" });
  }
};

// 📌 Cập nhật trạng thái báo cáo (admin duyệt / từ chối)
exports.updateReportStatus = async (req, res) => {
  const reportId = req.params.id;
  const { newStatus } = req.body;

  await db.query('UPDATE reports SET status = ? WHERE id = ?', [newStatus, reportId]);

  const [reportRows] = await db.query('SELECT id, userId, title FROM reports WHERE id = ?', [reportId]);
  if (!reportRows.length) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });

  const ownerId = reportRows[0].userId;
  const title = reportRows[0].title;

  let statusText = '';
  if (newStatus === 'approved') statusText = 'đã được duyệt';
  else if (newStatus === 'rejected') statusText = 'đã bị từ chối';
  else statusText = `cập nhật trạng thái: ${newStatus}`;

  await createNotification({
    userId: ownerId,
    type: 'report',
    content: `Bài viết "${title}" ${statusText}.`,
    link: `/report/${reportId}`,
  });

  res.json({ message: 'Cập nhật trạng thái thành công!' });
};

// 📌 Cập nhật nội dung báo cáo (admin chỉnh sửa)
exports.updateReportContent = async (req, res) => {
  const { id } = req.params;
  const {
    accountName, accountNumber, bank, facebookLink,
    content, reporterName, zalo, confirm,
    category, proof
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE reports SET
        accountName = ?, accountNumber = ?, bank = ?, facebookLink = ?,
        content = ?, reporterName = ?, zalo = ?, confirm = ?,
        category = ?, proof = ?
      WHERE id = ?`,
      [
        accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm,
        category, JSON.stringify(proof || []),
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo cáo!' });
    }

    res.json({ message: 'Cập nhật báo cáo thành công.' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật báo cáo:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// 📌 Tăng lượt xem
exports.incrementViews = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE reports SET views = views + 1 WHERE id = ?', [id]);
    res.json({ message: 'Đã tăng lượt xem!' });
  } catch (err) {
    console.error("❌ Lỗi tăng lượt xem:", err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// 📌 Lấy các báo cáo theo số tài khoản
exports.getReportsByAccountNumber = async (req, res) => {
  const { accountNumber } = req.params;
  if (!accountNumber) {
    return res.status(400).json({ message: "Thiếu số tài khoản!" });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM reports WHERE accountNumber = ?',
      [accountNumber]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy báo cáo theo account:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
