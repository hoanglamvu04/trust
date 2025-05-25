const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportDetailController');

router.post('/', controller.createReportDetail);
router.get('/:reportId', controller.getDetailsByReportId);

module.exports = router;
