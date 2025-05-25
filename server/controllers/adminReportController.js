const db = require("../db");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Lấy danh sách reports (admin)
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

// Tạo report mới (admin) — lưu ảnh vào thư mục riêng
exports.createReport = async (req, res) => {
  try {
    const {
      accountName, accountNumber, bank, facebookLink, content,
      reporterName, zalo, confirm, category, userId
    } = req.body;

    if (!accountName || !accountNumber || !bank || !content || !reporterName) {
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
        proofUrls.push(file.originalname); // chỉ lưu tên file
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

// Cập nhật report (đã xử lý ảnh bị xóa + ảnh mới)
// Cập nhật report (lưu ảnh mới đúng thư mục, xóa ảnh cũ bị loại bỏ)
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

    // Load các ảnh cũ đang lưu trong CSDL
    const [rows] = await db.query("SELECT proof FROM reports WHERE id = ?", [id]);
    const existingProofs = rows[0]?.proof ? JSON.parse(rows[0].proof) : [];

    // 1. Xoá các ảnh cũ bị người dùng xóa
    for (const filename of deleted) {
      const filePath = path.join(folder, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // 2. Lọc ảnh cũ còn giữ lại
    const keptProofs = existingProofs.filter(name => !deleted.includes(name));

    // 3. Di chuyển ảnh mới từ tmp vào thư mục /reports/:id/
    const newProofs = [];
    for (const file of uploadedFiles) {
      const destPath = path.join(folder, file.originalname);
      fs.renameSync(file.path, destPath);
      newProofs.push(file.originalname); // chỉ lưu tên file
    }

    // 4. Gộp lại danh sách ảnh
    const finalProofs = [...keptProofs, ...newProofs];

    // 5. Cập nhật CSDL
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


// Xoá report + ảnh
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

// Duyệt / từ chối report
exports.approveReport = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    await db.query(
      `UPDATE reports SET status=?, rejectionReason=? WHERE id=?`,
      [status, status === "rejected" ? rejectionReason : null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ approveReport error:", err);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Xem chi tiết báo cáo
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

