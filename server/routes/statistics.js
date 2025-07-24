const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/top-reported', statisticsController.topReportedAccounts);
router.get('/latest-reports', statisticsController.latestReports);
router.get('/latest-comments', statisticsController.latestComments);
router.get('/top-searched', statisticsController.topSearchedAccounts);

module.exports = router;
