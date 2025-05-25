const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminCommentController');

router.get('/', controller.getAdminComments);
router.post('/', controller.createAdminComment);
router.put('/:id', controller.updateAdminComment);
router.delete('/:id', controller.deleteAdminComment);

module.exports = router;
