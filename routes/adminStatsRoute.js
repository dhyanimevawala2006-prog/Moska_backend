const express = require("express");
const router = express.Router();
const { getStats, getDashboard } = require("../controllers/adminStatsController");

router.get("/", getStats);
router.get("/dashboard", getDashboard);

module.exports = router;
