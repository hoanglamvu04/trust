const express = require('express');
const router = express.Router();
const trustScoreController = require('../controllers/trustScoreController');

router.post('/', trustScoreController.checkTrustScore);

module.exports = router;
