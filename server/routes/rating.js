const express = require('express');
const router = express.Router();
const voteController = require('../controllers/ratingController');
const verifyToken = require('../middlewares/verifyToken');

// Tổng hợp sao
router.get('/:account', voteController.getRatingSummary);
// Đã đăng nhập mới được vote/hủy vote
router.post('/:account/vote', verifyToken, voteController.vote);
router.post('/:account/unvote', verifyToken, voteController.unvote);
// Lấy vote hiện tại
router.get('/:account/my-vote', verifyToken, voteController.getMyVote);

module.exports = router;
