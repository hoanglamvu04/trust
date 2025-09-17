const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Helpers
const getRolePriority = (roleId) => parseInt(roleId);

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, name, email, nickname, status, roleId, createdAt FROM users ORDER BY createdAt DESC`
    );
    res.json({ success: true, users });
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Lấy user theo ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, username, name, email, nickname, status, roleId, createdAt FROM users WHERE id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Lỗi lấy user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Tạo tài khoản người dùng
exports.createUser = async (req, res) => {
  const { username, name, email, password, nickname, status, roleId, diachi } = req.body;
  const id = uuidv4();
  const safeRoleId = parseInt(roleId);
  const finalRoleId = [1, 2, 3].includes(safeRoleId) ? safeRoleId : 4;
  const userStatus = (status === 2 || status === "2") ? 2 : 1;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (id, username, name, email, password, nickname, status, roleId, tokenVersion, diaChi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [id, username, name, email, hashedPassword, nickname, userStatus, finalRoleId]
    );

    res.status(201).json({ success: true, message: 'Tạo user thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi tạo user:', err);
    res.status(500).json({ success: false, message: 'Email hoặc username đã tồn tại!' });
  }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, name, email, password, nickname, status, roleId } = req.body;
  const currentUser = req.user;

  try {
    const [[targetUser]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) return res.status(404).json({ message: 'Không tìm thấy user!' });

    if (
      getRolePriority(currentUser.roleId) > 1 &&
      getRolePriority(targetUser.roleId) <= 2 &&
      currentUser.id !== targetUser.id
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa user cấp cao hơn!' });
    }

    let query = 'UPDATE users SET username = ?, name = ?, email = ?, nickname = ?';
    const params = [username, name, email, nickname];
    let needIncreaseToken = false;

    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashed);
      needIncreaseToken = true;
    }

    if (status !== undefined) {
      const safeStatus = (parseInt(status) === 2) ? 2 : 1;
      query += ', status = ?';
      params.push(safeStatus);
      needIncreaseToken = true;
    }

    if (roleId !== undefined) {
      query += ', roleId = ?';
      params.push(roleId);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);

    if (needIncreaseToken) {
      await db.query('UPDATE users SET tokenVersion = tokenVersion + 1 WHERE id = ?', [id]);
    }

    const [[updated]] = await db.query(
      'SELECT id, username, name, email, nickname, status, roleId FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('❌ Lỗi cập nhật user:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
};

// Cập nhật trạng thái user
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;
  status = (parseInt(status) === 2) ? 2 : 1;

  try {
    const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy user!' });

    await db.query('UPDATE users SET tokenVersion = tokenVersion + 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công.', status });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  try {
    const [[target]] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!target) return res.status(404).json({ message: 'Không tìm thấy user!' });

    const isSelf = currentUser.id === target.id;
    const isAdmin = getRolePriority(currentUser.roleId) <= 2;
    const isSuperAdmin = currentUser.roleId === 1;

    if (!isSuperAdmin && (!isSelf || getRolePriority(target.roleId) < getRolePriority(currentUser.roleId))) {
      return res.status(403).json({ message: 'Không đủ quyền xoá user này!' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xoá user.' });
  } catch (err) {
    console.error('❌ Lỗi xoá user:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

// Cập nhật nickname
exports.updateNickname = async (req, res) => {
  const userId = req.user.id;
  const { nickname } = req.body;

  if (!nickname || !nickname.trim())
    return res.status(400).json({ success: false, message: "Vui lòng nhập biệt danh!" });

  try {
    const [[user]] = await db.query(
      "SELECT nickname, nicknameUpdatedAt FROM users WHERE id = ?",
      [userId]
    );

    if (user.nickname === nickname.trim()) {
      return res.status(400).json({ success: false, message: "Biệt danh không có thay đổi." });
    }

    // Kiểm tra thời gian đổi gần nhất
    if (user.nicknameUpdatedAt) {
      const lastUpdate = new Date(user.nicknameUpdatedAt);
      const now = new Date();
      const diffInDays = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
      const nextAllowed = new Date(lastUpdate.getTime() + 14 * 24 * 60 * 60 * 1000);

      if (diffInDays < 14) {
        return res.status(400).json({
          success: false,
          blockUntil: nextAllowed.toISOString(),
          message: `Bạn chỉ được đổi biệt danh mỗi 14 ngày. Hãy thử lại sau ngày ${nextAllowed.toLocaleDateString("vi-VN")}.`,
        });
      }
    }

    // Kiểm tra trùng biệt danh
    const [exist] = await db.query(
      "SELECT id FROM users WHERE nickname = ? AND id != ?",
      [nickname.trim(), userId]
    );
    if (exist.length > 0) {
      return res.status(400).json({ success: false, message: "Biệt danh đã tồn tại." });
    }

    await db.query(
      "UPDATE users SET nickname = ?, nicknameUpdatedAt = NOW() WHERE id = ?",
      [nickname.trim(), userId]
    );

    res.json({ success: true, message: "Cập nhật biệt danh thành công!", nickname });
  } catch (err) {
    console.error("❌ updateNickname error:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};



// Reset mật khẩu user (API)
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;
  if (parseInt(currentUser.roleId) > 2)
    return res.status(403).json({ message: "Bạn không có quyền reset mật khẩu!" });

  const newPassword = "12345678"; // Hoặc random tùy bạn
  const hashed = await require('bcryptjs').hash(newPassword, 10);

  await db.query('UPDATE users SET password = ?, tokenVersion = tokenVersion + 1 WHERE id = ?', [hashed, id]);
  res.json({ success: true, message: `Đã reset mật khẩu user về: ${newPassword}` });
};
