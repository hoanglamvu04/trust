const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminTestController");
const verifyToken = require("../middlewares/verifyToken");

// Lấy danh sách tất cả tests (phân trang, lọc, search)
router.get("/", verifyToken, controller.getTests);

// Lấy chi tiết 1 test (nếu cần)
router.get("/:id", verifyToken, controller.getTestById);

// Thêm test mới
router.post("/", verifyToken, controller.createTest);

// Cập nhật test
router.put("/:id", verifyToken, controller.updateTest);

// Xoá test
router.delete("/:id", verifyToken, controller.deleteTest);

module.exports = router;
