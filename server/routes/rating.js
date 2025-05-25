const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratingController');

router.get('/:accountNumber', controller.getRatingByAccountNumber);
router.post('/', controller.submitRating);

module.exports = router;
