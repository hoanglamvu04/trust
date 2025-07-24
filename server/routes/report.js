const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const verifyToken = require('../middlewares/verifyToken');

router.get("/", verifyToken, controller.getMyReports);
router.get('/all', controller.getAllReports); 
router.get('/:id', verifyToken, controller.getReportById);
router.post('/', controller.createReport);
router.put('/:id/status', controller.updateReportStatus);
router.put('/:id', controller.updateReportContent);
router.patch('/:id/view', controller.incrementViews);
router.get('/account/:accountNumber', controller.getReportsByAccountNumber);

module.exports = router;
