const express = require("express");
const router = express.Router();
const controller = require("../controllers/testController");

// GET /api/tests?category_id=...
router.get("/", controller.getTests);

// GET /api/tests/top?limit=5
router.get("/top", controller.getTopTests);

module.exports = router;
