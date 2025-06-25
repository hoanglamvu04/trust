const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy thông tin người dùng hiện tại (bắt buộc xác thực)
router.get('/me', verifyToken, authController.getCurrentUser);

// Đăng xuất
router.post('/logout', authController.logout);

module.exports = router;
