const db = require('../db');

// Lấy rating theo accountNumber
exports.getRatingByAccountNumber = async (req, res) => {
  const { accountNumber } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM ratings WHERE accountNumber = ?',
      [accountNumber]
    );
    if (rows.length === 0) {
      return res.json({
        accountNumber,
        rating_1: 0,
        rating_2: 0,
        rating_3: 0,
        rating_4: 0,
        rating_5: 0,
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Lỗi lấy đánh giá:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Gửi rating (1-5 sao) cho accountNumber
exports.submitRating = async (req, res) => {
  const { accountNumber, rating } = req.body;
  const ratingField = `rating_${rating}`;

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return res.status(400).json({ message: 'Rating phải từ 1 đến 5 sao!' });
  }

  try {
    // Nếu tồn tại → update
    const [rows] = await db.query('SELECT * FROM ratings WHERE accountNumber = ?', [accountNumber]);
    if (rows.length > 0) {
      await db.query(
        `UPDATE ratings SET ${ratingField} = ${ratingField} + 1 WHERE accountNumber = ?`,
        [accountNumber]
      );
    } else {
      // Nếu chưa có thì tạo mới với 1 rating tương ứng
      const newRating = { rating_1: 0, rating_2: 0, rating_3: 0, rating_4: 0, rating_5: 0 };
      newRating[ratingField] = 1;
      await db.query(
        `INSERT INTO ratings (accountNumber, rating_1, rating_2, rating_3, rating_4, rating_5)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [accountNumber, newRating.rating_1, newRating.rating_2, newRating.rating_3, newRating.rating_4, newRating.rating_5]
      );
    }
    res.json({ message: 'Đã ghi nhận đánh giá!' });
  } catch (err) {
    console.error('❌ Lỗi gửi đánh giá:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
