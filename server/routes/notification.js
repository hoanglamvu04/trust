const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

// Áp dụng middleware yêu cầu đăng nhập
router.get('/', controller.requireLogin, controller.getNotificationsByUser);
router.post('/', controller.createNotification);
router.patch('/:id/read', controller.requireLogin, controller.markAsRead);

module.exports = router;
