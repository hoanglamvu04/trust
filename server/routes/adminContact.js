const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminContactController');

// Lấy danh sách contact (GET, lọc, phân trang)
router.get("/", controller.getContacts);

// Gửi liên hệ mới (từ phía FE hoặc admin thêm test)
router.post("/send", controller.createContact);

// Cập nhật trạng thái contact (read/replied)
router.put("/:id/status", controller.updateContactStatus);

// Xóa liên hệ
router.delete("/:id", controller.deleteContact);

module.exports = router;
