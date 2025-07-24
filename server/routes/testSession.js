const express = require("express");
const router = express.Router();
const controller = require("../controllers/testSessionController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/start", verifyToken, controller.startSession);
router.post("/answer", verifyToken, controller.submitResult);  // Sửa lại path này!
router.get("/", verifyToken, controller.getSessions);
router.get("/detail", verifyToken, controller.getSessionDetail);
router.post("/submit", verifyToken, controller.submitSession); // Để nguyên
router.post("/finish", verifyToken, controller.finishSession);

module.exports = router;
