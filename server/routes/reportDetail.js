const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportDetailController');

// Lấy báo cáo theo ID từ bảng 'reports'
router.get('/:reportId', controller.getReportDetail);

// (Tùy chọn) nếu bạn vẫn dùng bảng report_details
router.post('/', controller.createReportDetail);

module.exports = router;
