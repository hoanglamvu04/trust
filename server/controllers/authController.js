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

    // tokenVersion mặc định là 1, nickname để rỗng khi đăng ký, bắt user tự cập nhật
    await db.query(
      'INSERT INTO users (id, username, name, email, password, status, roleId, tokenVersion, nickname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, username, name, email, hashed, 1, 4, 1, null]
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
    if (user.status !== 1) { // 1 là hoạt động, 2 là bị khóa
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Mật khẩu không đúng.' });

    // Tạo JWT với tokenVersion hiện tại
    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    // Gửi cookie JWT
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false // bật true nếu dùng HTTPS
    });

    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      roleId: user.roleId,
    };

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
        nickname: user.nickname || "", // Thêm nickname vào trả về
      }
    });
  } catch (err) {
    console.error('❌ login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập!' });
  }
};

// Lấy thông tin người dùng hiện tại (bắt buộc verifyToken trước khi vào hàm này!)
exports.getCurrentUser = async (req, res) => {
  const userId = req.user.id; // Lấy từ verifyToken middleware

  try {
    const [users] = await db.query(
      'SELECT id, username, name, email, createdAt, roleId, nickname FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    console.error('❌ getCurrentUser error:', err);
    res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.clearCookie('token');
  req.session.destroy(() => {
    res.json({ success: true, message: 'Đăng xuất thành công!' });
  });
};

// (Bạn có thể bổ sung thêm API updateNickname nếu muốn cho phép đổi biệt danh)
