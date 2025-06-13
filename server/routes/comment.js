const express = require('express');
const router = express.Router();
const controller = require('../controllers/commentController');

router.get('/:reportId', controller.getCommentsByReport);           
router.post('/', controller.createComment);                          
router.put('/:commentId/like', controller.toggleLike);              
router.put('/:commentId/reply', controller.replyToComment);         
router.delete('/:commentId', controller.deleteComment);             
router.delete('/:commentId/reply/:replyIndex', controller.deleteReply); 
router.get("/user", controller.getCommentsByUser);

module.exports = router;
