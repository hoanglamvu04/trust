const express = require('express');
const router = express.Router();
const controller = require('../controllers/searchLogController');

router.get('/', controller.getAllSearchLogs);     // Tuỳ chọn dùng
router.post('/', controller.createSearchLog);

module.exports = router;
