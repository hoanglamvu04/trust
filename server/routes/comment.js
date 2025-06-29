const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/my', verifyToken, controller.getCommentsByUser);
router.get('/:reportId', controller.getCommentsByReport);
router.post('/', verifyToken, controller.createComment);
router.put('/:commentId/like', verifyToken, controller.toggleLike);
router.put('/:commentId/reply', verifyToken, controller.replyToComment);
router.delete('/:commentId', verifyToken, controller.deleteComment);
router.delete('/:commentId/reply/:replyIndex', verifyToken, controller.deleteReply);

module.exports = router;
