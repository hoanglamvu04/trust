const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

router.get('/', controller.getAllReports);
router.get('/:id', controller.getReportById);
router.post('/', controller.createReport);
router.put('/:id/status', controller.updateReportStatus);
router.put('/:id', controller.updateReportContent);
router.patch('/:id/view', controller.incrementViews);
router.get('/account/:accountNumber', controller.getReportsByAccountNumber);

module.exports = router;
