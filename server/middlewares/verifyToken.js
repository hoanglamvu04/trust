const jwt = require('jsonwebtoken');
const db = require('../db'); // Nhớ require db kết nối

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;

    // Lấy thông tin user hiện tại từ DB để kiểm tra status và tokenVersion
    const [rows] = await db.query('SELECT status, tokenVersion FROM users WHERE id = ?', [decoded.id]);
    const userDb = rows[0];

    if (!userDb) {
      res.clearCookie('token');
      if (req.session) req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: 'Không tìm thấy user!' });
    }

    // Kiểm tra trạng thái bị khóa
    if (userDb.status !== 1) {
      res.clearCookie('token');
      if (req.session) req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa hoặc không còn hoạt động!' });
    }

    // Kiểm tra tokenVersion (cưỡng chế đăng xuất khi đổi mật khẩu hoặc bị admin khóa)
    if (
      typeof decoded.tokenVersion !== "undefined" &&
      userDb.tokenVersion !== decoded.tokenVersion
    ) {
      res.clearCookie('token');
      if (req.session) req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!' });
    }

    // ✅ Tự động khôi phục session nếu mất
    if (!req.session.user) {
      req.session.user = {
        id: decoded.id,
        username: decoded.username,
        roleId: decoded.roleId,
      };
      console.log("✅ Session.user khôi phục từ token:", req.session.user);
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
  }
};

module.exports = verifyToken;
