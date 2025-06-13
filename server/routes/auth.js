const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 📌 Đăng ký tài khoản
router.post('/register', authController.register);

// 📌 Đăng nhập
router.post('/login', authController.login);

// 📌 Lấy thông tin người dùng hiện tại (kèm alias nếu truyền reportId)
router.get('/me', authController.getCurrentUser);

// 📌 Đăng xuất
router.post('/logout', authController.logout);

module.exports = router;
