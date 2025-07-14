const express = require('express');
const router = express.Router();
const adminCategoryController = require('../controllers/adminCategoryController');

router.get('/', adminCategoryController.getCategories);
router.post('/', adminCategoryController.createCategory);
router.put('/:id', adminCategoryController.updateCategory);
router.delete('/:id', adminCategoryController.deleteCategory);

module.exports = router;
