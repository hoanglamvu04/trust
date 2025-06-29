const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, userController.getAllUsers);
router.put('/nickname', verifyToken, userController.updateNickname); 
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.patch('/:id/status', verifyToken, userController.updateUserStatus);
router.post("/users/:id/reset-password", userController.resetPassword);

module.exports = router;
