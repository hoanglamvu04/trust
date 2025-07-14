const express = require('express');
const router = express.Router();
const controller = require('../controllers/userResultController');
const verifyToken = require('../middlewares/verifyToken');

// Gửi từng câu trả lời (lưu kết quả)
router.post('/submit', verifyToken, controller.submitResult);

// Lấy chi tiết kết quả của 1 session
router.get('/session-detail', verifyToken, controller.getSessionResults);

// Lấy tất cả kết quả (cho admin)
router.get('/all', verifyToken, controller.getAllResults);

module.exports = router;
