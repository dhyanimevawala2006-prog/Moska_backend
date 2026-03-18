const express = require("express");
const router = express.Router();
const { addRating, getRatings } = require("../controllers/ratingController");

// POST /api/ratings/:productId  — add review
// GET  /api/ratings/:productId  — get all reviews
router.post("/:productId", addRating);
router.get("/:productId", getRatings);

module.exports = router;
