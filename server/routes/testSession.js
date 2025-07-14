const express = require("express");
const router = express.Router();
const controller = require("../controllers/testSessionController");
const verifyToken = require("../middlewares/verifyToken");

// Tạo mới session (bắt đầu làm bài)
router.post("/start", verifyToken, controller.startSession);

router.post("/submit", verifyToken, controller.submitResult);

// Lấy danh sách các session (lần làm bài)
router.get("/", verifyToken, controller.getSessions);

// Lấy chi tiết 1 session
router.get("/detail", verifyToken, controller.getSessionDetail);

router.post("/submit", verifyToken, controller.submitSession);
router.post("/finish", verifyToken, controller.finishSession); // Nộp bài, update điểm

module.exports = router;
