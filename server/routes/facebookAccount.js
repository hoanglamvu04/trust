const express = require('express');
const router = express.Router();
const controller = require('../controllers/facebookAccountController');

router.get('/', controller.getAllFacebookAccounts);
router.post('/', controller.createFacebookAccount);
router.delete('/:id', controller.deleteFacebookAccount);

module.exports = router;
