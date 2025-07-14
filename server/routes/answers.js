const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminAnswerController");
const verifyToken = require("../middlewares/verifyToken"); // Dùng xác thực user

// Lấy danh sách các lần làm bài (sessions + user + đề)
router.get("/", verifyToken, controller.getAnswerSessions);

// Lấy chi tiết từng lần làm bài (session_id)
router.get("/detail", verifyToken, controller.getAnswerSessionDetail);

module.exports = router;
