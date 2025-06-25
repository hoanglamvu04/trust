const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminReportController");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/verifyToken");

// ⚠️ Đảm bảo tất cả route đều xác thực đăng nhập qua verifyToken
// ⚠️ Nếu cần phân quyền admin, có thể thêm middleware kiểm tra role ở đây

// Lấy danh sách tất cả reports (phân trang, lọc)
router.get("/", verifyToken, controller.getReports);

// Lấy thông tin chi tiết 1 report
router.get("/:id", verifyToken, controller.getReportById);

// Tạo report mới (cho phép upload nhiều file proofs)
router.post("/", verifyToken, upload.array("proofs"), controller.createReport);

// Cập nhật report (cho phép upload nhiều file proofs)
router.put("/:id", verifyToken, upload.array("proofs"), controller.updateReport);

// Duyệt hoặc từ chối 1 report
router.put("/:id/approve", verifyToken, controller.approveReport);

// Xoá 1 report
router.delete("/:id", verifyToken, controller.deleteReport);

module.exports = router;
