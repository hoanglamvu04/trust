const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;

    console.log("📌 Token nhận được:", token);     // ✅ đưa vào đây
    console.log("📌 Token decode:", decoded);

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
