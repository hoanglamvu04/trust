const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratingController');

router.get('/:account', controller.getRatingSummary);
router.post('/:account', controller.vote);
router.post('/:account/unvote', controller.unvote);

module.exports = router;
