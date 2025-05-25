const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router.get('/:reportId', controller.getCommentsByReport);
router.post('/', controller.createComment);
router.put('/:commentId/like', controller.toggleLike);
router.put('/:commentId/reply', controller.replyToComment);

module.exports = router;
