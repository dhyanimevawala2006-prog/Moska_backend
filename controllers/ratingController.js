const Rating = require("../models/ratingModel");

// Add a review
exports.addRating = async (req, res) => {
  try {
    const { userName, rating, title, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Name, rating and comment are required" });
    }

    const review = await Rating.create({
      product: req.params.productId,
      userName,
      rating: Number(rating),
      title: title || "",
      comment
    });

    res.status(201).json({ success: true, message: "Review added", data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all reviews for a product
exports.getRatings = async (req, res) => {
  try {
    const reviews = await Rating.find({ product: req.params.productId }).sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 0;

    // count per star
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { starCounts[r.rating] = (starCounts[r.rating] || 0) + 1; });

    res.json({ success: true, data: reviews, avgRating, total, starCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
