const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Đăng ký
exports.register = async (req, res) => {
  const { username, name, email, password, confirmPassword } = req.body;

  if (!username || !name || !email || !password || !confirmPassword)
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });

  if (password !== confirmPassword)
    return res.status(400).json({ success: false, message: 'Mật khẩu không khớp!' });

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0)
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại!' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query(
      'INSERT INTO users (id, username, name, email, password) VALUES (?, ?, ?, ?, ?)',
      [id, username, name, email, hashed]
    );

    res.json({ success: true, message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('❌ register error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại.' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Thiếu tên đăng nhập hoặc mật khẩu.' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0)
      return res.status(400).json({ success: false, message: 'Tên đăng nhập không tồn tại.' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Mật khẩu không đúng.' });

   const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId }, 
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // nếu HTTPS thì set true
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        roleId: user.roleId,
      }
    });
  } catch (err) {
    console.error('❌ login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập!' });
  }
};

// Lấy thông tin user hiện tại từ token
exports.getCurrentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const [users] = await db.query(
      'SELECT id, username, name, email, createdAt, roleId FROM users WHERE id = ?',
      [decoded.id]
    );
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token').json({ success: true, message: 'Đăng xuất thành công!' });
};
