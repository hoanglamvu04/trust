const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminReportController");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/verifyToken");

// Đặt verifyToken TRƯỚC upload.array(...) để có req.user trước khi xử lý controller
router.get("/", verifyToken, controller.getReports);
router.get("/:id", verifyToken, controller.getReportById);
router.post("/", verifyToken, upload.array("proofs"), controller.createReport);
router.put("/:id", verifyToken, upload.array("proofs"), controller.updateReport);
router.put("/:id/approve", verifyToken, controller.approveReport);
router.delete("/:id", verifyToken, controller.deleteReport);

module.exports = router;
