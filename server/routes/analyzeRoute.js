const express = require("express");
const router = express.Router();
const { checkDomain } = require("../controllers/domainController");

router.post("/analyze-url", checkDomain); // ✅ endpoint đúng

module.exports = router;
