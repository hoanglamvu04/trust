const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);
router.post('/logout', authController.logout);
module.exports = router;
