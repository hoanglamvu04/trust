const express = require('express');
const router = express.Router();
const controller = require('../controllers/searchLogController');

router.get('/', controller.getAllSearchLogs);     
router.post('/', controller.createSearchLog);
router.get('/stats', controller.getSearchStats);  

module.exports = router;
