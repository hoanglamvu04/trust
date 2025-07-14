const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminQuestionController");
const verifyToken = require("../middlewares/verifyToken");

// Danh sách câu hỏi (phân trang, search, filter test)
router.get("/", verifyToken, controller.getQuestions);

// Chi tiết 1 câu hỏi
router.get("/:id", verifyToken, controller.getQuestionById);

// Thêm mới
router.post("/", verifyToken, controller.createQuestion);

// Sửa
router.put("/:id", verifyToken, controller.updateQuestion);

// Xoá
router.delete("/:id", verifyToken, controller.deleteQuestion);

module.exports = router;
