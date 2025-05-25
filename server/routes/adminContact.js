const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminContactController');

router.get('/', controller.getAllContacts);
router.put('/:id/status', controller.updateContactStatus);

module.exports = router;
