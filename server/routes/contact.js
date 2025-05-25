const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');

router.post('/send', controller.createContact);

module.exports = router;
