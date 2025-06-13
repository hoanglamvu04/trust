const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const getIp = require('../middlewares/getIp');

// Lấy tổng số sao theo accountNumber
exports.getRatingSummary = async (req, res) => {
  const { account } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM ratings WHERE accountNumber = ?', [account]);
    if (rows.length === 0) {
      return res.json({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    }
    const r = rows[0];
    res.json({
      1: r.rating_1,
      2: r.rating_2,
      3: r.rating_3,
      4: r.rating_4,
      5: r.rating_5
    });
  } catch (err) {
    console.error("❌ Lỗi lấy rating:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Vote sao hoặc cập nhật sao mới
exports.vote = async (req, res) => {
  const { account } = req.params;
  const { rating, userId } = req.body;
  const ip = getIp(req);

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating không hợp lệ!" });
  }

  try {
    // Kiểm tra đã từng vote chưa
    const [logRows] = await db.query(
      'SELECT * FROM rating_logs WHERE accountNumber = ? AND (userId = ? OR ip = ?)',
      [account, userId || null, ip]
    );

    if (logRows.length > 0) {
      const prevRating = logRows[0].rating;

      if (prevRating === rating) {
        return res.json({ message: "Bạn đã vote rồi!" });
      }

      // Giảm điểm cũ
      await db.query(
        `UPDATE ratings SET rating_${prevRating} = GREATEST(rating_${prevRating} - 1, 0) WHERE accountNumber = ?`,
        [account]
      );

      // Tăng điểm mới
      await db.query(
        `UPDATE ratings SET rating_${rating} = rating_${rating} + 1 WHERE accountNumber = ?`,
        [account]
      );

      // Cập nhật log
      await db.query(
        `UPDATE rating_logs SET rating = ?, updatedAt = CURRENT_TIMESTAMP WHERE accountNumber = ? AND (userId = ? OR ip = ?)`,
        [rating, account, userId || null, ip]
      );

      return res.json({ message: "Đã cập nhật đánh giá!" });
    }

    // Nếu chưa vote lần nào:
    // 1. Tạo record ratings nếu chưa có
    const [ratingRow] = await db.query('SELECT * FROM ratings WHERE accountNumber = ?', [account]);
    if (ratingRow.length === 0) {
      await db.query(
        `INSERT INTO ratings (accountNumber, rating_${rating}) VALUES (?, 1)`,
        [account]
      );
    } else {
      await db.query(
        `UPDATE ratings SET rating_${rating} = rating_${rating} + 1 WHERE accountNumber = ?`,
        [account]
      );
    }

    // 2. Ghi log
    await db.query(
      `INSERT INTO rating_logs (id, userId, accountNumber, rating, ip, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [uuidv4(), userId || null, account, rating, ip]
    );

    res.status(201).json({ message: "Đã vote!" });
  } catch (err) {
    console.error("❌ Lỗi vote:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Huỷ vote
exports.unvote = async (req, res) => {
  const { account } = req.params;
  const { rating, userId } = req.body;
  const ip = getIp(req);

  try {
    // Kiểm tra log
    const [logs] = await db.query(
      'SELECT * FROM rating_logs WHERE accountNumber = ? AND (userId = ? OR ip = ?)',
      [account, userId || null, ip]
    );

    if (logs.length === 0) {
      return res.status(404).json({ message: "Bạn chưa từng vote!" });
    }

    const prevRating = logs[0].rating;

    // Giảm điểm
    await db.query(
      `UPDATE ratings SET rating_${prevRating} = GREATEST(rating_${prevRating} - 1, 0) WHERE accountNumber = ?`,
      [account]
    );

    // Xoá log
    await db.query(
      'DELETE FROM rating_logs WHERE accountNumber = ? AND (userId = ? OR ip = ?)',
      [account, userId || null, ip]
    );

    res.json({ message: "Đã huỷ vote!" });
  } catch (err) {
    console.error("❌ Lỗi unvote:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
