const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả tài khoản
exports.getAllAccounts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM accounts ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

exports.createAccount = async (req, res) => {
  const { name, phone, accountNumber } = req.body;
  const id = uuidv4();

  try {
    await db.query(
      'INSERT INTO accounts (id, name, phone, accountNumber) VALUES (?, ?, ?, ?)',
      [id, name, phone, accountNumber]
    );
    res.status(201).json({ message: 'Thêm tài khoản thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi thêm tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xoá tài khoản theo ID
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM accounts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }
    res.json({ message: 'Đã xoá tài khoản.' });
  } catch (err) {
    console.error('❌ Lỗi xoá tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Lấy tài khoản theo ID
exports.getAccountById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM accounts WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Lỗi lấy tài khoản:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

