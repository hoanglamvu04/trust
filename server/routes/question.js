const express = require("express");
const router = express.Router();
const controller = require("../controllers/questionController");

// GET /api/questions?test_id=...
router.get("/", controller.getQuestions);

module.exports = router;
