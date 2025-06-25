const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/:reportId', controller.getCommentsByReport);            // Xem comment vẫn công khai

// Tất cả các route còn lại phải xác thực
router.post('/', verifyToken, controller.createComment);
router.put('/:commentId/like', verifyToken, controller.toggleLike);
router.put('/:commentId/reply', verifyToken, controller.replyToComment);
router.delete('/:commentId', verifyToken, controller.deleteComment);
router.delete('/:commentId/reply/:replyIndex', verifyToken, controller.deleteReply);
router.get("/user", verifyToken, controller.getCommentsByUser);

module.exports = router;
