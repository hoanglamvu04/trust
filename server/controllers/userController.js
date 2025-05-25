const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Helpers
const getRolePriority = (roleId) => {
  return parseInt(roleId); // Lower number = higher privilege
};

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, name, email, status, roleId, createdAt FROM users ORDER BY createdAt DESC`
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
      `SELECT id, username, name, email, status, roleId, createdAt FROM users WHERE id = ?`,
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

// Tạo tài khoản người dùng (có mã hóa)
exports.createUser = async (req, res) => {
  const { username, name, email, password, status = 'chưa xác thực', roleId } = req.body;
  const id = uuidv4();
  const safeRoleId = parseInt(roleId);
  const finalRoleId = [1, 2, 3].includes(safeRoleId) ? safeRoleId : 4;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (id, username, name, email, password, status, roleId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, username, name, email, hashedPassword, status, finalRoleId]
    );

    res.status(201).json({ success: true, message: 'Tạo user thành công!', id });
  } catch (err) {
    console.error('❌ Lỗi tạo user:', err);
    res.status(500).json({ success: false, message: 'Email hoặc username đã tồn tại!' });
  }
};

// Cập nhật người dùng (có mã hóa nếu thay đổi mật khẩu)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, name, email, password, status, roleId } = req.body;
  const currentUser = req.user; // Gán từ middleware auth

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

    let query = 'UPDATE users SET username = ?, name = ?, email = ?';
    const params = [username, name, email];

    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashed);
    }
    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    if (roleId !== undefined) {
      query += ', roleId = ?';
      params.push(roleId);
    }
    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);

    const [[updated]] = await db.query(
      'SELECT id, username, name, email, status, roleId FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('❌ Lỗi cập nhật user:', err);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
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

// Cập nhật trạng thái
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatus = ['chưa xác thực', 'đã xác thực', 'bị khóa'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
  }

  try {
    const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy user!' });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công.', status });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
