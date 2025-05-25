const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminReportController");
const upload = require("../middlewares/upload");

router.get("/", controller.getReports);
router.get("/:id", controller.getReportById);
router.post("/", upload.array("proofs"), controller.createReport);
router.put('/:id', upload.array('proofs'), controller.updateReport);
router.put("/:id/approve", controller.approveReport);
router.delete("/:id", controller.deleteReport);

module.exports = router;
