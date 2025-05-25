const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả tài khoản Facebook
exports.getAllFacebookAccounts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM facebook_accounts');
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy facebook accounts:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Thêm tài khoản Facebook mới
exports.createFacebookAccount = async (req, res) => {
  const { username, facebookId } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO facebook_accounts (id, username, facebookId) VALUES (?, ?, ?)',
      [id, username, facebookId]
    );
    res.status(201).json({ message: 'Thêm thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi thêm facebook account:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xoá tài khoản Facebook theo ID
exports.deleteFacebookAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM facebook_accounts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }
    res.json({ message: 'Đã xoá tài khoản.' });
  } catch (err) {
    console.error('❌ Lỗi xoá facebook account:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
