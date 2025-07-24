const db = require("../db");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ✅ Lấy danh sách reports (admin)
exports.getReports = async (req, res) => {
  const { search = "", status = "", page = 1 } = req.query;
  const limit = 30;
  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push("status = ?");
      values.push(status);
    }
    if (search) {
      conditions.push(`(
        accountName LIKE ? OR
        accountNumber LIKE ?
      )`);
      values.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM reports ${whereClause}`, values);
    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT * FROM reports ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({ success: true, reports: rows, total });
  } catch (err) {
    console.error("❌ getReports error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Tạo report mới
exports.createReport = async (req, res) => {
  try {
    const {
      accountName, accountNumber, bank, facebookLink, content,
      reporterName, zalo, confirm, category
    } = req.body;

    // ✅ Lấy userId từ token hoặc session
    const userId = req.user?.id || req.session?.user?.id;
    console.log("📌 createReport - userId:", userId);

    if (!userId || !accountName || !accountNumber || !bank || !content || !reporterName) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });
    }

    const id = uuidv4();
    const folder = path.join(__dirname, "..", "uploads", "reports", id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const proofUrls = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const dest = path.join(folder, file.originalname);
        fs.renameSync(file.path, dest);
        proofUrls.push(file.originalname);
      }
    }

    await db.query(
      `INSERT INTO reports (
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        proof, status, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
      [
        id, accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        JSON.stringify(proofUrls), userId
      ]
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error("❌ createReport error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

// ✅ Cập nhật report
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountName, accountNumber, bank, facebookLink,
      content, reporterName, zalo, confirm, category,
      deletedImages = "[]"
    } = req.body;

    const deleted = JSON.parse(deletedImages);
    const uploadedFiles = req.files || [];

    const folder = path.join(__dirname, "..", "uploads", "reports", id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const [rows] = await db.query("SELECT proof FROM reports WHERE id = ?", [id]);
    const existingProofs = rows[0]?.proof ? JSON.parse(rows[0].proof) : [];

    for (const filename of deleted) {
      const filePath = path.join(folder, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const keptProofs = existingProofs.filter(name => !deleted.includes(name));

    const newProofs = [];
    for (const file of uploadedFiles) {
      const destPath = path.join(folder, file.originalname);
      fs.renameSync(file.path, destPath);
      newProofs.push(file.originalname);
    }

    const finalProofs = [...keptProofs, ...newProofs];

    await db.query(
      `UPDATE reports SET 
        accountName = ?, accountNumber = ?, bank = ?, facebookLink = ?,
        content = ?, reporterName = ?, zalo = ?, confirm = ?, category = ?,
        proof = ?
      WHERE id = ?`,
      [
        accountName, accountNumber, bank, facebookLink,
        content, reporterName, zalo, confirm, category,
        JSON.stringify(finalProofs), id
      ]
    );

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ updateReport error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

// ✅ Xoá report
exports.deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    const folder = path.join(__dirname, "..", "uploads", "reports", id);
    if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });

    await db.query("DELETE FROM reports WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ deleteReport error:", err);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// ✅ Duyệt / từ chối report
// ✅ Duyệt / từ chối report + gửi thông báo
exports.approveReport = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const senderId = req.session?.user?.id || null; // ✅ lấy admin id

  try {
    const [[report]] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);
    if (!report) return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo!" });

    // Cập nhật trạng thái
    await db.query(
      `UPDATE reports SET status = ?, rejectionReason = ? WHERE id = ?`,
      [status, status === "rejected" ? rejectionReason : null, id]
    );

    // ✅ Gửi thông báo cho người gửi báo cáo
    const notificationId = uuidv4();
    const content =
      status === "approved"
        ? "✅ Báo cáo của bạn đã được duyệt thành công. Cảm ơn bạn đã đóng góp!"
        : `❌ Báo cáo của bạn bị từ chối. Lý do: ${rejectionReason || "Không rõ"}`;

    const link = `/report/${report.id}`;

    await db.query(
      `INSERT INTO notifications (id, userId, senderId, type, content, link, isRead, createdAt)
       VALUES (?, ?, ?, 'report', ?, ?, 0, NOW())`,
      [notificationId, report.userId, senderId, content, link]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ approveReport error:", err);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// ✅ Xem chi tiết báo cáo
exports.getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[report]] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);
    if (!report) return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo!" });
    res.json({ success: true, report });
  } catch (err) {
    console.error("❌ getReportById error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};
