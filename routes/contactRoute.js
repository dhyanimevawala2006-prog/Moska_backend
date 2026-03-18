const express = require("express");
const router = express.Router();
const { sendMessage, getAllMessages, updateStatus } = require("../controllers/contactController");

router.post("/", sendMessage);
router.get("/", getAllMessages);
router.patch("/:id/status", updateStatus);

module.exports = router;
