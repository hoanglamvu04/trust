const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.get('/:userId', controller.getNotificationsByUser);
router.post('/', controller.createNotification);
router.put('/:id/read', controller.markAsRead);

module.exports = router;
