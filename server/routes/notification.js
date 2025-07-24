const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

// Yêu cầu đăng nhập cho tất cả route cần bảo vệ
router.get('/', controller.requireLogin, controller.getNotificationsByUser);
router.post('/', controller.createNotification);
router.patch('/:id/read', controller.requireLogin, controller.markAsRead);

// Gọi 2 controller mới
router.delete('/:id', controller.requireLogin, controller.deleteNotificationById);
router.delete('/', controller.requireLogin, controller.deleteAllNotificationsByType);

module.exports = router;
