const express = require("express");
const router = express.Router();
const { checkDomain } = require("../controllers/domainController");

router.post("/", checkDomain);

module.exports = router;
