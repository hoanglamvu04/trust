const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryController");

// GET /api/categories
router.get("/", controller.getCategories);

module.exports = router;
