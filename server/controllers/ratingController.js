const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tổng số sao theo accountNumber
exports.getRatingSummary = async (req, res) => {
  const { account } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN rating = 1 THEN 1 END), 0) AS rating_1,
        COALESCE(SUM(CASE WHEN rating = 2 THEN 1 END), 0) AS rating_2,
        COALESCE(SUM(CASE WHEN rating = 3 THEN 1 END), 0) AS rating_3,
        COALESCE(SUM(CASE WHEN rating = 4 THEN 1 END), 0) AS rating_4,
        COALESCE(SUM(CASE WHEN rating = 5 THEN 1 END), 0) AS rating_5
      FROM user_votes
      WHERE accountNumber = ?
    `, [account]);

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

// Vote hoặc cập nhật vote
exports.vote = async (req, res) => {
  const { account } = req.params;
  const { rating } = req.body;
  const userId = req.session.user && req.session.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để vote!" });
  }
  if (![1,2,3,4,5].includes(rating)) {
    return res.status(400).json({ message: "Rating không hợp lệ!" });
  }

  try {
    // Kiểm tra đã vote chưa
    const [[existing]] = await db.query(
      'SELECT rating FROM user_votes WHERE accountNumber = ? AND userId = ?',
      [account, userId]
    );

    if (existing) {
      if (existing.rating === rating) {
        return res.json({ message: "Bạn đã vote rồi!" });
      }
      // Cập nhật điểm cũ -> điểm mới trong bảng ratings
      await db.query(
        `UPDATE ratings 
         SET rating_${existing.rating} = GREATEST(rating_${existing.rating} - 1, 0)
         WHERE accountNumber = ?`,
        [account]
      );
      await db.query(
        `UPDATE ratings 
         SET rating_${rating} = rating_${rating} + 1
         WHERE accountNumber = ?`,
        [account]
      );
      // Update vote
      await db.query(
        `UPDATE user_votes 
         SET rating = ?, updatedAt = NOW()
         WHERE accountNumber = ? AND userId = ?`,
        [rating, account, userId]
      );
      return res.json({ message: "Đã cập nhật đánh giá!" });
    }

    // Nếu chưa từng vote lần nào
    // Tạo ratings nếu chưa có
    const [[r0]] = await db.query(
      'SELECT 1 FROM ratings WHERE accountNumber = ?',
      [account]
    );
    if (!r0) {
      await db.query(
        `INSERT INTO ratings 
           (accountNumber, rating_1, rating_2, rating_3, rating_4, rating_5)
         VALUES (?, 0, 0, 0, 0, 0)`,
        [account]
      );
    }
    // Tăng điểm
    await db.query(
      `UPDATE ratings 
         SET rating_${rating} = rating_${rating} + 1
       WHERE accountNumber = ?`,
      [account]
    );
    // Ghi user_votes
    await db.query(
      `INSERT INTO user_votes 
         (id, userId, accountNumber, rating, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [uuidv4(), userId, account, rating]
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
  const userId = req.session.user && req.session.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để huỷ vote!" });
  }

  try {
    // Kiểm tra đã vote chưa
    const [[existing]] = await db.query(
      'SELECT rating FROM user_votes WHERE accountNumber = ? AND userId = ?',
      [account, userId]
    );
    if (!existing) {
      return res.status(404).json({ message: "Bạn chưa từng vote!" });
    }
    // Giảm điểm
    await db.query(
      `UPDATE ratings 
         SET rating_${existing.rating} = GREATEST(rating_${existing.rating} - 1, 0)
       WHERE accountNumber = ?`,
      [account]
    );
    // Xoá vote
    await db.query(
      'DELETE FROM user_votes WHERE accountNumber = ? AND userId = ?',
      [account, userId]
    );
    res.json({ message: "Đã huỷ vote!" });
  } catch (err) {
    console.error("❌ Lỗi unvote:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
exports.getMyVote = async (req, res) => {
  const userId = req.session.user && req.session.user.id;
  const { account } = req.params;
  if (!userId) return res.json({ rating: 0 });
  const [[vote]] = await db.query(
    'SELECT rating FROM user_votes WHERE accountNumber = ? AND userId = ?',
    [account, userId]
  );
  res.json({ rating: vote ? vote.rating : 0 });
};
