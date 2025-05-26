const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportDetailController');

router.get('/:reportId', controller.getDetailsByReportId);
router.post('/', controller.createReportDetail);

module.exports = router;
